import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/erp/app-shell";
import { Cell, Metric, PageHeader, Panel, Row, StatusBadge, Table } from "@/components/erp/ui";
import { estruturaProduto, necessidades, ordens } from "@/lib/erp-data";

export const Route = createFileRoute("/mrp")({
  head: () => ({
    meta: [
      { title: "MRP — Planejamento de materiais | ForjaERP" },
      {
        name: "description",
        content:
          "Cálculo de necessidades brutas e líquidas, explosão da estrutura do produto e sugestões de compra e produção.",
      },
      { property: "og:title", content: "MRP — Planejamento de materiais" },
      {
        property: "og:description",
        content: "Necessidades líquidas, prazos e sugestões automáticas de compra e produção.",
      },
    ],
  }),
  component: MrpPage,
});

function MrpPage() {
  const comprar = necessidades.filter((n) => n.acao === "Comprar").length;
  const produzir = necessidades.filter((n) => n.acao === "Produzir").length;

  return (
    <AppShell>
      <PageHeader
        titulo="MRP · Planejamento de materiais"
        descricao="Explosão da estrutura, cálculo de necessidade líquida e sugestões para o horizonte de 4 semanas."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Horizonte" value="28 dias" delta="Semana 38 a 41" tone="ok" />
        <Metric label="Sugestões de compra" value={String(comprar)} delta="Geradas hoje" tone="critico" />
        <Metric label="Sugestões de produção" value={String(produzir)} delta="Semiacabados" tone="atencao" />
        <Metric label="Cobertura média" value="11 dias" delta="Meta: 15 dias" tone="atencao" />
      </div>

      <Panel titulo="Necessidades calculadas">
        <Table
          colunas={["Item", "Necessidade bruta", "Estoque", "Necessidade líquida", "Data limite", "Sugestão"]}
        >
          {necessidades.map((n) => (
            <Row key={n.sku}>
              <Cell>
                <span className="font-mono text-xs text-muted-foreground">{n.sku}</span>
                <span className="ml-2">{n.nome}</span>
              </Cell>
              <Cell mono>{n.bruta}</Cell>
              <Cell mono>{n.estoque}</Cell>
              <Cell mono className={n.liquida > 0 ? "text-warning" : ""}>
                {n.liquida}
              </Cell>
              <Cell mono>{n.data}</Cell>
              <Cell>
                <StatusBadge status={n.tone} label={n.acao} />
              </Cell>
            </Row>
          ))}
        </Table>
      </Panel>

      <div className="grid gap-5 xl:grid-cols-2">
        <Panel titulo={`Estrutura · ${estruturaProduto.nome}`}>
          <Table colunas={["Componente", "Qtd por unidade", "Unidade"]}>
            {estruturaProduto.itens.map((i) => (
              <Row key={i.sku}>
                <Cell>
                  <span className="font-mono text-xs text-muted-foreground">{i.sku}</span>
                  <span className="ml-2">{i.nome}</span>
                </Cell>
                <Cell mono>{i.qtd}</Cell>
                <Cell mono>{i.un}</Cell>
              </Row>
            ))}
          </Table>
        </Panel>

        <Panel titulo="Demanda que originou o plano">
          <Table colunas={["Ordem", "Produto", "Qtd", "Início", "Fim"]}>
            {ordens.map((o) => (
              <Row key={o.id}>
                <Cell mono>{o.id}</Cell>
                <Cell>{o.produto}</Cell>
                <Cell mono>{o.qtd}</Cell>
                <Cell mono>{o.inicio}</Cell>
                <Cell mono>{o.fim}</Cell>
              </Row>
            ))}
          </Table>
        </Panel>
      </div>
    </AppShell>
  );
}
