from pathlib import Path

text = Path(r"app/productos/[id]/page.tsx").read_text()
snippet = text[text.index('                  <div className="bg-blue-50'):text.index('                  <div className="bg-blue-50')+120]
print(repr(snippet))
