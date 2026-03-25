"""
flight_workflow.py
──────────────────
TripGenie – Flight Graph Builder
Follows the exact same pattern as ReplanningGraphBuilder / GraphBuilder.

Graph flow:
  START → agent ⇄ tools → END
  (same ReAct loop as existing agents)

The agent is given a FLIGHT_SEARCH_PROMPT and the two flight tools
(search_flights, get_flight_details). It reasons over the user's trip
profile and returns a context-aware flight recommendation.
"""

from langgraph.graph import StateGraph, MessagesState, END, START
from langgraph.prebuilt import ToolNode, tools_condition
from utils.model_loader import ModelLoader
from prompt_library.prompt import FLIGHT_SEARCH_PROMPT
from tools.flight_search_tool import FlightSearchTool


class FlightGraphBuilder:
    """
    Identical pattern to ReplanningGraphBuilder.

    Usage in main.py:
        graph = FlightGraphBuilder(model_provider="groq")
        flight_app = graph()
        output = flight_app.invoke({"messages": [question]})
    """

    def __init__(self, model_provider: str = "groq"):
        self.model_loader = ModelLoader(model_provider=model_provider)
        self.llm          = self.model_loader.load_llm()
        self.tools        = []

        # Flight tools — same pattern as WeatherInfoTool in GraphBuilder
        self.flight_tools = FlightSearchTool()
        self.tools.extend([*self.flight_tools.flight_tool_list])

        self.llm_with_tools = self.llm.bind_tools(tools=self.tools)
        self.graph          = None
        self.system_prompt  = FLIGHT_SEARCH_PROMPT

    def agent_function(self, state: MessagesState):
        """Main agent node — identical pattern to GraphBuilder.agent_function"""
        user_question  = state["messages"]
        input_question = [self.system_prompt] + user_question
        response       = self.llm_with_tools.invoke(input_question)
        return {"messages": [response]}

    def build_graph(self):
        graph_builder = StateGraph(MessagesState)

        graph_builder.add_node("agent", self.agent_function)
        graph_builder.add_node("tools", ToolNode(tools=self.tools))

        graph_builder.add_edge(START, "agent")
        graph_builder.add_conditional_edges("agent", tools_condition)
        graph_builder.add_edge("tools", "agent")
        graph_builder.add_edge("agent", END)

        self.graph = graph_builder.compile()
        return self.graph

    def __call__(self):
        return self.build_graph()