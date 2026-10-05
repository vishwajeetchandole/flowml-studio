import logging
import queue
import json
import asyncio
from datetime import datetime
from sse_starlette.sse import ServerSentEvent

# ─── In-memory queue for SSE log streaming ───────────────────────
log_queue: queue.Queue = queue.Queue(maxsize=500)


class QueueHandler(logging.Handler):
    """Pushes formatted log records into log_queue for SSE consumers."""

    def emit(self, record):
        try:
            msg = self.format(record)
            # Non-blocking put — drop the message if queue is full
            log_queue.put_nowait(msg)
        except queue.Full:
            pass
        except Exception:
            self.handleError(record)


# ─── Logger setup ─────────────────────────────────────────────────
logger = logging.getLogger("flowml")
logger.setLevel(logging.INFO)

_console_handler = logging.StreamHandler()
_console_handler.setLevel(logging.INFO)

_queue_handler = QueueHandler()
_queue_handler.setLevel(logging.INFO)

_formatter = logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s")
_console_handler.setFormatter(_formatter)
_queue_handler.setFormatter(_formatter)

logger.addHandler(_console_handler)
logger.addHandler(_queue_handler)


# ─── Async SSE generator ──────────────────────────────────────────
async def stream_logs():
    """
    Async generator that streams log messages to an SSE client.

    IMPORTANT: Uses run_in_executor so the blocking queue.get() call
    never blocks the asyncio event loop — without this, all other API
    requests would stall while a console client is connected.
    """
    loop = asyncio.get_running_loop()

    # Handshake message
    yield ServerSentEvent(
        data=json.dumps(
            {
                "message": "Log streaming connected",
                "level": "INFO",
                "timestamp": datetime.now().isoformat(),
            }
        )
    )

    while True:
        try:
            # Run the blocking queue.get in a thread-pool so the event loop
            # stays free to handle other HTTP requests concurrently.
            log_msg = await loop.run_in_executor(
                None, lambda: log_queue.get(timeout=2.0)
            )
            yield ServerSentEvent(
                data=json.dumps(
                    {"log": log_msg, "timestamp": datetime.now().isoformat()}
                )
            )
        except Exception:
            # queue.Empty on timeout — send a keep-alive ping comment
            yield ServerSentEvent(comment="ping")


# ─── Convenience logger ───────────────────────────────────────────
def log_event(message: str, level: str = "INFO") -> None:
    """Log a message at the given level and push it to the SSE queue."""
    lvl = level.upper()
    if lvl == "INFO":
        logger.info(message)
    elif lvl == "ERROR":
        logger.error(message)
    elif lvl == "WARNING":
        logger.warning(message)
    else:
        logger.debug(message)
