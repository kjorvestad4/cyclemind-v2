#!/usr/bin/env python3
"""
Combine all Luna SFT JSONL batch files into a single dataset.
Run: python data/combine_dataset.py
"""
import json
import os
import pathlib

DATA_DIR = pathlib.Path(__file__).parent
OUTPUT = DATA_DIR / "luna-finetune-combined.jsonl"

BATCH_FILES = [
    DATA_DIR / "luna-finetune.jsonl",
    DATA_DIR / "luna-finetune-batch2.jsonl",
]

examples = []
for path in BATCH_FILES:
    if not path.exists():
        print(f"WARNING: {path} not found, skipping")
        continue
    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                obj = json.loads(line)
                examples.append(obj)
            except json.JSONDecodeError as e:
                print(f"Parse error in {path}: {e}")

print(f"Total examples loaded: {len(examples)}")

with open(OUTPUT, "w", encoding="utf-8") as f:
    for ex in examples:
        f.write(json.dumps(ex, ensure_ascii=False) + "\n")

print(f"Written to {OUTPUT}")
print(f"Dataset size: {OUTPUT.stat().st_size / 1024:.1f} KB")