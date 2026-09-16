import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/erp/app-shell";
import { Bar, Cell, Metric, PageHeader, Panel, Row, StatusBadge, Table } from "@/components/erp/ui";
import { cargas, centrosTrabalho, kpis, necessidades, ordens } from "@/lib/erp-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Painel de operação — ForjaERP" },
      {
        name: "description",
        content:
          "Visão geral da produção: ordens abertas, carga das células, necessidades de material e cargas em rota.",
      },
      { property: "og:title", content: "Painel de operação — ForjaERP" },
      {
        property: "og:description",
        content: "Indicadores de produção, estoque, compras e transporte em uma só tela.",
      },
    ],
  }),
  component: Painel,
});

function Painel() {
  return (
    <AppShell>
      <PageHeader
        titulo="Painel de operação"
        descricao="Situação da planta em tempo real — produção, materiais, armazém e expedição."
        acao={
          <div className="text-right">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Atualizado
            </p>
            <p className="font-mono text-sm tabular-nums text-primary">16/09 · 14:22</p>
          </div>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {kpis.map((k) => (
          <Metric key={k.label} {...k} />
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <Panel
          titulo="Ordens de produção"
          className="xl:col-span-2"
          extra={
            <Link to="/producao" className="font-mono text-[11px] uppercase text-primary">
              Ver tudo
            </Link>
          }
        >
          <Table colunas={["Ordem", "Produto", "Avanço", "Célula", "Status"]}>
            {ordens.slice(0, 4).map((o) => (
              <Row key={o.id}>
                <Cell mono>{o.id}</Cell>
                <Cell>{o.produto}</Cell>
                <Cell className="w-40">
                  <div className="space-y-1">
                    <span className="font-mono text-xs tabular-nums text-muted-foreground">
                      {o.feito}/{o.qtd}
                    </span>
                    <Bar value={Math.round((o.feito / o.qtd) * 100)} />
                  </div>
                </Cell>
                <Cell>{o.centro}</Cell>
                <Cell>
                  <StatusBadge status={o.status} />
                </Cell>
              </Row>
            ))}
          </Table>
        </Panel>

        <Panel titulo="Carga das células">
          <ul className="space-y-4">
            {centrosTrabalho.map((c) => (
              <li key={c.nome}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span>{c.nome}</span>
                  <span className="font-mono tabular-nums text-muted-foreground">{c.carga}%</span>
                </div>
                <Bar value={c.carga} />
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Panel
          titulo="Necessidade de material (MRP)"
          extra={
            <Link to="/mrp" className="font-mono text-[11px] uppercase text-primary">
              Abrir MRP
            </Link>
          }
        >
          <Table colunas={["Item", "Falta", "Data", "Ação"]}>
            {necessidades
              .filter((n) => n.liquida > 0)
              .map((n) => (
                <Row key={n.sku}>
                  <Cell>{n.nome}</Cell>
                  <Cell mono>{n.liquida}</Cell>
                  <Cell mono>{n.data}</Cell>
                  <Cell>
                    <StatusBadge status={n.tone} label={n.acao} />
                  </Cell>
                </Row>
              ))}
          </Table>
        </Panel>

        <Panel
          titulo="Cargas em rota (TMS)"
          extra={
            <Link to="/tms" className="font-mono text-[11px] uppercase text-primary">
              Abrir TMS
            </Link>
          }
        >
          <Table colunas={["Carga", "Rota", "Ocupação", "Chegada"]}>
            {cargas.map((c) => (
              <Row key={c.id}>
                <Cell mono>{c.id}</Cell>
                <Cell>{c.rota}</Cell>
                <Cell mono>{c.ocupacao}%</Cell>
                <Cell mono>{c.eta}</Cell>
              </Row>
            ))}
          </Table>
        </Panel>
      </div>
    </AppShell>
  );
}
