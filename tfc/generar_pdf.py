"""
Convierte el Word del TFC a PDF usando docx2pdf (requiere Word instalado).
"""
import os
from docx2pdf import convert

BASE = r"C:\Users\r.aguado\TFC_Rubén_Aguado\tfc"
DOCX = os.path.join(BASE, "TFC_SolveIT.docx")
PDF = os.path.join(BASE, "TFC_SolveIT.pdf")

print("Convirtiendo a PDF...")
convert(DOCX, PDF)
print(f"OK PDF generado: {PDF}")
