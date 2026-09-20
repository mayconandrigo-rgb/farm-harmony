# Farm Harmony

# Sistema de Gestão Integrada de Fazenda (ERP Rural)

## 1. Visão Geral

Crie um sistema web completo de gestão para uma fazenda diversificada que produz soja, milho, ovos, hortaliças (horta), pecuária de corte (bovinos), ovinos (carneiros) e piscicultura. A fazenda possui refeitório, dormitório e parque de máquinas (colheitadeiras, plantadeiras, plataformas de colheita de milho e de soja, caminhões, caminhonetes, motos e pulverizadores). O sistema deve integrar todos os módulos em uma única base de dados, ser fácil de usar e mobile-first (será usado no campo), manter histórico completo de todas as operações e permitir anexar imagens e PDFs (romaneios, notas fiscais, manuais de máquinas, análises de solo, contratos, GTAs).

## 2. Stack e Tecnologia

- Frontend: React gerado no Lovable.

- Backend e banco: Supabase (PostgreSQL) com autenticação, storage para arquivos e políticas RLS.

- Design: responsivo, mobile-first, botões grandes e formulários simples para uso no campo.

- Estados de carregamento e erro em todas as telas; validação de dados em todos os formulários.

## 3. Perfis e Permissões

- Administrador/Gestor: acesso total, cadastros, configurações, relatórios.

- Financeiro: módulo financeiro, notas fiscais, contratos, folha de pagamento.

- Operador de campo: lançamentos de romaneios, consumo, produção e ocorrências (sem acesso a valores financeiros).

- Consulta: acesso somente leitura.

- Implementar políticas RLS no Supabase para cada perfil.

## 4. Cadastros Base

- Talhões: nome/número, área (ha), cultura atual, safra, observações.

- Culturas: soja, milho, hortaliças, pastagem, etc.

- Produtos/Insumos: sementes, adubos, defensivos, rações, sal mineral, sal comum, vermífugos, medicamentos e alimentos (macarrão, trigo, etc.), com unidade de medida (kg, saco, litro, dose).

- Clientes e Fornecedores: nome, CNPJ/CPF, contato, endereço.

- Armazéns: nome e localização (usados nos contratos de venda).

- Funcionários: nome, CPF, cargo, função, salário, data de admissão, dados bancários.

- Máquinas: tipo (colheitadeira, plantadeira, plataforma de milho, plataforma de soja, caminhão, caminhonete, moto, pulverizador), marca, modelo, ano, placa, com opção de anexar o manual em PDF.

- Pastos/Piquetes: nome, área, capacidade.

- Tanques/Viveiros (piscicultura): nome, espécie, capacidade.

## 5. Módulo Lavoura

- Plantio por talhão: cultura, variedade/tipo de semente, data do plantio, quantidade de semente, safra.

- Análise de solo: registrar laudo por talhão (data, laboratório, resultado) e anexar PDF/imagem do laudo.

- Adubação: talhão, tipo de adubo, quantidade, data, forma de aplicação.

- Defensivos: talhão, produto, dose, data, alvo (praga, doença ou planta daninha).

- Ocorrências no desenvolvimento: talhão, data, tipo de problema (praga, doença, estresse hídrico, acamamento, etc.), descrição, severidade e ação tomada.

- Histórico completo por talhão, incluindo todas as safras.

## 6. Módulo Contratos

- Contratos de compra e venda de grãos (soja e milho).

- Contrato de venda: cliente comprador, armazém de destino, cultura, quantidade contratada, preço, data da venda, data de início da entrega, data de conclusão prevista e percentual de entrega (atualizado automaticamente pelos romaneios vinculados).

- Status do contrato: em andamento, concluído, cancelado.

- Anexar PDF do contrato.

- Lista de contratos com filtros por status, cultura e cliente.

## 7. Módulo Romaneios (Carga e Descarga)

- Lançamento de romaneio vinculado a: talhão colhido, contrato de venda e armazém.

- Campos: número do romaneio, placa do caminhão, nome do motorista, data e hora, peso bruto, peso tara, peso líquido (calculado automaticamente), origem (colheita direta na lavoura ou retirada de silo bag) e número da nota fiscal.

- Classificação da carga conforme a cultura (soja/milho): impureza (%), umidade (%), avariados (%), mofado (%), verde (%), quebrados (%) e outros.

- Anexar imagem ou PDF do romaneio.

- Atualização automática do percentual de entrega do contrato vinculado.

- Histórico de romaneios com filtros por talhão, contrato, placa e período.

## 8. Módulo Pecuária (Bovinos)

- Rebanho: quantidade de cabeças, identificação (brinco/nome), idade, sexo (macho/fêmea), raça e pasto/piquete atual.

- Vacinas: tipo, data, lote, dose, animal ou lote vacinado e data do próximo reforço.

- Vendas: comprador, data, valor, quantidade e número da GTA, com anexo do PDF da GTA.

- Nascimentos: registro de nascimento de bezerros/novilhas (data, mãe, sexo, peso).

- Abate para consumo: data, quantidade, peso e finalidade.

- Consumo de insumos: sal comum, sal mineral, milho e ração (produto, quantidade, data e pasto/lote).

- Histórico completo por animal e por lote.

## 9. Módulo Ovinos (Carneiros)

- Controle similar ao de bovinos: quantidade, idade, sexo, raça, vacinas, vendas com GTA, nascimentos, abate para consumo, consumo de insumos e pasto.

## 10. Módulo Aves e Galinheiro

- Cadastro de lotes: raça, quantidade de aves e data de entrada.

- Produção diária de ovos: data, quantidade recolhida e lote/galinheiro.

- Consumo de ração: produto, quantidade e data.

- Abate para consumo: data, quantidade e peso.

## 11. Módulo Financeiro

- Notas fiscais de entrada e saída: número, tipo, fornecedor/cliente, data de emissão, valor total, frete (se existente) e itens (descrição, quantidade, valor unitário).

- Contas a pagar e contas a receber: descrição, valor, vencimento, status (pendente/pago) e forma de pagamento.

- O lançamento de uma NF gera automaticamente a entrada ou saída de estoque.

- Anexar PDF/imagem da NF.

- Relatórios: fluxo de caixa, despesas por categoria e receitas por cliente.

## 12. Módulo Estoque

- Controle de todos os produtos da fazenda, com saldo atualizado automaticamente.

- Entrada de estoque: automática via NF de compra.

- Saída/consumo por área, registrando a área de destino:

  - Refeitório: ex. pacote de macarrão, trigo e alimentos.

  - Lavoura: fungicida, adubo, sementes e defensivos.

  - Pecuária e ovinocultura: sal mineral (em sacos), sal comum, vermífugo e ração.

  - Aves: ração.

  - Piscicultura: ração e medicamentos.

- Histórico de movimentações (entradas, saídas e ajustes) com data, quantidade, responsável e área.

- Alerta de estoque mínimo (opcional).

## 13. Módulo Piscicultura

- Tanques/viveiros: cadastro com espécie e capacidade.

- Registro de povoamento (quantidade de alevinos e data), alimentação (ração, quantidade, data), despesca (quantidade, peso, data), vendas (comprador, valor, quantidade) e abate/consumo.

## 14. Módulo RH e Folha de Pagamento

- Cadastro de funcionários com dados completos.

- Folha de pagamento: mês/ano, salário base, adicionais, descontos, valor líquido, status (pago/pendente) e data de pagamento.

- Histórico mensal de folhas.

## 15. Anexos e Documentos

- Upload de imagem ou PDF em: romaneios, notas fiscais, contratos, GTAs, análises de solo, manuais de máquinas e laudos.

- Armazenamento no Supabase Storage, com visualização e download.

## 16. Dashboard e Relatórios

- Visão geral: safra atual por talhão, estoque de insumos, contratos em andamento com % de entrega, saldo financeiro, produção de ovos do dia, rebanho (bovinos/ovinos) e aves.

- Relatórios: produção por talhão, entregas por contrato, consumo por área, despesas por categoria e folha de pagamento.

- Filtros por período, cultura, talhão e área.

## 17. Regras Gerais e Critérios de Aceite

- Todos os módulos interligados: romaneio puxa talhão e contrato; NF gera estoque; consumo baixa estoque por área; venda de animais registra GTA.

- Histórico completo em todos os módulos — nada precisa ser recadastrado do zero.

- Busca e filtros em todas as listagens.

- Validações de dados e mensagens de erro claras.

- Responsivo e utilizável no celular no campo.

- Dados sensíveis protegidos por RLS; nenhuma chave ou credencial exposta.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/2acee945-3b96-45d2-8f10-454ef23caa64).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
