// Cadastro de produtos em memória + localStorage (protótipo, sem backend).
import { useSyncExternalStore } from "react";
import { produtos as base, type Produto } from "@/lib/erp-data";

const KEY = "forja-produtos-extra";
let extras: Produto[] = [];
let carregado = false;
const ouvintes = new Set<() => void>();
let snapshot: Produto[] = base;

function carregar() {
  if (carregado || typeof window === "undefined") return;
  carregado = true;
  try {
    extras = JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    extras = [];
  }
  snapshot = [...base, ...extras];
}

export function adicionarProduto(p: Produto) {
  carregar();
  extras = [...extras, p];
  snapshot = [...base, ...extras];
  localStorage.setItem(KEY, JSON.stringify(extras));
  ouvintes.forEach((f) => f());
}

export function removerProduto(sku: string) {
  carregar();
  extras = extras.filter((p) => p.sku !== sku);
  snapshot = [...base, ...extras];
  localStorage.setItem(KEY, JSON.stringify(extras));
  ouvintes.forEach((f) => f());
}

export function ehCadastroManual(sku: string) {
  return extras.some((p) => p.sku === sku);
}

export function useProdutos(): Produto[] {
  return useSyncExternalStore(
    (f) => {
      ouvintes.add(f);
      if (!carregado) {
        carregar();
        queueMicrotask(f);
      }
      return () => ouvintes.delete(f);
    },
    () => snapshot,
    () => base,
  );
}
