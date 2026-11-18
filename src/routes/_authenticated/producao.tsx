import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/erp/app-shell";
import { Bar, Cell, Metric, PageHeader, Panel, Row, StatusBadge, Table } from "@/components/erp/ui";
import { centrosTrabalho, ordens } from "@/lib/erp-data";

export const Route = createFileRoute("/_authenticated/producao")({
  head: () => ({
    meta: [
      { title: "Produção — Ordens e chão de fábrica | ForjaERP" },
      {
        name: "description",
        content:
          "Acompanhamento de ordens de produção, apontamento por célula, carga de capacidade e sequenciamento.",
      },
      { property: "og:title", content: "Produção — Ordens e chão de fábrica" },
      {
        property: "og:description",
        content: "Ordens abertas, avanço por célula e capacidade disponível da planta.",
      },
    ],
  }),
  component: ProducaoPage,
});

function ProducaoPage() {
  return (
    <AppShell>
      <PageHeader
        titulo="Produção · Chão de fábrica"
        descricao="Ordens abertas, apontamento de avanço e ocupação das células produtivas."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Ordens abertas" value="18" delta="3 atrasadas" tone="atencao" />
        <Metric label="Peças produzidas hoje" value="412" delta="Meta 450" tone="atencao" />
        <Metric label="Refugo" value="1,8%" delta="Meta ≤ 2%" tone="ok" />
        <Metric label="Paradas não planejadas" value="42 min" delta="Robô de solda RS-01" tone="critico" />
      </div>

      <Panel titulo="Ordens de produção">
        <Table colunas={["Ordem", "Produto", "Qtd", "Avanço", "Célula", "Início", "Fim", "Status"]}>
          {ordens.map((o) => (
            <Row key={o.id}>
              <Cell mono>{o.id}</Cell>
              <Cell>{o.produto}</Cell>
              <Cell mono>{o.qtd}</Cell>
              <Cell className="w-40">
                <div className="space-y-1">
                  <span className="font-mono text-xs tabular-nums text-muted-foreground">
                    {Math.round((o.feito / o.qtd) * 100)}%
                  </span>
                  <Bar value={Math.round((o.feito / o.qtd) * 100)} />
                </div>
              </Cell>
              <Cell>{o.centro}</Cell>
              <Cell mono>{o.inicio}</Cell>
              <Cell mono>{o.fim}</Cell>
              <Cell>
                <StatusBadge status={o.status} />
              </Cell>
            </Row>
          ))}
        </Table>
      </Panel>

      <Panel titulo="Capacidade por célula">
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
          {centrosTrabalho.map((c) => (
            <div key={c.nome} className="border border-border p-3">
              <p className="text-sm">{c.nome}</p>
              <p className="mt-1 font-display text-2xl tabular-nums text-foreground">{c.carga}%</p>
              <div className="mt-2">
                <Bar value={c.carga} />
              </div>
              <p className="mt-2 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                {c.carga >= 90 ? "Gargalo" : c.carga >= 75 ? "Alta carga" : "Folga"}
              </p>
            </div>
          ))}
        </div>
      </Panel>
    </AppShell>
  );
}
