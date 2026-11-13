import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import type { Map as LMap, LayerGroup } from "leaflet";
import { AppShell } from "@/components/erp/app-shell";
import { Bar, Cell, Metric, PageHeader, Panel, Row, StatusBadge, Table, brl } from "@/components/erp/ui";
import { cargas, fretes } from "@/lib/erp-data";

export const Route = createFileRoute("/tms")({
  head: () => ({
    meta: [
      { title: "TMS — Transporte e roteirização | ForjaERP" },
      { name: "description", content: "Mapa com cálculo de rota, distância, tempo, combustível, pedágios e custo de motorista por viagem." },
      { property: "og:title", content: "TMS — Transporte e roteirização" },
      { property: "og:description", content: "Calcule rotas no mapa com custos de combustível, pedágios e motorista." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TmsPage,
});

const veiculos = [
  { nome: "VUC · LPQ-2C09", eixos: 2, kmL: 7.5, capacidade: "3 t" },
  { nome: "Truck · MER-4E21", eixos: 3, kmL: 4.5, capacidade: "14 t" },
  { nome: "Carreta · KTZ-9B44", eixos: 5, kmL: 2.6, capacidade: "30 t" },
];
const motoristas = [
  { nome: "A. Ferreira", diaria: 280, porKm: 0.35, cnh: "E" },
  { nome: "D. Martins", diaria: 240, porKm: 0.3, cnh: "D" },
  { nome: "S. Nunes", diaria: 310, porKm: 0.4, cnh: "E" },
  { nome: "L. Batista", diaria: 250, porKm: 0.32, cnh: "E" },
];
// Estimativa média de pedágio em rodovias concedidas (SP/PR): R$ por eixo a cada 100 km.
const PEDAGIO_EIXO_100KM = 11.5;
const JORNADA_H = 8;

type Rota = { km: number; horas: number; coords: [number, number][]; origem: string; destino: string };
type Calculo = Rota & { veiculo: string; motorista: string; combustivel: number; pedagio: number; custoMotorista: number; outros: number; total: number };

async function geocode(q: string): Promise<[number, number]> {
  const r = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=br&q=${encodeURIComponent(q)}`);
  const j = await r.json();
  if (!j[0]) throw new Error(`Endereço não encontrado: ${q}`);
  return [Number(j[0].lat), Number(j[0].lon)];
}

function TmsPage() {
  const mapEl = useRef<HTMLDivElement>(null);
  const map = useRef<LMap | null>(null);
  const camada = useRef<LayerGroup | null>(null);
  const [origem, setOrigem] = useState("São Paulo, SP");
  const [destino, setDestino] = useState("Curitiba, PR");
  const [parada, setParada] = useState("");
  const [vi, setVi] = useState(1);
  const [mi, setMi] = useState(0);
  const [diesel, setDiesel] = useState(6.19);
  const [outros, setOutros] = useState(120);
  const [rota, setRota] = useState<Rota>();
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [salvas, setSalvas] = useState<Calculo[]>([]);

  useEffect(() => {
    let vivo = true;
    (async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");
      if (!vivo || !mapEl.current || map.current) return;
      map.current = L.map(mapEl.current).setView([-23.55, -46.63], 6);
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "© OpenStreetMap contributors", maxZoom: 18 }).addTo(map.current);
      camada.current = L.layerGroup().addTo(map.current);
    })();
    return () => { vivo = false; map.current?.remove(); map.current = null; };
  }, []);

  async function calcular() {
    setErro(""); setCarregando(true);
    try {
      const pontos = await Promise.all([origem, ...(parada ? [parada] : []), destino].map(geocode));
      const coordStr = pontos.map(([la, lo]) => `${lo},${la}`).join(";");
      const r = await fetch(`https://router.project-osrm.org/route/v1/driving/${coordStr}?overview=full&geometries=geojson`);
      const j = await r.json();
      if (j.code !== "Ok") throw new Error("Não foi possível traçar a rota.");
      const coords: [number, number][] = j.routes[0].geometry.coordinates.map(([lo, la]: number[]) => [la, lo]);
      setRota({ km: j.routes[0].distance / 1000, horas: j.routes[0].duration / 3600, coords, origem, destino });
      const L = (await import("leaflet")).default;
      camada.current?.clearLayers();
      const linha = L.polyline(coords, { color: "#f59e0b", weight: 5 }).addTo(camada.current!);
      pontos.forEach((p, i) =>
        L.circleMarker(p, { radius: 8, color: "#0f1115", fillColor: i === 0 ? "#22c55e" : i === pontos.length - 1 ? "#ef4444" : "#e5e7eb", fillOpacity: 1, weight: 2 })
          .bindTooltip(i === 0 ? "Origem" : i === pontos.length - 1 ? "Destino" : "Parada").addTo(camada.current!));
      map.current?.fitBounds(linha.getBounds(), { padding: [30, 30] });
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao calcular rota");
    } finally { setCarregando(false); }
  }

  const v = veiculos[vi]!, m = motoristas[mi]!;
  const calc: Calculo | undefined = rota && (() => {
    const combustivel = (rota.km / v.kmL) * diesel;
    const pedagio = (rota.km / 100) * PEDAGIO_EIXO_100KM * v.eixos;
    const dias = Math.max(1, Math.ceil(rota.horas / JORNADA_H));
    const custoMotorista = dias * m.diaria + rota.km * m.porKm;
    return { ...rota, veiculo: v.nome, motorista: m.nome, combustivel, pedagio, custoMotorista, outros, total: combustivel + pedagio + custoMotorista + outros };
  })();

  const campo = "h-9 w-full border border-border bg-background px-2 text-sm text-foreground";
  const rot = "mb-1 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground";

  return (
    <AppShell>
      <PageHeader titulo="TMS · Transporte" descricao="Roteirização no mapa com distância, tempo, combustível, pedágios e custo do motorista." />

      <div className="grid gap-5 xl:grid-cols-[340px_1fr]">
        <Panel titulo="Planejar viagem">
          <div className="space-y-3">
            <label className="block"><span className={rot}>Origem</span><input className={campo} value={origem} onChange={(e) => setOrigem(e.target.value)} /></label>
            <label className="block"><span className={rot}>Parada (opcional)</span><input className={campo} value={parada} onChange={(e) => setParada(e.target.value)} placeholder="Ex.: Registro, SP" /></label>
            <label className="block"><span className={rot}>Destino</span><input className={campo} value={destino} onChange={(e) => setDestino(e.target.value)} /></label>
            <label className="block"><span className={rot}>Veículo</span>
              <select className={campo} value={vi} onChange={(e) => setVi(Number(e.target.value))}>
                {veiculos.map((x, i) => <option key={x.nome} value={i}>{x.nome} · {x.eixos} eixos · {x.kmL} km/L</option>)}
              </select></label>
            <label className="block"><span className={rot}>Motorista</span>
              <select className={campo} value={mi} onChange={(e) => setMi(Number(e.target.value))}>
                {motoristas.map((x, i) => <option key={x.nome} value={i}>{x.nome} · CNH {x.cnh} · {brl(x.diaria)}/dia</option>)}
              </select></label>
            <div className="grid grid-cols-2 gap-2">
              <label className="block"><span className={rot}>Diesel R$/L</span><input type="number" step="0.01" className={campo} value={diesel} onChange={(e) => setDiesel(Number(e.target.value))} /></label>
              <label className="block"><span className={rot}>Outros R$</span><input type="number" className={campo} value={outros} onChange={(e) => setOutros(Number(e.target.value))} /></label>
            </div>
            <button onClick={calcular} disabled={carregando} className="h-10 w-full bg-primary font-semibold uppercase tracking-wider text-primary-foreground disabled:opacity-50">
              {carregando ? "Calculando…" : "Calcular rota"}
            </button>
            {erro && <p className="text-sm text-destructive">{erro}</p>}
          </div>
        </Panel>

        <Panel titulo="Mapa da rota">
          <div ref={mapEl} className="h-[440px] w-full" />
        </Panel>
      </div>

      {calc && (
        <Panel titulo={`Custo da viagem · ${calc.origem} → ${calc.destino}`}
          extra={<button onClick={() => setSalvas((s) => [calc, ...s])} className="border border-primary px-3 py-1 font-mono text-xs uppercase text-primary">Salvar viagem</button>}>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <Metric label="Distância" value={`${calc.km.toFixed(0)} km`} delta={`${Math.floor(calc.horas)}h${String(Math.round((calc.horas % 1) * 60)).padStart(2, "0")} de direção`} tone="ok" />
            <Metric label="Combustível" value={brl(calc.combustivel)} delta={`${(calc.km / v.kmL).toFixed(0)} L diesel`} tone="atencao" />
            <Metric label="Pedágios (estim.)" value={brl(calc.pedagio)} delta={`${v.eixos} eixos`} tone="atencao" />
            <Metric label="Motorista" value={brl(calc.custoMotorista)} delta={`${Math.max(1, Math.ceil(calc.horas / JORNADA_H))} diária(s) + km`} tone="ok" />
            <Metric label="Total da viagem" value={brl(calc.total)} delta={`Inclui ${brl(calc.outros)} outros`} tone="critico" />
            <Metric label="Custo por km" value={brl(calc.total / calc.km)} delta={calc.veiculo} tone="ok" />
          </div>
          <p className="mt-3 text-xs text-muted-foreground">Pedágio é estimado pela média de R$ {PEDAGIO_EIXO_100KM.toFixed(2).replace(".", ",")} por eixo a cada 100 km; o valor real depende das praças da rota.</p>
        </Panel>
      )}

      {salvas.length > 0 && (
        <Panel titulo="Viagens planejadas">
          <Table colunas={["Rota", "Veículo", "Motorista", "Km", "Combustível", "Pedágio", "Motorista R$", "Total"]}>
            {salvas.map((s, i) => (
              <Row key={i}>
                <Cell>{s.origem} → {s.destino}</Cell><Cell>{s.veiculo}</Cell><Cell>{s.motorista}</Cell>
                <Cell mono>{s.km.toFixed(0)}</Cell><Cell mono>{brl(s.combustivel)}</Cell><Cell mono>{brl(s.pedagio)}</Cell>
                <Cell mono>{brl(s.custoMotorista)}</Cell><Cell mono className="text-primary">{brl(s.total)}</Cell>
              </Row>
            ))}
          </Table>
        </Panel>
      )}

      <div className="grid gap-5 xl:grid-cols-2">
        <Panel titulo="Motoristas">
          <Table colunas={["Nome", "CNH", "Diária", "R$/km", "Situação"]}>
            {motoristas.map((x, i) => (
              <Row key={x.nome}><Cell>{x.nome}</Cell><Cell mono>{x.cnh}</Cell><Cell mono>{brl(x.diaria)}</Cell><Cell mono>{brl(x.porKm)}</Cell>
                <Cell><StatusBadge status={i < 3 ? "andamento" : "planejado"} label={i < 3 ? "Em rota" : "Disponível"} /></Cell></Row>
            ))}
          </Table>
        </Panel>
        <Panel titulo="Desempenho por transportadora">
          <Table colunas={["Transportadora", "Entregas", "No prazo", "Custo/km"]}>
            {fretes.map((f) => (
              <Row key={f.transportadora}><Cell>{f.transportadora}</Cell><Cell mono>{f.entregas}</Cell><Cell mono>{f.prazo}</Cell><Cell mono>{f.custoKm}</Cell></Row>
            ))}
          </Table>
        </Panel>
      </div>

      <Panel titulo="Cargas em rota">
        <Table colunas={["Carga", "Veículo", "Motorista", "Rota", "Ocupação", "Chegada", "Status"]}>
          {cargas.map((c) => (
            <Row key={c.id}>
              <Cell mono>{c.id}</Cell><Cell>{c.veiculo}</Cell><Cell>{c.motorista}</Cell><Cell>{c.rota}</Cell>
              <Cell className="w-32"><Bar value={c.ocupacao} /></Cell><Cell mono>{c.eta}</Cell><Cell><StatusBadge status={c.status} /></Cell>
            </Row>
          ))}
        </Table>
      </Panel>
    </AppShell>
  );
}
