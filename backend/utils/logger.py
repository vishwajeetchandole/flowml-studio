import logging
import queue
import json
from datetime import datetime
from sse_starlette.sse import ServerSentEvent

# A queue to hold log messages for the /api/logs endpoint
log_queue = queue.Queue()

class QueueHandler(logging.Handler):
    def emit(self, record):
        try:
            msg = self.format(record)
            log_queue.put(msg)
        except Exception:
            self.handleError(record)

# Setup root logger
logger = logging.getLogger("flowml")
logger.setLevel(logging.INFO)

# Console handler
ch = logging.StreamHandler()
ch.setLevel(logging.INFO)

# Queue handler
qh = QueueHandler()
qh.setLevel(logging.INFO)

formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
ch.setFormatter(formatter)
qh.setFormatter(formatter)

logger.addHandler(ch)
logger.addHandler(qh)

def stream_logs():
    """Generator to stream logs to an SSE client."""
    # Yield a connection established message
    yield ServerSentEvent(data=json.dumps({"message": "Log streaming connected", "level": "INFO", "timestamp": datetime.now().isoformat()}))
    
    while True:
        try:
            # Block until a log is available
            log_msg = log_queue.get(timeout=2.0)
            yield ServerSentEvent(data=json.dumps({"log": log_msg, "timestamp": datetime.now().isoformat()}))
        except queue.Empty:
            # Send a heartbeat/keep-alive empty comment to prevent timeout
            yield ServerSentEvent(comment="ping")

def log_event(message: str, level: str = "INFO"):
    """Convenience method to log events and push to queue."""
    if level.upper() == "INFO":
        logger.info(message)
    elif level.upper() == "ERROR":
        logger.error(message)
    elif level.upper() == "WARNING":
        logger.warning(message)
    else:
        logger.debug(message)
