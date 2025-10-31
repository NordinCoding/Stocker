from loguru import logger
import os

log_dir = os.path.join(os.path.dirname(__file__), "../logs")
os.makedirs(log_dir, exist_ok=True)

logger.remove()
logger.add(
    f"{log_dir}/stocker.log",
    rotation="10 MB",
    retention="7 days",
    level="INFO"
)
logger.add(
    f"{log_dir}/stocker_error.log",
    rotation="10 MB",
    retention="7 days",
    level="ERROR"
)