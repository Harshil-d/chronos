#!/usr/bin/env python3
import json
import os
from datetime import datetime
import time
from pathlib import Path
import subprocess
import signal
import sys
import logging
import psutil
import socket

# Set up logging
log_dir = Path(__file__).parent.parent.parent / 'logs'
log_dir.mkdir(exist_ok=True)
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(log_dir / 'screen_time_tracker.log'),
        logging.StreamHandler()
    ]
)

class ScreenTimeTracker:
    def __init__(self):
        try:
            # Set up paths
            self.base_dir = Path(__file__).parent.parent.parent
            self.data_dir = self.base_dir / 'data' / 'screen_time_data'
            self.data_dir.mkdir(parents=True, exist_ok=True)
            self.current_file = self.data_dir / f"screen_time_{datetime.now().strftime('%Y-%m-%d')}.json"
            
            logging.info("Initializing ScreenTimeTracker")
            logging.info(f"Base directory: {self.base_dir}")
            logging.info(f"Data directory: {self.data_dir}")
            logging.info(f"Current file: {self.current_file}")
            
            self.load_data()
            
            # Track current session
            self.current_session = {
                'is_active': False,
                'start_time': None
            }
            self.last_event_time = None
            
            logging.info("ScreenTimeTracker initialized successfully")
        except Exception as e:
            print(f"Error during initialization: {str(e)}")
            if 'logging' in locals():
                logging.error(f"Error during initialization: {str(e)}")
            raise
        
    def load_data(self):
        try:
            if self.current_file.exists():
                with open(self.current_file, 'r') as f:
                    self.data = json.load(f)
                logging.info(f"Loaded existing data from {self.current_file}")
            else:
                self.data = {
                    "events": [],
                    "total_time": 0,
                    "current_session": {
                        "start_time": None,
                        "is_active": False
                    }
                }
                logging.info(f"Created new data file at {self.current_file}")
        except Exception as e:
            logging.error(f"Error loading data: {str(e)}")
            raise
    
    def save_data(self):
        try:
            with open(self.current_file, 'w') as f:
                json.dump(self.data, f, indent=4)
            logging.debug("Data saved successfully")
        except Exception as e:
            logging.error(f"Error saving data: {str(e)}")
            raise
    
    def log_event(self, event_type):
        try:
            current_time = datetime.now()
            # Prevent duplicate events within 1 second
            if self.last_event_time and (current_time - self.last_event_time).total_seconds() < 1:
                logging.warning(f"Skipping duplicate event {event_type} within 1 second")
                return
                
            self.last_event_time = current_time
            event = {
                "timestamp": current_time.isoformat(),
                "type": event_type
            }
            self.data["events"].append(event)
            
            # Update current session
            if event_type == 'unlock':
                self.current_session = {
                    'is_active': True,
                    'start_time': current_time.isoformat()
                }
            elif event_type in ['lock', 'logout', 'system_shutdown']:
                if self.current_session['is_active']:
                    start_time = datetime.fromisoformat(self.current_session['start_time'])
                    duration = (current_time - start_time).total_seconds()
                    self.data["total_time"] += duration
                self.current_session = {
                    'is_active': False,
                    'start_time': None
                }
            
            self.save_data()
            logging.info(f"Logged event: {event_type}")
        except Exception as e:
            logging.error(f"Error logging event: {str(e)}")
            raise
    
    def calculate_total_time(self):
        try:
            events = self.data["events"]
            total_time = 0
            for i in range(1, len(events)):
                if events[i-1]["type"] == "unlock" and events[i]["type"] == "lock":
                    start_time = datetime.fromisoformat(events[i-1]["timestamp"])
                    end_time = datetime.fromisoformat(events[i]["timestamp"])
                    total_time += (end_time - start_time).total_seconds()
            self.data["total_time"] = total_time
            self.save_data()
            logging.info(f"Calculated total time: {total_time} seconds")
        except Exception as e:
            logging.error(f"Error calculating total time: {str(e)}")
            raise

    def update_current_session(self, is_active):
        try:
            current_time = datetime.now()
            if is_active and not self.data["current_session"]["is_active"]:
                self.data["current_session"]["start_time"] = current_time.isoformat()
                self.data["current_session"]["is_active"] = True
                logging.info(f"Session started at {self.data['current_session']['start_time']}")
            elif not is_active and self.data["current_session"]["is_active"]:
                self.data["current_session"]["start_time"] = None
                self.data["current_session"]["is_active"] = False
                logging.info("Session ended")
            self.save_data()
        except Exception as e:
            logging.error(f"Error updating current session: {str(e)}")
            raise

    def is_system_shutting_down(self):
        try:
            for proc in psutil.process_iter(['name']):
                if proc.info['name'] in ['shutdown', 'reboot', 'halt']:
                    return True
            return False
        except:
            return False

    def is_network_available(self):
        try:
            socket.create_connection(("8.8.8.8", 53), timeout=3)
            return True
        except OSError:
            return False

    def is_user_logged_out(self):
        try:
            # Check if X server is running
            if not os.path.exists("/tmp/.X11-unix/X0"):
                return True
            
            # Check if gnome-session is running
            for proc in psutil.process_iter(['name']):
                if proc.info['name'] == 'gnome-session':
                    return False
            return True
        except:
            return False

    def is_screen_locked(self):
        try:
            # Use loginctl to check session status
            result = subprocess.run(['loginctl', 'show-session', 'self', '-p', 'LockedHint'], 
                                 capture_output=True, text=True)
            return result.stdout.strip() == 'yes'
        except Exception as e:
            logging.error(f"Error checking screen lock status: {e}")
            return False

    def handle_signal(self, signum, frame):
        logging.info("Received shutdown signal, saving data...")
        self.log_event('system_shutdown')
        sys.exit(0)

    def run(self):
        # Set up signal handlers
        signal.signal(signal.SIGTERM, self.handle_signal)
        signal.signal(signal.SIGINT, self.handle_signal)
        
        logging.info("Starting screen time tracker...")
        last_lock_state = self.is_screen_locked()
        
        while True:
            try:
                current_lock_state = self.is_screen_locked()
                
                if current_lock_state != last_lock_state:
                    if current_lock_state:
                        self.log_event('lock')
                    else:
                        self.log_event('unlock')
                    last_lock_state = current_lock_state
                
                # Check for system shutdown
                if self.is_system_shutting_down():
                    self.log_event('system_shutdown')
                    self.calculate_total_time()
                    sys.exit(0)

                # Check for logout with improved detection
                if self.is_user_logged_out():
                    self.log_event('logout')
                    self.calculate_total_time()
                    sys.exit(0)
                
                # Check for network status changes
                if not self.is_network_available():
                    logging.warning("Network connection lost")
                
                time.sleep(1)
            except Exception as e:
                logging.error(f"Error in main loop: {e}")
                time.sleep(5)

def main():
    try:
        logging.info("Starting screen time tracker")
        logging.info(f"Python version: {sys.version}")
        logging.info(f"Current user: {os.getenv('USER')}")
        logging.info(f"Display: {os.getenv('DISPLAY')}")
        
        tracker = ScreenTimeTracker()
        
        # Log system startup
        tracker.log_event("startup")
        
        tracker.run()
    except Exception as e:
        logging.error(f"Fatal error in main: {str(e)}")
        raise

if __name__ == "__main__":
    main() 