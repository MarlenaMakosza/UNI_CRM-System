#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Fix Polish characters in PlantUML files and set proper PNG naming
"""

import os
import re

# Polish character mapping
POLISH_CHARS = {
    'ą': 'a', 'ć': 'c', 'ę': 'e', 'ł': 'l', 'ń': 'n',
    'ó': 'o', 'ś': 's', 'ź': 'z', 'ż': 'z',
    'Ą': 'A', 'Ć': 'C', 'Ę': 'E', 'Ł': 'L', 'Ń': 'N',
    'Ó': 'O', 'Ś': 'S', 'Ź': 'Z', 'Ż': 'Z'
}

def remove_polish_chars(text):
    """Replace Polish characters with ASCII equivalents"""
    for polish, ascii_char in POLISH_CHARS.items():
        text = text.replace(polish, ascii_char)
    return text

def process_file(filepath):
    """Process a single PlantUML file"""
    print(f"Processing: {filepath}")

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Remove Polish characters
    content = remove_polish_chars(content)

    # Write back
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"  ✓ Fixed Polish characters")

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))

    puml_files = [
        '01-process-full.puml',
        '02-process-minimal.puml',
        '03-roles-permissions.puml',
        '04-data-model.puml',
        '05-use-cases.puml',
        '06-sequence-phone-contact.puml'
    ]

    for filename in puml_files:
        filepath = os.path.join(script_dir, filename)
        if os.path.exists(filepath):
            process_file(filepath)
        else:
            print(f"⚠ File not found: {filepath}")

    print("\n✅ All files processed!")
    print("\nNext step: Regenerate PNG files:")
    print("  java -jar plantuml-1.2025.0.jar -tpng *.puml")

if __name__ == '__main__':
    main()
