import os
import subprocess

npm_path = r"d:\Node js\npm.cmd"
env = os.environ.copy()
env["PATH"] = r"d:\Node js;" + env.get("PATH", "")
print("Installing firebase-tools globally...")
subprocess.run([npm_path, "install", "-g", "firebase-tools"], env=env, check=True)
print("Finished installing firebase-tools!")
