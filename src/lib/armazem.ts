// Layout do armazém: ruas (racks) × posições × níveis, com itens alocados.
import type { Produto } from "@/lib/erp-data";

export type Posicao = {
  id: string; rua: string; coluna: number; nivel: number;
  sku?: string; nome?: string; qtd: number; ocupacao: number;
};

export const RUAS = ["A", "B", "C", "D"];
export const COLUNAS = 6;
export const NIVEIS = 4;

export function montarArmazem(produtos: Produto[]): Posicao[] {
  const posicoes: Posicao[] = [];
  let i = 0;
  for (const rua of RUAS)
    for (let n = 1; n <= NIVEIS; n++)
      for (let c = 1; c <= COLUNAS; c++) {
        const seed = (i * 37 + 11) % 100;
        const p = seed < 72 ? produtos[(i * 7) % produtos.length] : undefined;
        const ocupacao = p ? 25 + ((seed * 13) % 76) : 0;
        posicoes.push({
          id: `${rua}-${String(c).padStart(2, "0")}-${n}`,
          rua, coluna: c, nivel: n,
          sku: p?.sku, nome: p?.nome,
          qtd: p ? Math.max(1, Math.round((p.estoque / 6) * (ocupacao / 100))) : 0,
          ocupacao,
        });
        i++;
      }
  return posicoes;
}

export function corOcupacao(o: number) {
  if (o === 0) return "#2a2f3a";
  if (o >= 90) return "#ef4444";
  if (o >= 70) return "#f59e0b";
  return "#22c55e";
}
