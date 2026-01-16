"""
Logging Utility
===============
Provides a consistent logging wrapper for the application.
"""

import logging
import os
import sys

LOG_FORMAT = "%(asctime)s %(message)s"
DEFAULT_LEVEL = logging.DEBUG


class LogWrapper:
    """
    Wrapper class for Python logging module.
    Creates log files in a dedicated logs directory.
    """

    PATH = './logs'

    def __init__(self, name: str, mode: str = "w"):
        """
        Initialize a logger with the given name.

        Args:
            name: Logger name (used for filename)
            mode: File mode ('w' for write, 'a' for append)
        """
        self._create_directory()
        self.filename = f"{LogWrapper.PATH}/{name}.log"
        self.logger = logging.getLogger(name)
        self.logger.setLevel(DEFAULT_LEVEL)

        formatter = logging.Formatter(LOG_FORMAT, datefmt='%Y-%m-%d %H:%M:%S')

        # File handler for log files
        file_handler = logging.FileHandler(self.filename, mode=mode)
        file_handler.setFormatter(formatter)
        self.logger.addHandler(file_handler)

        # Stream handler for stdout
        stream_handler = logging.StreamHandler(sys.stdout)
        stream_handler.setFormatter(formatter)
        self.logger.addHandler(stream_handler)

        self.logger.info(f"LogWrapper init() {self.filename}")

    def _create_directory(self) -> None:
        """Create logs directory if it doesn't exist."""
        if not os.path.exists(LogWrapper.PATH):
            os.makedirs(LogWrapper.PATH)

    def debug(self, msg: str) -> None:
        """Log debug message."""
        self.logger.debug(msg)

    def info(self, msg: str) -> None:
        """Log info message."""
        self.logger.info(msg)

    def warning(self, msg: str) -> None:
        """Log warning message."""
        self.logger.warning(msg)

    def error(self, msg: str) -> None:
        """Log error message."""
        self.logger.error(msg)
