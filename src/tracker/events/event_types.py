"""
Module defining screen time event types.
"""

from enum import Enum, auto

class EventType(Enum):
    """Enumeration of possible screen time event types."""
    
    STARTUP = auto()      # System startup
    SHUTDOWN = auto()     # System shutdown
    LOGIN = auto()        # User login
    LOGOUT = auto()       # User logout
    LOCK = auto()         # Screen lock
    UNLOCK = auto()       # Screen unlock
    IDLE = auto()         # System idle
    ACTIVE = auto()       # System active
    ERROR = auto()        # Error event 