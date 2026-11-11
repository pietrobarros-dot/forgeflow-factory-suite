import { useState } from "react";
import { gerarEan13, gerarSku, montarEan13 } from "@/lib/barcode";
import { adicionarProduto, ehCadastroManual, removerProduto, useProdutos } from "@/lib/produtos-store";
import { BarcodeEan13 } from "@/components/erp/barcode-svg";
import { Cell, Panel, Row, Table, brl } from "@/components/erp/ui";

const vazio = { sku: "", nome: "", descricao: "", tipo: "Matéria-prima", un: "UN", estoque: "", minimo: "", custo: "", preco: "", ean: "", foto: "" };

export function CadastroProduto() {
  const produtos = useProdutos();
  const [f, setF] = useState(vazio);
  const [skuAuto, setSkuAuto] = useState(true);
  const [eanAuto, setEanAuto] = useState(true);
  const [msg, setMsg] = useState("");
  const set = (k: keyof typeof vazio, v: string) => setF((x) => ({ ...x, [k]: v }));

  const seq = produtos.length + 1;
  const sku = skuAuto ? gerarSku(f.tipo, seq + 50) : f.sku.trim().toUpperCase();
  const ean = eanAuto ? gerarEan13({ sequencial: 5000 + seq }) : f.ean.replace(/\D/g, "").length >= 12 ? montarEan13(f.ean) : "";

  function salvar(e: React.FormEvent) {
    e.preventDefault();
    if (!sku || !f.nome.trim()) return setMsg("Informe SKU e nome do produto.");
    if (produtos.some((p) => p.sku === sku)) return setMsg(`O SKU ${sku} já existe.`);
    if (!ean) return setMsg("Código de barras precisa de 12 ou 13 dígitos.");
    if (produtos.some((p) => p.ean === ean)) return setMsg("Esse código de barras já está em uso.");
    adicionarProduto({
      sku, nome: f.nome.trim(), descricao: f.descricao.trim() || f.nome.trim(), tipo: f.tipo, un: f.un,
      estoque: Number(f.estoque) || 0, minimo: Number(f.minimo) || 0, custo: Number(f.custo) || 0,
      preco: Number(f.preco) || undefined, ean, foto: f.foto || undefined,
    });
    setMsg(`Produto ${sku} cadastrado.`);
    setF(vazio);
  }

  function lerFoto(file?: File) {
    if (!file) return;
    const r = new FileReader();
    r.onload = () => set("foto", String(r.result));
    r.readAsDataURL(file);
  }

  const campo = "h-9 w-full border border-border bg-background px-2 text-sm text-foreground";
  const rot = "mb-1 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground";
  const toggle = (on: boolean, fn: () => void, t: string) => (
    <button type="button" onClick={fn} className={`border px-2 py-0.5 font-mono text-[10px] uppercase ${on ? "border-primary text-primary" : "border-border text-muted-foreground"}`}>{t}</button>
  );

  return (
    <>
      <Panel titulo="Cadastrar novo produto">
        <form onSubmit={salvar} className="grid gap-5 lg:grid-cols-[1fr_260px]">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <label className="block">
              <span className={`${rot} flex justify-between`}>SKU {toggle(skuAuto, () => setSkuAuto(!skuAuto), skuAuto ? "Automático" : "Manual")}</span>
              <input className={campo} value={skuAuto ? sku : f.sku} disabled={skuAuto} onChange={(e) => set("sku", e.target.value)} placeholder="Ex.: MP-3100" />
            </label>
            <label className="block sm:col-span-2"><span className={rot}>Nome do produto</span><input className={campo} value={f.nome} onChange={(e) => set("nome", e.target.value)} /></label>
            <label className="block"><span className={rot}>Tipo</span>
              <select className={campo} value={f.tipo} onChange={(e) => set("tipo", e.target.value)}>
                {["Acabado", "Semiacabado", "Matéria-prima"].map((t) => <option key={t}>{t}</option>)}
              </select></label>
            <label className="block sm:col-span-2 xl:col-span-4"><span className={rot}>Descrição</span><input className={campo} value={f.descricao} onChange={(e) => set("descricao", e.target.value)} /></label>
            <label className="block sm:col-span-2">
              <span className={`${rot} flex justify-between`}>Código de barras EAN-13 {toggle(eanAuto, () => setEanAuto(!eanAuto), eanAuto ? "Automático" : "Manual")}</span>
              <input className={campo} value={eanAuto ? ean : f.ean} disabled={eanAuto} onChange={(e) => set("ean", e.target.value)} placeholder="12 dígitos (verificador calculado)" />
            </label>
            <label className="block"><span className={rot}>Unidade</span>
              <select className={campo} value={f.un} onChange={(e) => set("un", e.target.value)}>
                {["UN", "PC", "M", "KG", "L", "CH", "CX"].map((t) => <option key={t}>{t}</option>)}
              </select></label>
            <label className="block"><span className={rot}>Quantidade em estoque</span><input type="number" className={campo} value={f.estoque} onChange={(e) => set("estoque", e.target.value)} /></label>
            <label className="block"><span className={rot}>Estoque mínimo</span><input type="number" className={campo} value={f.minimo} onChange={(e) => set("minimo", e.target.value)} /></label>
            <label className="block"><span className={rot}>Custo R$</span><input type="number" step="0.01" className={campo} value={f.custo} onChange={(e) => set("custo", e.target.value)} /></label>
            <label className="block"><span className={rot}>Preço de venda R$</span><input type="number" step="0.01" className={campo} value={f.preco} onChange={(e) => set("preco", e.target.value)} /></label>
            <label className="block"><span className={rot}>Foto</span><input type="file" accept="image/*" className="text-xs text-muted-foreground" onChange={(e) => lerFoto(e.target.files?.[0])} /></label>
            <div className="flex items-end gap-3 sm:col-span-2 xl:col-span-4">
              <button className="h-10 bg-primary px-6 font-semibold uppercase tracking-wider text-primary-foreground">Cadastrar produto</button>
              {msg && <span className="text-sm text-muted-foreground">{msg}</span>}
            </div>
          </div>
          <div className="space-y-3 border border-border p-3">
            <p className={rot}>Prévia</p>
            {f.foto ? <img src={f.foto} alt="" className="h-28 w-full object-cover" /> : <div className="grid h-28 place-items-center bg-muted text-xs text-muted-foreground">Sem foto</div>}
            <p className="font-mono text-xs text-primary">{sku || "SKU"}</p>
            <p className="text-sm">{f.nome || "Nome do produto"}</p>
            {ean && <div className="bg-foreground p-2"><BarcodeEan13 codigo={ean} /></div>}
          </div>
        </form>
      </Panel>

      <Panel titulo="Produtos cadastrados">
        <Table colunas={["SKU", "Produto", "EAN-13", "Tipo", "Un", "Qtd", "Custo", "Preço", ""]}>
          {produtos.map((p) => (
            <Row key={p.sku}>
              <Cell mono>{p.sku}</Cell><Cell>{p.nome}</Cell><Cell mono>{p.ean}</Cell><Cell>{p.tipo}</Cell>
              <Cell mono>{p.un}</Cell><Cell mono>{p.estoque}</Cell><Cell mono>{brl(p.custo)}</Cell>
              <Cell mono>{p.preco ? brl(p.preco) : "—"}</Cell>
              <Cell>{ehCadastroManual(p.sku) && <button onClick={() => removerProduto(p.sku)} className="text-xs text-destructive">Excluir</button>}</Cell>
            </Row>
          ))}
        </Table>
      </Panel>
    </>
  );
}
