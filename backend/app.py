from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import requests
from io import BytesIO

try:
    from ytmusicapi import YTMusic
    YTMUSIC_AVAILABLE = True
except ImportError:
    YTMUSIC_AVAILABLE = False

try:
    import yt_dlp
    YTDLP_AVAILABLE = True
except ImportError:
    YTDLP_AVAILABLE = False

app = Flask(__name__)
CORS(app)

# Your Freesound API Key
API_KEY = "zFJHswHd0bdYd6wBhSN9uEK9w6DA1VQy5bPESUiD"

# Initialize YTMusic if available
if YTMUSIC_AVAILABLE:
    ytmusic = YTMusic()

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

@app.route("/listen-music/search", methods=["GET"])
def search_youtube_music():
    """Search music from YouTube Music API"""
    if not YTMUSIC_AVAILABLE:
        return jsonify({"error": "YouTube Music API is not installed"}), 500
    
    query = request.args.get("q")
    
    if not query:
        return jsonify({"error": "Query is required"}), 400
    
    try:
        search_results = ytmusic.search(query, filter="songs", limit=80)
        
        results = []
        for r in search_results:
            result_item = {
                "title": r.get("title", "Unknown"),
                "artist": r.get("artists")[0]["name"] if r.get("artists") else "Unknown",
                "duration": r.get("duration", 0),
                "videoId": r.get("videoId", ""),
                "id": r.get("videoId", "")
            }
            results.append(result_item)
        
        return jsonify(results), 200
    
    except Exception as e:
        print(f"Error searching YouTube Music: {str(e)}")
        return jsonify({"error": f"Search failed: {str(e)}"}), 500


@app.route("/listen-music/audio", methods=["GET"])
def get_audio_url():
    """Get audio URL from YouTube video ID"""
    if not YTDLP_AVAILABLE:
        return jsonify({"error": "Audio extraction is not available"}), 500
    
    video_id = request.args.get("videoId")
    
    if not video_id:
        return jsonify({"error": "videoId is required"}), 400
    
    try:
        youtube_url = f"https://www.youtube.com/watch?v={video_id}"
        
        # Extract audio in a format that browsers can play
        ydl_opts = {
            'format': 'bestaudio',
            'quiet': True,
            'no_warnings': True,
            'extract_flat': False,
            'socket_timeout': 30,
            'ignoreerrors': True,
        }
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(youtube_url, download=False)
            audio_url = info.get('url')
            
            if not audio_url:
                return jsonify({"error": "Could not extract audio URL"}), 500
            
            return jsonify({
                "audioUrl": audio_url,
                "format": info.get('ext', 'unknown')
            }), 200
    
    except Exception as e:
        print(f"Error extracting audio: {str(e)}")
        return jsonify({"error": f"Audio extraction failed: {str(e)}"}), 500


@app.route("/listen-music/stream", methods=["GET"])
def stream_audio():
    """Stream audio from URL (proxy for CORS)"""
    audio_url = request.args.get("url")
    
    if not audio_url:
        return jsonify({"error": "URL is required"}), 400
    
    try:
        # Request audio from the URL with proper headers
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': '*/*',
            'Origin': 'https://www.youtube.com',
            'Referer': 'https://www.youtube.com/',
        }
        
        response = requests.get(audio_url, headers=headers, stream=True, timeout=30)
        response.raise_for_status()
        
        # Determine content type from response
        content_type = response.headers.get('content-type', 'audio/mpeg')
        
        # If the content type isn't audio, set it to audio/mpeg
        if not content_type.startswith('audio'):
            content_type = 'audio/mpeg'
        
        # Stream the audio
        def generate():
            for chunk in response.iter_content(chunk_size=8192):
                if chunk:
                    yield chunk
        
        response_headers = {
            'Content-Type': content_type,
            'Access-Control-Allow-Origin': '*',
            'Accept-Ranges': 'bytes',
            'Cache-Control': 'no-cache',
        }
        
        # Get content length if available
        content_length = response.headers.get('content-length')
        if content_length:
            response_headers['Content-Length'] = content_length
        
        return generate(), 200, response_headers
    
    except requests.RequestException as e:
        print(f"Error fetching audio: {str(e)}")
        return jsonify({"error": f"Failed to fetch audio: {str(e)}"}), 500
    except Exception as e:
        print(f"Error streaming audio: {str(e)}")
        return jsonify({"error": f"Streaming failed: {str(e)}"}), 500


@app.route("/listen-music/download", methods=["GET"])
def download_audio():
    """Download audio file with proper headers"""
    if not YTDLP_AVAILABLE:
        return jsonify({"error": "Audio extraction is not available"}), 500
    
    video_id = request.args.get("videoId")
    filename = request.args.get("filename", "audio.mp3")
    
    if not video_id:
        return jsonify({"error": "videoId is required"}), 400
    
    # Validate video ID format
    if len(video_id) != 11:
        return jsonify({"error": "Invalid video ID"}), 400
    
    try:
        youtube_url = f"https://www.youtube.com/watch?v={video_id}"
        
        # Extract audio in a format that browsers can play
        ydl_opts = {
            'format': 'bestaudio',
            'quiet': True,
            'no_warnings': True,
            'extract_flat': False,
            'socket_timeout': 30,
            'ignoreerrors': True,
        }
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(youtube_url, download=False)
            audio_url = info.get('url')
            
            if not audio_url:
                return jsonify({"error": "Could not extract audio URL"}), 500
            
            # Fetch the audio file
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            }
            
            response = requests.get(audio_url, headers=headers, stream=True, timeout=30)
            response.raise_for_status()
            
            # Return with download headers
            def generate():
                for chunk in response.iter_content(chunk_size=8192):
                    if chunk:
                        yield chunk
            
            return generate(), 200, {
                'Content-Type': 'audio/mpeg',
                'Content-Disposition': f'attachment; filename="{filename}"',
                'Content-Length': response.headers.get('content-length', ''),
                'Accept-Ranges': 'bytes',
                'Cache-Control': 'no-cache',
                'Access-Control-Allow-Origin': '*',
            }
    
    except Exception as e:
        print(f"Error downloading audio: {str(e)}")
        return jsonify({"error": f"Download failed: {str(e)}"}), 500


@app.route("/listen-music/music-info", methods=["GET"])
def get_music_info():
    """Get music metadata from YouTube video ID"""
    if not YTDLP_AVAILABLE:
        return jsonify({"error": "Audio extraction is not available"}), 500
    
    video_id = request.args.get("videoId")
    
    if not video_id:
        return jsonify({"error": "videoId is required"}), 400
    
    # Validate video ID format (11 characters for YouTube)
    if not isinstance(video_id, str) or len(video_id) != 11:
        return jsonify({"error": f"Invalid video ID format. Expected 11 characters, got {len(video_id)}"}), 400
    
    try:
        youtube_url = f"https://www.youtube.com/watch?v={video_id}"
        
        # Extract metadata using yt_dlp
        ydl_opts = {
            'quiet': True,
            'no_warnings': True,
            'extract_flat': False,
            'socket_timeout': 30,
        }
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(youtube_url, download=False)
            
            title = info.get('title', 'Unknown')
            artist = info.get('uploader', 'Unknown')
            duration = info.get('duration', 0)
            
            return jsonify({
                "title": title,
                "artist": artist,
                "duration": duration,
                "videoId": video_id
            }), 200
    
    except yt_dlp.utils.DownloadError as e:
        error_msg = str(e)
        # Check for common errors
        if "unavailable" in error_msg.lower() or "not available" in error_msg.lower():
            return jsonify({"error": "Video is unavailable. This video may be private, deleted, or region-blocked."}), 404
        elif "age restricted" in error_msg.lower():
            return jsonify({"error": "Video is age-restricted and cannot be played."}), 403
        else:
            return jsonify({"error": f"Failed to get video info: {error_msg}"}), 400
    
    except Exception as e:
        print(f"Error getting music info: {str(e)}")
        return jsonify({"error": "Failed to get music info. Please try a valid YouTube URL."}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)
