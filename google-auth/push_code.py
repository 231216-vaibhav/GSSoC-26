import os
import subprocess

path = r"d:\Antigravity\firebase-auth-app"
os.chdir(path)

commands = [
    ["git", "init"],
    ["git", "config", "user.email", "vaibhav@example.com"],
    ["git", "config", "user.name", "Vaibhav"],
    ["git", "add", "."],
    ["git", "commit", "-m", "Initial setup: React + Vite + Firebase Auth integration for Skill Bridge"],
    ["git", "branch", "-M", "main"],
    ["git", "remote", "remove", "origin"],
    ["git", "remote", "add", "origin", "https://github.com/231216-vaibhav/Skill-Bridge.git"],
    ["git", "push", "-u", "origin", "main", "--force"]
]

for cmd in commands:
    print("Running:", " ".join(cmd))
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.stdout: print("STDOUT:", result.stdout)
    if result.stderr: print("STDERR:", result.stderr)
