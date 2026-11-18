import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/erp/app-shell";
import { BarcodeEan13 } from "@/components/erp/barcode-svg";
import { Cell, Metric, PageHeader, Panel, Row, StatusBadge, Table } from "@/components/erp/ui";
import { ean13Valido, gerarEan13, gerarSku, montarEan13 } from "@/lib/barcode";
import { enderecos, produtos } from "@/lib/erp-data";

export const Route = createFileRoute("/_authenticated/etiquetas")({
  head: () => ({
    meta: [
      { title: "Etiquetas de estoque — SKU e EAN-13 | ForjaERP" },
      {
        name: "description",
        content:
          "Geração de etiquetas de estoque com SKU manual ou automático, código de barras EAN-13 comercial, descrição e foto do item cadastrado.",
      },
      { property: "og:title", content: "Etiquetas de estoque — SKU e EAN-13" },
      {
        property: "og:description",
        content: "Crie e imprima etiquetas com SKU, código de barras EAN-13, descrição e foto do produto.",
      },
    ],
  }),
  component: EtiquetasPage,
});

type Emitida = {
  id: string;
  sku: string;
  nome: string;
  ean: string;
  lote: string;
  endereco: string;
  copias: number;
  hora: string;
};

const campo =
  "w-full border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary";
const rotulo = "font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground";
const botao =
  "border border-border px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-colors hover:bg-muted";

function EtiquetasPage() {
  const [skuBase, setSkuBase] = useState(produtos[0]!.sku);
  const [novoItem, setNovoItem] = useState(false);

  const [skuAuto, setSkuAuto] = useState(true);
  const [skuManual, setSkuManual] = useState("");
  const [tipo, setTipo] = useState("Acabado");
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");

  const [eanAuto, setEanAuto] = useState(true);
  const [eanManual, setEanManual] = useState("");

  const [lote, setLote] = useState("LT-8830");
  const [endereco, setEndereco] = useState(enderecos[0]!.rua + " · " + enderecos[0]!.posicao);
  const [copias, setCopias] = useState(4);
  const [emitidas, setEmitidas] = useState<Emitida[]>([]);

  const cadastrado = produtos.find((p) => p.sku === skuBase)!;

  const sku = useMemo(() => {
    if (novoItem) {
      return skuAuto ? gerarSku(tipo, Date.now()) : skuManual.toUpperCase() || "—";
    }
    return skuAuto ? cadastrado.sku : skuManual.toUpperCase() || cadastrado.sku;
  }, [novoItem, skuAuto, skuManual, tipo, cadastrado]);

  const ean = useMemo(() => {
    if (eanAuto) {
      return novoItem
        ? gerarEan13({ sequencial: sku.split("-")[1] ? Number(sku.split("-")[1]) : 1 })
        : cadastrado.ean;
    }
    return montarEan13(eanManual);
  }, [eanAuto, eanManual, novoItem, sku, cadastrado]);

  const nomeFinal = novoItem ? nome || "Item sem descrição" : cadastrado.nome;
  const descricaoFinal = novoItem ? descricao || "—" : cadastrado.descricao;
  const unFinal = novoItem ? "UN" : cadastrado.un;
  const fotoFinal = novoItem ? undefined : cadastrado.foto;

  function emitir() {
    setEmitidas((atual) => [
      {
        id: `ETQ-${String(9000 + atual.length + 1)}`,
        sku,
        nome: nomeFinal,
        ean,
        lote,
        endereco,
        copias,
        hora: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      },
      ...atual,
    ]);
  }

  return (
    <AppShell>
      <PageHeader
        titulo="Etiquetas de estoque"
        descricao="Gere SKU manual ou automático, código de barras EAN-13 comercial e imprima a etiqueta com descrição e foto do item."
        acao={
          <button type="button" onClick={() => window.print()} className={`${botao} border-primary text-primary`}>
            Imprimir etiqueta
          </button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Itens com EAN" value={String(produtos.length)} delta="Prefixo GS1 789" tone="ok" />
        <Metric label="Etiquetas nesta sessão" value={String(emitidas.reduce((s, e) => s + e.copias, 0))} delta={`${emitidas.length} emissões`} tone="ok" />
        <Metric label="Padrão do código" value="EAN-13" delta="Dígito verificador automático" tone="ok" />
        <Metric label="Formato de impressão" value="100 x 60 mm" delta="Etiqueta térmica" tone="atencao" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_420px]">
        <Panel titulo="Dados da etiqueta">
          <div className="space-y-5">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setNovoItem(false)}
                className={`${botao} ${!novoItem ? "border-primary text-primary" : "text-muted-foreground"}`}
              >
                Item cadastrado
              </button>
              <button
                type="button"
                onClick={() => setNovoItem(true)}
                className={`${botao} ${novoItem ? "border-primary text-primary" : "text-muted-foreground"}`}
              >
                Novo item
              </button>
            </div>

            {!novoItem ? (
              <div>
                <label className={rotulo} htmlFor="item">
                  Item do cadastro
                </label>
                <select
                  id="item"
                  className={`${campo} mt-1.5`}
                  value={skuBase}
                  onChange={(e) => setSkuBase(e.target.value)}
                >
                  {produtos.map((p) => (
                    <option key={p.sku} value={p.sku}>
                      {p.sku} · {p.nome}
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-xs text-muted-foreground">
                  Descrição, unidade, foto e EAN vêm do cadastro do item.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={rotulo} htmlFor="tipo">
                    Tipo do item
                  </label>
                  <select
                    id="tipo"
                    className={`${campo} mt-1.5`}
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value)}
                  >
                    <option>Acabado</option>
                    <option>Semiacabado</option>
                    <option>Matéria-prima</option>
                  </select>
                </div>
                <div>
                  <label className={rotulo} htmlFor="nome">
                    Nome do item
                  </label>
                  <input
                    id="nome"
                    className={`${campo} mt-1.5`}
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Ex: Mesa industrial 2,00m"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={rotulo} htmlFor="descricao">
                    Descrição comercial
                  </label>
                  <textarea
                    id="descricao"
                    rows={3}
                    className={`${campo} mt-1.5`}
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    placeholder="Medidas, material, acabamento..."
                  />
                </div>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <div className="flex items-center justify-between">
                  <span className={rotulo}>SKU</span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setSkuAuto(true)}
                      className={`${botao} px-2 py-1 ${skuAuto ? "border-primary text-primary" : "text-muted-foreground"}`}
                    >
                      Automático
                    </button>
                    <button
                      type="button"
                      onClick={() => setSkuAuto(false)}
                      className={`${botao} px-2 py-1 ${!skuAuto ? "border-primary text-primary" : "text-muted-foreground"}`}
                    >
                      Manual
                    </button>
                  </div>
                </div>
                <input
                  className={`${campo} mt-1.5 font-mono disabled:opacity-60`}
                  value={skuAuto ? sku : skuManual}
                  disabled={skuAuto}
                  onChange={(e) => setSkuManual(e.target.value)}
                  placeholder="PA-1005"
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <span className={rotulo}>EAN-13</span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setEanAuto(true)}
                      className={`${botao} px-2 py-1 ${eanAuto ? "border-primary text-primary" : "text-muted-foreground"}`}
                    >
                      Automático
                    </button>
                    <button
                      type="button"
                      onClick={() => setEanAuto(false)}
                      className={`${botao} px-2 py-1 ${!eanAuto ? "border-primary text-primary" : "text-muted-foreground"}`}
                    >
                      Manual
                    </button>
                  </div>
                </div>
                <input
                  className={`${campo} mt-1.5 font-mono disabled:opacity-60`}
                  value={eanAuto ? ean : eanManual}
                  disabled={eanAuto}
                  inputMode="numeric"
                  onChange={(e) => setEanManual(e.target.value.replace(/\D/g, "").slice(0, 13))}
                  placeholder="789450100012"
                />
                <p className="mt-1.5 text-xs text-muted-foreground">
                  {ean13Valido(ean)
                    ? `Dígito verificador ${ean.slice(-1)} conferido.`
                    : "Informe os 12 primeiros dígitos; o verificador é calculado."}
                </p>
              </div>

              <div>
                <label className={rotulo} htmlFor="lote">
                  Lote
                </label>
                <input
                  id="lote"
                  className={`${campo} mt-1.5 font-mono`}
                  value={lote}
                  onChange={(e) => setLote(e.target.value)}
                />
              </div>

              <div>
                <label className={rotulo} htmlFor="endereco">
                  Endereço no armazém
                </label>
                <select
                  id="endereco"
                  className={`${campo} mt-1.5`}
                  value={endereco}
                  onChange={(e) => setEndereco(e.target.value)}
                >
                  {enderecos.map((e) => (
                    <option key={`${e.rua}-${e.posicao}`}>{`${e.rua} · ${e.posicao}`}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={rotulo} htmlFor="copias">
                  Cópias
                </label>
                <input
                  id="copias"
                  type="number"
                  min={1}
                  max={50}
                  className={`${campo} mt-1.5 font-mono`}
                  value={copias}
                  onChange={(e) => setCopias(Math.max(1, Math.min(50, Number(e.target.value) || 1)))}
                />
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={emitir}
                  className="w-full bg-primary px-4 py-2.5 text-sm font-bold uppercase tracking-wider text-primary-foreground transition-opacity hover:opacity-90"
                >
                  Emitir etiquetas
                </button>
              </div>
            </div>
          </div>
        </Panel>

        <Panel titulo="Pré-visualização · 100 x 60 mm">
          <div className="etiqueta-print border-2 border-foreground bg-card p-4">
            <div className="flex items-start justify-between gap-3 border-b border-border pb-3">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  ForjaERP · Planta 01
                </p>
                <p className="font-display text-xl leading-tight text-foreground">{nomeFinal}</p>
              </div>
              {fotoFinal ? (
                <img
                  src={fotoFinal}
                  alt={`Foto do item ${nomeFinal}`}
                  loading="lazy"
                  width={816}
                  height={816}
                  className="size-20 shrink-0 border border-border object-cover"
                />
              ) : (
                <div className="flex size-20 shrink-0 items-center justify-center border border-dashed border-border font-mono text-[10px] uppercase text-muted-foreground">
                  sem foto
                </div>
              )}
            </div>

            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{descricaoFinal}</p>

            <div className="mt-3 grid grid-cols-3 gap-2 font-mono text-[11px]">
              <div>
                <p className="uppercase tracking-widest text-muted-foreground">SKU</p>
                <p className="text-foreground">{sku}</p>
              </div>
              <div>
                <p className="uppercase tracking-widest text-muted-foreground">Lote</p>
                <p className="text-foreground">{lote}</p>
              </div>
              <div>
                <p className="uppercase tracking-widest text-muted-foreground">Endereço</p>
                <p className="text-foreground">{endereco}</p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
              <BarcodeEan13 codigo={ean} altura={56} larguraBarra={2} />
              <div className="text-right font-mono text-[11px] text-muted-foreground">
                <p className="uppercase tracking-widest">Unidade</p>
                <p className="text-foreground">{unFinal}</p>
                <p className="mt-2 uppercase tracking-widest">Cópias</p>
                <p className="text-foreground">{copias}</p>
              </div>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <StatusBadge
              status={ean13Valido(ean) ? "ok" : "atencao"}
              label={ean13Valido(ean) ? "EAN válido" : "EAN incompleto"}
            />
            <button type="button" onClick={() => window.print()} className={botao}>
              Imprimir
            </button>
          </div>
        </Panel>
      </div>

      <Panel titulo="Etiquetas emitidas nesta sessão">
        {emitidas.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Nenhuma etiqueta emitida ainda. Preencha os dados e clique em “Emitir etiquetas”.
          </p>
        ) : (
          <Table colunas={["Emissão", "SKU", "Item", "EAN-13", "Lote", "Endereço", "Cópias", "Hora"]}>
            {emitidas.map((e) => (
              <Row key={e.id}>
                <Cell mono>{e.id}</Cell>
                <Cell mono>{e.sku}</Cell>
                <Cell>{e.nome}</Cell>
                <Cell mono>{e.ean}</Cell>
                <Cell mono>{e.lote}</Cell>
                <Cell mono>{e.endereco}</Cell>
                <Cell mono>{e.copias}</Cell>
                <Cell mono>{e.hora}</Cell>
              </Row>
            ))}
          </Table>
        )}
      </Panel>

      <Panel titulo="Códigos do cadastro">
        <Table colunas={["SKU", "Item", "Descrição", "EAN-13", "Foto"]}>
          {produtos.map((p) => (
            <Row key={p.sku}>
              <Cell mono>{p.sku}</Cell>
              <Cell>{p.nome}</Cell>
              <Cell className="max-w-sm text-xs text-muted-foreground">{p.descricao}</Cell>
              <Cell mono>{p.ean}</Cell>
              <Cell>
                {p.foto ? (
                  <img
                    src={p.foto}
                    alt={`Foto do item ${p.nome}`}
                    loading="lazy"
                    width={816}
                    height={816}
                    className="size-10 border border-border object-cover"
                  />
                ) : (
                  <span className="font-mono text-[11px] text-muted-foreground">—</span>
                )}
              </Cell>
            </Row>
          ))}
        </Table>
      </Panel>
    </AppShell>
  );
}
