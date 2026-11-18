import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/erp/app-shell";
import { brl, Cell, Metric, PageHeader, Panel, Row, StatusBadge, Table } from "@/components/erp/ui";
import { compras, necessidades } from "@/lib/erp-data";

export const Route = createFileRoute("/_authenticated/compras")({
  head: () => ({
    meta: [
      { title: "Compras e suprimentos | ForjaERP" },
      {
        name: "description",
        content:
          "Pedidos de compra, prazos de entrega de fornecedores e sugestões geradas pelo cálculo de MRP.",
      },
      { property: "og:title", content: "Compras e suprimentos" },
      {
        property: "og:description",
        content: "Pedidos em aberto, fornecedores e sugestões de reposição de materiais.",
      },
    ],
  }),
  component: ComprasPage,
});

function ComprasPage() {
  const total = compras.reduce((s, c) => s + c.valor, 0);

  return (
    <AppShell>
      <PageHeader
        titulo="Compras · Suprimentos"
        descricao="Pedidos em aberto, recebimentos previstos e sugestões de reposição vindas do MRP."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Pedidos em aberto" value="14" delta="3 atrasados" tone="atencao" />
        <Metric label="Valor em carteira" value={brl(total)} delta="Semana 38" tone="ok" />
        <Metric label="Prazo médio de entrega" value="9 dias" delta="Meta 7 dias" tone="atencao" />
        <Metric label="Fornecedores ativos" value="27" delta="2 em homologação" tone="ok" />
      </div>

      <Panel titulo="Pedidos de compra">
        <Table colunas={["Pedido", "Fornecedor", "Item", "Qtd", "Valor", "Entrega", "Status"]}>
          {compras.map((c) => (
            <Row key={c.pedido}>
              <Cell mono>{c.pedido}</Cell>
              <Cell>{c.fornecedor}</Cell>
              <Cell>{c.item}</Cell>
              <Cell mono>{c.qtd}</Cell>
              <Cell mono>{brl(c.valor)}</Cell>
              <Cell mono>{c.entrega}</Cell>
              <Cell>
                <StatusBadge status={c.status} />
              </Cell>
            </Row>
          ))}
        </Table>
      </Panel>

      <Panel titulo="Sugestões de reposição (origem MRP)">
        <Table colunas={["Item", "Quantidade a comprar", "Data limite"]}>
          {necessidades
            .filter((n) => n.acao === "Comprar")
            .map((n) => (
              <Row key={n.sku}>
                <Cell>
                  <span className="font-mono text-xs text-muted-foreground">{n.sku}</span>
                  <span className="ml-2">{n.nome}</span>
                </Cell>
                <Cell mono>{n.liquida}</Cell>
                <Cell mono>{n.data}</Cell>
              </Row>
            ))}
        </Table>
      </Panel>
    </AppShell>
  );
}
