"""State definition for the LangGraph agent"""

from typing import List, Dict, Any, Optional, Set, Tuple
from typing_extensions import TypedDict


class AgentState(TypedDict):
    user_query: str
    timestamp: Optional[str]

    reddit_query: Optional[Dict[str, Any]]
    reddit_dump: str
    sources: Set[Tuple[str, str]]

    optimised_context: str

    errors: List[str]
    warnings: List[str]
    current_step: str
    processing_times: Dict[str, float]

def create_initial_state(user_query: str):
    from datetime import datetime

    return AgentState(
        user_query=user_query,
        timestamp=datetime.now().isoformat(),
        reddit_query=None,
        reddit_dump=None,
        sources=set(),
        optimised_context=None,
        errors=[],
        warnings=[],
        current_step="initialized",
        processing_times={}
    )