import { padraoBarrasEan13 } from "@/lib/barcode";

/** Renderiza um código de barras EAN-13 legível por leitor óptico. */
export function BarcodeEan13({
  codigo,
  altura = 64,
  larguraBarra = 2,
}: {
  codigo: string;
  altura?: number;
  larguraBarra?: number;
}) {
  const bits = padraoBarrasEan13(codigo);
  const largura = bits.length * larguraBarra;
  const c = codigo.replace(/\D/g, "").padStart(13, "0").slice(0, 13);
  const guardas = new Set<number>();
  [0, 1, 2, 45, 46, 47, 48, 49, 92, 93, 94].forEach((i) => guardas.add(i));

  return (
    <div className="inline-block bg-white p-2">
      <svg
        role="img"
        aria-label={`Código de barras EAN-13 ${c}`}
        width={largura}
        height={altura + 16}
        viewBox={`0 0 ${largura} ${altura + 16}`}
      >
        {bits.split("").map((bit, i) =>
          bit === "1" ? (
            <rect
              key={i}
              x={i * larguraBarra}
              y={0}
              width={larguraBarra}
              height={guardas.has(i) ? altura + 6 : altura}
              fill="#000"
            />
          ) : null,
        )}
        <text
          x={largura / 2}
          y={altura + 14}
          textAnchor="middle"
          fontFamily="monospace"
          fontSize="11"
          letterSpacing="2"
          fill="#000"
        >
          {`${c.slice(0, 1)} ${c.slice(1, 7)} ${c.slice(7)}`}
        </text>
      </svg>
    </div>
  );
}
