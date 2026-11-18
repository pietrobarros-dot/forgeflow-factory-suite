import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import {
  Boxes, ClipboardCheck, Factory, Gauge, Layers, LogOut, Menu, Package, ShieldCheck,
  ShoppingCart, Tags, Truck, Users, Warehouse, X, Loader2, Lock,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { nomePapel, podeVer, useSessao, type Modulo } from "@/hooks/use-sessao";

type Item = { to: string; label: string; sigla: string; modulo: Modulo; icon: typeof Gauge };
export const navegacao: { grupo: string; itens: Item[] }[] = [
  { grupo: "Visão geral", itens: [{ to: "/", label: "Painel", sigla: "DSH", modulo: "painel", icon: Gauge }] },
  { grupo: "Planejamento e produção", itens: [
    { to: "/mrp", label: "MRP · Planejamento", sigla: "MRP", modulo: "mrp", icon: Layers },
    { to: "/producao", label: "Produção", sigla: "MES", modulo: "producao", icon: Factory },
    { to: "/qualidade", label: "Qualidade e manutenção", sigla: "QMS", modulo: "qualidade", icon: ClipboardCheck },
  ] },
  { grupo: "Materiais e logística", itens: [
    { to: "/produtos", label: "Produtos e estrutura", sigla: "PIM", modulo: "produtos", icon: Package },
    { to: "/wms", label: "Estoque · Armazém", sigla: "WMS", modulo: "wms", icon: Warehouse },
    { to: "/etiquetas", label: "Etiquetas e códigos", sigla: "ETQ", modulo: "etiquetas", icon: Tags },
    { to: "/tms", label: "Transporte", sigla: "TMS", modulo: "tms", icon: Truck },
  ] },
  { grupo: "Comercial", itens: [
    { to: "/compras", label: "Compras", sigla: "SRM", modulo: "compras", icon: ShoppingCart },
    { to: "/vendas", label: "Vendas e pedidos", sigla: "CRM", modulo: "vendas", icon: Boxes },
  ] },
  { grupo: "Administração", itens: [
    { to: "/usuarios", label: "Usuários e acessos", sigla: "ADM", modulo: "usuarios", icon: Users },
  ] },
];
const todos = navegacao.flatMap((g) => g.itens);

function moduloAtual(path: string) {
  return todos.find((i) => (i.to === "/" ? path === "/" : path.startsWith(i.to)));
}

function Navegacao({ onNavigate }: { onNavigate?: () => void }) {
  const { data: s } = useSessao();
  return (
    <nav className="flex-1 overflow-y-auto py-3">
      {navegacao.map((g) => {
        const itens = g.itens.filter((i) => podeVer(s, i.modulo));
        if (!itens.length) return null;
        return (
          <div key={g.grupo} className="mb-3">
            <p className="px-5 pb-1 pt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">{g.grupo}</p>
            {itens.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={onNavigate}
                activeOptions={{ exact: item.to === "/" }}
                activeProps={{ className: "bg-muted text-foreground border-l-primary [&_svg]:text-primary" }}
                inactiveProps={{ className: "border-l-transparent text-muted-foreground" }}
                className="flex items-center gap-3 border-l-2 px-5 py-2 text-sm transition-colors hover:bg-muted/60 hover:text-foreground"
              >
                <item.icon className="size-4 shrink-0" />
                <span className="flex-1">{item.label}</span>
                <span className="font-mono text-[9px] tracking-widest opacity-50">{item.sigla}</span>
              </Link>
            ))}
          </div>
        );
      })}
    </nav>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: sessao, isLoading } = useSessao();
  const [aberto, setAberto] = useState(false);
  const atual = moduloAtual(pathname);

  async function sair() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", search: { redirect: undefined }, replace: true });
  }

  const logo = (
    <div className="border-b border-border px-5 py-5">
      <p className="font-display text-xl uppercase tracking-tight text-foreground">Forja<span className="text-primary">ERP</span></p>
      <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Planta 01</p>
    </div>
  );

  let conteudo: ReactNode = children;
  if (isLoading) {
    conteudo = <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" />Carregando acesso…</div>;
  } else if (atual && !podeVer(sessao, atual.modulo)) {
    conteudo = (
      <div className="mx-auto mt-20 max-w-md border border-border bg-card p-8 text-center">
        <Lock className="mx-auto size-8 text-destructive" />
        <h1 className="mt-4 font-display text-xl uppercase">Sem permissão</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {sessao?.papeis.length ? "Seu perfil não tem acesso a este módulo." : "Sua conta ainda não tem um perfil de acesso. Peça a um administrador para liberar."}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen">
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-sidebar lg:flex">
          {logo}
          <Navegacao />
        </aside>

        {aberto && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <button aria-label="Fechar menu" className="absolute inset-0 bg-background/80" onClick={() => setAberto(false)} />
            <aside className="relative flex h-full w-72 flex-col border-r border-border bg-sidebar animate-in slide-in-from-left">
              <button aria-label="Fechar menu" onClick={() => setAberto(false)} className="absolute right-3 top-5 text-muted-foreground"><X className="size-5" /></button>
              {logo}
              <Navegacao onNavigate={() => setAberto(false)} />
            </aside>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-sidebar/95 px-4 backdrop-blur lg:px-8">
            <button aria-label="Abrir menu" className="text-muted-foreground lg:hidden" onClick={() => setAberto(true)}><Menu className="size-5" /></button>
            {atual && <atual.icon className="size-4 text-primary" />}
            <p className="flex-1 truncate text-sm">
              <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">{atual?.sigla ?? "ERP"} /</span>{" "}
              <span className="font-semibold">{atual?.label ?? "ForjaERP"}</span>
            </p>
            {sessao && (
              <div className="flex items-center gap-3">
                <div className="hidden text-right sm:block">
                  <p className="text-sm leading-tight">{sessao.nome}</p>
                  <p className="flex items-center justify-end gap-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    <ShieldCheck className="size-3" />{sessao.papeis.map((p) => nomePapel[p]).join(", ") || "Sem perfil"}
                  </p>
                </div>
                <button onClick={sair} aria-label="Sair" title="Sair" className="border border-border p-2 text-muted-foreground transition-colors hover:border-destructive hover:text-destructive">
                  <LogOut className="size-4" />
                </button>
              </div>
            )}
          </header>
          <main className="flex-1 space-y-6 p-5 animate-in fade-in lg:p-8">{conteudo}</main>
        </div>
      </div>
    </div>
  );
}
