from pathlib import Path

text = Path(r"app/productos/[id]/page.tsx").read_text()
start = text.index('{dollarRate && (')
end = text.index('                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">')
print(text[start:end])
