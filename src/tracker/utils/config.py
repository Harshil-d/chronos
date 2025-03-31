"""
Module for handling configuration settings.
"""

import os
import json
from pathlib import Path
from typing import Dict, Any

class Config:
    """Class for managing configuration settings."""

    def __init__(self, config_file: str = None):
        """
        Initialize the configuration.

        Args:
            config_file: Optional path to configuration file
        """
        self.config_file = config_file or os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
            'config.json'
        )
        self.settings = self._load_config()

    def _load_config(self) -> Dict[str, Any]:
        """
        Load configuration from file.

        Returns:
            Dict[str, Any]: Configuration settings
        """
        default_config = {
            'data_dir': os.path.join(os.path.expanduser('~'), '.screen_time'),
            'log_dir': os.path.join(os.path.expanduser('~'), '.screen_time', 'logs'),
            'idle_threshold': 300,  # 5 minutes
            'debug': False,
            'server': {
                'host': 'localhost',
                'port': 5000
            }
        }

        try:
            if os.path.exists(self.config_file):
                with open(self.config_file, 'r') as f:
                    user_config = json.load(f)
                    # Merge user config with defaults
                    return {**default_config, **user_config}
        except Exception as e:
            print(f"Error loading config file: {e}")

        return default_config

    def save(self):
        """Save current configuration to file."""
        try:
            os.makedirs(os.path.dirname(self.config_file), exist_ok=True)
            with open(self.config_file, 'w') as f:
                json.dump(self.settings, f, indent=2)
        except Exception as e:
            print(f"Error saving config file: {e}")

    def get(self, key: str, default: Any = None) -> Any:
        """
        Get a configuration value.

        Args:
            key: Configuration key
            default: Default value if key not found

        Returns:
            Any: Configuration value
        """
        return self.settings.get(key, default)

    def set(self, key: str, value: Any):
        """
        Set a configuration value.

        Args:
            key: Configuration key
            value: Configuration value
        """
        self.settings[key] = value
        self.save()

    @property
    def data_dir(self) -> str:
        """Get the data directory path."""
        return self.get('data_dir')

    @property
    def log_dir(self) -> str:
        """Get the log directory path."""
        return self.get('log_dir')

    @property
    def idle_threshold(self) -> int:
        """Get the idle threshold in seconds."""
        return self.get('idle_threshold')

    @property
    def debug(self) -> bool:
        """Get the debug mode setting."""
        return self.get('debug', False)

    @property
    def server(self) -> Dict[str, Any]:
        """Get the server configuration."""
        return self.get('server', {}) 