"""
OilGuard AI — GitHub Remote Push Helper
Uses dulwich (pure-Python Git) to link and push your local Git repository to GitHub.

Usage:
    python scripts/push_to_github.py <repo_url_or_name> [personal_access_token]

Examples:
    python scripts/push_to_github.py https://github.com/your-username/oilguard-ai.git
    python scripts/push_to_github.py https://github.com/your-username/oilguard-ai.git ghp_yourTokenHere
"""

import sys
import os
import dulwich.porcelain as git
from dulwich.repo import Repo

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def push_to_github(remote_url, token=None, branch="main"):
    repo = Repo(REPO_ROOT)
    
    # Format remote URL with token if provided
    push_url = remote_url
    if token and "https://" in remote_url and "@" not in remote_url:
        push_url = remote_url.replace("https://", f"https://{token}@")

    print(f"[OilGuard Git] Target Remote: {remote_url}")
    print(f"[OilGuard Git] Local Branch: {branch}")

    try:
        # Add or update remote 'origin'
        try:
            git.remote_add(repo, b"origin", push_url.encode("utf-8"))
            print("[OilGuard Git] Added remote 'origin'.")
        except Exception:
            # If already exists, update config
            config = repo.get_config()
            config.set((b"remote", b"origin"), b"url", push_url.encode("utf-8"))
            config.write_to_path()
            print("[OilGuard Git] Updated existing remote 'origin'.")

        # Push to remote
        print("[OilGuard Git] Pushing commits to GitHub...")
        git.push(repo, b"origin", f"refs/heads/main:refs/heads/{branch}".encode("utf-8"))
        print("[OilGuard Git] SUCCESS! Pushed to GitHub repository.")
    except Exception as e:
        print(f"\n[OilGuard Git] Notice during push: {e}")
        print("\nIf authentication is required, you can:")
        print("1. Supply a GitHub Personal Access Token (PAT):")
        print(f"   python scripts/push_to_github.py {remote_url} <your_token>")
        print("2. Or use standard Git if installed on your system:")
        print(f"   git remote add origin {remote_url}")
        print(f"   git branch -M main")
        print(f"   git push -u origin main")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(__doc__)
        print("Current repository status:")
        git.status(REPO_ROOT)
        sys.exit(0)

    url = sys.argv[1]
    pat = sys.argv[2] if len(sys.argv) > 2 else None
    push_to_github(url, pat)
