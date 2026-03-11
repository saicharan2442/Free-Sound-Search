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
    """Search sounds from Freesound API - fetches results with timeout"""
    query = request.args.get("q")

    if not query:
        return jsonify({"error": "Query is required"}), 400

    all_results = []
    page = 1
    max_pages = 20  # Limit to 20 pages = 3000 results max
    
    try:
        while page <= max_pages:
            params = {
                "query": query,
                "token": API_KEY,
                "fields": "id,name,username,previews,duration",
                "limit": 150,  # Max results per page
                "page": page
            }
            
            try:
                response = requests.get(BASE_URL, params=params, timeout=10)
                print(f"Fetching page {page} - Status Code: {response.status_code}")

                if response.status_code == 200:
                    data = response.json()
                    results = data.get("results", [])
                    
                    # If no results on this page, stop pagination
                    if not results:
                        print(f"No results on page {page}, stopping pagination")
                        break
                    
                    all_results.extend(results)
                    print(f"Page {page} loaded: {len(results)} results, total: {len(all_results)}")
                    page += 1
                else:
                    print(f"API error on page {page}: {response.status_code}")
                    # Return what we have if API fails on a later page
                    if all_results:
                        break
                    return jsonify({"error": "Failed to fetch sounds from Freesound API"}), 500
                    
            except requests.Timeout:
                print(f"Timeout on page {page}")
                # Return what we have if timeout occurs
                if all_results:
                    break
                return jsonify({"error": "Request timeout while fetching sounds"}), 500
            except Exception as page_err:
                print(f"Error on page {page}: {str(page_err)}")
                # Return what we have accumulated
                if all_results:
                    break
                return jsonify({"error": f"Error fetching sounds: {str(page_err)}"}), 500

        print(f"Total results fetched: {len(all_results)}")
        return jsonify(all_results)

    except Exception as e:
        print(f"General error: {str(e)}")
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
