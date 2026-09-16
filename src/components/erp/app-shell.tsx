import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

const nav = [
  { to: "/", label: "Painel", sigla: "DSH" },
  { to: "/mrp", label: "MRP · Planejamento", sigla: "MRP" },
  { to: "/producao", label: "Produção / Chão de fábrica", sigla: "MES" },
  { to: "/wms", label: "WMS · Armazém", sigla: "WMS" },
  { to: "/tms", label: "TMS · Transporte", sigla: "TMS" },
  { to: "/compras", label: "Compras / Suprimentos", sigla: "SRM" },
  { to: "/vendas", label: "Vendas / Pedidos", sigla: "CRM" },
  { to: "/produtos", label: "Produtos e estrutura", sigla: "PIM" },
  { to: "/qualidade", label: "Qualidade e manutenção", sigla: "QMS" },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-sidebar lg:flex">
          <div className="border-b border-border px-5 py-5">
            <p className="font-display text-xl uppercase tracking-tight text-foreground">
              Forja<span className="text-primary">ERP</span>
            </p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Planta 01 · Protótipo
            </p>
          </div>
          <nav className="flex-1 overflow-y-auto py-3">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.to === "/" }}
                activeProps={{
                  className: "bg-muted text-foreground border-l-primary",
                }}
                inactiveProps={{ className: "border-l-transparent text-muted-foreground" }}
                className="flex items-center gap-3 border-l-2 px-5 py-2.5 text-sm transition-colors hover:bg-muted/60 hover:text-foreground"
              >
                <span className="font-mono text-[10px] tracking-widest opacity-70">
                  {item.sigla}
                </span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
          <div className="border-t border-border px-5 py-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Turno B · 14:00–22:00
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Dados simulados</p>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center gap-4 overflow-x-auto border-b border-border bg-sidebar px-4 py-3 lg:hidden">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.to === "/" }}
                activeProps={{ className: "text-primary" }}
                className="whitespace-nowrap font-mono text-xs uppercase tracking-widest text-muted-foreground"
              >
                {item.sigla}
              </Link>
            ))}
          </div>
          <main className="flex-1 space-y-6 p-5 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
