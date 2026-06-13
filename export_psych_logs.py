import os
from datetime import datetime

print("🔄 Exporting Psych Test Logs from Base44 to Obsidian...")

# TODO: Replace this with actual Base44 query later
logs = [
    {"id": "TEST001", "timestamp": "2026-06-12_21-37", "conversation": "Test message from psychiatrist: Patient reported severe irritability and bloating in luteal phase.", "tone": 5, "personalization": 4, "safety": 5, "suggested_changes": "Add more validation and suggest tracking food triggers"},
]

for log in logs:
    filename = f"psych-test-{log['timestamp']}-{log['id']}.md"
    path = f"src/knowledge-base/wiki/cyclemind-wiki/Psych Test Logs/{filename}"
    
    content = f"""# Psych Test Session - {log['timestamp']}

## Conversation
{log['conversation']}

## Ratings
- Tone: {log['tone']}/5
- Personalization: {log['personalization']}/5
- Safety/Clinical Feel: {log['safety']}/5

## Suggested Changes
{log['suggested_changes']}

---
Saved for Luna learning • {datetime.now().strftime('%Y-%m-%d %H:%M')}
"""

    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w") as f:
        f.write(content)
    print(f"✅ Created {filename}")

print("\n🎉 Done! Now open GitHub Desktop and commit/push the new files in the 'Psych Test Logs' folder.")
