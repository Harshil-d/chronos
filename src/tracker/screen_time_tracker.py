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
            
            # Initialize current_session from data
            self.current_session = self.data.get("current_session", {
                "is_active": False,
                "start_time": None
            })
        except Exception as e:
            logging.error(f"Error loading data: {str(e)}")
            raise
    
    def save_data(self):
        try:
            # Update data with current session before saving
            self.data["current_session"] = self.current_session
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
                
            # Prevent duplicate startup events within 5 minutes
            if event_type == 'startup':
                for event in reversed(self.data["events"]):
                    if event["type"] == "startup":
                        event_time = datetime.fromisoformat(event["timestamp"])
                        if (current_time - event_time).total_seconds() < 300:  # 5 minutes
                            logging.warning(f"Skipping duplicate startup event within 5 minutes")
                            return
            
            self.last_event_time = current_time
            event = {
                "timestamp": current_time.isoformat(),
                "type": event_type
            }
            self.data["events"].append(event)
            
            # Update current session
            if event_type == 'unlock' or event_type == 'startup':
                if not self.current_session['is_active']:
                    self.current_session = {
                        'is_active': True,
                        'start_time': current_time.isoformat()
                    }
                    logging.info(f"Session started at {self.current_session['start_time']}")
            elif event_type in ['lock', 'logout', 'system_shutdown']:
                if self.current_session['is_active']:
                    start_time = datetime.fromisoformat(self.current_session['start_time'])
                    duration = (current_time - start_time).total_seconds()
                    self.data["total_time"] += duration
                    logging.info(f"Session ended. Duration: {duration} seconds")
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
            # Don't reset total_time, only add new session time if needed
            if self.current_session['is_active'] and self.current_session['start_time']:
                start_time = datetime.fromisoformat(self.current_session['start_time'])
                end_time = datetime.now()
                session_duration = (end_time - start_time).total_seconds()
                self.data["total_time"] += session_duration
                logging.info(f"Added current session time: {session_duration} seconds")
            
            self.save_data()
            logging.info(f"Total time: {self.data['total_time']} seconds")
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
            # Check for shutdown processes
            for proc in psutil.process_iter(['name']):
                if proc.info['name'] in ['shutdown', 'reboot', 'halt', 'poweroff']:
                    return True
            
            # Check for systemd shutdown state
            result = subprocess.run(['systemctl', 'is-system-running'], 
                                 capture_output=True, text=True)
            if result.stdout.strip() == 'stopping':
                return True
                
            return False
        except Exception as e:
            logging.error(f"Error checking system shutdown status: {e}")
            return False

    def is_network_available(self):
        try:
            socket.create_connection(("8.8.8.8", 53), timeout=3)
            return True
        except OSError:
            return False

    def is_user_logged_out(self):
        try:
            # Get current session ID
            session_id = subprocess.run(['loginctl', 'show-user', 'self', '-p', 'Display'], 
                                     capture_output=True, text=True).stdout.strip().split('=')[1]
            
            if not session_id:
                return True

            # Check session state
            session_state = subprocess.run(['loginctl', 'show-session', session_id], 
                                        capture_output=True, text=True).stdout.strip()
            
            # If session is not active or closing
            if 'State=closing' in session_state or 'Active=no' in session_state:
                return True

            # Check GNOME session status
            gnome_session = subprocess.run(['gnome-session-status'], 
                                        capture_output=True, text=True)
            if gnome_session.returncode != 0:
                # Only return True if we also have session state confirmation
                return 'Active=no' in session_state

            return False

        except Exception as e:
            logging.error(f"Error checking user logout status: {e}")
            # Default to false to prevent false positives
            return False

    def is_screen_locked(self):
        try:
            # Method 1: Check using loginctl
            result = subprocess.run(['loginctl', 'show-session', 'self', '-p', 'LockedHint'], 
                                 capture_output=True, text=True)
            if result.stdout.strip() == 'yes':
                return True

            # Method 2: Check using gnome-screensaver-command
            try:
                result = subprocess.run(['gnome-screensaver-command', '-q'], 
                                     capture_output=True, text=True)
                if 'is active' in result.stdout.lower():
                    return True
            except:
                pass

            # Method 3: Check using dbus
            try:
                result = subprocess.run(['dbus-send', '--session', '--dest=org.gnome.ScreenSaver', 
                                      '--type=method_call', '--print-reply', '/org/gnome/ScreenSaver', 
                                      'org.gnome.ScreenSaver.GetActive'], 
                                     capture_output=True, text=True)
                if 'boolean true' in result.stdout.lower():
                    return True
            except:
                pass

            # Method 4: Check using xdg-screensaver
            try:
                result = subprocess.run(['xdg-screensaver', 'status'], 
                                     capture_output=True, text=True)
                if 'is active' in result.stdout.lower():
                    return True
            except:
                pass

            # Method 5: Check using xset
            try:
                result = subprocess.run(['xset', 'q'], 
                                     capture_output=True, text=True)
                if 'monitor is off' in result.stdout.lower():
                    return True
            except:
                pass

            return False

        except Exception as e:
            logging.error(f"Error checking screen lock status: {e}")
            # If we can't determine the lock status, assume it's not locked
            return False

    def handle_signal(self, signum, frame):
        logging.info("Received shutdown signal, saving data...")
        self.log_event('system_shutdown')
        self.calculate_total_time()
        sys.exit(0)

    def run(self):
        # Set up signal handlers
        signal.signal(signal.SIGTERM, self.handle_signal)
        signal.signal(signal.SIGINT, self.handle_signal)
        
        logging.info("Starting screen time tracker...")
        last_lock_state = self.is_screen_locked()
        last_check_time = datetime.now()
        last_logout_check = False
        
        while True:
            try:
                current_time = datetime.now()
                current_lock_state = self.is_screen_locked()
                current_logout_state = self.is_user_logged_out()
                
                # Only process state changes if enough time has passed (2 seconds minimum)
                if (current_time - last_check_time).total_seconds() >= 2:
                    # Handle lock state changes
                    if current_lock_state != last_lock_state:
                        if current_lock_state:
                            logging.info("Screen locked detected")
                            self.log_event('lock')
                        else:
                            logging.info("Screen unlocked detected")
                            self.log_event('unlock')
                        last_lock_state = current_lock_state
                        last_check_time = current_time
                    
                    # Handle logout state changes
                    if current_logout_state and not last_logout_check:
                        self.log_event('logout')
                        self.calculate_total_time()
                        sys.exit(0)
                    last_logout_check = current_logout_state
                
                time.sleep(2)  # Check every 2 seconds
            except Exception as e:
                logging.error(f"Error in main loop: {e}")
                time.sleep(2)

def main():
    try:
        logging.info("Starting screen time tracker")
        logging.info(f"Python version: {sys.version}")
        logging.info(f"Current user: {os.getenv('USER')}")
        logging.info(f"Display: {os.getenv('DISPLAY')}")
        logging.info(f"Working directory: {os.getcwd()}")
        
        tracker = ScreenTimeTracker()
        
        # Check if we should log a startup event
        should_log_startup = True
        current_time = datetime.now()

        # Look at recent events
        if tracker.data["events"]:
            last_event = tracker.data["events"][-1]
            last_event_time = datetime.fromisoformat(last_event["timestamp"])
            time_since_last = (current_time - last_event_time).total_seconds()

            logging.info(f"Last event: {last_event['type']} at {last_event_time}")
            logging.info(f"Time since last event: {time_since_last} seconds")

            # If last event was a startup and it was recent (within 5 minutes)
            if last_event["type"] == "startup" and time_since_last < 300:
                logging.info("Skipping startup event - last startup was too recent")
                should_log_startup = False
            # If last event was shutdown/logout, always allow new startup regardless of time
            elif last_event["type"] in ["system_shutdown", "logout"]:
                logging.info("Last event was shutdown/logout - allowing new startup")
                should_log_startup = True
            else:
                logging.info(f"Last event was {last_event['type']} - allowing new startup")
            
        if should_log_startup:
            logging.info("Logging startup event")
            tracker.log_event("startup")
            tracker.current_session['is_active'] = True
            tracker.current_session['start_time'] = current_time.isoformat()
            tracker.save_data()
            logging.info("Startup event logged successfully")
        
        # Add a small delay after startup to ensure system is stable
        time.sleep(5)
        
        # Verify the service is still running after startup
        if not os.path.exists('/proc/self'):
            logging.error("Service process no longer exists after startup")
            return
            
        logging.info("Starting main tracking loop")
        tracker.run()
    except Exception as e:
        logging.error(f"Fatal error in main: {str(e)}")
        logging.error(f"Error type: {type(e).__name__}")
        import traceback
        logging.error(f"Traceback: {traceback.format_exc()}")
        raise

if __name__ == "__main__":
    main() 