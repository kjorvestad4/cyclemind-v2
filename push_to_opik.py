import os
import json
from pathlib import Path
from datetime import datetime
import opik
from opik import Opik

print("🔄 Pushing + scoring new Psych Test Logs...")

opik_client = Opik(project_name="CycleMind")

folder = Path("src/knowledge-base/wiki/cyclemind-wiki/Psych Test Logs")
processed_file = Path("processed_opik.json")

if processed_file.exists():
    processed = set(json.loads(processed_file.read_text()))
else:
    processed = set()

md_files = sorted(folder.glob("*.md"))
new_files = [f for f in md_files if f.name not in processed]

for md_file in new_files:
    try:
        content = md_file.read_text(encoding="utf-8")
        conversation = content.split("## Conversation")[1].split("## Ratings")[0].strip() if "## Conversation" in content else ""
        tone = content.split("- Tone:")[1].split("/5")[0].strip() if "- Tone:" in content else "N/A"
        pers = content.split("- Personalization:")[1].split("/5")[0].strip() if "- Personalization:" in content else "N/A"
        safety = content.split("- Safety")[1].split("/5")[0].strip().split(":")[-1].strip() if "- Safety" in content else "N/A"
        suggested = content.split("## Suggested Changes")[1].split("---")[0].strip() if "## Suggested Changes" in content else ""

        trace = opik_client.trace(
            name="psych_test_session",
            input={"conversation": conversation[:3000]},
            output={"tone": tone, "personalization": pers, "safety": safety, "suggested_changes": suggested},
            tags=["psych_test", "base44_export"],
            metadata={"source_file": md_file.name}
        )

        # Attach meaningful scores
        trace.log_feedback_score("tone_score", float(tone) if tone != "N/A" else 0)
        trace.log_feedback_score("safety_score", float(safety) if safety != "N/A" else 0)
        trace.log_feedback_score("helpfulness", 0.85)  # placeholder - we can make this smarter later
        trace.log_feedback_score("overall_quality", (float(tone or 0) + float(pers or 0) + float(safety or 0)) / 3)

        trace.end()
        processed.add(md_file.name)
        print(f"✅ Scored and sent: {md_file.name}")

    except Exception as e:
        print(f"⚠️ Skipped {md_file.name}: {e}")

processed_file.write_text(json.dumps(list(processed), indent=2))
print("🎉 Pipeline complete.")
