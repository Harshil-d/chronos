#!/usr/bin/env python3
import http.server
import socketserver
import os
import logging
from pathlib import Path
from datetime import datetime

# Set up logging
log_dir = Path(__file__).parent.parent.parent / 'logs'
log_dir.mkdir(exist_ok=True)
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(log_dir / 'viewer_server.log'),
        logging.StreamHandler()
    ]
)

class CORSRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add CORS headers
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def translate_path(self, path):
        # Get the base directory (where the script is located)
        base_dir = Path(__file__).parent.parent.parent
        
        # Remove leading slash and split path
        path = path.lstrip('/')
        
        # Map the URL paths to the actual file system paths
        if path == '' or path == 'index.html':
            return str(base_dir / 'screen_time_viewer.html')
        elif path.startswith('static/'):
            return str(base_dir / path)
        elif path.startswith('data/'):
            full_path = base_dir / path
            logging.info(f"Serving data file: {full_path}")
            if not full_path.exists():
                logging.error(f"Data file not found: {full_path}")
            return str(full_path)
        elif path == 'manifest.json':
            return str(base_dir / path)
        elif path == 'sw.js':
            return str(base_dir / path)
        elif path == 'screen_time_viewer.html':
            return str(base_dir / path)
        
        # For any other path, serve the main HTML file
        return str(base_dir / 'screen_time_viewer.html')

def main():
    PORT = 4567
    try:
        # Change to the project root directory
        root_dir = Path(__file__).parent.parent.parent
        os.chdir(root_dir)
        
        # Log the current working directory and data directory
        logging.info(f"Server root directory: {root_dir}")
        logging.info(f"Data directory: {root_dir / 'data' / 'screen_time_data'}")
        
        with socketserver.TCPServer(("", PORT), CORSRequestHandler) as httpd:
            logging.info(f"Starting server on port {PORT}")
            logging.info(f"View the screen time tracker at http://localhost:{PORT}/")
            httpd.serve_forever()
    except Exception as e:
        logging.error(f"Error starting server: {e}")
        raise

if __name__ == "__main__":
    main() 