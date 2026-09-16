import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/erp/app-shell";
import { Bar, Cell, Metric, PageHeader, Panel, Row, Table } from "@/components/erp/ui";
import { enderecos, movimentos, produtos } from "@/lib/erp-data";

export const Route = createFileRoute("/wms")({
  head: () => ({
    meta: [
      { title: "WMS — Gestão de armazém | ForjaERP" },
      {
        name: "description",
        content:
          "Endereçamento, ocupação de ruas, movimentações de entrada e saída e posição de estoque por item.",
      },
      { property: "og:title", content: "WMS — Gestão de armazém" },
      {
        property: "og:description",
        content: "Endereços, ocupação, movimentações e saldo de estoque do armazém.",
      },
    ],
  }),
  component: WmsPage,
});

function WmsPage() {
  return (
    <AppShell>
      <PageHeader
        titulo="WMS · Armazém"
        descricao="Endereçamento, movimentações do turno e saldo de estoque com pontos de reposição."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Ocupação total" value="83%" delta="1.240 posições" tone="atencao" />
        <Metric label="Movimentos do turno" value="128" delta="24 separações" tone="ok" />
        <Metric label="Acuracidade de inventário" value="98,7%" delta="Última contagem 12/09" tone="ok" />
        <Metric label="Itens abaixo do mínimo" value="2" delta="Reposição urgente" tone="critico" />
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Panel titulo="Endereços e ocupação">
          <Table colunas={["Rua", "Posição", "Item", "Qtd", "Ocupação"]}>
            {enderecos.map((e) => (
              <Row key={`${e.rua}-${e.posicao}`}>
                <Cell mono>{e.rua}</Cell>
                <Cell mono>{e.posicao}</Cell>
                <Cell>{e.item}</Cell>
                <Cell mono>{e.qtd}</Cell>
                <Cell className="w-32">
                  <Bar value={e.ocupacao} />
                </Cell>
              </Row>
            ))}
          </Table>
        </Panel>

        <Panel titulo="Movimentações do turno">
          <Table colunas={["Documento", "Tipo", "Item", "Qtd", "Hora", "Operador"]}>
            {movimentos.map((m) => (
              <Row key={m.doc}>
                <Cell mono>{m.doc}</Cell>
                <Cell>{m.tipo}</Cell>
                <Cell>{m.item}</Cell>
                <Cell mono>{m.qtd}</Cell>
                <Cell mono>{m.hora}</Cell>
                <Cell>{m.operador}</Cell>
              </Row>
            ))}
          </Table>
        </Panel>
      </div>

      <Panel titulo="Posição de estoque">
        <Table colunas={["SKU", "Item", "Unidade", "Saldo", "Mínimo", "Situação"]}>
          {produtos.map((p) => (
            <Row key={p.sku}>
              <Cell mono>{p.sku}</Cell>
              <Cell>{p.nome}</Cell>
              <Cell mono>{p.un}</Cell>
              <Cell mono>{p.estoque}</Cell>
              <Cell mono>{p.minimo}</Cell>
              <Cell
                className={
                  p.estoque < p.minimo ? "text-destructive" : "text-muted-foreground"
                }
              >
                {p.estoque < p.minimo ? "Abaixo do mínimo" : "Normal"}
              </Cell>
            </Row>
          ))}
        </Table>
      </Panel>
    </AppShell>
  );
}
