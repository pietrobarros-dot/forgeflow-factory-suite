import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Search, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/erp/app-shell";
import { Cell, Metric, PageHeader, Panel, Row, Table } from "@/components/erp/ui";
import { Confirmar } from "@/components/erp/confirmar";
import { nomePapel, useSessao, type Papel } from "@/hooks/use-sessao";

export const Route = createFileRoute("/_authenticated/usuarios")({
  head: () => ({
    meta: [
      { title: "Usuários e acessos | ForjaERP" },
      { name: "description", content: "Cadastro de usuários, perfis de acesso e registro de atividades do ForjaERP." },
      { property: "og:title", content: "Usuários e acessos — ForjaERP" },
      { property: "og:description", content: "Perfis, permissões por módulo e auditoria." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: UsuariosPage,
});

const PAPEIS: Papel[] = ["admin", "gestor", "supervisor", "operador", "almoxarife", "comprador", "vendedor"];

function UsuariosPage() {
  const qc = useQueryClient();
  const { data: sessao } = useSessao();
  const [busca, setBusca] = useState("");

  const usuarios = useQuery({
    queryKey: ["usuarios"],
    queryFn: async () => {
      const [p, r] = await Promise.all([
        supabase.from("profiles").select("id,nome,email,ativo,created_at").order("created_at"),
        supabase.from("user_roles").select("user_id,role"),
      ]);
      if (p.error) throw p.error;
      return (p.data ?? []).map((u) => ({ ...u, papeis: (r.data ?? []).filter((x) => x.user_id === u.id).map((x) => x.role) }));
    },
  });
  const perms = useQuery({
    queryKey: ["permissoes"],
    queryFn: async () => (await supabase.from("permissoes_modulo").select("*").order("modulo")).data ?? [],
  });
  const atividades = useQuery({
    queryKey: ["atividades"],
    queryFn: async () => (await supabase.from("atividades").select("*").order("created_at", { ascending: false }).limit(30)).data ?? [],
  });

  const lista = useMemo(() => {
    const q = busca.toLowerCase();
    return (usuarios.data ?? []).filter((u) => !q || u.nome.toLowerCase().includes(q) || (u.email ?? "").toLowerCase().includes(q));
  }, [usuarios.data, busca]);

  async function adicionar(userId: string, role: Papel) {
    const { error } = await supabase.from("user_roles").insert({ user_id: userId, role });
    if (error) return toast.error("Não foi possível atribuir o perfil.");
    toast.success(`Perfil ${nomePapel[role]} atribuído.`);
    qc.invalidateQueries({ queryKey: ["usuarios"] });
    qc.invalidateQueries({ queryKey: ["atividades"] });
  }
  async function remover(userId: string, role: Papel) {
    const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", role);
    if (error) return toast.error("Não foi possível remover o perfil.");
    toast.success(`Perfil ${nomePapel[role]} removido.`);
    qc.invalidateQueries({ queryKey: ["usuarios"] });
    qc.invalidateQueries({ queryKey: ["atividades"] });
  }

  const modulos = [...new Set((perms.data ?? []).map((p) => p.modulo))];
  const nomeDe = (id: string | null) => usuarios.data?.find((u) => u.id === id)?.nome ?? "—";

  return (
    <AppShell>
      <PageHeader titulo="Usuários e acessos" descricao="Atribua perfis aos usuários. As permissões de cada perfil valem para todos os módulos." />

      <div className="grid gap-3 sm:grid-cols-3">
        <Metric label="Usuários" value={String(usuarios.data?.length ?? 0)} delta="Cadastrados" tone="ok" />
        <Metric label="Sem perfil" value={String((usuarios.data ?? []).filter((u) => !u.papeis.length).length)} delta="Aguardando liberação" tone="atencao" />
        <Metric label="Administradores" value={String((usuarios.data ?? []).filter((u) => u.papeis.includes("admin")).length)} delta="Acesso total" tone="ok" />
      </div>

      <Panel
        titulo="Usuários"
        extra={
          <label className="flex h-8 items-center gap-2 border border-border bg-background px-2">
            <Search className="size-3.5 text-muted-foreground" />
            <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar nome ou e-mail" className="w-48 bg-transparent text-xs outline-none" />
          </label>
        }
      >
        {usuarios.isLoading ? <p className="text-sm text-muted-foreground">Carregando…</p> : (
          <Table colunas={["Nome", "E-mail", "Perfis", "Adicionar perfil"]}>
            {lista.map((u) => (
              <Row key={u.id}>
                <Cell>{u.nome}</Cell>
                <Cell mono className="text-xs">{u.email}</Cell>
                <Cell>
                  <div className="flex flex-wrap gap-1">
                    {u.papeis.length === 0 && <span className="text-xs text-warning">Sem perfil</span>}
                    {u.papeis.map((p) => (
                      <span key={p} className="inline-flex items-center gap-1 border border-primary/40 bg-primary/10 px-2 py-0.5 text-[11px] uppercase tracking-wider text-primary">
                        {nomePapel[p]}
                        {!(p === "admin" && u.id === sessao?.userId) && (
                          <Confirmar titulo="Remover perfil?" descricao={`${u.nome} perde o acesso de ${nomePapel[p]}.`} acao="Remover" perigo onConfirm={() => remover(u.id, p)}>
                            <button aria-label={`Remover ${nomePapel[p]}`}><X className="size-3" /></button>
                          </Confirmar>
                        )}
                      </span>
                    ))}
                  </div>
                </Cell>
                <Cell>
                  <select
                    value=""
                    onChange={(e) => e.target.value && adicionar(u.id, e.target.value as Papel)}
                    className="h-8 border border-border bg-background px-2 text-xs"
                  >
                    <option value="">Escolher…</option>
                    {PAPEIS.filter((p) => !u.papeis.includes(p)).map((p) => <option key={p} value={p}>{nomePapel[p]}</option>)}
                  </select>
                </Cell>
              </Row>
            ))}
          </Table>
        )}
      </Panel>

      <Panel titulo="Permissões por perfil (V = ver, E = editar)">
        <Table colunas={["Módulo", ...PAPEIS.map((p) => nomePapel[p])]}>
          {modulos.map((m) => (
            <Row key={m}>
              <Cell mono className="uppercase">{m}</Cell>
              {PAPEIS.map((p) => {
                if (p === "admin") return <Cell key={p} mono className="text-success">E</Cell>;
                const x = perms.data?.find((q) => q.role === p && q.modulo === m);
                return <Cell key={p} mono className={x ? (x.pode_editar ? "text-success" : "text-warning") : "text-muted-foreground"}>{x ? (x.pode_editar ? "E" : "V") : "—"}</Cell>;
              })}
            </Row>
          ))}
        </Table>
      </Panel>

      <Panel titulo="Registro de atividades">
        {(atividades.data ?? []).length === 0 ? <p className="text-sm text-muted-foreground">Nenhuma atividade registrada ainda.</p> : (
          <Table colunas={["Quando", "Usuário", "Módulo", "Ação", "Registro"]}>
            {(atividades.data ?? []).map((a) => (
              <Row key={a.id}>
                <Cell mono className="text-xs">{new Date(a.created_at).toLocaleString("pt-BR")}</Cell>
                <Cell>{nomeDe(a.user_id)}</Cell>
                <Cell mono className="uppercase text-xs">{a.modulo}</Cell>
                <Cell>{a.acao === "INSERT" ? "Perfil atribuído" : a.acao === "DELETE" ? "Perfil removido" : a.acao}</Cell>
                <Cell className="text-xs">{a.entidade === "user_roles" ? `${nomeDe(a.entidade_id)} · ${String(((a.depois ?? a.antes) as { role?: string } | null)?.role ?? "")}` : a.entidade_id}</Cell>
              </Row>
            ))}
          </Table>
        )}
      </Panel>
    </AppShell>
  );
}
