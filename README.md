

1. ✅ Target only a specific file (e.g., values.yaml) using a CLI argument.


2. ✅ Preview the changes before applying.


3. ✅ Ask for confirmation (yes/no) before saving.




---

🛠️ Updated Script: update_tenant_values.py

import argparse
import yaml
import difflib
import copy
import os
import sys

def get_tenant_keys(data, path=''):
    tenant_keys = []
    if isinstance(data, dict):
        for key, value in data.items():
            full_key = f"{path}.{key}" if path else key
            if key.startswith('tenant_'):
                tenant_keys.append(full_key)
            tenant_keys += get_tenant_keys(value, full_key)
    elif isinstance(data, list):
        for i, item in enumerate(data):
            full_key = f"{path}[{i}]"
            tenant_keys += get_tenant_keys(item, full_key)
    return tenant_keys

def set_value_by_path(data, path, new_value):
    keys = path.replace('[', '.[').split('.')
    current = data
    for i, key in enumerate(keys):
        if '[' in key:
            key_part, index = key[:-1].split('[')
            index = int(index)
            current = current[key_part][index] if key_part else current[index]
        else:
            if i == len(keys) - 1:
                current[key] = new_value
            else:
                current = current[key]

def show_diff(original_yaml, modified_yaml):
    original_str = yaml.dump(original_yaml, default_flow_style=False)
    modified_str = yaml.dump(modified_yaml, default_flow_style=False)
    diff = difflib.unified_diff(
        original_str.splitlines(keepends=True),
        modified_str.splitlines(keepends=True),
        fromfile='original',
        tofile='modified'
    )
    print("\n--- Preview of changes ---")
    for line in diff:
        print(line, end='')

def update_yaml_file(file_path):
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        sys.exit(1)

    print(f"\n📄 Processing: {file_path}")
    with open(file_path, 'r') as f:
        original_content = yaml.safe_load(f)

    if original_content is None:
        print("⚠️ Empty or invalid YAML.")
        return

    modified_content = copy.deepcopy(original_content)
    tenant_keys = get_tenant_keys(original_content)

    if not tenant_keys:
        print("✅ No 'tenant_' keys found.")
        return

    for key_path in tenant_keys:
        value = input(f"Enter value for '{key_path}': ")
        set_value_by_path(modified_content, key_path, value)

    show_diff(original_content, modified_content)

    confirm = input("\n💾 Do you want to apply these changes? (yes/no): ").strip().lower()
    if confirm in ['y', 'yes']:
        with open(file_path, 'w') as f:
            yaml.dump(modified_content, f, default_flow_style=False)
        print(f"✅ Changes applied to: {file_path}")
    else:
        print("❌ Changes discarded.")

def main():
    parser = argparse.ArgumentParser(description="Update tenant_ keys in a values.yaml file.")
    parser.add_argument('file', help='Path to the target values.yaml file')

    args = parser.parse_args()
    update_yaml_file(args.file)

if __name__ == "__main__":
    main()


---

✅ How to Use

1. Save the script as update_tenant_values.py.


2. Run it like this:



python3 update_tenant_values.py values.yaml


---

✨ Features Summary

Prompts you only for tenant_ keys.

Shows a preview of what's changing with a side-by-side diff.

Applies changes only after confirmation 

