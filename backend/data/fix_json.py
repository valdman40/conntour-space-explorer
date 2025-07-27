#!/usr/bin/env python3
"""Script to fix the corrupted search_history.json file."""

import json
import os

def fix_search_history_json():
    file_path = "search_history.json"
    backup_path = "search_history_backup.json"
    
    print(f"Checking file: {file_path}")
    
    if not os.path.exists(file_path):
        print("File doesn't exist!")
        return
    
    # Create backup
    print("Creating backup...")
    with open(file_path, 'rb') as src, open(backup_path, 'wb') as dst:
        dst.write(src.read())
    
    # Try to read and identify the issue
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        print(f"File size: {len(content)} characters")
        print(f"Last 200 characters:")
        print(repr(content[-200:]))
        
        # Try to parse
        data = json.loads(content)
        print(f"JSON is valid! Contains {len(data)} items")
        
    except json.JSONDecodeError as e:
        print(f"JSON Error: {e}")
        print(f"Error at line {e.lineno}, column {e.colno}")
        
        # Try to find and fix common issues
        lines = content.split('\n')
        problem_line_idx = e.lineno - 1
        
        if problem_line_idx < len(lines):
            print(f"Problem line: {repr(lines[problem_line_idx])}")
            
        # Common fixes
        if content.endswith(','):
            print("File ends with comma, removing it...")
            content = content.rstrip(',').strip()
            
        if not content.endswith(']'):
            print("File doesn't end with ], adding it...")
            content = content.rstrip() + '\n]'
            
        # Try to parse again
        try:
            data = json.loads(content)
            print(f"Fixed! JSON now contains {len(data)} items")
            
            # Write the fixed version
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            print("Fixed file saved!")
            
        except json.JSONDecodeError as e2:
            print(f"Still has JSON error: {e2}")
            
            # If still broken, try to salvage what we can
            print("Attempting to salvage data...")
            try:
                # Find the last complete entry
                bracket_count = 0
                last_good_pos = 0
                
                for i, char in enumerate(content):
                    if char == '[':
                        bracket_count += 1
                    elif char == ']':
                        bracket_count -= 1
                    elif char == '{':
                        bracket_count += 1
                    elif char == '}':
                        bracket_count -= 1
                        if bracket_count == 1:  # We're back to just the main array
                            last_good_pos = i + 1
                
                # Truncate to last good position and close array
                salvaged_content = content[:last_good_pos].rstrip().rstrip(',') + '\n]'
                
                data = json.loads(salvaged_content)
                print(f"Salvaged {len(data)} items")
                
                with open(file_path, 'w', encoding='utf-8') as f:
                    json.dump(data, f, indent=2, ensure_ascii=False)
                print("Salvaged file saved!")
                
            except Exception as e3:
                print(f"Salvage failed: {e3}")
                print("Creating empty array...")
                with open(file_path, 'w', encoding='utf-8') as f:
                    json.dump([], f)
                print("Created empty search history file")

if __name__ == "__main__":
    fix_search_history_json()
