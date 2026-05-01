import json
import re
with open("signatures.json") as f:
    signatures = json.load(f)

# Load signatures (safe loading)
with open("signatures.json", "r") as f:
    SIGNATURES = json.load(f)

def detect_attack(log):
    path = log.get("path", "").lower()

    for sig in signatures:
        if re.search(sig["pattern"], path):
            return {
                "attack": sig["type"],
                "severity": sig["severity"]
            }

    return {
        "attack": "normal",
        "severity": "low"
    }
