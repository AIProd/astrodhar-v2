"""
Structured logging configuration for AstroDhar backend.
Uses structlog for JSON-formatted logging.
"""
import logging
import structlog
from structlog.processors import JSONRenderer
import sys


def setup_logging(log_level: str = "INFO"):
    """
    Configure structured logging with structlog.
    
    Args:
        log_level: Logging level (DEBUG, INFO, WARNING, ERROR)
    """
    # Configure standard logging
    logging.basicConfig(
        format="%(message)s",
        stream=sys.stdout,
        level=getattr(logging, log_level.upper()),
    )
    
    # Configure structlog
    structlog.configure(
        processors=[
            # Add log level
            structlog.stdlib.add_log_level,
            # Add logger name
            structlog.stdlib.add_logger_name,
            # Add timestamp
            structlog.processors.TimeStamper(fmt="iso"),
            # Context from thread local storage
            structlog.contextvars.merge_contextvars,
            # Stack info for exceptions
            structlog.processors.StackInfoRenderer(),
            # Format exceptions
            structlog.processors.format_exc_info,
            # Render as JSON for production, colorful for dev
            JSONRenderer() if log_level == "INFO" else structlog.dev.ConsoleRenderer()
        ],
        wrapper_class=structlog.stdlib.BoundLogger,
        context_class=dict,
        logger_factory=structlog.stdlib.LoggerFactory(),
        cache_logger_on_first_use=True,
    )


def get_logger(name: str = __name__):
    """Get a structured logger instance."""
    return structlog.get_logger(name)


# Example usage:
# logger = get_logger(__name__)
# logger.info("chart_calculated", session_id="abc123", ascendant="Aries", duration_ms=150)
