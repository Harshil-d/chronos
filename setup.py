from setuptools import setup, find_packages

setup(
    name="screen-time-tracker",
    version="0.1.0",
    packages=find_packages(where="src"),
    package_dir={"": "src"},
    install_requires=[
        "flask>=3.0.2",
        "flask-cors>=4.0.0",
        "python-dateutil>=2.8.2",
        "typing-extensions>=4.9.0",
    ],
    entry_points={
        "console_scripts": [
            "screen-time-tracker=tracker.core.screen_time_tracker:main",
            "screen-time-server=server.app:run_server",
        ],
    },
    author="Your Name",
    author_email="your.email@example.com",
    description="A screen time tracking application",
    long_description=open("README.md").read(),
    long_description_content_type="text/markdown",
    url="https://github.com/yourusername/screen-time-tracker",
    classifiers=[
        "Development Status :: 3 - Alpha",
        "Intended Audience :: End Users/Desktop",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
    ],
    python_requires=">=3.8",
) 