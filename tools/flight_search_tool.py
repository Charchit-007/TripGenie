"""
flight_search_tool.py
─────────────────────
TripGenie – Flight Search Tool (Static Data)
Follows the exact same pattern as WeatherInfoTool and CalculatorTool.

Static flight data covers 20+ major routes with realistic airlines,
times, prices, and stops. Swap _generate_flights() with a real
Amadeus call later without changing anything else.
"""

import random
from datetime import datetime, timedelta
from langchain_core.tools import tool
from pydantic import BaseModel, Field
from typing import Optional


# ──────────────────────────────────────────────
# STATIC DATA BANK
# ──────────────────────────────────────────────

AIRLINES = {
    "domestic": [
        {"code": "AI", "name": "Air India"},
        {"code": "6E", "name": "IndiGo"},
        {"code": "UK", "name": "Vistara"},
        {"code": "SG", "name": "SpiceJet"},
    ],
    "international": [
        {"code": "EK", "name": "Emirates"},
        {"code": "QR", "name": "Qatar Airways"},
        {"code": "EY", "name": "Etihad Airways"},
        {"code": "SQ", "name": "Singapore Airlines"},
        {"code": "BA", "name": "British Airways"},
        {"code": "LH", "name": "Lufthansa"},
        {"code": "AF", "name": "Air France"},
        {"code": "TK", "name": "Turkish Airlines"},
    ],
}

CITY_TO_IATA = {
    # Major Indian Metro & Tier 1
    "mumbai": "BOM", "delhi": "DEL", "bangalore": "BLR", "bengaluru": "BLR",
    "chennai": "MAA", "kolkata": "CCU", "hyderabad": "HYD", "goa": "GOI",
    "ahmedabad": "AMD", "pune": "PNQ", "kochi": "COK", "cochin": "COK",
    "jaipur": "JAI", 
    
    # Additional Popular Indian Airports
    "lucknow": "LKO", "guwahati": "GAU", "thiruvananthapuram": "TRV", "trivandrum": "TRV",
    "kozhikode": "CCJ", "calicut": "CCJ", "nagpur": "NAG", "chandigarh": "IXC",
    "amritsar": "ATQ", "srinagar": "SXR", "mangalore": "IXE", "coimbatore": "CJB",
    "tiruchirappalli": "TRZ", "trichy": "TRZ", "bhubaneswar": "BBI", "patna": "PAT",
    "indore": "IDR", "varanasi": "VNS", "banaras": "VNS", "surat": "STV",
    "vadodara": "BDQ", "baroda": "BDQ", "port blair": "IXZ", "madurai": "IXM",

    # North America
    "new york": "JFK", "los angeles": "LAX", "chicago": "ORD", "toronto": "YYZ",
    "miami": "MIA", "san francisco": "SFO", "vancouver": "YVR", "seattle": "SEA",
    "washington": "IAD", "boston": "BOS", "dallas": "DFW", "houston": "IAH",

    # Europe
    "london": "LHR", "paris": "CDG", "amsterdam": "AMS", "frankfurt": "FRA",
    "zurich": "ZRH", "rome": "FCO", "madrid": "MAD", "barcelona": "BCN",
    "istanbul": "IST", "munich": "MUC", "dublin": "DUB", "vienna": "VIE",

    # Middle East & Africa
    "dubai": "DXB", "doha": "DOH", "abu dhabi": "AUH", "muscat": "MCT",
    "cairo": "CAI", "nairobi": "NBO", "riyadh": "RUH", "jeddah": "JED",
    "cape town": "CPT", "johannesburg": "JNB",

    # Asia-Pacific
    "singapore": "SIN", "bangkok": "BKK", "tokyo": "NRT", "sydney": "SYD",
    "hong kong": "HKG", "seoul": "ICN", "beijing": "PEK", "shanghai": "PVG",
    "kuala lumpur": "KUL", "bali": "DPS", "maldives": "MLE", "male": "MLE",
    "phuket": "HKT", "colombo": "CMB", "kathmandu": "KTM", "melbourne": "MEL",
    "jakarta": "CGK", "manila": "MNL", "taipei": "TPE", "auckland": "AKL"
}

IATA_TO_CITY = {v: k.title() for k, v in CITY_TO_IATA.items()}

DOMESTIC_IATAS = {
    "BOM", "DEL", "BLR", "MAA", "CCU", "HYD", "GOI", "AMD", "PNQ", "COK", 
    "JAI", "LKO", "GAU", "TRV", "CCJ", "NAG", "IXC", "ATQ", "SXR", "IXE", 
    "CJB", "TRZ", "BBI", "PAT", "IDR", "VNS", "STV", "BDQ", "IXZ", "IXM"
}
SHORT_HAUL  = {("BOM","DEL"),("BOM","BLR"),("BOM","GOI"),("DEL","JAI"),
               ("DEL","CCU"),("BLR","MAA"),("BOM","HYD"),("DEL","AMD")}
MEDIUM_HAUL = {("BOM","DXB"),("DEL","DXB"),("BOM","SIN"),("DEL","BKK"),
               ("BOM","DOH"),("DEL","MCT"),("BOM","CMB"),("DEL","KTM"),
               ("BOM","MLE"),("DEL","HKG"),("BOM","KUL"),("BLR","SIN")}

CABIN_BASE_PRICES = {
    "ECONOMY":         {"short": 6600,   "medium": 29000,  "long": 54000},
    "PREMIUM_ECONOMY": {"short": 15000,  "medium": 62000,  "long": 116000},
    "BUSINESS":        {"short": 33000,  "medium": 149000, "long": 290000},
    "FIRST":           {"short": 75000,  "medium": 290000, "long": 580000},
}


# ──────────────────────────────────────────────
# HELPERS
# ──────────────────────────────────────────────

def _route_type(o: str, d: str) -> str:
    pair = (o.upper(), d.upper())
    rev  = (d.upper(), o.upper())
    if pair in SHORT_HAUL  or rev in SHORT_HAUL:  return "short"
    if pair in MEDIUM_HAUL or rev in MEDIUM_HAUL: return "medium"
    return "long"


def _duration(route_type: str, stops: int) -> str:
    base = {"short": (1,30), "medium": (4,0), "long": (9,0)}[route_type]
    h, m = base[0] + stops * 2, base[1] + random.randint(0, 55)
    if m >= 60: h += 1; m -= 60
    return f"{h}h {m:02d}m"


def _calculate_arrival(date_str: str, time_str: str, dur_str: str) -> dict:
    """Calculates arrival info handling date rollovers."""
    try:
        dep_dt = datetime.strptime(f"{date_str} {time_str}", "%Y-%m-%d %H:%M")
        h_dur = int(dur_str.split("h")[0])
        m_dur = int(dur_str.split("h")[1].replace("m","").strip())
        arr_dt = dep_dt + timedelta(hours=h_dur, minutes=m_dur)
        return {
            "date": arr_dt.strftime("%d %b %Y"),
            "time": arr_dt.strftime("%H:%M"),
            "iso": arr_dt.strftime("%Y-%m-%dT%H:%M:00")
        }
    except:
        return {"date": date_str, "time": time_str, "iso": f"{date_str}T{time_str}:00"}


def _fmt_date(d: str) -> str:
    try:    return datetime.strptime(d, "%Y-%m-%d").strftime("%d %b %Y")
    except: return d


# ──────────────────────────────────────────────
# FLIGHT GENERATOR
# ──────────────────────────────────────────────

def _generate_flights(
    origin_iata: str,
    dest_iata: str,
    departure_date: str,
    return_date: Optional[str],
    passengers: int,
    cabin_class: str,
) -> list[dict]:
    rt         = _route_type(origin_iata, dest_iata)
    base_price = CABIN_BASE_PRICES.get(cabin_class, CABIN_BASE_PRICES["ECONOMY"])[rt]
    is_dom     = origin_iata in DOMESTIC_IATAS and dest_iata in DOMESTIC_IATAS
    pool       = AIRLINES["domestic"] if is_dom else AIRLINES["international"]

    random.seed(hash(f"{origin_iata}{dest_iata}{departure_date}"))

    dep_times   = ["06:15","08:45","11:20","14:05","17:30"]
    stops_plan  = [0,0,1,0,1] if rt == "long" else [0,0,0,1,0]

    flights = []
    for i in range(5):
        airline  = pool[i % len(pool)]
        stops    = stops_plan[i]
        dep      = dep_times[i]
        dur      = _duration(rt, stops)
        
        # New robust arrival calculation
        arrival_info = _calculate_arrival(departure_date, dep, dur)

        mult     = 1.0 + (0.15 if stops==0 else 0) - (0.10 if i==0 else 0)
        price_pp = round(base_price * mult * random.uniform(0.92, 1.08), 2)
        total    = round(price_pp * passengers, 2)

        stop_details = []
        if stops == 1:
            hub = "DEL" if is_dom else "DXB"
            stop_details = [{"airport": hub, "layover_duration": "2h 15m"}]
        elif stops == 2:
            stop_details = [
                {"airport": "DXB", "layover_duration": "1h 45m"},
                {"airport": "DOH", "layover_duration": "2h 00m"},
            ]

        inbound = None
        if return_date:
            rd      = dep_times[(i+2) % len(dep_times)]
            rdur    = _duration(rt, stops)
            inbound_arrival = _calculate_arrival(return_date, rd, rdur)
            inbound = {
                "departure":        {"date": _fmt_date(return_date), "time": rd,   "iso": f"{return_date}T{rd}:00"},
                "arrival":          inbound_arrival,
                "origin_iata":      dest_iata,
                "destination_iata": origin_iata,
                "duration":         rdur,
                "stops":            stops,
                "stop_details":     stop_details,
            }

        flights.append({
            "id":               f"TG-{origin_iata}{dest_iata}-{i+1:03d}",
            "rank":             i + 1,
            "airline_code":     airline["code"],
            "airline_name":     airline["name"],
            "flight_number":    f"{airline['code']}{random.randint(100,999)}",
            "outbound": {
                "departure":        {"date": _fmt_date(departure_date), "time": dep, "iso": f"{departure_date}T{dep}:00"},
                "arrival":          arrival_info,
                "origin_iata":      origin_iata,
                "destination_iata": dest_iata,
                "origin_city":      IATA_TO_CITY.get(origin_iata, origin_iata),
                "destination_city": IATA_TO_CITY.get(dest_iata, dest_iata),
                "duration":         dur,
                "stops":            stops,
                "stop_details":     stop_details,
            },
            "inbound":          inbound,
            "price_per_person": price_pp,
            "total_price":      total,
            "taxes_and_fees":   round(total * 0.18, 2),
            "currency":         "INR",
            "cabin":            cabin_class,
            "seats_remaining":  random.randint(2, 24),
            "is_refundable":    i % 3 == 0,
            "baggage_allowance":"23kg" if cabin_class == "ECONOMY" else "32kg",
            "meal_included":    cabin_class in ["BUSINESS","FIRST"],
        })

    flights.sort(key=lambda x: x["total_price"])
    for idx, f in enumerate(flights):
        f["rank"] = idx + 1
    return flights


# ──────────────────────────────────────────────
# PYDANTIC INPUT MODEL
# ──────────────────────────────────────────────

class FlightSearchInput(BaseModel):
    origin_city:       str            = Field(..., description="Departure city e.g. 'Mumbai'")
    destination_city:  str            = Field(..., description="Destination city e.g. 'Paris'")
    departure_date:    str            = Field(..., description="YYYY-MM-DD")
    return_date:       Optional[str]  = Field(None, description="YYYY-MM-DD or None for one-way")
    passengers:        int            = Field(1, ge=1, le=9)
    cabin_class:       str            = Field("ECONOMY")
    budget_tier:       Optional[str]  = Field(None)
    trip_type:         Optional[str]  = Field(None)
    itinerary_summary: Optional[str]  = Field(None)
    total_budget:      Optional[float]= Field(None)
    budget_currency:   Optional[str]  = Field("INR")


# ──────────────────────────────────────────────
# CONVENIENCE WRAPPER
# ──────────────────────────────────────────────

def run_flight_search(input_data: FlightSearchInput) -> dict:
    result = {"origin_iata": None, "dest_iata": None, "results": [], "error": None}
    try:
        origin_iata = CITY_TO_IATA.get(input_data.origin_city.strip().lower())
        dest_iata   = CITY_TO_IATA.get(input_data.destination_city.strip().lower())

        if not origin_iata:
            result["error"] = f"No airport found for '{input_data.origin_city}'. Try a major city name."
            return result
        if not dest_iata:
            result["error"] = f"No airport found for '{input_data.destination_city}'. Try a major city name."
            return result

        result["origin_iata"] = origin_iata
        result["dest_iata"]   = dest_iata
        result["results"]     = _generate_flights(
            origin_iata    = origin_iata,
            dest_iata      = dest_iata,
            departure_date = input_data.departure_date,
            return_date    = input_data.return_date,
            passengers     = input_data.passengers,
            cabin_class    = input_data.cabin_class,
        )
    except Exception as e:
        result["error"] = f"Flight search error: {str(e)}"
    return result


# ──────────────────────────────────────────────
# LANGCHAIN TOOL CLASS
# ──────────────────────────────────────────────

class FlightSearchTool:
    def __init__(self):
        self.flight_tool_list = self._build_tools()

    def _build_tools(self) -> list:

        @tool
        def search_flights(
            origin_city: str,
            destination_city: str,
            departure_date: str,
            passengers: int = 1,
            cabin_class: str = "ECONOMY",
            return_date: str = "",
        ) -> str:
            """
            Search for available flights between two cities.
            """
            inp  = FlightSearchInput(
                origin_city      = origin_city,
                destination_city = destination_city,
                departure_date   = departure_date,
                return_date      = return_date if return_date else None,
                passengers       = passengers,
                cabin_class      = cabin_class,
            )
            data = run_flight_search(inp)

            if data["error"]:
                return f"Flight search failed: {data['error']}"

            flights = data["results"]
            if not flights:
                return f"No flights found from {origin_city} to {destination_city} on {departure_date}."

            lines = [
                f"Found {len(flights)} flights from {origin_city} "
                f"({data['origin_iata']}) to {destination_city} ({data['dest_iata']}) "
                f"on {departure_date}:\n"
            ]
            for f in flights:
                ob    = f["outbound"]
                stops = "Non-stop" if ob["stops"] == 0 else f"{ob['stops']} stop(s)"
                lines.append(
                    f"{f['rank']}. {f['airline_name']} {f['flight_number']} | "
                    f"{ob['departure']['time']} → {ob['arrival']['time']} | "
                    f"{ob['duration']} | {stops} | "
                    f"${f['total_price']} total ({f['cabin']}) | "
                    f"Seats left: {f['seats_remaining']}"
                )
            return "\n".join(lines)

        @tool
        def get_flight_details(
            origin_city: str,
            destination_city: str,
            departure_date: str,
            flight_rank: int = 1,
            passengers: int = 1,
            cabin_class: str = "ECONOMY",
        ) -> str:
            """
            Get full details of a specific flight option.
            """
            inp  = FlightSearchInput(
                origin_city      = origin_city,
                destination_city = destination_city,
                departure_date   = departure_date,
                passengers       = passengers,
                cabin_class      = cabin_class,
            )
            data = run_flight_search(inp)

            if data["error"]:
                return f"Could not fetch flight details: {data['error']}"

            flights = data["results"]
            if not flights:
                return "No flights found for this route."

            f  = flights[min(flight_rank - 1, len(flights) - 1)]
            ob = f["outbound"]

            stop_str = ""
            if ob["stop_details"]:
                stop_str = "\n  Stops:     " + " → ".join(
                    f"{s['airport']} ({s['layover_duration']} layover)"
                    for s in ob["stop_details"]
                )

            return (
                f"Flight {f['rank']}: {f['airline_name']} {f['flight_number']}\n"
                f"  Route:     {ob['origin_city']} ({ob['origin_iata']}) → "
                f"{ob['destination_city']} ({ob['destination_iata']})\n"
                f"  Departure: {ob['departure']['date']} at {ob['departure']['time']}\n"
                f"  Arrival:   {ob['arrival']['date']} at {ob['arrival']['time']}\n"
                f"  Duration:  {ob['duration']}{stop_str}\n"
                f"  Cabin:     {f['cabin']}\n"
                f"  Price:     ${f['price_per_person']} × {passengers} = ${f['total_price']} total\n"
                f"  Taxes:     ${f['taxes_and_fees']}\n"
                f"  Baggage:   {f['baggage_allowance']}\n"
                f"  Meal:      {'Included' if f['meal_included'] else 'Not included'}\n"
                f"  Refundable:{'Yes' if f['is_refundable'] else 'No'}\n"
                f"  Seats left:{f['seats_remaining']}"
            )

        return [search_flights, get_flight_details]