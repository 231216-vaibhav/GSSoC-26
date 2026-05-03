import os
import subprocess

firebase_cmd = r"C:\Users\vaibhav kumar gupta\AppData\Roaming\npm\firebase.cmd"
with open(r"d:\Antigravity\firebase-auth-app\projects.txt", "w", encoding="utf-8") as f:
    try:
        result = subprocess.run([firebase_cmd, "projects:list", "--non-interactive"], capture_output=True, encoding="utf-8", check=True)
        f.write(result.stdout)
    except Exception as e:
        f.write(str(e))
