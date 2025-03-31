#!/usr/bin/env python3
"""
Core module for tracking screen time events.
"""

import os
import json
import time
import logging
from datetime import datetime
from typing import Dict, List, Optional
from pathlib import Path

from ..events.event_types import EventType
from ..events.event_handler import EventHandler
from ..utils.config import Config
from ..utils.logger import setup_logger

class ScreenTimeTracker:
    """Main class for tracking screen time events."""

    def __init__(self, config: Config):
        """
        Initialize the screen time tracker.

        Args:
            config: Configuration object containing settings
        """
        self.config = config
        self.logger = setup_logger('screen_time_tracker')
        self.event_handler = EventHandler(config)
        self.current_session: Optional[Dict] = None
        self.data_dir = Path(config.data_dir)
        self.data_dir.mkdir(parents=True, exist_ok=True)

    def start(self):
        """Start the screen time tracker."""
        self.logger.info("Starting screen time tracker...")
        try:
            self.event_handler.start()
            self._run_event_loop()
        except KeyboardInterrupt:
            self.logger.info("Stopping screen time tracker...")
        finally:
            self.stop()

    def stop(self):
        """Stop the screen time tracker."""
        self.event_handler.stop()
        if self.current_session:
            self._end_current_session()
        self.logger.info("Screen time tracker stopped")

    def _run_event_loop(self):
        """Main event loop for processing events."""
        while True:
            try:
                event = self.event_handler.get_next_event()
                if event:
                    self._process_event(event)
                time.sleep(1)  # Prevent CPU overuse
            except Exception as e:
                self.logger.error(f"Error in event loop: {e}")
                time.sleep(5)  # Wait before retrying

    def _process_event(self, event: Dict):
        """
        Process a screen time event.

        Args:
            event: Event dictionary containing type and timestamp
        """
        event_type = event.get('type')
        timestamp = event.get('timestamp')

        if not event_type or not timestamp:
            self.logger.warning(f"Invalid event received: {event}")
            return

        try:
            if event_type in [EventType.STARTUP, EventType.UNLOCK]:
                self._start_new_session(timestamp)
            elif event_type in [EventType.LOCK, EventType.SHUTDOWN, EventType.LOGOUT]:
                self._end_current_session(timestamp)
            
            self._save_event(event)
        except Exception as e:
            self.logger.error(f"Error processing event {event}: {e}")

    def _start_new_session(self, timestamp: str):
        """
        Start a new screen time session.

        Args:
            timestamp: Session start timestamp
        """
        if not self.current_session:
            self.current_session = {
                'start_time': timestamp,
                'is_active': True
            }
            self.logger.info(f"New session started at {timestamp}")

    def _end_current_session(self, timestamp: Optional[str] = None):
        """
        End the current screen time session.

        Args:
            timestamp: Optional timestamp for session end
        """
        if self.current_session:
            end_time = timestamp or datetime.now().isoformat()
            self.current_session['end_time'] = end_time
            self.current_session['is_active'] = False
            self.logger.info(f"Session ended at {end_time}")
            self.current_session = None

    def _save_event(self, event: Dict):
        """
        Save an event to the appropriate JSON file.

        Args:
            event: Event dictionary to save
        """
        try:
            date = datetime.fromisoformat(event['timestamp']).strftime('%Y-%m-%d')
            file_path = self.data_dir / f"screen_time_{date}.json"
            
            # Load existing data or create new structure
            if file_path.exists():
                with open(file_path, 'r') as f:
                    data = json.load(f)
            else:
                data = {'events': [], 'total_time': 0}

            # Add new event
            data['events'].append(event)
            
            # Update total time if session ended
            if event['type'] in [EventType.LOCK, EventType.SHUTDOWN, EventType.LOGOUT]:
                self._update_total_time(data)

            # Save updated data
            with open(file_path, 'w') as f:
                json.dump(data, f, indent=2)

            self.logger.debug(f"Event saved to {file_path}")
        except Exception as e:
            self.logger.error(f"Error saving event: {e}")

    def _update_total_time(self, data: Dict):
        """
        Update total time in the data file.

        Args:
            data: Data dictionary to update
        """
        try:
            total_time = 0
            current_session = None

            for event in data['events']:
                if event['type'] in [EventType.STARTUP, EventType.UNLOCK]:
                    current_session = event
                elif event['type'] in [EventType.LOCK, EventType.SHUTDOWN, EventType.LOGOUT] and current_session:
                    start_time = datetime.fromisoformat(current_session['timestamp'])
                    end_time = datetime.fromisoformat(event['timestamp'])
                    duration = (end_time - start_time).total_seconds()
                    total_time += duration
                    current_session = None

            data['total_time'] = total_time
        except Exception as e:
            self.logger.error(f"Error updating total time: {e}")

def main():
    """Main entry point for the screen time tracker."""
    config = Config()
    tracker = ScreenTimeTracker(config)
    tracker.start()

if __name__ == '__main__':
    main() 