#!/usr/bin/env python3
import sys
import os
import platform
import socket
import subprocess
import shutil
import datetime

class C:
    RESET  = "\033[0m"
    BOLD   = "\033[1m"
    GREEN  = "\033[92m"
    YELLOW = "\033[93m"
    RED    = "\033[91m"
    CYAN   = "\033[96m"
    DIM    = "\033[2m"

def ok(msg):   print(f"  {C.GREEN}✓{C.RESET}  {msg}")
def warn(msg): print(f"  {C.YELLOW}⚠{C.RESET}  {msg}")
def err(msg):  print(f"  {C.RED}✗{C.RESET}  {msg}")
def info(msg): print(f"  {C.CYAN}→{C.RESET}  {msg}")
def step(msg): print(f"\n{C.BOLD}{msg}{C.RESET}")
def hr():      print(f"  {C.DIM}{'─' * 44}{C.RESET}")

def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"

def is_port_busy(port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(("127.0.0.1", port)) == 0

def run(cmd):
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=120)
        return result.returncode == 0, result.stdout.strip(), result.stderr.strip()
    except Exception as e:
        return False, "", str(e)

def run_npm_install(npm_cmd, project_dir):
    try:
        proc = subprocess.Popen(
            f"{npm_cmd} install",
            shell=True,
            cwd=project_dir,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
        )
        for line in proc.stdout:
            line = line.rstrip()
            if line:
                print(f"  {C.DIM}{line}{C.RESET}")
        proc.wait()
        return proc.returncode == 0
    except Exception as e:
        err(f"Install error: {e}")
        return False


def main():
    project_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(project_dir)

    print()
    print(f"{C.BOLD}{C.CYAN}  ╔══════════════════════════════════════════╗{C.RESET}")
    print(f"{C.BOLD}{C.CYAN}  ║        UrWeather — Setup Script          ║{C.RESET}")
    print(f"{C.BOLD}{C.CYAN}  ╚══════════════════════════════════════════╝{C.RESET}")

    step("1 / 6  Python")
    py = sys.version_info
    if py.major < 3 or (py.major == 3 and py.minor < 8):
        err(f"Python 3.8+ required. Found: {sys.version}")
        sys.exit(1)
    ok(f"Python {py.major}.{py.minor}.{py.micro}  ({platform.system()})")

    step("2 / 6  Node.js")
    node_ok, node_ver, _ = run("node --version")
    if not node_ok:
        err("Node.js not found.")
        info("Download from: https://nodejs.org  (LTS recommended)")
        sys.exit(1)
    ok(f"Node.js {node_ver}")

    pnpm_ok, pnpm_ver, _ = run("pnpm --version")
    npm_ok, npm_ver, _   = run("npm --version")
    if pnpm_ok:
        npm_cmd = "pnpm"
        ok(f"pnpm {pnpm_ver}")
    elif npm_ok:
        npm_cmd = "npm"
        ok(f"npm {npm_ver}")
    else:
        err("Neither npm nor pnpm found.")
        sys.exit(1)

    step("3 / 6  API Keys")
    ok("No API keys required.")
    info("Weather data: Open-Meteo  (free, no registration)")
    info("City search:  OpenStreetMap Nominatim  (free, no registration)")

    step("4 / 6  Environment")
    pkg_json = os.path.join(project_dir, "package.json")
    if not os.path.exists(pkg_json):
        err("package.json not found. The archive may be corrupted.")
        sys.exit(1)
    ok("package.json found")

    env_path    = os.path.join(project_dir, ".env")
    env_example = os.path.join(project_dir, ".env.example")
    if not os.path.exists(env_path):
        if os.path.exists(env_example):
            shutil.copy(env_example, env_path)
        else:
            with open(env_path, "w") as f:
                f.write("# UrWeather\n")
        ok(".env created")
    else:
        ok(".env already exists")

    gitignore = os.path.join(project_dir, ".gitignore")
    if os.path.exists(gitignore):
        with open(gitignore) as f:
            content = f.read()
        if ".env" not in content:
            with open(gitignore, "a") as f:
                f.write("\n.env\n")
            warn(".env added to .gitignore")
        else:
            ok(".env is protected in .gitignore")
    else:
        with open(gitignore, "w") as f:
            f.write("node_modules/\ndist/\n.env\n.setup_complete\n*.log\n")
        ok(".gitignore created")

    step("5 / 6  Dependencies")
    node_modules = os.path.join(project_dir, "node_modules")
    if os.path.isdir(node_modules):
        ok("node_modules already exists, skipping install")
    else:
        info(f"Running: {npm_cmd} install  (may take 1–3 minutes…)")
        hr()
        if not run_npm_install(npm_cmd, project_dir):
            err(f"{npm_cmd} install failed. Check your internet connection.")
            sys.exit(1)
        hr()
        ok("Dependencies installed")

    step("6 / 6  Network")
    local_ip = get_local_ip()
    port = 5173
    if is_port_busy(port):
        warn(f"Port {port} is busy — Vite will pick the next available one")
    else:
        ok(f"Port {port} is free")
    ok(f"Local IP: {local_ip}")

    marker = os.path.join(project_dir, ".setup_complete")
    with open(marker, "w") as f:
        f.write(f"completed: {datetime.datetime.now().isoformat()}\n")
        f.write(f"python: {sys.version}\n")
        f.write(f"os: {platform.system()} {platform.release()}\n")
        f.write(f"package_manager: {npm_cmd}\n")

    print()
    print(f"{C.BOLD}{C.GREEN}  ╔══════════════════════════════════════════╗{C.RESET}")
    print(f"{C.BOLD}{C.GREEN}  ║         Setup complete!                  ║{C.RESET}")
    print(f"{C.BOLD}{C.GREEN}  ╚══════════════════════════════════════════╝{C.RESET}")
    print()
    print(f"  Start the server:")
    print()
    print(f"  {C.BOLD}{C.CYAN}    python start.py{C.RESET}")
    print()
    print(f"  The app will be available at:")
    print(f"    {C.DIM}http://localhost:{port}{C.RESET}")
    print(f"    {C.DIM}http://{local_ip}:{port}  ← other devices on your network{C.RESET}")
    print()


if __name__ == "__main__":
    main()
