#!/usr/bin/env python3
"""
Music Popularity Predictor - Startup Script
This script opens two terminal windows - one for backend and one for frontend.
Both servers will run in the background, giving you control of your main terminal.
"""

import subprocess
import sys
import os
import time
from pathlib import Path

def check_command(command):
    """Check if a command is available"""
    try:
        result = subprocess.run([command, '--version'], capture_output=True, text=True)
        return result.returncode == 0
    except FileNotFoundError:
        return False

def open_terminal_window(command, title, working_dir):
    """Open a new terminal window with a specific command"""
    # macOS Terminal.app command
    terminal_cmd = [
        'osascript', '-e',
        f'tell application "Terminal" to do script "cd {working_dir} && {command}"'
    ]
    
    # Set the title of the terminal window
    title_cmd = [
        'osascript', '-e',
        f'tell application "Terminal" to set custom title of front window to "{title}"'
    ]
    
    try:
        # Open the terminal window
        subprocess.run(terminal_cmd, check=True)
        time.sleep(1)  # Wait a bit for the window to open
        
        # Set the title (this might not work perfectly due to timing)
        try:
            subprocess.run(title_cmd, check=True)
        except:
            pass  # Title setting is optional
            
        return True
    except subprocess.CalledProcessError as e:
        print(f"Failed to open terminal window: {e}")
        return False

def main():
    print("Music Popularity Predictor - Multi-Terminal Startup")
    print("=" * 60)
    
    # Check required commands
    if not check_command('python3'):
        print("Python 3 is not available! Please install Python 3.")
        return
    
    if not check_command('npm'):
        print("npm is not available! Please install Node.js first.")
        print("   You can install it with: brew install node")
        return
    
    # Get the current directory
    current_dir = Path(__file__).parent.absolute()
    backend_dir = current_dir / "Backend"
    frontend_dir = current_dir / "Frontend"
    
    # Check if directories exist
    if not backend_dir.exists():
        print("Backend directory not found!")
        return
    
    if not frontend_dir.exists():
        print("Frontend directory not found!")
        return
    
    # Check if virtual environment exists
    venv_path = backend_dir / "venv"
    if not venv_path.exists():
        print("Virtual environment not found in Backend directory!")
        print("   Please run: cd Backend && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt")
        return
    
    print("Opening terminal windows for both servers...")
    print()
    
    # Start backend in new terminal window
    print("1. Opening Backend Terminal...")
    backend_cmd = f"source venv/bin/activate && python3 app.py"
    backend_success = open_terminal_window(
        backend_cmd, 
        "Music Predictor - Backend", 
        str(backend_dir)
    )
    
    if backend_success:
        print("   Backend terminal opened successfully")
    else:
        print("   Failed to open backend terminal")
        return
    
    # Wait a bit for backend to start
    time.sleep(2)
    
    # Start frontend in new terminal window
    print("2. Opening Frontend Terminal...")
    frontend_cmd = "npm start"
    frontend_success = open_terminal_window(
        frontend_cmd, 
        "Music Predictor - Frontend", 
        str(frontend_dir)
    )
    
    if frontend_success:
        print("   Frontend terminal opened successfully")
    else:
        print("   Failed to open frontend terminal")
        return
    
    print()
    print("Both terminal windows have been opened!")
    print()
    print("Backend: http://localhost:5001")
    print("Frontend: http://localhost:3000")
    print()
    print("Instructions:")
    print("   • Backend terminal: Flask server running in background")
    print("   • Frontend terminal: React dev server running in background")
    print("   • Both servers will continue running even if you close this terminal")
    print("   • To stop servers: Close their respective terminal windows or use Ctrl+C")
    print()
    print("You can now:")
    print("   • Open your browser to http://localhost:3000")
    print("   • Use this terminal for other commands")
    print("   • Keep developing while servers run in background")

if __name__ == "__main__":
    main() 