import argparse
import yaml
import difflib
import copy
import re
import sys
import os

def find_placeholders(data, path=''):
    matches = {}
    if isinstance(data, dict):
        for k, v in data.items():
            full_path = f"{path}.{k}" if path else k
            matches.update(find_placeholders(v, full_path))
    elif isinstance(data, list):
        for i, item in enumerate(data):
            full_path = f"{path}[{i}]"
            matches.update(find_placeholders(item, full_path))
    elif isinstance(data, str) and re.match(r'^TENANT_[A-Z0-9_]+$', data):
        matches[path] = data
    return matches

def set_value_by_path(data, path, new_value):
    keys = path.replace('[', '.[').split('.')
    current = data
    for i, key in enumerate(keys):
        if '[' in key:
            key_part, index = key[:-1].split('[')
            index = int(index)
            if key_part:
                current = current[key_part][index]
            else:
                current = current[index]
        else:
            if i == len(keys) - 1:
                current[key] = new_value
            else:
                current = current[key]

def show_diff(original, modified):
    orig_yaml = yaml.dump(original, default_flow_style=False)
    mod_yaml = yaml.dump(modified, default_flow_style=False)
    diff = difflib.unified_diff(
        orig_yaml.splitlines(keepends=True),
        mod_yaml.splitlines(keepends=True),
        fromfile='original',
        tofile='modified'
    )
    print("\n--- Preview of changes ---")
    for line in diff:
        print(line, end='')

def update_placeholders(file_path):
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        sys.exit(1)

    print(f"\n📄 Processing: {file_path}")
    with open(file_path, 'r') as f:
        original_data = yaml.safe_load(f)

    if original_data is None:
        print("⚠️ Empty or invalid YAML.")
        return

    modified_data = copy.deepcopy(original_data)
    placeholder_paths = find_placeholders(original_data)

    if not placeholder_paths:
        print("✅ No TENANT_ placeholders found.")
        return

    user_inputs = {}
    for path, placeholder in placeholder_paths.items():
        val = input(f"Enter value for placeholder '{placeholder}' (at {path}): ")
        user_inputs[path] = val

    for path, val in user_inputs.items():
        set_value_by_path(modified_data, path, val)

    show_diff(original_data, modified_data)

    confirm = input("\n💾 Apply these changes? (yes/no): ").strip().lower()
    if confirm in ['yes', 'y']:
        with open(file_path, 'w') as f:
            yaml.dump(modified_data, f, default_flow_style=False)
        print(f"✅ Changes saved to {file_path}")
    else:
        print("❌ No changes applied.")

def main():
    parser = argparse.ArgumentParser(description="Replace TENANT_ placeholders in a YAML file.")
    parser.add_argument('file', help="Path to values.yml file")
    args = parser.parse_args()
    update_placeholders(args.file)

if __name__ == "__main__":
    main()
