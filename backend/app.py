from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import requests
from io import BytesIO

app = Flask(__name__)
CORS(app)

# Your Freesound API Key
API_KEY = "zFJHswHd0bdYd6wBhSN9uEK9w6DA1VQy5bPESUiD"

# Freesound Search Endpoint
BASE_URL = "https://freesound.org/apiv2/search/text/"

@app.route("/", methods=["GET"])
def search_sounds():
    """Search sounds from Freesound API"""
    query = request.args.get("q")

    if not query:
        return jsonify({"error": "Query is required"}), 400

    params = {
        "query": query,
        "token": API_KEY,
        "fields": "id,name,username,previews,duration"
    }

    try:
        response = requests.get(BASE_URL, params=params)
        print(f"Status Code: {response.status_code}")

        if response.status_code == 200:
            data = response.json()
            results = data.get("results", [])
            return jsonify(results)
        else:
            return jsonify({"error": "Failed to fetch sounds from Freesound API"}), 500

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/download", methods=["GET"])
def download_sound():
    """Download sound preview"""
    preview_url = request.args.get("url")
    sound_name = request.args.get("name", "sound")

    if not preview_url:
        return jsonify({"error": "URL is required"}), 400

    try:
        response = requests.get(preview_url, stream=True)
        
        if response.status_code == 200:
            return send_file(
                BytesIO(response.content),
                mimetype="audio/mpeg",
                as_attachment=True,
                download_name=f"{sound_name}.mp3"
            )
        else:
            return jsonify({"error": "Failed to download sound"}), 500

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)
