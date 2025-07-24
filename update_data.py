import pandas as pd
from pathlib import Path

# Path to updated Excel file
excel_path = Path("data/FHR_Partners_Geocoded.xlsx")
output_dir = Path("data")

# Read Excel file
xls = pd.ExcelFile(excel_path)

# Convert each sheet to a JSON file
for sheet_name in xls.sheet_names:
    df = xls.parse(sheet_name)

    # Fill missing with empty strings and ensure strings for JSON compatibility
    df = df.fillna("").astype(str)

    # Convert to filename-friendly format
    json_filename = f"{sheet_name.replace(' ', '_')}.json"
    json_path = output_dir / json_filename

    # Export to JSON
    df.to_json(json_path, orient="records", indent=2)

    print(f"Updated: {json_filename}")

print("All JSON files updated successfully.")
