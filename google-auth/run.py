import os
import subprocess

path = r"d:\Antigravity\firebase-auth-app"
npm_path = r"d:\Node js\npm.cmd"
os.chdir(path)
env = os.environ.copy()
env["PATH"] = r"d:\Node js;" + env.get("PATH", "")
print("Installing dependencies...")
subprocess.run([npm_path, "install"], env=env, check=True)
print("Starting server...")
subprocess.Popen([npm_path, "run", "dev"], env=env)
import webbrowser
webbrowser.open("http://localhost:5173")
