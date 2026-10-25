import csv
import json
import os
import re
import sys
from collections import defaultdict, Counter

sys.path.append(os.getcwd())
sys.stdout.reconfigure(encoding="utf-8")

INPUT_CSV = r"C:\Kannada_Travel_guide_AI\dataset\Sample_dataset.csv"
OUTPUT_DIR = r"C:\Kannada_Travel_guide_AI\dataset"
os.makedirs(OUTPUT_DIR, exist_ok=True)

USABLE_JSON = os.path.join(OUTPUT_DIR, "usable_examples.json")
USABLE_CSV = os.path.join(OUTPUT_DIR, "usable_examples.csv")
DEFECTIVE_JSON = os.path.join(OUTPUT_DIR, "defective_examples.json")
DEFECTIVE_CSV = os.path.join(OUTPUT_DIR, "defective_examples.csv")
HELD_OUT_JSON = os.path.join(OUTPUT_DIR, "eval_held_out.json")
FEW_SHOT_JSON = os.path.join(OUTPUT_DIR, "few_shot_curated.json")
REPORT_JSON = os.path.join(OUTPUT_DIR, "validation_report.json")

# --- Helper Functions ---

def detect_script(text: str) -> str:
    counts = {'kn': 0, 'ta': 0, 'te': 0, 'ml': 0, 'hi': 0, 'en': 0}
    for ch in text:
        code = ord(ch)
        if 0x0C80 <= code <= 0x0CFF:
            counts['kn'] += 1
        elif 0x0B80 <= code <= 0x0BFF:
            counts['ta'] += 1
        elif 0x0C00 <= code <= 0x0C7F:
            counts['te'] += 1
        elif 0x0D00 <= code <= 0x0D7F:
            counts['ml'] += 1
        elif 0x0900 <= code <= 0x097F:
            counts['hi'] += 1
        elif (0x0041 <= code <= 0x005A) or (0x0061 <= code <= 0x007A):
            counts['en'] += 1
    max_s = max(counts, key=counts.get)
    return max_s if counts[max_s] > 0 else 'unknown'

def extract_duration(prompt: str) -> int | None:
    patterns = [
        r'(\d+)\s*[- ]?day[s]?',
        r'(\d+)\s*[- ]?nights?',
        r'(\d+)\s*ದಿನ',
        r'(\d+)\s*दिन',
        r'(\d+)\s*நாள்',
        r'(\d+)\s*రోజు',
        r'(\d+)\s*ദിവസം',
    ]
    for p in patterns:
        m = re.search(p, prompt, re.IGNORECASE)
        if m:
            return int(m.group(1))
    return None

def extract_budget(prompt: str) -> int | None:
    patterns = [
        r'₹\s*([0-9,]+)',
        r'([0-9,]+)\s*(?:INR|rupees|ರೂಪಾಯಿ|रुपये|ரூபாய்|రూపాయలు|രൂപ)',
        r'बजट\s*[:₹]?\s*([0-9,]+)',
        r'ಬಜೆಟ್\s*[:₹]?\s*([0-9,]+)',
        r'బడ్జెట్\s*[:₹]?\s*([0-9,]+)',
        r'பட்ஜெட்\s*[:₹]?\s*([0-9,]+)',
        r'budget\s*(?:of|is)?\s*[:₹]?\s*([0-9,]+)',
    ]
    for p in patterns:
        m = re.search(p, prompt, re.IGNORECASE)
        if m:
            clean = m.group(1).replace(',', '')
            if clean.isdigit():
                val = int(clean)
                if val >= 500:
                    return val
    return None

def count_itinerary_days(completion: str) -> set[int]:
    days = set()
    # Explicit headers
    for m in re.finditer(r'(?:Day|DAY|ದಿನ|दिन|நாள்|రోజు|ദിവസം)\s*0?(\d+)', completion):
        d = int(m.group(1))
        if 1 <= d <= 30:
            days.add(d)

    # Telugu / Kannada / Hindi ordinal prefixes
    # e.g. 1వ రోజు, 1ನೇ ದಿನ, 1वां दिन, 1-ാം ദിവസം
    for m in re.finditer(r'(\d+)\s*(?:వ\s*రోజు|ನೇ\s*ದಿನ|वां\s*दिन|ஆம்\s*நாள்|-?ാം\s*ദിവസം)', completion):
        d = int(m.group(1))
        if 1 <= d <= 30:
            days.add(d)

    # Markdown table column 1
    for line in completion.split('\n'):
        line_s = line.strip()
        if line_s.startswith('|'):
            parts = [p.strip() for p in line_s.split('|')]
            if len(parts) >= 3:
                c1 = parts[1].replace('*', '').strip()
                if c1.isdigit():
                    d = int(c1)
                    if 1 <= d <= 30:
                        days.add(d)

    # Multi-day spans (e.g. Days 1-3)
    for m in re.finditer(r'(?:Days|DAY|ದಿನಗಳು|दिन)\s*(\d+)\s*(?:-|–|to|ಇಂದ|से|முதல்)\s*(\d+)', completion):
        d1 = int(m.group(1))
        d2 = int(m.group(2))
        if 1 <= d1 <= 30 and 1 <= d2 <= 30:
            for x in range(d1, d2 + 1):
                days.add(x)

    return days

def check_disclaimer(completion: str) -> bool:
    keywords = [
        'disclaimer', 'warning', 'estimate', 'unverified', 'verified',
        'ಹಕ್ಕುತ್ಯಾಗ', 'ಎಚ್ಚರಿಕೆ', 'ಅಂದಾಜು',
        'अस्वीकरण', 'चेतावनी', 'अनुमानित',
        'எச்சரிக்கை', 'பொறுப்புத் துறப்பு', 'மதிப்பீடு',
        'హెచ్చరిక', 'నిరాకరణ', 'అంచనా',
        'നിരാകരണം', 'മുന്നറിയിപ്പ്', 'ഏകദേശ',
        '⚠️', '❗'
    ]
    c_lower = completion.lower()
    return any(k in c_lower or k in completion for k in keywords)

def evaluate_budget_math(completion: str):
    """
    Parses budget tables and verifies arithmetic sum vs stated total.
    Returns (has_table, is_consistent, stated_total, sum_items, diff, details)
    """
    tables = []
    current_table = []
    in_table = False
    for line in completion.split('\n'):
        line_s = line.strip()
        if line_s.startswith('|') and line_s.endswith('|'):
            in_table = True
            current_table.append(line_s)
        else:
            if in_table:
                if len(current_table) >= 3:
                    tables.append(current_table)
                current_table = []
                in_table = False
    if current_table and len(current_table) >= 3:
        tables.append(current_table)

    cost_keywords = ['cost', 'expense', 'inr', 'விலை', 'செலவு', 'ಖರ್ಚು', 'लागत', 'ఖర్చు', 'തുക', 'రూ.']
    total_keywords = ['total', 'ಒಟ್ಟು', 'कुल', 'மொத்தம்', 'మొత్తం', 'ആകെ']

    for t in tables:
        has_total_row = any(any(k in r.lower() for k in total_keywords) for r in t)
        if not has_total_row:
            continue

        header_cells = [c.strip().lower() for c in t[0].split('|')[1:-1]]
        cost_col = None
        for idx, hc in enumerate(header_cells):
            if any(k in hc for k in cost_keywords):
                cost_col = idx
                break
        if cost_col is None:
            cost_col = len(header_cells) - 1

        line_items = []
        stated_total = None

        for row_line in t[2:]:
            cells = [c.strip() for c in row_line.split('|')[1:-1]]
            if not cells or len(cells) <= cost_col:
                continue
            cat = cells[0].replace('*', '').strip()
            cost_cell = cells[cost_col]

            nums = re.findall(r'([0-9]{1,3}(?:,[0-9]{2,3})+|[0-9]{4,7})', cost_cell)
            if not nums:
                continue
            clean = nums[-1].replace(',', '')
            if not clean.isdigit():
                continue
            cost = int(clean)

            if any(k in cat.lower() for k in total_keywords):
                stated_total = cost
            else:
                line_items.append((cat, cost))

        if stated_total is not None and line_items:
            item_sum = sum(c for _, c in line_items)
            diff = abs(stated_total - item_sum)
            # Arithmetic tolerance: up to ₹1,000 or <= 5% difference for miscellaneous rounding
            is_acceptable = (diff <= 1000) or (item_sum > 0 and (diff / item_sum) <= 0.05)
            return True, is_acceptable, stated_total, item_sum, diff, line_items

    return False, True, None, None, 0, []

# --- Main Validation Logic ---

with open(INPUT_CSV, "r", encoding="utf-8", errors="replace") as f:
    rows = list(csv.DictReader(f))

validated_records = []
usable_records = []
defective_records = []

script_map = {
    'kn-Knda-IN': 'kn', 'Kannada (India)': 'kn',
    'ta-Taml-IN': 'ta', 'Tamil (India)': 'ta',
    'te-Telu-IN': 'te', 'Telugu (India)': 'te',
    'ml-Mlym-IN': 'ml', 'Malayalam (India)': 'ml',
    'hi-Deva-IN': 'hi', 'Hindi (India)': 'hi',
    'en-Latn-IN': 'en', 'English (India)': 'en',
    'original': 'en',
}

defect_counter = Counter()

for idx, r in enumerate(rows):
    row_num = idx + 1
    prompt = r.get("enhanced_prompt", "").strip()
    completion = r.get("enhanced_completion", "").strip()
    target_lang = r.get("target_language", "")
    target_code = r.get("target_language_code", "")

    defects = []
    warnings = []

    # 1. Truncation & completeness
    if len(prompt) < 50:
        defects.append("PROMPT_TOO_SHORT")
    if len(completion) < 1000:
        defects.append("COMPLETION_TOO_SHORT")

    valid_ends = ('.', '?', '!', '।', '॥', ':', '"', "'", ')', ']', '}', '*', '۔')
    if not prompt.endswith(valid_ends):
        defects.append("PROMPT_TRUNCATED")
    if not completion.endswith(valid_ends):
        defects.append("COMPLETION_TRUNCATED")

    # 2. Language & Script matching
    exp_script = script_map.get(target_code) or script_map.get(target_lang, 'en')
    detected_p_script = detect_script(prompt)
    detected_c_script = detect_script(completion)

    if exp_script != 'en':
        if detected_p_script != exp_script:
            defects.append(f"PROMPT_SCRIPT_MISMATCH (expected {exp_script}, detected {detected_p_script})")
        if detected_c_script != exp_script:
            defects.append(f"COMPLETION_SCRIPT_MISMATCH (expected {exp_script}, detected {detected_c_script})")

    # Check for obvious translation number corruption (e.g. SIM card = ₹500,000)
    if "500,000" in completion and ("sim" in completion.lower() or "ಸಿಮ್" in completion):
        defects.append("TRANSLATION_CORRUPTION (SIM card ₹5,00,000)")

    # 3. Duration & Day count matching
    req_dur = extract_duration(prompt)
    found_days = count_itinerary_days(completion)
    day_count = len(found_days)

    if req_dur is not None:
        if day_count == 0:
            defects.append("ZERO_DAYS_IN_ITINERARY")
        elif abs(day_count - req_dur) > 1:
            defects.append(f"DAY_COUNT_MISMATCH (requested {req_dur} days, found {day_count} days)")
        elif abs(day_count - req_dur) == 1:
            warnings.append(f"DAY_COUNT_VARIANCE_1 (requested {req_dur}, found {day_count})")

    # 4. Budget extraction & Arithmetic check
    req_budget = extract_budget(prompt)
    has_tb, math_ok, stated_tot, sum_items, diff, items = evaluate_budget_math(completion)

    if has_tb and not math_ok:
        defects.append(f"BUDGET_ARITHMETIC_ERROR (stated ₹{stated_tot:,} vs sum ₹{sum_items:,}, diff ₹{diff:,})")

    # 5. Feasibility & Warning check
    has_disc = check_disclaimer(completion)
    if not has_disc:
        warnings.append("NO_EXPLICIT_VERIFICATION_DISCLAIMER")

    # If requested budget is known and stated total significantly exceeds it
    if req_budget and stated_tot and stated_tot > (req_budget * 1.15):
        # Must contain explicit warning/failed statement
        comp_lower = completion.lower()
        if not any(w in comp_lower for w in ['exceeds budget', 'failed', 'over budget', 'ಬಜೆಟ್‌ ಮೀರುತ್ತದೆ', 'बजट से अधिक', 'பட்ஜெட்டை விட அதிகம்', 'బడ్జెట్‌ను మించిపోయింది', 'അധികമാണ്']):
            warnings.append(f"BUDGET_EXCEEDED_WITHOUT_PROMINENT_FLAG (stated ₹{stated_tot:,} vs target ₹{req_budget:,})")

    # Classification
    is_usable = (len(defects) == 0)

    record = {
        "row_id": row_num,
        "target_language": target_lang,
        "target_language_code": target_code,
        "requested_duration": req_dur,
        "completion_days": day_count,
        "requested_budget_inr": req_budget,
        "stated_total_inr": stated_tot,
        "sum_line_items_inr": sum_items,
        "budget_diff_inr": diff if has_tb else 0,
        "prompt_chars": len(prompt),
        "completion_chars": len(completion),
        "has_disclaimer": has_disc,
        "defects": defects,
        "warnings": warnings,
        "is_usable": is_usable,
        "enhanced_prompt": prompt,
        "enhanced_completion": completion,
    }

    validated_records.append(record)
    if is_usable:
        usable_records.append(record)
    else:
        defective_records.append(record)
        for d in defects:
            defect_counter[d.split(' (')[0]] += 1

# --- Assign Semantic Clusters to Prevent Data Leakage ---
orig_rows = [(idx, r) for idx, r in enumerate(rows) if r["target_language"] == "original"]

def extract_feature_vector(text):
    return tuple(sorted(set(re.findall(r'\b[0-9]{1,7}\b', text.replace(',', '')))))

orig_profiles = []
for orig_id, (idx, r) in enumerate(orig_rows, 1):
    orig_profiles.append({
        "cluster_id": orig_id,
        "orig_row_idx": idx,
        "prompt": r["enhanced_prompt"],
        "completion": r["enhanced_completion"],
        "nums_p": extract_feature_vector(r["enhanced_prompt"]),
    })

row_to_cluster = {}
for idx, r in enumerate(rows):
    if r["target_language"] == "original":
        for op in orig_profiles:
            if op["orig_row_idx"] == idx:
                row_to_cluster[idx] = op["cluster_id"]
                break

for idx, r in enumerate(rows):
    if idx in row_to_cluster:
        continue
    p = r["enhanced_prompt"]
    c = r["enhanced_completion"]
    p_nums = extract_feature_vector(p)
    candidates = [op for op in orig_profiles if op["nums_p"] == p_nums]
    if len(candidates) == 1:
        row_to_cluster[idx] = candidates[0]["cluster_id"]
    elif len(candidates) > 1:
        c_nums = set(extract_feature_vector(c))
        best_cand = max(candidates, key=lambda op: len(c_nums.intersection(set(extract_feature_vector(op["completion"])))))
        row_to_cluster[idx] = best_cand["cluster_id"]
    else:
        p_set = set(p_nums)
        cand_sub = [op for op in orig_profiles if p_set.issubset(set(op["nums_p"])) or set(op["nums_p"]).issubset(p_set)]
        if cand_sub:
            c_nums = set(extract_feature_vector(c))
            best_cand = max(cand_sub, key=lambda op: len(c_nums.intersection(set(extract_feature_vector(op["completion"])))))
            row_to_cluster[idx] = best_cand["cluster_id"]
        else:
            row_to_cluster[idx] = 999  # Fallback cluster

# Attach cluster_id to each record
for r in validated_records:
    r["cluster_id"] = row_to_cluster[r["row_id"] - 1]

# --- Group-based Split (Zero Leakage Across Semantic Clusters) ---
cluster_to_usable = defaultdict(list)
for r in usable_records:
    cluster_to_usable[r["cluster_id"]].append(r)

# Identify multi-language clusters (represented in >= 5 languages) and single clusters
multi_lang_clusters = sorted([cid for cid, recs in cluster_to_usable.items() if len(recs) >= 5])
single_or_small = sorted([cid for cid, recs in cluster_to_usable.items() if len(recs) < 5])

# Select 4 multi-clusters (gives ~24-28 rows across all 6 languages) + 10 single clusters
eval_clusters = set(multi_lang_clusters[2:6] + single_or_small[5:15])

held_out = []
few_shot = []

for cid, recs in cluster_to_usable.items():
    if cid in eval_clusters:
        held_out.extend(recs)
    else:
        few_shot.extend(recs)

# Sort both sets cleanly by row_id
held_out.sort(key=lambda x: x["row_id"])
few_shot.sort(key=lambda x: x["row_id"])

# Save files
# 1. Usable JSON & CSV
with open(USABLE_JSON, "w", encoding="utf-8") as f:
    json.dump(usable_records, f, ensure_ascii=False, indent=2)

with open(USABLE_CSV, "w", encoding="utf-8", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=[
        "row_id", "target_language", "target_language_code", "requested_duration",
        "completion_days", "requested_budget_inr", "stated_total_inr", "is_usable",
        "enhanced_prompt", "enhanced_completion"
    ])
    writer.writeheader()
    for r in usable_records:
        writer.writerow({
            "row_id": r["row_id"],
            "target_language": r["target_language"],
            "target_language_code": r["target_language_code"],
            "requested_duration": r["requested_duration"],
            "completion_days": r["completion_days"],
            "requested_budget_inr": r["requested_budget_inr"],
            "stated_total_inr": r["stated_total_inr"],
            "is_usable": r["is_usable"],
            "enhanced_prompt": r["enhanced_prompt"],
            "enhanced_completion": r["enhanced_completion"],
        })

# 2. Defective JSON & CSV
with open(DEFECTIVE_JSON, "w", encoding="utf-8") as f:
    json.dump(defective_records, f, ensure_ascii=False, indent=2)

with open(DEFECTIVE_CSV, "w", encoding="utf-8", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=[
        "row_id", "target_language", "target_language_code", "defects", "warnings",
        "enhanced_prompt", "enhanced_completion"
    ])
    writer.writeheader()
    for r in defective_records:
        writer.writerow({
            "row_id": r["row_id"],
            "target_language": r["target_language"],
            "target_language_code": r["target_language_code"],
            "defects": "; ".join(r["defects"]),
            "warnings": "; ".join(r["warnings"]),
            "enhanced_prompt": r["enhanced_prompt"],
            "enhanced_completion": r["enhanced_completion"],
        })

# 3. Held-out Evaluation JSON
with open(HELD_OUT_JSON, "w", encoding="utf-8") as f:
    json.dump(held_out, f, ensure_ascii=False, indent=2)

# 4. Few-shot Curated JSON
with open(FEW_SHOT_JSON, "w", encoding="utf-8") as f:
    json.dump(few_shot, f, ensure_ascii=False, indent=2)

# 5. Validation Report JSON
report = {
    "summary": {
        "total_rows": len(rows),
        "usable_count": len(usable_records),
        "usable_percentage": round(len(usable_records) / len(rows) * 100, 2),
        "defective_count": len(defective_records),
        "defective_percentage": round(len(defective_records) / len(rows) * 100, 2),
        "few_shot_curated_count": len(few_shot),
        "held_out_evaluation_count": len(held_out),
    },
    "defect_breakdown": dict(defect_counter.most_common()),
    "usable_by_language": dict(Counter(r["target_language"] for r in usable_records)),
    "defective_by_language": dict(Counter(r["target_language"] for r in defective_records)),
    "held_out_by_language": dict(Counter(r["target_language"] for r in held_out)),
}

with open(REPORT_JSON, "w", encoding="utf-8") as f:
    json.dump(report, f, ensure_ascii=False, indent=2)

# Print Summary
print("=" * 60)
print("KARNATAKA YATRA AI - DATASET VALIDATION COMPLETE")
print("=" * 60)
print(f"Total Rows Evaluated   : {len(rows)}")
print(f"Usable Examples        : {len(usable_records)} ({len(usable_records)/len(rows)*100:.1f}%)")
print(f"Defective Examples     : {len(defective_records)} ({len(defective_records)/len(rows)*100:.1f}%)")
print(f"Few-Shot Curated Pool  : {len(few_shot)} examples ({len(set(r['cluster_id'] for r in few_shot))} clusters)")
print(f"Held-Out Evaluation Set: {len(held_out)} examples ({len(set(r['cluster_id'] for r in held_out))} clusters)")
cluster_leakage = set(r['cluster_id'] for r in few_shot).intersection(set(r['cluster_id'] for r in held_out))
print(f"Cluster Overlap / Leak : {len(cluster_leakage)} (Verified Zero Leakage: {len(cluster_leakage) == 0})")
print("\nDefects Identified:")
for d, c in defect_counter.most_common():
    print(f"  - {d:30s}: {c} rows")

print("\nUsable Distribution by Language:")
for l, c in Counter(r["target_language"] for r in usable_records).items():
    tot = sum(1 for r in rows if r["target_language"] == l)
    print(f"  - {l:20s}: {c:2d} usable / {tot:2d} total ({c/tot*100:.1f}%)")

print("\nHeld-Out Distribution by Language:")
for l, c in Counter(r["target_language"] for r in held_out).items():
    print(f"  - {l:20s}: {c:2d} evaluation prompts")

print(f"\nFiles Written:")
print(f"  ✓ {USABLE_JSON}")
print(f"  ✓ {USABLE_CSV}")
print(f"  ✓ {DEFECTIVE_JSON}")
print(f"  ✓ {DEFECTIVE_CSV}")
print(f"  ✓ {FEW_SHOT_JSON}")
print(f"  ✓ {HELD_OUT_JSON}")
print(f"  ✓ {REPORT_JSON}")
