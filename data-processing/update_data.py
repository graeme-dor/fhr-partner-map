import pandas as pd
from pathlib import Path

# Path to updated Excel file
excel_path = Path("FHR_Partners_Geocoded.xlsx")

# Read Excel file
xls = pd.ExcelFile(excel_path)

# Convert each sheet to a JSON file
for sheet_name in xls.sheet_names:
    df = xls.parse(sheet_name)

    # Fill missing with empty strings and convert all values to strings
    df = df.fillna("").astype(str)

    # Sanitize sheet name for filename
    json_filename = f"{sheet_name.replace(' ', '_')}.json"

    # Export to JSON in the same directory
    df.to_json(json_filename, orient="records", indent=2)

    print(f"Exported: {json_filename}")

print("All JSON files exported successfully.")