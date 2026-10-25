import json
import os
import pytest
from backend.app.services.llm_provider import load_curated_few_shot_examples

DATASET_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "dataset"
)


def test_validation_files_exist():
    expected_files = [
        "Sample_dataset.csv",
        "usable_examples.json",
        "defective_examples.json",
        "few_shot_curated.json",
        "eval_held_out.json",
        "validation_report.json",
    ]
    for fname in expected_files:
        fpath = os.path.join(DATASET_DIR, fname)
        assert os.path.exists(fpath), f"Missing expected dataset file: {fpath}"


def test_usable_examples_quality():
    fpath = os.path.join(DATASET_DIR, "usable_examples.json")
    with open(fpath, "r", encoding="utf-8") as f:
        usable = json.load(f)

    assert len(usable) >= 180, f"Expected at least 180 usable examples, got {len(usable)}"

    for item in usable:
        assert item["is_usable"] is True
        assert len(item["defects"]) == 0
        assert len(item["enhanced_prompt"]) >= 50
        assert len(item["enhanced_completion"]) >= 1000
        assert item["completion_days"] > 0


def test_held_out_set_diversity():
    fpath = os.path.join(DATASET_DIR, "eval_held_out.json")
    with open(fpath, "r", encoding="utf-8") as f:
        held_out = json.load(f)

    assert len(held_out) >= 25, f"Expected at least 25 held-out evaluation cases, got {len(held_out)}"

    langs = {item["target_language"] for item in held_out}
    assert "Kannada (India)" in langs
    assert "Hindi (India)" in langs
    assert "Tamil (India)" in langs
    assert "Telugu (India)" in langs
    assert "Malayalam (India)" in langs


def test_zero_cluster_leakage():
    with open(os.path.join(DATASET_DIR, "few_shot_curated.json"), "r", encoding="utf-8") as f:
        few_shot = json.load(f)
    with open(os.path.join(DATASET_DIR, "eval_held_out.json"), "r", encoding="utf-8") as f:
        held_out = json.load(f)

    fs_clusters = set(r["cluster_id"] for r in few_shot if "cluster_id" in r)
    ho_clusters = set(r["cluster_id"] for r in held_out if "cluster_id" in r)

    overlap = fs_clusters.intersection(ho_clusters)
    assert len(overlap) == 0, f"Detected cluster data leakage: {overlap}"


def test_few_shot_retriever():
    kannada_ex = load_curated_few_shot_examples(preferred_language="kannada", duration_days=5, limit=1)
    assert len(kannada_ex) == 1
    assert kannada_ex[0]["is_usable"] is True

    english_ex = load_curated_few_shot_examples(preferred_language="english", duration_days=3, limit=1)
    assert len(english_ex) == 1
    assert english_ex[0]["is_usable"] is True
