import os
import json
from pathlib import Path
from datetime import datetime
import opik
from opik import Opik

print("🔄 Pushing new Psych Test Logs to Opik + attaching scores...")

opik_client = Opik(project_name="CycleMind")

folder = Path("src/knowledge-base/wiki/cyclemind-wiki/Psych Test Logs")
processed_file = Path("processed_opik.json")

if processed_file.exists():
    processed = set(json.loads(processed_file.read_text()))
else:
    processed = set()

md_files = sorted(folder.glob("*.md"))
new_files = [f for f in md_files if f.name not in processed]

print(f"Found {len(md_files)} total files. Processing {len(new_files)} new files...")

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
            output={
                "tone": tone,
                "personalization": pers,
                "safety": safety,
                "suggested_changes": suggested
            },
            tags=["psych_test", "base44_export"],
            metadata={"source_file": md_file.name}
        )

        # Attach scores directly to the trace (this is the reliable way)
        try:
            trace.log_feedback_score(
                name="tone_score",
                value=float(tone) if tone != "N/A" else 0,
                reason="Extracted from psychiatrist rating"
            )
            trace.log_feedback_score(
                name="safety_score",
                value=float(safety) if safety != "N/A" else 0,
                reason="Extracted from psychiatrist rating"
            )
        except Exception as score_error:
            print(f"   ⚠️ Could not attach scores for {md_file.name}: {score_error}")

        trace.end()
        processed.add(md_file.name)
        print(f"✅ Sent + scored: {md_file.name}")

    except Exception as e:
        print(f"⚠️ Skipped {md_file.name}: {e}")

processed_file.write_text(json.dumps(list(processed), indent=2))

print(f"\n🎉 Done! {len(new_files)} new traces + scores sent to Opik.")
print("Refresh Opik → Logs → Traces. Scores should appear on each trace.")
