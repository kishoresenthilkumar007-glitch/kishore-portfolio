import os
import json
import getpass
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment logic
load_dotenv()

url = os.environ.get("SUPABASE_URL", "")
key = os.environ.get("SUPABASE_KEY", "")

if not url or not key or not url.startswith("http"):
    print("CRITICAL: PLEASE FILL OUT YOUR .ENV FILE WITH VALID URLS BEFORE RUNNING!")
    exit(1)

supabase: Client = create_client(url, key)

print("=== Supabase Database Seeder ===")
print("In order to safely bypass RLS as an admin, please provide your Supabase login credentials:")
email = input("Email: ")
password = getpass.getpass("Password: ")

try:
    print("Logging in...")
    res = supabase.auth.sign_in_with_password({"email": email, "password": password})
    print("Login successful!")
except Exception as e:
    print(f"Login Failed: {e}")
    exit(1)

print("Loading local data.json...")
try:
    with open('data.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
except Exception as e:
    print(f"Failed to read data.json: {e}")
    exit(1)

# Now upsert
print("Injecting default data into portfolio_settings...")
try:
    response = supabase.table('portfolio_settings').upsert({
        'id': 1,
        'data': data
    }).execute()
    print("Seeding Complete! Refresh your live site.")
except Exception as e:
    print(f"Insertion failed! Make sure you executed the RLS Policy fix in your Supabase dashboard.\nError: {e}")

