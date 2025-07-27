import pandas as pd
import numpy as np
import re
import googlemaps
import time

# Input Excel file path
input_path = "V8 Heat Map Data - FHR Partner Organisations 20250722 (2).xlsx"

# Read the Excel file
xls = pd.ExcelFile(input_path)
output_data = {}

## 1. Standardise province names for province filter:

# Province normalization function
def normalize_province(province):
    if not isinstance(province, str):
        return province
    cleaned = re.sub(r'\s+', ' ', province.strip().lower().replace('-', ' '))
    mapping = {
        "kwazulu natal": "KwaZulu-Natal",
        "eastern cape": "Eastern Cape",
        "western cape": "Western Cape",
        "northern cape": "Northern Cape",
        "north west": "North West",
        "free state": "Free State",
        "gauteng": "Gauteng",
        "limpopo": "Limpopo",
        "mpumalanga": "Mpumalanga"
    }
    return mapping.get(cleaned, province.strip())

## 2. Geocoding at the town level:

# Initialize Google Maps client
gmaps = googlemaps.Client(key='AIzaSyBqqc8p-2Xhcqa3744XX_iS5d5JywQvFGI')

# Define geocoding function
def geocode_address(address):
    try:
        geocode_result = gmaps.geocode(address)
        if geocode_result:
            location = geocode_result[0]['geometry']['location']
            return location['lat'], location['lng']
    except Exception as e:
        print(f"Error geocoding {address}: {e}")
    return None, None

# Process each sheet
for sheet_name in xls.sheet_names:
    print(f"Processing sheet: {sheet_name}")
    df = xls.parse(sheet_name)
    if "Province" in df.columns:
        df["Province"] = df["Province"].apply(normalize_province)

    # Identify location fields
    if "Town" in df.columns and "Province" in df.columns:
        df["Full_Location"] = df["Town"].astype(str) + ", " + df["Province"].astype(str)
    elif "School Name" in df.columns and "Province" in df.columns:
        df["Full_Location"] = df["School Area"].astype(str) + df["Town"].astype(str) + ", " + df["Province"].astype(str)    
    elif "Place of apartheid crime" in df.columns and "Province" in df.columns:
        df["Full_Location"] = df["Place of apartheid crime"].astype(str) + ", " + df["Province"].astype(str)
    else:
        print(f"Skipping sheet {sheet_name} — required location columns not found.")
        continue

    # Ensure Latitude and Longitude columns exist
    if "Latitude" not in df.columns:
	    df["Latitude"] = None
    if "Longitude" not in df.columns:
	    df["Longitude"] = None

    # Geocode missing lat/lon
    for idx in df[df["Latitude"].isnull() | df["Longitude"].isnull()].index:
	    address = df.at[idx, "Full_Location"]
	    lat, lon = geocode_address(address)
	    df.at[idx, "Latitude"] = lat
	    df.at[idx, "Longitude"] = lon
	    #print(f"Geocoded: {address} → {lat}, {lon}")
	    time.sleep(0.25)

    # Add jitter to overlapping coordinates
    if "Latitude" in df.columns and "Longitude" in df.columns:
        dups = df.duplicated(subset=["Latitude", "Longitude"], keep=False)
        jitter_amount = 0.01  # approx 1km variation
        df.loc[dups, "Latitude"] += np.random.uniform(-jitter_amount, jitter_amount, size=dups.sum())
        df.loc[dups, "Longitude"] += np.random.uniform(-jitter_amount, jitter_amount, size=dups.sum())

    df.drop(columns=["Full_Location"], inplace=True)
    output_data[sheet_name] = df

# Save results to a new Excel file
output_path = "FHR_Partners_Geocoded.xlsx"
with pd.ExcelWriter(output_path) as writer:
    for sheet, df in output_data.items():
        df.to_excel(writer, sheet_name=sheet, index=False)

print("Geocoding complete. File saved as:", output_path)