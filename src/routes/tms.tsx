import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/erp/app-shell";
import { Bar, Cell, Metric, PageHeader, Panel, Row, StatusBadge, Table } from "@/components/erp/ui";
import { cargas, fretes } from "@/lib/erp-data";

export const Route = createFileRoute("/tms")({
  head: () => ({
    meta: [
      { title: "TMS — Transporte e expedição | ForjaERP" },
      {
        name: "description",
        content:
          "Montagem de cargas, roteirização, ocupação de veículos, prazos de entrega e custo por transportadora.",
      },
      { property: "og:title", content: "TMS — Transporte e expedição" },
      {
        property: "og:description",
        content: "Cargas em rota, ocupação dos veículos e desempenho das transportadoras.",
      },
    ],
  }),
  component: TmsPage,
});

function TmsPage() {
  return (
    <AppShell>
      <PageHeader
        titulo="TMS · Transporte"
        descricao="Cargas montadas, rotas do dia, ocupação dos veículos e custo de frete por transportadora."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Cargas em rota" value="9" delta="2 com atraso" tone="atencao" />
        <Metric label="Ocupação média" value="72%" delta="Meta 85%" tone="atencao" />
        <Metric label="Entregas no prazo" value="94%" delta="Últimos 30 dias" tone="ok" />
        <Metric label="Custo médio por km" value="R$ 2,78" delta="-4,1% vs. mês" tone="ok" />
      </div>

      <Panel titulo="Cargas e rotas">
        <Table
          colunas={["Carga", "Veículo", "Motorista", "Rota", "Paradas", "Ocupação", "Chegada", "Status"]}
        >
          {cargas.map((c) => (
            <Row key={c.id}>
              <Cell mono>{c.id}</Cell>
              <Cell>{c.veiculo}</Cell>
              <Cell>{c.motorista}</Cell>
              <Cell>{c.rota}</Cell>
              <Cell mono>{c.paradas}</Cell>
              <Cell className="w-32">
                <div className="space-y-1">
                  <span className="font-mono text-xs tabular-nums text-muted-foreground">
                    {c.ocupacao}%
                  </span>
                  <Bar value={c.ocupacao} />
                </div>
              </Cell>
              <Cell mono>{c.eta}</Cell>
              <Cell>
                <StatusBadge status={c.status} />
              </Cell>
            </Row>
          ))}
        </Table>
      </Panel>

      <Panel titulo="Desempenho por transportadora">
        <Table colunas={["Transportadora", "Entregas no mês", "No prazo", "Custo por km"]}>
          {fretes.map((f) => (
            <Row key={f.transportadora}>
              <Cell>{f.transportadora}</Cell>
              <Cell mono>{f.entregas}</Cell>
              <Cell mono>{f.prazo}</Cell>
              <Cell mono>{f.custoKm}</Cell>
            </Row>
          ))}
        </Table>
      </Panel>
    </AppShell>
  );
}
