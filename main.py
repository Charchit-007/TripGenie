# FOR END POINTS (BACKEND)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from agent.agentic_workflow import GraphBuilder
from utils.save_to_document import save_document
from starlette.responses import JSONResponse
import os
import datetime
from dotenv import load_dotenv
from pydantic import BaseModel
from agent.replanning_workflow import ReplanningGraphBuilder
load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # set specific origins in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
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

@app.post("/query")
async def query_travel_agent(query:QueryRequest):
    try:
        print(query)
        graph = GraphBuilder(model_provider="groq")
        react_app=graph()
        #react_app = graph.build_graph()

        png_graph = react_app.get_graph().draw_mermaid_png()
        with open("my_graph.png", "wb") as f:
            f.write(png_graph)

        print(f"Graph saved as 'my_graph.png' in {os.getcwd()}")
        # Assuming request is a pydantic object like: {"question": "your text"}
        messages={"messages": [query.question]}
        output = react_app.invoke(messages)

        # If result is dict with messages:
        if isinstance(output, dict) and "messages" in output:
            final_output = output["messages"][-1].content  # Last AI response
        else:
            final_output = str(output)
        
        return {"answer": final_output}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})
    
# endpoint for replanning affected trips
@app.post("/replan")
async def replan_trip(request: ReplanRequest):
    try:
        graph = ReplanningGraphBuilder(model_provider="groq")
        replan_app = graph()

        # Construct question from trip + alert data
        question = f"""
        Replan this trip to {request.destination} from {request.startDate} to {request.endDate}
        for {request.guests} guest(s) with a {request.budget} budget. Trip type: {request.tripType}.
        Original plan: {request.aiResponse}
        Disruption alert: {request.alert}
        """

        messages = {"messages": [question]}
        output = replan_app.invoke(messages)

        if isinstance(output, dict) and "messages" in output:
            final_output = output["messages"][-1].content
        else:
            final_output = str(output)

        return {"replannedItinerary": final_output}

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})