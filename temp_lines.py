from pathlib import Path

text = Path(r"app/productos/[id]/page.tsx").read_text(encoding="utf-8")
for line in text.splitlines():
    if "cuotas" in line:
        print(repr(line))
