"""State definition for the LangGraph agent"""
import operator
from typing import List, Dict, Any, Optional, Set, Tuple
from typing_extensions import TypedDict, Annotated

def merge_dicts(d1: dict, d2: dict) -> dict:
    d1.update(d2)
    return d1

class AgentState(TypedDict):
    user_query: str
    timestamp: Optional[str]

    query: Optional[Dict[str, Any]]
    reddit_dump: str
    google_dump:str
    sources: Set[Tuple[str, str]]
    reddit_sources: Set[Tuple[str, str]]
    google_sources: Set[Tuple[str, str]]

    evaluation: str

    errors: Annotated[List[str], operator.add]
    warnings: Annotated[List[str], operator.add]
    current_step: Annotated[str, operator.add]
    processing_times: Annotated[Dict[str, float], merge_dicts]

def create_initial_state(user_query: str):
    from datetime import datetime

    return AgentState(
        user_query=user_query,
        timestamp=datetime.now().isoformat(),
        query=None,
        reddit_dump=None,
        google_dump=None,
        sources=set(),
        reddit_sources=set(),
        google_sources=set(),
        evaluation=None,
        errors=[],
        warnings=[],
        current_step="initialized",
        processing_times={}
    )