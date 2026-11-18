import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/erp/app-shell";
import { brl, Cell, Metric, PageHeader, Panel, Row, StatusBadge, Table } from "@/components/erp/ui";
import { pedidos } from "@/lib/erp-data";

export const Route = createFileRoute("/_authenticated/vendas")({
  head: () => ({
    meta: [
      { title: "Vendas e carteira de pedidos | ForjaERP" },
      {
        name: "description",
        content:
          "Carteira de pedidos de venda, prazos de entrega prometidos e vínculo com as ordens de produção.",
      },
      { property: "og:title", content: "Vendas e carteira de pedidos" },
      {
        property: "og:description",
        content: "Pedidos de clientes, valores e datas de entrega prometidas.",
      },
    ],
  }),
  component: VendasPage,
});

function VendasPage() {
  const total = pedidos.reduce((s, p) => s + p.valor, 0);

  return (
    <AppShell>
      <PageHeader
        titulo="Vendas · Carteira de pedidos"
        descricao="Pedidos de clientes que alimentam a demanda do planejamento de produção."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Carteira ativa" value={brl(total)} delta="4 pedidos" tone="ok" />
        <Metric label="Pedidos do mês" value="38" delta="+9 vs. agosto" tone="ok" />
        <Metric label="Prazo médio prometido" value="12 dias" delta="Produção + entrega" tone="atencao" />
        <Metric label="Pedidos em risco" value="1" delta="Falta de MDF" tone="critico" />
      </div>

      <Panel titulo="Pedidos de venda">
        <Table colunas={["Pedido", "Cliente", "Itens", "Valor", "Entrega", "Status"]}>
          {pedidos.map((p) => (
            <Row key={p.pedido}>
              <Cell mono>{p.pedido}</Cell>
              <Cell>{p.cliente}</Cell>
              <Cell>{p.itens}</Cell>
              <Cell mono>{brl(p.valor)}</Cell>
              <Cell mono>{p.entrega}</Cell>
              <Cell>
                <StatusBadge status={p.status} />
              </Cell>
            </Row>
          ))}
        </Table>
      </Panel>
    </AppShell>
  );
}
