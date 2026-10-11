#!/usr/bin/env python3
import sys
import os
import socket
import subprocess
import signal
import re
import shutil

class C:
    RESET  = "\033[0m"
    BOLD   = "\033[1m"
    GREEN  = "\033[92m"
    YELLOW = "\033[93m"
    RED    = "\033[91m"
    CYAN   = "\033[96m"
    DIM    = "\033[2m"

def ok(msg):   print(f"  {C.GREEN}✓{C.RESET}  {msg}")
def err(msg):  print(f"  {C.RED}✗{C.RESET}  {msg}")
def info(msg): print(f"  {C.CYAN}→{C.RESET}  {msg}")

def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"

def server_command(project_dir, port):
    node = shutil.which("node")
    if not node:
        raise FileNotFoundError("Node.js not found. Install Node.js and add it to PATH.")
    vite = os.path.join(project_dir, "node_modules", "vite", "bin", "vite.js")
    if not os.path.isfile(vite):
        raise FileNotFoundError("Vite is not installed. Run python setup.py first.")
    return [node, vite, "--config", "vite.config.local.ts", "--host", "0.0.0.0", "--port", str(port)]

def extract_port(line: str):
    m = re.search(r"localhost:(\d+)", line)
    return m.group(1) if m else None


def main():
    project_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(project_dir)

    print()
    print(f"{C.BOLD}{C.CYAN}  ╔══════════════════════════════════════════╗{C.RESET}")
    print(f"{C.BOLD}{C.CYAN}  ║         UrWeather Local Server           ║{C.RESET}")
    print(f"{C.BOLD}{C.CYAN}  ╚══════════════════════════════════════════╝{C.RESET}")
    print()

    if not os.path.exists(os.path.join(project_dir, ".setup_complete")):
        err("Setup not complete.")
        print()
        print(f"  Run first:")
        print(f"  {C.BOLD}{C.CYAN}    python setup.py{C.RESET}")
        print()
        sys.exit(1)

    if not os.path.isdir(os.path.join(project_dir, "node_modules")):
        err("node_modules not found. Run python setup.py first.")
        sys.exit(1)

    if not os.path.exists(os.path.join(project_dir, "package.json")):
        err("package.json not found. Project may be corrupted.")
        sys.exit(1)

    ok("node_modules found")
    ok("package.json found")

    env_vars = os.environ.copy()
    env_path = os.path.join(project_dir, ".env")
    if os.path.exists(env_path):
        with open(env_path) as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, _, val = line.partition("=")
                    env_vars.setdefault(key.strip(), val.strip())
        ok(".env loaded")

    try:
        port = int(env_vars.get("PORT", "5173"))
    except ValueError:
        err("PORT must be a number between 1 and 65535.")
        sys.exit(1)
    if not 1 <= port <= 65535:
        err("PORT must be a number between 1 and 65535.")
        sys.exit(1)
    local_ip = get_local_ip()
    try:
        vite_command = server_command(project_dir, port)
    except FileNotFoundError as e:
        err(str(e))
        return 1

    vite_cmd = subprocess.list2cmdline(vite_command)

    print()
    print(f"  {C.DIM}{'─' * 44}{C.RESET}")
    print(f"  {C.BOLD}Starting server…{C.RESET}")
    print(f"  {C.DIM}{vite_cmd}{C.RESET}")
    print(f"  {C.DIM}{'─' * 44}{C.RESET}")
    print()

    process = None
    server_shown = False

    def handle_exit(sig, frame):
        print()
        print(f"  {C.YELLOW}Server stopped.{C.RESET}")
        if process:
            process.terminate()
            try:
                process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                process.kill()
                process.wait()
        sys.exit(0)

    signal.signal(signal.SIGINT, handle_exit)
    signal.signal(signal.SIGTERM, handle_exit)

    try:
        process = subprocess.Popen(
            vite_command,
            cwd=project_dir,
            env=env_vars,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            bufsize=1,
        )

        for line in process.stdout:
            line = line.rstrip()
            if not server_shown and ("localhost" in line or "Local:" in line):
                detected_port = extract_port(line) or str(port)
                server_shown = True
                print(f"{C.BOLD}{C.GREEN}  ╔══════════════════════════════════════════╗{C.RESET}")
                print(f"{C.BOLD}{C.GREEN}  ║      UrWeather is running!               ║{C.RESET}")
                print(f"{C.BOLD}{C.GREEN}  ╚══════════════════════════════════════════╝{C.RESET}")
                print()
                print(f"  {C.BOLD}This device:{C.RESET}")
                print(f"    {C.CYAN}http://localhost:{detected_port}{C.RESET}")
                print()
                print(f"  {C.BOLD}Phone / tablet / TV:{C.RESET}")
                print(f"    {C.CYAN}http://{local_ip}:{detected_port}{C.RESET}")
                print()
                print(f"  {C.DIM}Press Ctrl+C to stop{C.RESET}")
                print(f"  {C.DIM}{'─' * 44}{C.RESET}")
                print()
            elif line:
                print(f"  {C.DIM}{line}{C.RESET}")

        return process.wait()

    except Exception as e:
        err(f"Failed to start: {e}")
        return 1


if __name__ == "__main__":
    sys.exit(main())
