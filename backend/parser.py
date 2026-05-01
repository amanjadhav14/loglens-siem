import re

log_pattern = re.compile(
    r'(?P<ip>\S+) '              # IP
    r'\S+ \S+ '                  # ident, authuser
    r'\[(?P<timestamp>[^\]]+)\] ' # timestamp
    r'"(?P<method>\S+) (?P<path>\S+) \S+" '  # method + path
    r'(?P<status>\d{3}) '        # status
    r'\S+ '                      # size
    r'"[^"]*" '                  # referer
    r'"(?P<user_agent>[^"]*)"'   # user agent
)

def parse_log_line(line):
    # ✅ Try Apache/Nginx format first
    match = log_pattern.match(line)
    if match:
        return match.groupdict()

    # ✅ Fallback: simple format (IP - attack)
    try:
        parts = line.split(" - ")

        if len(parts) < 2:
            return None

        ip = parts[0].strip()
        attack = parts[1].strip()

        return {
            "ip": ip,
            "method": "GET",
            "path": "/",
            "status": "200",
            "timestamp": "now",
            "attack": attack,
            "severity": "high" if attack != "normal" else "low"
        }

    except:
        return None
