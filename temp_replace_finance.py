from pathlib import Path

path = Path(r"app/productos/[id]/page.tsx")
text = path.read_text(encoding="utf-8")
old_line = '                    <p className="text-blue-700 font-medium">💳 Hasta 12 cuotas sin interés disponibles</p>\n'
idx = text.index(old_line)
end_idx = idx + len(old_line) + len('                  </div>\n\n')
finance_new = '                    <p className="text-blue-700 font-medium">Opciones de financiación disponibles</p>\n                    {installmentOptions.length > 0 ? (\n                      <div className="mt-2 space-y-1 text-sm text-blue-700">\n                        {installmentOptions.map((option) => (\n                          <p key={option.months} className="flex flex-wrap items-baseline justify-between gap-2">\n                            <span>{option.months} cuotas de</span>\n                            <span className="font-semibold">\n                              ${option.monthlyAmount.toLocaleString("es-AR", { maximumFractionDigits: 0 })}\n                            </span>\n                            <span className="text-blue-600/70">\n                              Total ${option.totalAmount.toLocaleString("es-AR", { maximumFractionDigits: 0 })}\n                            </span>\n                          </p>\n                        ))}\n                      </div>\n                    ) : (\n                      <p className="mt-2 text-sm text-blue-700">\n                        Consultá por financiación personalizada para este producto.\n                      </p>\n                    )}\n'
text = text[:idx] + finance_new + text[end_idx:]
stock_block = '{/* Stock */}\n                <div className="flex items-center gap-2">\n                  <div className={`w-3 h-3 rounded-full ${product.stock > 0 ? "bg-green-500" : "bg-red-500"}`} />\n                  <span className={`font-medium ${product.stock > 0 ? "text-green-700" : "text-red-700"}`}>\n                    {product.stock > 0 ? `${product.stock} disponibles` : "Sin stock"}\n                  </span>\n                </div>\n\n                \n'
text = text.replace(stock_block, '', 1)
path.write_text(text, encoding="utf-8")
