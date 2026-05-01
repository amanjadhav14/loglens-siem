from flask import Flask, request, jsonify
from flask_cors import CORS
from parser import parse_log_line
from detector import detect_attack
import requests

# 🌍 GeoIP function
def get_geo(ip):
    try:
        res = requests.get(f"http://ip-api.com/json/{ip}", timeout=3)
        data = res.json()

        lat = data.get("lat")
        lon = data.get("lon")

        if not lat or not lon:
            return {
                "country": "Unknown",
                "lat": 20.5937,
                "lon": 78.9629
            }

        return {
            "country": data.get("country", "Unknown"),
            "lat": lat,
            "lon": lon
        }

    except:
        return {
            "country": "Unknown",
            "lat": 20.5937,
            "lon": 78.9629
        }


app = Flask(__name__)
CORS(app)

@app.route('/api/logs')
def get_logs():
    return jsonify([
        {"ip": "192.168.1.1", "status": "OK"},
        {"ip": "10.0.0.5", "status": "Suspicious"},
        {"ip": "8.8.8.8", "status": "Blocked"}
    ])


# ✅ HOME
@app.route('/')
def home():
    return "LogLens Backend Running 🚀"


# ✅ UPLOAD
@app.route('/upload', methods=['POST'])
def upload_file():
    file = request.files['file']

    results = []
    failed_attempts = {}
    ip_attack_count = {}

    for line in file.stream:
        try:
            decoded_line = line.decode('utf-8', errors='ignore').strip()
        except:
            continue

        if not decoded_line:
            continue

        try:
            parsed = parse_log_line(decoded_line)
        except:
            continue

        if not parsed:
            continue

        ip = parsed.get("ip", "unknown")
        status = parsed.get("status", "000")

        # 🌍 GEO
        geo = get_geo(ip)
        parsed["country"] = geo["country"]
        parsed["lat"] = geo["lat"]
        parsed["lon"] = geo["lon"]

        # 🔐 TRACK FAILED LOGINS
        if status == "401":
            failed_attempts[ip] = failed_attempts.get(ip, 0) + 1

        # 🚨 ATTACK DETECTION
        if "attack" in parsed:
            pass
        elif failed_attempts.get(ip, 0) > 3:
            parsed["attack"] = "brute_force"
            parsed["severity"] = "high"
        else:
            parsed.update(detect_attack(parsed))

        # 📊 COUNT ATTACKERS
        if parsed["attack"] != "normal":
            ip_attack_count[ip] = ip_attack_count.get(ip, 0) + 1

        # ✅ ADD ALL LOGS
        results.append(parsed)

    # ✅ THIS MUST BE INSIDE FUNCTION
    return jsonify({
        "logs": results,
        "top_attackers": ip_attack_count
    })


# ✅ DEMO
@app.route('/demo')
def demo_data():
    demo_logs = [
        {
            "ip": "8.8.8.8",
            "method": "GET",
            "path": "/login.php?id=1 OR 1=1",
            "status": "200",
            "timestamp": "10/Oct/2025:13:05:00 +0530",
            "attack": "sql_injection",
            "severity": "high"
        },
        { 
            "ip": "1.1.1.1",
            "path": "/login",
            "status": "401",
            "timestamp": "10/Oct/2025:13:01:00 +0530",
            "attack": "brute_force",
            "severity": "high"
        },
        { 
            "ip": "151.101.1.69",
            "method": "GET",
            "path": "/index.html",
            "status": "200",
            "timestamp": "10/Oct/2025:13:10:00 +0530",
            "attack": "normal",
            "severity": "low"
        }
    ]

    # 🌍 Add geo
    for log in demo_logs:
        geo = get_geo(log["ip"])
        log["country"] = geo["country"]
        log["lat"] = geo["lat"]
        log["lon"] = geo["lon"]

    return jsonify({
        "logs": demo_logs,
        "top_attackers": {
            "8.8.8.8": 1,
            "1.1.1.1": 1
        }
    })


# ✅ RUN
if __name__ == '__main__':
    app.run(debug=True)
