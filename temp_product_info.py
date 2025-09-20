from pathlib import Path

text = Path(r"app/productos/[id]/page.tsx").read_text()
start = text.index('            {/* Product Info */}')
end = text.index('            </AnimatedSection>', start)
print(text[start:end])
