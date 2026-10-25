import csv
import json
import re
import sys
import os
from collections import Counter, defaultdict

sys.path.append(os.getcwd())
sys.stdout.reconfigure(encoding="utf-8")

with open("dataset/Sample_dataset.csv", "r", encoding="utf-8") as f:
    rows = list(csv.DictReader(f))

# The 100 'original' rows are the reference base prompts
orig_rows = [(idx, r) for idx, r in enumerate(rows) if r["target_language"] == "original"]
print(f"Total rows: {len(rows)}, Original rows: {len(orig_rows)}")

# Build semantic fingerprints for each original row
# Using key features:
# - numerical values in prompt (durations, budgets, group size, years)
# - proper nouns / keywords (English)
def extract_feature_vector(text):
    nums = tuple(sorted(set(re.findall(r'\b[0-9]{1,7}\b', text.replace(',', '')))))
    return nums

orig_profiles = []
for orig_id, (idx, r) in enumerate(orig_rows, 1):
    p = r["enhanced_prompt"]
    c = r["enhanced_completion"]
    nums_p = extract_feature_vector(p)
    nums_c = extract_feature_vector(c)
    orig_profiles.append({
        "cluster_id": orig_id,
        "orig_row_idx": idx,
        "row_id": idx + 1,
        "prompt": p,
        "completion": c,
        "nums_p": nums_p,
    })

# Now for each row in rows, assign it to a cluster
# For original rows, cluster_id is obvious.
# For translated rows, we match:
# 1. Exact match of numbers in prompt
# 2. Or completion numbers match
row_to_cluster = {}
for idx, r in enumerate(rows):
    if r["target_language"] == "original":
        # Find which orig_profile has this idx
        for op in orig_profiles:
            if op["orig_row_idx"] == idx:
                row_to_cluster[idx] = op["cluster_id"]
                break

# For non-original rows
unassigned = []
for idx, r in enumerate(rows):
    if idx in row_to_cluster:
        continue
    p = r["enhanced_prompt"]
    c = r["enhanced_completion"]
    p_nums = extract_feature_vector(p)
    
    # Candidate matches
    candidates = [op for op in orig_profiles if op["nums_p"] == p_nums]
    if len(candidates) == 1:
        row_to_cluster[idx] = candidates[0]["cluster_id"]
    elif len(candidates) > 1:
        # Disambiguate using completion numbers overlap
        c_nums = set(extract_feature_vector(c))
        best_cand = max(candidates, key=lambda op: len(c_nums.intersection(set(extract_feature_vector(op["completion"])))))
        row_to_cluster[idx] = best_cand["cluster_id"]
    else:
        # Relax matching: subset of numbers
        p_set = set(p_nums)
        cand_sub = [op for op in orig_profiles if p_set.issubset(set(op["nums_p"])) or set(op["nums_p"]).issubset(p_set)]
        if cand_sub:
            c_nums = set(extract_feature_vector(c))
            best_cand = max(cand_sub, key=lambda op: len(c_nums.intersection(set(extract_feature_vector(op["completion"])))))
            row_to_cluster[idx] = best_cand["cluster_id"]
        else:
            unassigned.append((idx + 1, r["target_language"], p[:100]))

print(f"Assigned rows: {len(row_to_cluster)}/{len(rows)}")
print(f"Unassigned rows: {len(unassigned)}")
if unassigned:
    print("Unassigned samples:", unassigned[:5])

# Print cluster size distribution
cluster_sizes = Counter(row_to_cluster.values())
print(f"\nUnique clusters present: {len(cluster_sizes)}")
print(f"Cluster size counts: {Counter(cluster_sizes.values())}")
