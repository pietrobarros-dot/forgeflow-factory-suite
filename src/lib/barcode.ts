// Utilitários de SKU e código de barras EAN-13 (protótipo, sem backend).

const L = [
  "0001101", "0011001", "0010011", "0111101", "0100011",
  "0110001", "0101111", "0111011", "0110111", "0001011",
];
const G = [
  "0100111", "0110011", "0011011", "0100001", "0011101",
  "0111001", "0000101", "0010001", "0001001", "0010111",
];
const R = [
  "1110010", "1100110", "1101100", "1000010", "1011100",
  "1001110", "1010000", "1000100", "1001000", "1110100",
];
const PARIDADE = [
  "LLLLLL", "LLGLGG", "LLGGLG", "LLGGGL", "LGLLGG",
  "LGGLLG", "LGGGLL", "LGLGLG", "LGLGGL", "LGGLGL",
];

/** Dígito verificador de um EAN-13 a partir dos 12 primeiros dígitos. */
export function digitoVerificadorEan13(doze: string): number {
  const d = doze.padStart(12, "0").slice(0, 12).split("").map(Number);
  const soma = d.reduce((acc, n, i) => acc + n * (i % 2 === 0 ? 1 : 3), 0);
  return (10 - (soma % 10)) % 10;
}

/** Completa/valida um EAN-13 de 13 dígitos a partir de um prefixo numérico. */
export function montarEan13(base: string): string {
  const doze = base.replace(/\D/g, "").padEnd(12, "0").slice(0, 12);
  return doze + digitoVerificadorEan13(doze);
}

export function ean13Valido(codigo: string): boolean {
  const c = codigo.replace(/\D/g, "");
  if (c.length !== 13) return false;
  return digitoVerificadorEan13(c.slice(0, 12)) === Number(c[12]);
}

/** Gera um EAN-13 comercial: prefixo GS1 + empresa + sequencial do item. */
export function gerarEan13({
  prefixoPais = "789",
  empresa = "4501",
  sequencial,
}: {
  prefixoPais?: string;
  empresa?: string;
  sequencial: number;
}): string {
  const seq = String(Math.abs(sequencial) % 100000).padStart(5, "0");
  return montarEan13(`${prefixoPais}${empresa}${seq}`);
}

/** Padrão de barras (string de 0/1) de um EAN-13 completo. */
export function padraoBarrasEan13(codigo: string): string {
  const c = codigo.replace(/\D/g, "").padStart(13, "0").slice(0, 13);
  const digitos = c.split("").map(Number);
  const paridade = PARIDADE[digitos[0]];
  let bits = "101";
  for (let i = 1; i <= 6; i++) {
    bits += paridade[i - 1] === "L" ? L[digitos[i]] : G[digitos[i]];
  }
  bits += "01010";
  for (let i = 7; i <= 12; i++) bits += R[digitos[i]];
  bits += "101";
  return bits;
}

/** Gera um SKU automático a partir do tipo e de um sequencial. */
export function gerarSku(tipo: string, sequencial: number): string {
  const prefixo =
    tipo === "Acabado" ? "PA" : tipo === "Semiacabado" ? "SM" : "MP";
  const faixa = tipo === "Acabado" ? 1000 : tipo === "Semiacabado" ? 2000 : 3000;
  return `${prefixo}-${faixa + (Math.abs(sequencial) % 999) + 1}`;
}
