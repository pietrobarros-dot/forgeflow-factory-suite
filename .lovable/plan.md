# ForjaERP — Auditoria e plano de evolução

## 1. Auditoria do sistema atual

**Tecnologia:** aplicação web (TanStack Start + React 19 + Tailwind v4), visual industrial escuro (grafite + âmbar), fontes Archivo / IBM Plex Mono.

**Banco de dados e login:** não existem. Todo o sistema é um protótipo com dados simulados em um único arquivo. Não há usuários, perfis nem permissões.

**Telas existentes (11):** Painel, MRP, Produção (MES), WMS, TMS, Compras (SRM), Vendas (CRM), Produtos (PIM), Etiquetas, Qualidade/Manutenção (QMS).

| Módulo | O que funciona hoje | Limitação |
|---|---|---|
| Painel | Cards e tabelas | Números fixos, sem cálculo nem filtros de período |
| MRP | Cadastro de produtos (SKU/EAN auto ou manual, foto, preço) | Fica salvo só no navegador; necessidades são fixas |
| MES | Lista de OPs e carga por célula | Sem criar/editar OP, apontamento, paradas ou OEE real |
| WMS | Mapa 2D e 3D do armazém, busca por SKU | Posições geradas automaticamente, sem movimentações reais |
| TMS | Mapa com rota real, combustível, pedágio estimado, motorista | Veículos e motoristas fixos; viagens não são salvas |
| SRM / CRM / QMS | Tabelas de leitura | Sem cadastros nem fluxos |
| Etiquetas | EAN-13 legível, prévia 100x60, impressão | Sem QR Code, sem formatos configuráveis |

**Problemas encontrados:**
- Indicadores são números digitados, não calculados.
- Os módulos não conversam entre si (venda não gera produção, produção não baixa estoque).
- Qualquer pessoa acessa tudo; não há auditoria.
- Os dados de demonstração estão misturados com o cadastro manual.

**Riscos:**
- Os produtos cadastrados até agora estão só no navegador e **não vão para o banco automaticamente**. Posso oferecer um botão de importação na etapa de Produtos.
- Os dados simulados serão removidos das telas reais (sua regra: não misturar demonstração com dados reais). As telas começarão vazias até haver cadastros.
- O pedágio continua estimado: o valor exato por praça exige um serviço pago externo.

## 2. Base necessária

Ativar o **Lovable Cloud**: banco de dados, login e controle de acesso. Sem isso não é possível ter dados reais, permissões nem integração entre os módulos.

## 3. Etapas (cada uma testada antes da próxima)

1. **Base visual e segurança mínima:** menu com ícones, cabeçalho com página atual, componentes padrão (formulário, tabela com filtro/busca, confirmação, mensagens, carregamento), login e perfis (Administrador, Gestor, Supervisor, Operador, Almoxarife, Comprador, Vendedor) com bloqueio por módulo no servidor.
2. **Produtos (PIM):** cadastro completo (categoria, unidade, peso/dimensões, imagens, ativo/inativo), estrutura (BOM), roteiro, revisões, histórico.
3. **Estoque (WMS):** endereços (rua/corredor/prateleira/posição), lotes, entradas, saídas, transferências, ajustes, inventário, reservas, mín/máx/segurança, alertas. O mapa 2D/3D passa a mostrar o estoque real.
4. **Compras e MRP:** fornecedores, solicitação → cotação → aprovação → pedido → recebimento (entra no estoque). MRP calcula a necessidade a partir das OPs e da BOM e gera solicitações de compra.
5. **Produção (MES):** criar/editar/cancelar OP com justificativa, prioridade, os 7 status, apontamento (aprovado, refugo, retrabalho, paradas e motivos, operador), consumo de material e entrada do acabado no estoque, OEE com fórmula visível, histórico da OP.
6. **Qualidade e manutenção (QMS):** planos e inspeções, não conformidades, ações corretivas/preventivas, máquinas, planos e ordens de manutenção, alertas.
7. **Vendas e transporte (CRM/TMS):** clientes, contatos, orçamentos, pedidos com aprovação (gera demanda no MRP), cargas, separação, conferência, entregas, comprovante, ocorrências. Veículos, motoristas e transportadoras cadastráveis; o mapa de rota é mantido.
8. **Painel e relatórios:** indicadores calculados dos dados reais, filtros de período (hoje, ontem, 7/30 dias, mês, personalizado), gráficos, cards clicáveis, exportação PDF e Excel.
9. **Auditoria:** registro de atividades e de alterações, controle de sessões.

Etiquetas ganham QR Code e formatos configuráveis na etapa 3.

## 4. Como vamos avançar

É um projeto grande; cada etapa é uma entrega própria. Depois da aprovação começo pela **etapa 1**, testo e aviso você antes de seguir para a próxima.

## Detalhes técnicos
- Tabelas com chaves estrangeiras, índices, unicidade de SKU/EAN/códigos e políticas de acesso por perfil (tabela de papéis separada, checagem por função no banco).
- Operações críticas (apontamento, recebimento, baixa de estoque) feitas em funções do banco em uma única transação, sempre gerando um movimento de histórico.
- Saldo de estoque derivado dos movimentos, nunca editado direto.
- Gatilhos de auditoria gravando quem, quando, antes e depois.
- Validação no formulário e no servidor.
