#!/usr/bin/env python3
"""
csv_to_datajs.py
Convierte un archivo CSV o Excel con columnas estándar a assets/js/data.js
Uso:
  python csv_to_datajs.py --input templates/propiedades_template.csv --output assets/js/data.js
"""
import argparse, pandas as pd, json, sys, os

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--input", required=True, help="Ruta a CSV/XLSX con columnas del template")
    ap.add_argument("--output", required=True, help="Ruta de salida para data.js")
    args = ap.parse_args()

    if not os.path.exists(args.input):
        print("No existe el archivo de entrada", file=sys.stderr)
        sys.exit(1)

    if args.input.lower().endswith(".xlsx"):
        df = pd.read_excel(args.input, dtype=str)
    else:
        df = pd.read_csv(args.input, dtype=str)

    # Limpia campos y casteos
    def to_num(x):
        if pd.isna(x) or x=="": return None
        x = str(x).replace(".","").replace(",",".")
        try: return float(x)
        except: return None

    props = []
    for _,r in df.iterrows():
        props.append({
            "id": str(r.get("id","")).strip(),
            "operacion": (r.get("operacion") or "").strip() or None,
            "tipo": (r.get("tipo") or "").strip() or None,
            "comuna": (r.get("comuna") or "").strip() or None,
            "ciudad": (r.get("ciudad") or "").strip() or None,
            "precioUF": to_num(r.get("precioUF")),
            "precioCLP": to_num(r.get("precioCLP")),
            "dormitorios": to_num(r.get("dormitorios")),
            "banos": to_num(r.get("banos")),
            "estacionamientos": to_num(r.get("estacionamientos")),
            "superficie": to_num(r.get("superficie")),
            "terreno": to_num(r.get("terreno")),
            "direccion": (r.get("direccion") or "").strip() or None,
            "imagen": (r.get("imagen") or "").strip() or None,
            "destacado": str(r.get("destacado") or "").strip().lower() in ("1","true","sí","si","yes","y"),
            "lat": to_num(r.get("lat")),
            "lon": to_num(r.get("lon")),
            "descripcion": (r.get("descripcion") or "").strip() or None
        })

    out_js = "window.PROPIEDADES = " + json.dumps(props, ensure_ascii=False, indent=2) + ";"
    os.makedirs(os.path.dirname(args.output), exist_ok=True)
    with open(args.output, "w", encoding="utf-8") as f:
        f.write(out_js)
    print("Generado", args.output, "con", len(props), "propiedades.")

if __name__ == "__main__":
    main()
