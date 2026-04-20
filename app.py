import os
from flask import Flask, request, jsonify, send_from_directory, session
from flask_session import Session
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment logic
load_dotenv()

app = Flask(__name__, static_url_path='', static_folder='.')

# Secure Session Configuration
app.config['SECRET_KEY'] = os.environ.get('FLASK_SECRET_KEY', 'fallback-development-key-123')
app.config['SESSION_TYPE'] = 'filesystem'
Session(app)

# Init Supabase
url: str = os.environ.get("SUPABASE_URL", "")
key: str = os.environ.get("SUPABASE_KEY", "")

supabase = None
try:
    if url and key and url.startswith("http"):
        supabase = create_client(url, key)
    else:
        print("===================================================================")
        print("CRITICAL WARNING: PLEASE FILL OUT YOUR .ENV FILE WITH VALID URLS!")
        print("The portfolio will boot, but the database saves will fail safely.")
        print("===================================================================")
except Exception as e:
    print(f"Failed to boot database connection: {e}")

# Load local fallback data from data.json if present
DEFAULT_DATA = {}
try:
    with open('data.json', 'r', encoding='utf-8') as f:
        import json
        DEFAULT_DATA = json.load(f)
except Exception:
    DEFAULT_DATA = {}

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/admin')
def admin():
    return send_from_directory('admin', 'index.html')

@app.route('/api/login', methods=['POST'])
def login():
    try:
        if not supabase:
            return jsonify({"error": "Auth backend not configured. Set SUPABASE_URL and SUPABASE_KEY in .env."}), 500
        credentials = request.json
        res = supabase.auth.sign_in_with_password({
            "email": credentials.get('email'),
            "password": credentials.get('password')
        })
        # Save session tokens to flask securely
        session['user_id'] = res.user.id
        session['access_token'] = res.session.access_token
        session['refresh_token'] = res.session.refresh_token
        # Make the session persistent so the browser retains it across refreshes
        session.permanent = True
        return jsonify({"status": "success"})
    except Exception as e:
        return jsonify({"error": str(e)}), 401


@app.route('/api/session', methods=['GET'])
def session_status():
    # Simple endpoint for the frontend to check whether a user session exists
    if session.get('user_id') and session.get('access_token'):
        return jsonify({"logged_in": True, "user_id": session.get('user_id')})
    return jsonify({"logged_in": False})

@app.route('/api/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({"status": "success"})

@app.route('/api/data', methods=['GET'])
def get_data():
    try:
        # If Supabase isn't configured, return local fallback data
        if not supabase:
            return jsonify(DEFAULT_DATA)

        # Public select access (if RLS public SELECT is enabled)
        response = supabase.table('portfolio_settings').select('data').eq('id', 1).execute()
        if hasattr(response, 'data') and response.data and len(response.data) > 0:
            return jsonify(response.data[0]['data'])
        # If no DB record exists yet, return local fallback (empty or defaults)
        return jsonify(DEFAULT_DATA)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/data', methods=['POST'])
def update_data():
    if not session.get('user_id') or not session.get('access_token'):
        return jsonify({"error": "Unauthorized Access. Please login via /admin."}), 401
    
    try:
        data = request.json
        # If Supabase is not configured, persist locally to data.json as a fallback
        if not supabase:
            try:
                import json
                with open('data.json', 'w', encoding='utf-8') as f:
                    json.dump(data, f, indent=4, ensure_ascii=False)
                # update in-memory fallback
                global DEFAULT_DATA
                DEFAULT_DATA = data
                return jsonify({"status": "success", "message": "Saved to local data.json (no DB configured)."})
            except Exception as write_err:
                return jsonify({"error": f"Local save failed: {write_err}"}), 500

        # Hydrate the client session to pass strict update RLS policies
        if hasattr(supabase, 'auth'):
            supabase.auth.set_session(session.get('access_token'), session.get('refresh_token'))

        # Upsert the JSON cleanly
        supabase.table('portfolio_settings').upsert({
            'id': 1,
            'data': data
        }).execute()

        return jsonify({"status": "success", "message": "Supabase sync complete!"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/<path:path>')
def send_static(path):
    return send_from_directory('.', path)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
