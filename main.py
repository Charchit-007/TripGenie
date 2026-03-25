# FOR END POINTS (BACKEND)
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from agent.agentic_workflow import GraphBuilder
from agent.replanning_workflow import ReplanningGraphBuilder
from agent.flight_workflow import FlightGraphBuilder
from utils.save_to_document import save_document
from starlette.responses import JSONResponse
import os
import json
import re
from dotenv import load_dotenv
from pydantic import BaseModel
from typing import Optional

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # set specific origins in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ──────────────────────────────────────────────
# REQUEST MODELS
# ──────────────────────────────────────────────

class QueryRequest(BaseModel):
    question: str

class ReplanRequest(BaseModel):
    userId: str
    tripId: str
    destination: str
    startDate: str
    endDate: str
    guests: int
    budget: str
    tripType: str
    aiResponse: str
    alert: dict

class TripProfile(BaseModel):
    budget_tier: Optional[str]  = None   # affordable | moderate | luxury
    trip_type: Optional[str]    = None   # romantic | family | adventure | business | solo
    guests: Optional[int]       = 1
    itinerary_summary: Optional[str] = None
    destination: Optional[str]  = None
    start_date: Optional[str]   = None
    end_date: Optional[str]     = None
    total_budget: Optional[float] = None
    budget_currency: Optional[str] = "INR"

class FlightRequest(BaseModel):
    query: str                           # natural language e.g. "Flights from Mumbai to Paris for 2 people on June 15"
    trip_profile: Optional[TripProfile] = None

class SyncItineraryRequest(BaseModel):
    userId: str
    tripId: str
    destination: str
    startDate: str
    endDate: str
    guests: int
    budget: str
    tripType: str
    aiResponse: str                      # current itinerary
    flight: dict                         # selected flight object from /flights response


# ──────────────────────────────────────────────
# HELPERS
# ──────────────────────────────────────────────

def _extract_json(text: str) -> dict:
    """
    Extracts JSON from LLM output that may contain surrounding text or markdown fences.
    Tries direct parse first, then strips fences, then finds first {...} block.
    """
    text = text.strip()

    # 1. Direct parse
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # 2. Strip markdown code fences
    cleaned = re.sub(r"```(?:json)?", "", text).strip().rstrip("`").strip()
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass

    # 3. Find first {...} block
    match = re.search(r"\{.*\}", cleaned, re.DOTALL)
    if match:
        try:
            return json.loads(match.group())
        except json.JSONDecodeError:
            pass

    return {}


# ──────────────────────────────────────────────
# EXISTING ENDPOINTS (unchanged)
# ──────────────────────────────────────────────

@app.post("/query")
async def query_travel_agent(query: QueryRequest):
    try:
        graph     = GraphBuilder(model_provider="groq")
        react_app = graph()

        png_graph = react_app.get_graph().draw_mermaid_png()
        with open("my_graph.png", "wb") as f:
            f.write(png_graph)
        print(f"Graph saved as 'my_graph.png' in {os.getcwd()}")

        messages = {"messages": [query.question]}
        output   = react_app.invoke(messages)

        if isinstance(output, dict) and "messages" in output:
            final_output = output["messages"][-1].content
        else:
            final_output = str(output)

        return {"answer": final_output}

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


@app.post("/replan")
async def replan_trip(request: ReplanRequest):
    try:
        graph      = ReplanningGraphBuilder(model_provider="groq")
        replan_app = graph()

        question = f"""
        Replan this trip to {request.destination} from {request.startDate} to {request.endDate}
        for {request.guests} guest(s) with a {request.budget} budget. Trip type: {request.tripType}.
        Original plan: {request.aiResponse}
        Disruption alert: {request.alert}
        """

        messages = {"messages": [question]}
        output   = replan_app.invoke(messages)

        if isinstance(output, dict) and "messages" in output:
            final_output = output["messages"][-1].content
        else:
            final_output = str(output)

        return {"replannedItinerary": final_output}

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


# ──────────────────────────────────────────────
# NEW: FLIGHT ENDPOINTS
# ──────────────────────────────────────────────

@app.post("/flights")
async def search_flights(request: FlightRequest):
    """
    Runs FlightGraphBuilder with the user's query + trip profile.
    Returns context-aware flight recommendations as structured JSON.

    Request body:
        query:        Natural language flight request
                      e.g. "Find flights from Mumbai to Paris for 2 people on June 15 2025"
        trip_profile: Optional trip context for smarter recommendations
                      (budget_tier, trip_type, guests, itinerary_summary etc.)

    Response:
        recommended:          Best flight object chosen for this trip profile
        all_options:          All available flights
        recommendation_reason: Why the agent picked this flight
        origin_iata:          Resolved origin airport code
        dest_iata:            Resolved destination airport code
    """
    try:
        graph      = FlightGraphBuilder(model_provider="groq")
        flight_app = graph()

        # Build enriched question with trip profile context
        profile_context = ""
        if request.trip_profile:
            p = request.trip_profile
            parts = []
            if p.budget_tier:       parts.append(f"Budget tier: {p.budget_tier}")
            if p.trip_type:         parts.append(f"Trip type: {p.trip_type}")
            if p.guests:            parts.append(f"Guests: {p.guests}")
            if p.total_budget:      parts.append(f"Total trip budget: {p.total_budget} {p.budget_currency}")
            if p.itinerary_summary: parts.append(f"Existing itinerary summary: {p.itinerary_summary[:500]}")
            if parts:
                profile_context = "\n\nTrip profile context:\n" + "\n".join(parts)

        question = request.query + profile_context

        messages = {"messages": [question]}
        output   = flight_app.invoke(messages)

        if isinstance(output, dict) and "messages" in output:
            raw = output["messages"][-1].content
        else:
            raw = str(output)

        # Parse the JSON the agent returns
        flight_data = _extract_json(raw)

        if not flight_data:
            # Agent returned prose instead of JSON — surface it with an error flag
            return JSONResponse(
                status_code=200,
                content={
                    "error": "Could not parse flight results. Please try again.",
                    "raw_response": raw,
                    "recommended": None,
                    "all_options": [],
                }
            )

        return flight_data

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


@app.post("/sync-itinerary")
async def sync_itinerary(request: SyncItineraryRequest):
    """
    Reuses ReplanningGraphBuilder to update the travel plan so it
    aligns with the selected flight's departure and arrival times.

    For example: if the flight lands at 23:10, Day 1 of the itinerary
    is rewritten to begin the next morning.

    Request body: same shape as /replan but includes a 'flight' object
    Response:     { replannedItinerary: string }
    """
    try:
        graph      = ReplanningGraphBuilder(model_provider="groq")
        replan_app = graph()

        flight   = request.flight
        outbound = flight.get("outbound", {})
        inbound  = flight.get("inbound")

        flight_summary = (
            f"Flight: {flight.get('airline_name')} {flight.get('flight_number')}\n"
            f"Departure: {outbound.get('departure', {}).get('date')} at {outbound.get('departure', {}).get('time')}\n"
            f"Arrival:   {outbound.get('arrival', {}).get('date')} at {outbound.get('arrival', {}).get('time')}\n"
            f"Duration:  {outbound.get('duration')}\n"
            f"Stops:     {outbound.get('stops', 0)}"
        )
        if inbound:
            flight_summary += (
                f"\nReturn flight departure: {inbound.get('departure', {}).get('date')} "
                f"at {inbound.get('departure', {}).get('time')}"
            )

        question = f"""
        Update this travel itinerary to align with the traveler's selected flight.
        
        Trip: {request.destination} from {request.startDate} to {request.endDate}
        Guests: {request.guests} | Budget: {request.budget} | Type: {request.tripType}
        
        Selected flight:
        {flight_summary}
        
        Current itinerary:
        {request.aiResponse}
        
        INSTRUCTIONS:
        - If the arrival time is late evening (after 8 PM) or late night, rewrite Day 1 
          to be a rest/settle-in day. Move Day 1 activities to Day 2 and shift everything forward.
        - If the return flight departs early morning (before 10 AM), remove the last day's
          full-day activities and replace with a light morning + airport transfer.
        - Keep all other days exactly as they are.
        - Do not change the destination, hotels, or overall plan.
        - Format the response as ## Updated Itinerary followed by the full updated plan.
        """

        messages = {"messages": [question]}
        output   = replan_app.invoke(messages)

        if isinstance(output, dict) and "messages" in output:
            final_output = output["messages"][-1].content
        else:
            final_output = str(output)

        return {"replannedItinerary": final_output}

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})