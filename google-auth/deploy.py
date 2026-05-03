import os
import subprocess

path = r"d:\Antigravity\firebase-auth-app"
os.chdir(path)
print("Deploying Firestore Rules...")
env = os.environ.copy()
env["PATH"] = env.get("PATH", "") + r";D:\;C:\Users\vaibhav kumar gupta\AppData\Roaming\npm\\"
result = subprocess.run(["firebase.cmd", "deploy", "--only", "firestore"], env=env, capture_output=True, text=True)
print("STDOUT:", result.stdout)
print("STDERR:", result.stderr)
