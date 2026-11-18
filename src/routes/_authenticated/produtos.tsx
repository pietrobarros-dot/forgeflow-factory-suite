import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/erp/app-shell";
import { brl, Cell, Metric, PageHeader, Panel, Row, Table } from "@/components/erp/ui";
import { estruturaProduto } from "@/lib/erp-data";
import { useProdutos } from "@/lib/produtos-store";

export const Route = createFileRoute("/_authenticated/produtos")({
  head: () => ({
    meta: [
      { title: "Produtos e estrutura (BOM) | ForjaERP" },
      {
        name: "description",
        content:
          "Cadastro de produtos acabados, semiacabados e matérias-primas com custo, unidade e estrutura de materiais.",
      },
      { property: "og:title", content: "Produtos e estrutura (BOM)" },
      {
        property: "og:description",
        content: "Cadastro de itens, custos e a lista de materiais de cada produto.",
      },
    ],
  }),
  component: ProdutosPage,
});

function ProdutosPage() {
  const produtos = useProdutos();
  const custoBom = estruturaProduto.itens.reduce((s, i) => {
    const item = produtos.find((p) => p.sku === i.sku);
    return s + (item ? item.custo * i.qtd : 0);
  }, 0);

  return (
    <AppShell>
      <PageHeader
        titulo="Produtos e estrutura"
        descricao="Cadastro de itens com unidade, custo padrão e a lista de materiais usada pelo MRP."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Itens cadastrados" value={String(produtos.length)} delta="3 famílias" tone="ok" />
        <Metric label="Produtos acabados" value="2" delta="Linha industrial" tone="ok" />
        <Metric label="Custo da estrutura PA-1001" value={brl(custoBom)} delta="Sem mão de obra" tone="atencao" />
        <Metric label="Níveis de estrutura" value="2" delta="Acabado → semiacabado" tone="ok" />
      </div>

      <Panel titulo="Cadastro de itens">
        <Table colunas={["SKU", "Descrição", "Tipo", "Unidade", "Saldo", "Custo padrão"]}>
          {produtos.map((p) => (
            <Row key={p.sku}>
              <Cell mono>{p.sku}</Cell>
              <Cell>{p.nome}</Cell>
              <Cell>{p.tipo}</Cell>
              <Cell mono>{p.un}</Cell>
              <Cell mono>{p.estoque}</Cell>
              <Cell mono>{brl(p.custo)}</Cell>
            </Row>
          ))}
        </Table>
      </Panel>

      <Panel titulo={`Lista de materiais · ${estruturaProduto.sku} ${estruturaProduto.nome}`}>
        <Table colunas={["Componente", "Qtd", "Unidade", "Custo do componente"]}>
          {estruturaProduto.itens.map((i) => {
            const item = produtos.find((p) => p.sku === i.sku);
            return (
              <Row key={i.sku}>
                <Cell>
                  <span className="font-mono text-xs text-muted-foreground">{i.sku}</span>
                  <span className="ml-2">{i.nome}</span>
                </Cell>
                <Cell mono>{i.qtd}</Cell>
                <Cell mono>{i.un}</Cell>
                <Cell mono>{item ? brl(item.custo * i.qtd) : "—"}</Cell>
              </Row>
            );
          })}
        </Table>
      </Panel>
    </AppShell>
  );
}
