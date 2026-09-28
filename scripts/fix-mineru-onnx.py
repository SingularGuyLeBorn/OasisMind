import os
import subprocess
import sys

base = r"D:\weights\mineru\mineru4\MinerU-4_models_onnx"
repo = "https://huggingface.co/opendatalab/MinerU-4_models_onnx/resolve/main"
files = [
    "Layout/PP-DocLayoutV2/inference.onnx",
    "Layout/PP-DocLayoutV2/inference.yml",
    "MFR/pp_formulanet_plus_m/PP-FormulaNet_plus-M.onnx",
    "MFR/pp_formulanet_plus_m/PP-FormulaNet_plus-M_inference.yml",
    "OCR/paddleocr/ch_PP-OCRv6_small_rec_infer.onnx",
    "OCR/paddleocr/ch_PP-OCRv6_small_rec_inference.yml",
    "OCR/paddleocr/ch_PP-OCRv6_tiny_det_infer.onnx",
    "OCR/paddleocr/ch_PP-OCRv6_tiny_det_inference.yml",
    "OCR/paddleocr/seal_PP-OCRv4_det_infer.onnx",
    "OCR/paddleocr/seal_PP-OCRv4_det_inference.yml",
    "Table/PP-LCNet_x1_0_table_cls.onnx",
    "Table/slanet-plus.onnx",
    "Table/unet.onnx",
]

for rel in files:
    dest = os.path.join(base, rel.replace("/", os.sep))
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    with open(dest, "rb") as handle:
        head = handle.read(16)
    if head and head.count(0) != len(head):
        print("keep", rel, os.path.getsize(dest))
        continue
    tmp = dest + ".download"
    url = repo + "/" + rel
    print("get", rel, flush=True)
    code = subprocess.call(["curl.exe", "-L", "--retry", "5", "--retry-all-errors", "-o", tmp, url])
    if code != 0 or not os.path.isfile(tmp):
        print("FAIL", rel, code)
        sys.exit(1)
    with open(tmp, "rb") as handle:
        magic = handle.read(16)
    size = os.path.getsize(tmp)
    if size < 100 or magic.count(0) == len(magic) or magic.startswith(b"Entry"):
        print("BAD", rel, size, magic)
        sys.exit(1)
    os.replace(tmp, dest)
    print("ok", rel, size, magic[:8])
print("done")
