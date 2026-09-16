import type { ReactNode } from "react";
import type { Status } from "@/lib/erp-data";

const statusLabel: Record<Status, string> = {
  ok: "Ok",
  atencao: "Atenção",
  critico: "Crítico",
  andamento: "Em andamento",
  concluido: "Concluído",
  planejado: "Planejado",
};

const statusClass: Record<Status, string> = {
  ok: "bg-success/15 text-success border-success/30",
  atencao: "bg-warning/15 text-warning border-warning/30",
  critico: "bg-destructive/15 text-destructive border-destructive/30",
  andamento: "bg-primary/15 text-primary border-primary/30",
  concluido: "bg-success/15 text-success border-success/30",
  planejado: "bg-muted text-muted-foreground border-border",
};

export function StatusBadge({ status, label }: { status: Status; label?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${statusClass[status]}`}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {label ?? statusLabel[status]}
    </span>
  );
}

export function PageHeader({
  titulo,
  descricao,
  acao,
}: {
  titulo: string;
  descricao: string;
  acao?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-5">
      <div>
        <h1 className="font-display text-3xl uppercase tracking-tight text-foreground">{titulo}</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{descricao}</p>
      </div>
      {acao}
    </header>
  );
}

export function Panel({
  titulo,
  extra,
  children,
  className = "",
}: {
  titulo: string;
  extra?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`border border-border bg-card ${className}`}>
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
          {titulo}
        </h2>
        {extra}
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

export function Metric({
  label,
  value,
  delta,
  tone,
}: {
  label: string;
  value: string;
  delta: string;
  tone: Status;
}) {
  const bar =
    tone === "critico" ? "bg-destructive" : tone === "atencao" ? "bg-warning" : "bg-primary";
  return (
    <div className="relative border border-border bg-card p-4">
      <span className={`absolute left-0 top-0 h-full w-0.5 ${bar}`} />
      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 font-display text-3xl tabular-nums text-foreground">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{delta}</p>
    </div>
  );
}

export function Bar({ value, tone = "primary" }: { value: number; tone?: string }) {
  const color =
    value >= 90 ? "bg-destructive" : value >= 75 ? "bg-warning" : `bg-${tone}`;
  return (
    <div className="h-1.5 w-full bg-muted">
      <div className={`h-full ${color}`} style={{ width: `${Math.min(value, 100)}%` }} />
    </div>
  );
}

export function Table({
  colunas,
  children,
}: {
  colunas: string[];
  children: ReactNode;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border">
            {colunas.map((c) => (
              <th
                key={c}
                className="px-3 py-2 text-left font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground"
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function Row({ children }: { children: ReactNode }) {
  return (
    <tr className="border-b border-border/60 transition-colors last:border-0 hover:bg-muted/40">
      {children}
    </tr>
  );
}

export function Cell({
  children,
  mono = false,
  className = "",
}: {
  children: ReactNode;
  mono?: boolean;
  className?: string;
}) {
  return (
    <td
      className={`px-3 py-2.5 text-foreground ${mono ? "font-mono tabular-nums" : ""} ${className}`}
    >
      {children}
    </td>
  );
}

export function brl(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 2 });
}
