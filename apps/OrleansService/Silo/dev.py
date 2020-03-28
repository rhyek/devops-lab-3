import signal
import time
import subprocess
import psutil
import os
import re

child = subprocess.Popen(["dotnet", "watch", "run"])

running = True


def close(a, b):
    global running
    process = psutil.Process(child.pid)
    for proc in process.children(recursive=True):
        path = proc.exe()
        if re.search("/bin/.+netcoreapp", path):
            proc.send_signal(signal.SIGTERM)
            proc.wait()
            break
    running = False


signal.signal(signal.SIGINT, close)
signal.signal(signal.SIGTERM, close)

while running:
    time.sleep(1)

print("\nBye.")
