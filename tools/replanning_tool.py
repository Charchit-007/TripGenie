from langchain_core.tools import StructuredTool
from pydantic import BaseModel, Field

class ReplanInput(BaseModel):
    destination: str = Field(description="The trip destination")
    start_date: str = Field(description="Trip start date")
    end_date: str = Field(description="Trip end date")
    guests: int = Field(description="Number of guests")
    budget: str = Field(description="Budget category: affordable, mid-range, or luxury")
    trip_type: str = Field(description="Type of trip: leisure, adventure, cultural, family, romantic, business")
    original_plan: str = Field(description="The original AI-generated travel plan")
    alert_details: str = Field(description="Weather or disruption alert details that triggered replanning")

class ReplanningTool:
    def _generate_replan_context(
        self,
        destination: str,
        start_date: str,
        end_date: str,
        guests: int,
        budget: str,
        trip_type: str,
        original_plan: str,
        alert_details: str
    ) -> str:
        """Structures trip and alert data for the LLM to reason about"""
        return f"""
        ORIGINAL TRIP DETAILS:
        - Destination: {destination}
        - Dates: {start_date} to {end_date}
        - Guests: {guests}
        - Budget: {budget}
        - Trip Type: {trip_type}

        ORIGINAL PLAN:
        {original_plan}

        DISRUPTION ALERT:
        {alert_details}

        Please replan this trip based on the disruption above.
        """

    @property
    def replanning_tool_list(self):
        return [
            StructuredTool.from_function(
                func=self._generate_replan_context,
                name="generate_replan_context",
                description="Structures the original trip plan and disruption alert so the LLM can generate a revised itinerary.",
                args_schema=ReplanInput
            )
        ]