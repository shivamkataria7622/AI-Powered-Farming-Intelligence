import requests
import pandas as pd
import json

def test_market_api():
    """
    This function calls the government's market price API and prints the raw data
    to help us debug the filtering issue.
    """
    print("--- Starting API Test ---")
    
    try:
        api_key = "579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b"
        # We will fetch the latest 1000 records without any state filter
        url = (f"https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070"
               f"?api-key={api_key}&format=json&limit=1000&sort[arrival_date]=desc")
        
        print(f"Calling API: {url}")
        response = requests.get(url, timeout=30)
        
        print(f"\nAPI Response Status Code: {response.status_code}")

        if response.status_code == 200:
            data = response.json()
            records = data.get('records', [])
            
            if not records:
                print("\nERROR: The API returned no records.")
                return

            # Convert the raw data into a pandas DataFrame for easy analysis
            df = pd.DataFrame(records)
            
            print("\n--- Raw Data Sample (First 5 Rows) ---")
            print(df.head())
            
            print("\n\n--- CRITICAL DEBUGGING INFO ---")
            # This is the most important part: let's see all the unique state names
            # that the API is actually sending us.
            if 'state' in df.columns:
                unique_states = df['state'].unique()
                print("Unique state names found in the API data:")
                print(list(unique_states))
            else:
                print("ERROR: The API response did not contain a 'state' column.")

        else:
            print("\nERROR: Failed to fetch data from the API.")
            print("Response Text:", response.text)

    except Exception as e:
        print(f"\nAn error occurred during the test: {e}")

if __name__ == '__main__':
    test_market_api()



    
