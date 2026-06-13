import os
import requests
from datetime import datetime

print("🔄 Pulling LIVE data from your Base44 workspace...")

headers = {
    "Authorization": "Bearer 74955646a7434787a6f0e6bea0d4d5f4",
    "Content-Type": "application/json"
}

workspace_id = "69d93cb8c911ac4cb1905e0"

# Try to fetch from the table (adjust table name if needed)
url = f"https://api.base44.com/v1/workspaces/{workspace_id}/tables/psych_test_logs/records"

response = requests.get(url, headers=headers)

if response.status_code == 200:
    logs = response.json().get("data", [])
    print(f"✅ Found {len(logs)} records")
else:
    print(f"❌ API error {response.status_code}: {response.text}")
    logs = []

for log in logs:
    timestamp = log.get("created_at", "unknown")[:19].replace("T", "_")
    filename = f"psych-test-{timestamp}-{log.get('id', 'unknown')[:8]}.md"
    path = f"src/knowledge-base/wiki/cyclemind-wiki/Psych Test Logs/{filename}"

    content = f"""# Psych Test Session - {timestamp}

## Conversation
{log.get("conversation", log.get("message_content", "No conversation"))}

## Ratings
- Tone: {log.get("tone_rating", "N/A")}/5
- Personalization: {log.get("personalization_rating", "N/A")}/5
- Safety / Clinical Feel: {log.get("safety_clinical_rating", "N/A")}/5

## Suggested Changes
{log.get("suggested_changes", "None")}

---
Saved from Base44 • {datetime.now().strftime('%Y-%m-%d %H:%M')}
"""

    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w") as f:
        f.write(content)
    print(f"✅ Saved {filename}")

print("\n🎉 Done! Open GitHub Desktop and push.")
