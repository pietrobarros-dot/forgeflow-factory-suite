// Dados simulados (protótipo) — nenhum backend conectado.
import { gerarEan13 } from "@/lib/barcode";
import fotoPa1001 from "@/assets/pa-1001.jpg";
import fotoPa1002 from "@/assets/pa-1002.jpg";
import fotoSm2010 from "@/assets/sm-2010.jpg";
import fotoMp3001 from "@/assets/mp-3001.jpg";

export type Status =
  | "ok"
  | "atencao"
  | "critico"
  | "andamento"
  | "concluido"
  | "planejado";

export const kpis = [
  { label: "Ordens em produção", value: "18", delta: "+3 vs. semana", tone: "ok" as Status },
  { label: "OEE médio", value: "78,4%", delta: "+1,2 p.p.", tone: "ok" as Status },
  { label: "Itens abaixo do mínimo", value: "12", delta: "requer compra", tone: "critico" as Status },
  { label: "Ocupação do armazém", value: "83%", delta: "4 ruas cheias", tone: "atencao" as Status },
  { label: "Entregas em rota", value: "9", delta: "2 com atraso", tone: "atencao" as Status },
  { label: "Faturamento do mês", value: "R$ 1,84 mi", delta: "+6,8%", tone: "ok" as Status },
];

export type Produto = {
  sku: string;
  nome: string;
  descricao: string;
  tipo: string;
  un: string;
  estoque: number;
  minimo: number;
  custo: number;
  ean: string;
  foto?: string;
};

export const produtos: Produto[] = [
  { sku: "PA-1001", nome: "Mesa industrial 1,60m", descricao: "Mesa industrial 1,60 x 0,80 m, estrutura em tubo de aço 40x40 pintado epóxi preto, tampo MDF 18 mm laminado.", tipo: "Acabado", un: "UN", estoque: 42, minimo: 20, custo: 812.4, ean: gerarEan13({ sequencial: 1001 }), foto: fotoPa1001 },
  { sku: "PA-1002", nome: "Bancada dobrável", descricao: "Bancada dobrável 1,50 m com pés retráteis em aço e tampo em madeira maciça, altura regulável.", tipo: "Acabado", un: "UN", estoque: 11, minimo: 15, custo: 654.0, ean: gerarEan13({ sequencial: 1002 }), foto: fotoPa1002 },
  { sku: "SM-2010", nome: "Estrutura soldada", descricao: "Estrutura soldada para mesa industrial, tubo 40x40, com sapatas e furação de fixação.", tipo: "Semiacabado", un: "UN", estoque: 68, minimo: 40, custo: 218.9, ean: gerarEan13({ sequencial: 2010 }), foto: fotoSm2010 },
  { sku: "MP-3001", nome: "Tubo aço 40x40", descricao: "Tubo de aço carbono seção quadrada 40x40 mm, parede 1,5 mm, barra de 6 m.", tipo: "Matéria-prima", un: "M", estoque: 1240, minimo: 800, custo: 24.7, ean: gerarEan13({ sequencial: 3001 }), foto: fotoMp3001 },
  { sku: "MP-3002", nome: "Chapa MDF 18mm", descricao: "Chapa de MDF 18 mm, 2750 x 1840 mm, revestimento melamínico.", tipo: "Matéria-prima", un: "CH", estoque: 96, minimo: 150, custo: 132.5, ean: gerarEan13({ sequencial: 3002 }) },
  { sku: "MP-3003", nome: "Tinta epóxi preta", descricao: "Tinta em pó epóxi-poliéster preto fosco para pintura eletrostática.", tipo: "Matéria-prima", un: "L", estoque: 310, minimo: 200, custo: 41.2, ean: gerarEan13({ sequencial: 3003 }) },
  { sku: "MP-3004", nome: "Parafuso M8 inox", descricao: "Parafuso sextavado M8 x 25 mm em aço inox A2 com arruela.", tipo: "Matéria-prima", un: "PC", estoque: 8600, minimo: 10000, custo: 0.38, ean: gerarEan13({ sequencial: 3004 }) },
];

export const estruturaProduto = {
  sku: "PA-1001",
  nome: "Mesa industrial 1,60m",
  itens: [
    { sku: "SM-2010", nome: "Estrutura soldada", qtd: 1, un: "UN" },
    { sku: "MP-3002", nome: "Chapa MDF 18mm", qtd: 1.2, un: "CH" },
    { sku: "MP-3003", nome: "Tinta epóxi preta", qtd: 0.8, un: "L" },
    { sku: "MP-3004", nome: "Parafuso M8 inox", qtd: 16, un: "PC" },
  ],
};

export const necessidades = [
  { sku: "MP-3002", nome: "Chapa MDF 18mm", bruta: 420, estoque: 96, liquida: 324, data: "22/09", acao: "Comprar", tone: "critico" as Status },
  { sku: "MP-3004", nome: "Parafuso M8 inox", bruta: 12800, estoque: 8600, liquida: 4200, data: "24/09", acao: "Comprar", tone: "critico" as Status },
  { sku: "MP-3001", nome: "Tubo aço 40x40", bruta: 980, estoque: 1240, liquida: 0, data: "—", acao: "Suficiente", tone: "ok" as Status },
  { sku: "SM-2010", nome: "Estrutura soldada", bruta: 210, estoque: 68, liquida: 142, data: "20/09", acao: "Produzir", tone: "atencao" as Status },
  { sku: "MP-3003", nome: "Tinta epóxi preta", bruta: 280, estoque: 310, liquida: 0, data: "—", acao: "Suficiente", tone: "ok" as Status },
];

export const ordens = [
  { id: "OP-4821", produto: "Mesa industrial 1,60m", qtd: 120, feito: 86, centro: "Montagem A", inicio: "14/09", fim: "19/09", status: "andamento" as Status },
  { id: "OP-4822", produto: "Bancada dobrável", qtd: 60, feito: 60, centro: "Montagem B", inicio: "10/09", fim: "16/09", status: "concluido" as Status },
  { id: "OP-4823", produto: "Estrutura soldada", qtd: 210, feito: 44, centro: "Solda", inicio: "15/09", fim: "23/09", status: "andamento" as Status },
  { id: "OP-4824", produto: "Mesa industrial 1,60m", qtd: 80, feito: 0, centro: "Montagem A", inicio: "22/09", fim: "27/09", status: "planejado" as Status },
  { id: "OP-4825", produto: "Bancada dobrável", qtd: 40, feito: 0, centro: "Pintura", inicio: "24/09", fim: "28/09", status: "planejado" as Status },
];

export const centrosTrabalho = [
  { nome: "Corte", capacidade: 100, carga: 72 },
  { nome: "Solda", capacidade: 100, carga: 94 },
  { nome: "Pintura", capacidade: 100, carga: 61 },
  { nome: "Montagem A", capacidade: 100, carga: 88 },
  { nome: "Montagem B", capacidade: 100, carga: 47 },
];

export const enderecos = [
  { rua: "A-01", posicao: "01-02", item: "MP-3001 · Tubo aço 40x40", qtd: 640, ocupacao: 92 },
  { rua: "A-02", posicao: "03-01", item: "MP-3002 · Chapa MDF 18mm", qtd: 96, ocupacao: 38 },
  { rua: "B-01", posicao: "01-01", item: "MP-3003 · Tinta epóxi preta", qtd: 310, ocupacao: 74 },
  { rua: "B-04", posicao: "02-03", item: "PA-1001 · Mesa industrial", qtd: 42, ocupacao: 66 },
  { rua: "C-02", posicao: "01-04", item: "SM-2010 · Estrutura soldada", qtd: 68, ocupacao: 81 },
];

export const movimentos = [
  { doc: "REC-2291", tipo: "Recebimento", item: "MP-3001 · Tubo aço", qtd: "+400 M", hora: "07:42", operador: "M. Souza" },
  { doc: "SEP-1188", tipo: "Separação", item: "MP-3002 · Chapa MDF", qtd: "-48 CH", hora: "08:15", operador: "J. Lima" },
  { doc: "TRF-0455", tipo: "Transferência", item: "SM-2010 · Estrutura", qtd: "32 UN", hora: "09:03", operador: "R. Alves" },
  { doc: "EXP-0912", tipo: "Expedição", item: "PA-1001 · Mesa", qtd: "-24 UN", hora: "10:28", operador: "C. Dias" },
  { doc: "INV-0033", tipo: "Inventário", item: "MP-3004 · Parafuso", qtd: "-120 PC", hora: "11:10", operador: "P. Rocha" },
];

export const cargas = [
  { id: "CG-7710", veiculo: "Truck · MER-4E21", motorista: "A. Ferreira", rota: "SP → Campinas → Jundiaí", paradas: 3, ocupacao: 88, status: "andamento" as Status, eta: "Hoje 16:40" },
  { id: "CG-7711", veiculo: "VUC · LPQ-2C09", motorista: "D. Martins", rota: "SP capital (zona sul)", paradas: 6, ocupacao: 64, status: "andamento" as Status, eta: "Hoje 18:10" },
  { id: "CG-7712", veiculo: "Carreta · KTZ-9B44", motorista: "S. Nunes", rota: "SP → Curitiba", paradas: 1, ocupacao: 96, status: "atencao" as Status, eta: "Amanhã 09:00" },
  { id: "CG-7713", veiculo: "Truck · HRE-5D77", motorista: "L. Batista", rota: "SP → Ribeirão Preto", paradas: 2, ocupacao: 41, status: "planejado" as Status, eta: "Sexta 11:30" },
];

export const fretes = [
  { transportadora: "TransNorte", entregas: 42, prazo: "96%", custoKm: "R$ 3,18" },
  { transportadora: "ViaSul Log", entregas: 28, prazo: "89%", custoKm: "R$ 2,94" },
  { transportadora: "Frota própria", entregas: 61, prazo: "98%", custoKm: "R$ 2,41" },
];

export const compras = [
  { pedido: "PC-5540", fornecedor: "Metalúrgica Bravo", item: "MP-3001 · Tubo aço 40x40", qtd: 600, valor: 14820, entrega: "21/09", status: "andamento" as Status },
  { pedido: "PC-5541", fornecedor: "Madeireira Central", item: "MP-3002 · Chapa MDF 18mm", qtd: 350, valor: 46375, entrega: "23/09", status: "planejado" as Status },
  { pedido: "PC-5542", fornecedor: "Química Prisma", item: "MP-3003 · Tinta epóxi", qtd: 200, valor: 8240, entrega: "18/09", status: "concluido" as Status },
  { pedido: "PC-5543", fornecedor: "Fixa Inox", item: "MP-3004 · Parafuso M8", qtd: 20000, valor: 7600, entrega: "25/09", status: "atencao" as Status },
];

export const pedidos = [
  { pedido: "PV-9031", cliente: "Construtora Vega", itens: "Mesa industrial x60", valor: 68400, entrega: "26/09", status: "andamento" as Status },
  { pedido: "PV-9032", cliente: "Rede Oficina Já", itens: "Bancada dobrável x40", valor: 39200, entrega: "29/09", status: "planejado" as Status },
  { pedido: "PV-9033", cliente: "Indústria Kalp", itens: "Mesa industrial x24", valor: 27360, entrega: "19/09", status: "concluido" as Status },
  { pedido: "PV-9034", cliente: "Logística Pampa", itens: "Estrutura soldada x80", valor: 24800, entrega: "02/10", status: "atencao" as Status },
];

export const qualidade = [
  { lote: "LT-8821", produto: "Mesa industrial 1,60m", inspecao: "Dimensional", resultado: "Aprovado", indice: "99,1%", tone: "ok" as Status },
  { lote: "LT-8822", produto: "Estrutura soldada", inspecao: "Solda / penetração", resultado: "Reinspeção", indice: "94,0%", tone: "atencao" as Status },
  { lote: "LT-8823", produto: "Bancada dobrável", inspecao: "Pintura", resultado: "Refugo parcial", indice: "88,6%", tone: "critico" as Status },
];

export const manutencao = [
  { ativo: "Prensa hidráulica PH-02", tipo: "Preventiva", proxima: "21/09", horas: 1840, tone: "ok" as Status },
  { ativo: "Robô de solda RS-01", tipo: "Corretiva", proxima: "Hoje", horas: 4210, tone: "critico" as Status },
  { ativo: "Cabine de pintura CP-03", tipo: "Preventiva", proxima: "30/09", horas: 960, tone: "ok" as Status },
];
