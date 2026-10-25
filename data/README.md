# Karnataka Yatra AI - Data & Dataset Directory

This directory outlines the dataset architecture, Adaption Labs dataset validation results, and few-shot in-context learning pipelines.

---

## 1. Adaption Labs Dataset Validation Summary

The raw dataset (`dataset/Sample_dataset.csv`) contains **238 prompt-completion pairs** across 6 regional Indian languages (Kannada, Hindi, Tamil, Telugu, Malayalam) and English.

A rigorous 5-step automated validation audit (`scripts/run_dataset_validation.py`) was conducted:

| Category | Count | Percentage | Description |
| :--- | :--- | :--- | :--- |
| **Total Rows Evaluated** | **238** | 100.0% | Complete prompt-completion pairs |
| **Usable Clean Rows** | **198** | **83.2%** | Passed truncation, script, day count, arithmetic & disclaimer checks |
| **Defective Rows** | **40** | **16.8%** | Isolated due to budget arithmetic discrepancy or truncated text |
| **Few-Shot Curated Pool** | **160** | 67.2% | High-quality exemplars for Gemini prompt enrichment (71 clusters) |
| **Held-Out Evaluation Set** | **38** | 16.0% | Zero-leakage cluster split across all 6 languages & durations (14 clusters) |

---

## 2. Generated Dataset Artifacts (`dataset/`)

- [`usable_examples.json`](file:///c:/Kannada_Travel_guide_AI/dataset/usable_examples.json) & [`usable_examples.csv`](file:///c:/Kannada_Travel_guide_AI/dataset/usable_examples.csv): 198 verified, high-fidelity examples.
- [`defective_examples.json`](file:///c:/Kannada_Travel_guide_AI/dataset/defective_examples.json) & [`defective_examples.csv`](file:///c:/Kannada_Travel_guide_AI/dataset/defective_examples.csv): 40 defective rows tagged with exact failure reasons (e.g. `BUDGET_ARITHMETIC_ERROR`, `COMPLETION_TOO_SHORT`).
- [`few_shot_curated.json`](file:///c:/Kannada_Travel_guide_AI/dataset/few_shot_curated.json): 160 verified examples used by `llm_provider.py` for in-context learning without fine-tuning.
- [`eval_held_out.json`](file:///c:/Kannada_Travel_guide_AI/dataset/eval_held_out.json): 38 held-out evaluation test cases stratified by language and cluster with verified zero leakage.
- [`validation_report.json`](file:///c:/Kannada_Travel_guide_AI/dataset/validation_report.json): Machine-readable audit report with language-wise defect distributions.
- [`eval_results.json`](file:///c:/Kannada_Travel_guide_AI/dataset/eval_results.json): Benchmark performance scores against the held-out evaluation set.

---

## 3. Defect Analysis & Root Causes

1. **Budget Arithmetic Mismatches (39 rows)**:
   - Line items in the markdown breakdown table did not sum to the stated total by more than ₹1,000 / 5% (e.g. stated ₹50,500 vs line item sum ₹55,000).
   - In Row 45 (Kannada), a translation hallucination mutated an emergency SIM card cost from ₹500 to ₹500,000 (`ಸ್ಥಳಾಂತರ ಸಿಮ್: ₹500,000`).
2. **Incomplete Completion (1 row)**:
   - Row 111 ended prematurely at character 1,200 without completing the daily itinerary.
3. **Punctuation & Truncation**:
   - Zero truncated prompts (100% of prompts end cleanly with proper sentence punctuation).

---

## 4. Benchmark Evaluation Runner

Run the benchmark evaluation against the held-out test set anytime:
```powershell
backend\venv\Scripts\python scripts\evaluate_planner.py
```

**Benchmark Results on Held-Out Test Set (38 cases)**:
- **Structural Compliance Score**: 100.0%
- **Day Count Precision**: 38/38 (100.0%)
- **Budget Safety Compliance**: 38/38 (100.0%)
- **Verification Disclaimer Presence**: 38/38 (100.0%)
- **Kannada Phrasebook Integration**: 38/38 (100.0%)
- **Curated Hub Resolution Rate**: 38/38 (100.0% offline matrix; 0 fallback)
