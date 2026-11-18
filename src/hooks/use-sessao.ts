import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Papel = Database["public"]["Enums"]["app_role"];
export type Modulo =
  | "painel" | "mrp" | "producao" | "wms" | "tms" | "compras" | "vendas"
  | "produtos" | "etiquetas" | "qualidade" | "relatorios" | "usuarios";

export const nomePapel: Record<Papel, string> = {
  admin: "Administrador", gestor: "Gestor", supervisor: "Supervisor", operador: "Operador",
  almoxarife: "Almoxarife", comprador: "Comprador", vendedor: "Vendedor",
};

export type Sessao = {
  userId: string;
  email: string;
  nome: string;
  papeis: Papel[];
  acesso: Record<string, "ver" | "editar">;
  admin: boolean;
};

async function carregar(): Promise<Sessao | null> {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return null;
  const [perfil, papeis, perms] = await Promise.all([
    supabase.from("profiles").select("nome,email").eq("id", u.user.id).maybeSingle(),
    supabase.from("user_roles").select("role").eq("user_id", u.user.id),
    supabase.from("permissoes_modulo").select("role,modulo,pode_editar"),
  ]);
  const lista = (papeis.data ?? []).map((r) => r.role);
  const admin = lista.includes("admin");
  const acesso: Sessao["acesso"] = {};
  for (const p of perms.data ?? []) {
    if (!lista.includes(p.role)) continue;
    if (p.pode_editar) acesso[p.modulo] = "editar";
    else acesso[p.modulo] ??= "ver";
  }
  return {
    userId: u.user.id,
    email: u.user.email ?? "",
    nome: perfil.data?.nome || u.user.email || "",
    papeis: lista,
    acesso,
    admin,
  };
}

export function useSessao() {
  return useQuery({ queryKey: ["sessao"], queryFn: carregar, staleTime: 60_000 });
}

export function podeVer(s: Sessao | null | undefined, m: Modulo) {
  if (!s) return false;
  if (s.admin) return true;
  if (m === "usuarios") return false;
  return !!s.acesso[m];
}

export function podeEditar(s: Sessao | null | undefined, m: Modulo) {
  if (!s) return false;
  return s.admin || s.acesso[m] === "editar";
}

export async function registrarAtividade(modulo: string, acao: string, entidade?: string, entidadeId?: string) {
  const { data } = await supabase.auth.getUser();
  if (!data.user) return;
  await supabase.from("atividades").insert({
    user_id: data.user.id, modulo, acao, entidade: entidade ?? null, entidade_id: entidadeId ?? null,
  });
}
