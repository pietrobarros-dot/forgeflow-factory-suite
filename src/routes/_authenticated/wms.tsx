import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/erp/app-shell";
import { Bar, Cell, Metric, PageHeader, Panel, Row, Table } from "@/components/erp/ui";
import { movimentos } from "@/lib/erp-data";
import { useProdutos } from "@/lib/produtos-store";
import { COLUNAS, NIVEIS, RUAS, corOcupacao, montarArmazem } from "@/lib/armazem";

const Armazem3D = lazy(() => import("@/components/erp/armazem-3d"));

export const Route = createFileRoute("/_authenticated/wms")({
  head: () => ({
    meta: [
      { title: "WMS — Gestão de armazém | ForjaERP" },
      { name: "description", content: "Mapa 2D e 3D do armazém, endereçamento, ocupação, movimentações e saldo de estoque." },
      { property: "og:title", content: "WMS — Gestão de armazém" },
      { property: "og:description", content: "Estoque em 2D e 3D, endereços, ocupação e movimentações do armazém." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: WmsPage,
});

function WmsPage() {
  const produtos = useProdutos();
  const posicoes = useMemo(() => montarArmazem(produtos), [produtos]);
  const [modo, setModo] = useState<"2d" | "3d">("2d");
  const [sel, setSel] = useState<string>();
  const [busca, setBusca] = useState("");
  const [montado, setMontado] = useState(false);
  useEffect(() => setMontado(true), []);

  const atual = posicoes.find((p) => p.id === sel);
  const ocupadas = posicoes.filter((p) => p.ocupacao > 0);
  const media = Math.round(posicoes.reduce((s, p) => s + p.ocupacao, 0) / posicoes.length);
  const destaque = busca.trim().toLowerCase();
  const casa = (p: (typeof posicoes)[number]) =>
    !!destaque && !!p.sku && (p.sku.toLowerCase().includes(destaque) || p.nome!.toLowerCase().includes(destaque));

  return (
    <AppShell>
      <PageHeader titulo="WMS · Armazém" descricao="Mapa do armazém em 2D e 3D, endereçamento, movimentações e saldo de estoque." />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Ocupação média" value={`${media}%`} delta={`${posicoes.length} posições`} tone={media > 80 ? "critico" : "atencao"} />
        <Metric label="Posições ocupadas" value={String(ocupadas.length)} delta={`${posicoes.length - ocupadas.length} livres`} tone="ok" />
        <Metric label="Posições cheias (≥90%)" value={String(posicoes.filter((p) => p.ocupacao >= 90).length)} delta="Avaliar remanejamento" tone="atencao" />
        <Metric label="Itens abaixo do mínimo" value={String(produtos.filter((p) => p.estoque < p.minimo).length)} delta="Reposição" tone="critico" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_300px]">
        <Panel
          titulo={`Mapa do armazém · ${modo.toUpperCase()}`}
          extra={
            <div className="flex items-center gap-2">
              <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Localizar SKU ou item"
                className="h-8 w-48 border border-border bg-background px-2 text-xs text-foreground" />
              {(["2d", "3d"] as const).map((m) => (
                <button key={m} onClick={() => setModo(m)}
                  className={`h-8 border px-3 font-mono text-xs uppercase ${modo === m ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground"}`}>
                  {m}
                </button>
              ))}
            </div>
          }
        >
          {modo === "2d" ? (
            <div className="space-y-5">
              {RUAS.map((rua) => (
                <div key={rua}>
                  <p className="mb-1 font-mono text-xs text-primary">RUA {rua}</p>
                  <div className="grid gap-1" style={{ gridTemplateColumns: `40px repeat(${COLUNAS}, 1fr)` }}>
                    {Array.from({ length: NIVEIS }, (_, k) => NIVEIS - k).map((n) => (
                      <div key={n} className="contents">
                        <span className="self-center font-mono text-[10px] text-muted-foreground">N{n}</span>
                        {Array.from({ length: COLUNAS }, (_, c) => {
                          const p = posicoes.find((x) => x.rua === rua && x.nivel === n && x.coluna === c + 1)!;
                          return (
                            <button key={p.id} onClick={() => setSel(p.id)} title={`${p.id} ${p.nome ?? "livre"}`}
                              className={`h-11 border px-1 text-left font-mono text-[10px] leading-tight ${sel === p.id ? "border-foreground" : casa(p) ? "border-primary ring-2 ring-primary" : "border-border"}`}
                              style={{ background: `color-mix(in oklab, ${corOcupacao(p.ocupacao)} ${p.ocupacao ? 35 : 100}%, transparent)` }}>
                              <span className="block text-foreground">{p.id}</span>
                              <span className="block text-muted-foreground">{p.sku ?? "livre"}</span>
                            </button>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : montado ? (
            <Suspense fallback={<p className="text-sm text-muted-foreground">Carregando 3D…</p>}>
              <Armazem3D posicoes={posicoes} selecionada={sel} onSelect={setSel} />
              <p className="mt-2 text-xs text-muted-foreground">Arraste para girar, role para aproximar, clique numa caixa para ver a posição.</p>
            </Suspense>
          ) : null}
          <div className="mt-4 flex gap-4 font-mono text-[11px] text-muted-foreground">
            {[["#22c55e", "< 70%"], ["#f59e0b", "70–89%"], ["#ef4444", "≥ 90%"], ["#2a2f3a", "Livre"]].map(([c, l]) => (
              <span key={l} className="flex items-center gap-1"><span className="size-3" style={{ background: c }} />{l}</span>
            ))}
          </div>
        </Panel>

        <Panel titulo="Posição selecionada">
          {atual ? (
            <dl className="space-y-3 text-sm">
              <div><dt className="text-xs text-muted-foreground">Endereço</dt><dd className="font-mono text-lg text-primary">{atual.id}</dd></div>
              <div><dt className="text-xs text-muted-foreground">Rua / coluna / nível</dt><dd className="font-mono">{atual.rua} / {atual.coluna} / {atual.nivel}</dd></div>
              <div><dt className="text-xs text-muted-foreground">Item</dt><dd>{atual.sku ? `${atual.sku} · ${atual.nome}` : "Posição livre"}</dd></div>
              <div><dt className="text-xs text-muted-foreground">Quantidade</dt><dd className="font-mono">{atual.qtd}</dd></div>
              <div><dt className="text-xs text-muted-foreground">Ocupação {atual.ocupacao}%</dt><dd><Bar value={atual.ocupacao} /></dd></div>
            </dl>
          ) : (
            <p className="text-sm text-muted-foreground">Clique numa posição do mapa 2D ou 3D.</p>
          )}
        </Panel>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Panel titulo="Movimentações do turno">
          <Table colunas={["Documento", "Tipo", "Item", "Qtd", "Hora", "Operador"]}>
            {movimentos.map((m) => (
              <Row key={m.doc}>
                <Cell mono>{m.doc}</Cell><Cell>{m.tipo}</Cell><Cell>{m.item}</Cell>
                <Cell mono>{m.qtd}</Cell><Cell mono>{m.hora}</Cell><Cell>{m.operador}</Cell>
              </Row>
            ))}
          </Table>
        </Panel>
        <Panel titulo="Posição de estoque">
          <Table colunas={["SKU", "Item", "Un", "Saldo", "Mínimo", "Situação"]}>
            {produtos.map((p) => (
              <Row key={p.sku}>
                <Cell mono>{p.sku}</Cell><Cell>{p.nome}</Cell><Cell mono>{p.un}</Cell>
                <Cell mono>{p.estoque}</Cell><Cell mono>{p.minimo}</Cell>
                <Cell className={p.estoque < p.minimo ? "text-destructive" : "text-muted-foreground"}>
                  {p.estoque < p.minimo ? "Abaixo do mínimo" : "Normal"}
                </Cell>
              </Row>
            ))}
          </Table>
        </Panel>
      </div>
    </AppShell>
  );
}
