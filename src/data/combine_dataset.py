#!/usr/bin/env python3
"""
Luna SFT Dataset Builder
Combines generator output + legacy handwritten examples into luna-finetune.jsonl.

Usage:
    # Step 1: Generate the main dataset (if not done already)
    python data/gen_dataset.py

    # Step 2: Merge with legacy handwritten batches
    python data/combine_dataset.py

    # Or run both in sequence:
    python data/gen_dataset.py && python data/combine_dataset.py
"""
import json
import random
import pathlib
import sys

DATA_DIR = pathlib.Path(__file__).parent
GENERATED = DATA_DIR / "luna-finetune.jsonl"        # from gen_dataset.py
LEGACY_BATCH2 = DATA_DIR / "luna-finetune-batch2.jsonl"
OUTPUT = DATA_DIR / "luna-finetune.jsonl"            # overwrites with merged

def load_jsonl(path):
    if not path.exists():
        print(f"  SKIP (not found): {path.name}")
        return []
    examples = []
    with open(path, "r", encoding="utf-8") as f:
        for i, line in enumerate(f, 1):
            line = line.strip()
            if not line:
                continue
            try:
                examples.append(json.loads(line))
            except json.JSONDecodeError as e:
                print(f"  Parse error in {path.name} line {i}: {e}")
    print(f"  Loaded {len(examples):,} examples from {path.name}")
    return examples

def validate(obj):
    """Basic structure check."""
    if not isinstance(obj, dict):
        return False
    msgs = obj.get("messages", [])
    if not msgs or not isinstance(msgs, list):
        return False
    if msgs[0].get("role") != "system":
        return False
    roles = [m.get("role") for m in msgs]
    if "user" not in roles or "assistant" not in roles:
        return False
    return True

def main():
    print("Luna SFT Dataset Builder")
    print("=" * 50)

    all_examples = []

    # Load generated dataset (main source)
    print(f"\nLoading generated dataset...")
    generated = load_jsonl(GENERATED)
    all_examples.extend(generated)

    # Load legacy handwritten batch 2
    print(f"\nLoading legacy batch 2...")
    batch2 = load_jsonl(LEGACY_BATCH2)
    all_examples.extend(batch2)

    # Validate all
    print(f"\nValidating {len(all_examples):,} examples...")
    valid = [e for e in all_examples if validate(e)]
    invalid = len(all_examples) - len(valid)
    if invalid:
        print(f"  Dropped {invalid} malformed examples")
    print(f"  Valid: {len(valid):,}")

    # Shuffle for better training distribution
    random.seed(42)
    random.shuffle(valid)

    # Write merged output
    with open(OUTPUT, "w", encoding="utf-8") as f:
        for obj in valid:
            f.write(json.dumps(obj, ensure_ascii=False) + "\n")

    size_kb = OUTPUT.stat().st_size / 1024
    print(f"\n✅ Written to {OUTPUT}")
    print(f"   Total examples: {len(valid):,}")
    print(f"   File size: {size_kb:.0f} KB ({size_kb/1024:.1f} MB)")

    if len(valid) < 1000:
        print(f"\n⚠️  WARNING: Only {len(valid)} examples. Run gen_dataset.py first to generate the full dataset.")
        print("   python data/gen_dataset.py")
    elif len(valid) >= 2000:
        print(f"\n🎯 Target met: {len(valid):,} examples (target: 2,000–3,000+)")
    else:
        print(f"\n📊 {len(valid):,} examples loaded. Run gen_dataset.py to add more.")

if __name__ == "__main__":
    main()