#!/usr/bin/env python3
"""Debug script to check search history loading."""

import os
import sys
sys.path.append(os.path.dirname(__file__))

from data.db import SpaceDB

def debug_search_history():
    print("=== Search History Debug ===")
    
    # Check if the file exists
    db_instance = SpaceDB()
    history_file_path = db_instance._history_file_path
    
    print(f"History file path: {history_file_path}")
    print(f"File exists: {os.path.exists(history_file_path)}")
    
    if os.path.exists(history_file_path):
        print(f"File size: {os.path.getsize(history_file_path)} bytes")
    
    # Check what's loaded in memory
    search_history = db_instance._search_history
    print(f"Search history items in memory: {len(search_history)}")
    
    if search_history:
        print("First item:")
        print(search_history[0])
    else:
        print("No search history items found!")
        
        # Try to manually load the file
        print("\n=== Manual file loading ===")
        try:
            import json
            with open(history_file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                print(f"Manual load successful: {len(data)} items")
                if data:
                    print("First manually loaded item:")
                    print(data[0])
        except Exception as e:
            print(f"Manual load failed: {e}")

if __name__ == "__main__":
    debug_search_history()
