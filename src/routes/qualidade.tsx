import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/erp/app-shell";
import { Cell, Metric, PageHeader, Panel, Row, StatusBadge, Table } from "@/components/erp/ui";
import { manutencao, qualidade } from "@/lib/erp-data";

export const Route = createFileRoute("/qualidade")({
  head: () => ({
    meta: [
      { title: "Qualidade e manutenção de ativos | ForjaERP" },
      {
        name: "description",
        content:
          "Inspeções por lote, índices de aprovação, refugo e plano de manutenção preventiva dos equipamentos.",
      },
      { property: "og:title", content: "Qualidade e manutenção de ativos" },
      {
        property: "og:description",
        content: "Inspeções de lote, refugo e manutenção preventiva e corretiva da planta.",
      },
    ],
  }),
  component: QualidadePage,
});

function QualidadePage() {
  return (
    <AppShell>
      <PageHeader
        titulo="Qualidade e manutenção"
        descricao="Inspeções por lote, índices de conformidade e plano de manutenção dos equipamentos."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Índice de conformidade" value="95,9%" delta="Meta 97%" tone="atencao" />
        <Metric label="Lotes inspecionados" value="34" delta="Semana 38" tone="ok" />
        <Metric label="Não conformidades abertas" value="3" delta="1 crítica" tone="critico" />
        <Metric label="Disponibilidade de ativos" value="91,2%" delta="Robô RS-01 parado" tone="atencao" />
      </div>

      <Panel titulo="Inspeções de lote">
        <Table colunas={["Lote", "Produto", "Tipo de inspeção", "Resultado", "Índice"]}>
          {qualidade.map((q) => (
            <Row key={q.lote}>
              <Cell mono>{q.lote}</Cell>
              <Cell>{q.produto}</Cell>
              <Cell>{q.inspecao}</Cell>
              <Cell>
                <StatusBadge status={q.tone} label={q.resultado} />
              </Cell>
              <Cell mono>{q.indice}</Cell>
            </Row>
          ))}
        </Table>
      </Panel>

      <Panel titulo="Plano de manutenção">
        <Table colunas={["Ativo", "Tipo", "Próxima intervenção", "Horas de uso", "Situação"]}>
          {manutencao.map((m) => (
            <Row key={m.ativo}>
              <Cell>{m.ativo}</Cell>
              <Cell>{m.tipo}</Cell>
              <Cell mono>{m.proxima}</Cell>
              <Cell mono>{m.horas}</Cell>
              <Cell>
                <StatusBadge status={m.tone} />
              </Cell>
            </Row>
          ))}
        </Table>
      </Panel>
    </AppShell>
  );
}
