#!/usr/bin/env python3
import subprocess
import time
import logging
from datetime import datetime

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('lock_detection_test.log'),
        logging.StreamHandler()
    ]
)

def test_loginctl():
    try:
        # Get current session ID
        session_id = subprocess.run(['loginctl', 'show-user', 'self', '-p', 'Display'], 
                                 capture_output=True, text=True).stdout.strip().split('=')[1]
        
        if not session_id:
            logging.error("Could not get session ID")
            return None
            
        # Get session state
        result = subprocess.run(['loginctl', 'show-session', session_id], 
                              capture_output=True, text=True)
        
        # Log the full output for debugging
        logging.info(f"Session state output: {result.stdout}")
        
        # Check for lock state
        is_locked = 'LockedHint=yes' in result.stdout
        logging.info(f"loginctl method: {'Locked' if is_locked else 'Unlocked'}")
        return is_locked
    except Exception as e:
        logging.error(f"loginctl method failed: {e}")
        return None

def main():
    logging.info("Starting screen lock detection test...")
    logging.info("Lock your screen manually to test detection")
    logging.info("Press Ctrl+C to exit")
    
    try:
        while True:
            print("\n" + "="*50)
            print(f"Testing at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
            print("="*50)
            
            # Test loginctl method
            result = test_loginctl()
            
            # Print summary
            print("\nSummary:")
            status = "Locked" if result is True else "Unlocked" if result is False else "Failed"
            print(f"loginctl: {status}")
            
            time.sleep(2)  # Wait 2 seconds before next test
            
    except KeyboardInterrupt:
        logging.info("Test stopped by user")
    except Exception as e:
        logging.error(f"Test failed: {e}")

if __name__ == "__main__":
    main() 