# WhatsApp-First Operating Model

## Visao Geral

O Softhouse Finance opera com um modelo **WhatsApp-First**, onde o WhatsApp e o canal principal de entrada de dados operacionais, e o painel web serve como centro de visualizacao, aprovacao e gestao.

## Papeis no Sistema

| Ator     | Funcao                                                     |
| -------- | ---------------------------------------------------------- |
| **Web**  | Painel de visualizacao, aprovacao e gestao                 |
| **WhatsApp** | Entrada operacional principal                         |
| **IA**   | Operador que organiza dados                                |
| **Humano** | Aprova acoes sensiveis                                  |

## Fluxo Geral

```
WhatsApp
↓
IA interpreta texto/audio/documento
↓
IA identifica cliente/projeto/tarefa/financeiro
↓
IA pede confirmacao quando necessario
↓
IA cria/atualiza dados
↓
Painel web mostra tudo organizado
```

## Comandos WhatsApp

### 1. Criar Cliente

| Campo                  | Valor                                                        |
| ---------------------- | ------------------------------------------------------------ |
| **Intencao**           | Cadastrar um novo cliente no sistema                         |
| **Dados obrigatorios** | Nome ou razao social                                         |
| **Dados opcionais**    | CNPJ/CPF, telefone, email, endereco, segmento, nome do contato |
| **Confirmacao**        | Sim -- revisao dos dados antes da criacao                    |
| **Acao gerada**        | INSERT na tabela de clientes + audit log                     |
| **Tabela afetada**     | `clientes`                                                   |
| **Role necessaria**    | `admin`, `gerente`                                           |
| **Risco**              | Baixo                                                        |

---

### 2. Criar Projeto

| Campo                  | Valor                                                        |
| ---------------------- | ------------------------------------------------------------ |
| **Intencao**           | Abrir um novo projeto vinculado a um cliente                 |
| **Dados obrigatorios** | Nome do projeto, cliente (nome ou ID)                        |
| **Dados opcionais**    | Descricao, data de inicio, data de fim prevista, orcamento, responsavel |
| **Confirmacao**        | Sim -- revisao dos dados antes da criacao                    |
| **Acao gerada**        | INSERT na tabela de projetos + audit log                     |
| **Tabela afetada**     | `projetos`                                                   |
| **Role necessaria**    | `admin`, `gerente`                                           |
| **Risco**              | Medio (impacta planejamento)                                 |

---

### 3. Criar Tarefa

| Campo                  | Valor                                                        |
| ---------------------- | ------------------------------------------------------------ |
| **Intencao**           | Criar uma tarefa vinculada a um projeto                      |
| **Dados obrigatorios** | Titulo da tarefa, projeto (nome ou ID)                       |
| **Dados opcionais**    | Descricao, responsavel, prazo, prioridade, estimativa de horas |
| **Confirmacao**        | Nao (operacional, reversivel)                                |
| **Acao gerada**        | INSERT na tabela de tarefas + audit log                      |
| **Tabela afetada**     | `tarefas`                                                    |
| **Role necessaria**    | `admin`, `gerente`, `lider`                                  |
| **Risco**              | Baixo                                                        |

---

### 4. Atualizar Status

| Campo                  | Valor                                                        |
| ---------------------- | ------------------------------------------------------------ |
| **Intencao**           | Alterar o status de uma tarefa ou projeto                    |
| **Dados obrigatorios** | Tarefa ou projeto (nome/ID), novo status                     |
| **Dados opcionais**    | Comentario, motivo da mudanca                                |
| **Confirmacao**        | Nao (operacional, reversivel)                                |
| **Acao gerada**        | UPDATE na tabela de tarefas ou projetos + audit log          |
| **Tabela afetada**     | `tarefas`, `projetos`                                        |
| **Role necessaria**    | `admin`, `gerente`, `lider`, `membro`                        |
| **Risco**              | Baixo                                                        |

---

### 5. Registrar Hora

| Campo                  | Valor                                                        |
| ---------------------- | ------------------------------------------------------------ |
| **Intencao**           | Lancar horas trabalhadas em uma tarefa                       |
| **Dados obrigatorios** | Tarefa (nome/ID), quantidade de horas, data                  |
| **Dados opcionais**    | Descricao do que foi feito, categoria (desenvolvimento, reuniao, etc.) |
| **Confirmacao**        | Nao (operacional)                                            |
| **Acao gerada**        | INSERT na tabela de time entries + audit log                 |
| **Tabela afetada**     | `time_entries`                                               |
| **Role necessaria**    | `admin`, `gerente`, `lider`, `membro`                        |
| **Risco**              | Baixo                                                        |

---

### 6. Registrar Entrega

| Campo                  | Valor                                                        |
| ---------------------- | ------------------------------------------------------------ |
| **Intencao**           | Registrar uma entrega ou artefato de projeto                 |
| **Dados obrigatorios** | Projeto (nome/ID), descricao da entrega                      |
| **Dados opcionais**    | Anexo (documento/imagem via WhatsApp), link, data de entrega, versao |
| **Confirmacao**        | Sim -- revisao antes de formalizar entrega                   |
| **Acao gerada**        | INSERT na tabela de entregas + audit log                     |
| **Tabela afetada**     | `entregas`                                                   |
| **Role necessaria**    | `admin`, `gerente`, `lider`, `membro`                        |
| **Risco**              | Medio (marca milestone do projeto)                           |

---

### 7. Registrar Receita

| Campo                  | Valor                                                        |
| ---------------------- | ------------------------------------------------------------ |
| **Intencao**           | Lancar uma entrada financeira (recebimento)                  |
| **Dados obrigatorios** | Projeto (nome/ID), valor, data, categoria                    |
| **Dados opcionais**    | Descricao, comprovante (imagem/PDF via WhatsApp), forma de pagamento |
| **Confirmacao**        | **Sim -- obrigatoria** (acao financeira)                     |
| **Acao gerada**        | INSERT na tabela financeira + audit log                      |
| **Tabela afetada**     | `financeiro`                                                 |
| **Role necessaria**    | `admin`, `gerente`                                           |
| **Risco**              | **Alto** (impacto financeiro direto)                         |

---

### 8. Registrar Custo

| Campo                  | Valor                                                        |
| ---------------------- | ------------------------------------------------------------ |
| **Intencao**           | Lancar uma saida financeira (custo/despesa)                  |
| **Dados obrigatorios** | Projeto (nome/ID), valor, data, categoria                    |
| **Dados opcionais**    | Descricao, comprovante (imagem/PDF via WhatsApp), forma de pagamento, fornecedor |
| **Confirmacao**        | **Sim -- obrigatoria** (acao financeira)                     |
| **Acao gerada**        | INSERT na tabela financeira + audit log                      |
| **Tabela afetada**     | `financeiro`                                                 |
| **Role necessaria**    | `admin`, `gerente`                                           |
| **Risco**              | **Alto** (impacto financeiro direto)                         |

---

### 9. Registrar Infraestrutura

| Campo                  | Valor                                                        |
| ---------------------- | ------------------------------------------------------------ |
| **Intencao**           | Registrar recurso de infraestrutura (servidor, dominio, servico cloud) |
| **Dados obrigatorios** | Nome do recurso, tipo (servidor, dominio, bucket, etc.), projeto vinculado |
| **Dados opcionais**    | Provedor, custo mensal, data de expiracao, credenciais (nunca armazenadas pela IA) |
| **Confirmacao**        | Sim -- revisao dos dados                                     |
| **Acao gerada**        | INSERT na tabela de infraestrutura + audit log               |
| **Tabela afetada**     | `infra_resources`                                            |
| **Role necessaria**    | `admin`, `gerente`                                           |
| **Risco**              | Medio (envolve ativos de TI)                                 |

---

### 10. Consultar Financeiro

| Campo                  | Valor                                                        |
| ---------------------- | ------------------------------------------------------------ |
| **Intencao**           | Consultar dados financeiros consolidados                     |
| **Dados obrigatorios** | Periodo ou mes de referencia                                 |
| **Dados opcionais**    | Projeto especifico, categoria, tipo (receita/custo/ambos)    |
| **Confirmacao**        | Nao (consulta, sem efeito colateral)                         |
| **Acao gerada**        | SELECT com sumarizacao + resposta formatada no WhatsApp      |
| **Tabela afetada**     | `financeiro` (somente leitura)                               |
| **Role necessaria**    | `admin`, `gerente`                                           |
| **Risco**              | Baixo (somente leitura)                                      |

---

### 11. Consultar Projetos em Risco

| Campo                  | Valor                                                        |
| ---------------------- | ------------------------------------------------------------ |
| **Intencao**           | Listar projetos com atraso, estouro de orcamento ou inatividade |
| **Dados obrigatorios** | Nenhum (usa criterios padrao de risco)                       |
| **Dados opcionais**    | Criterio especifico (atraso, orcamento, inatividade), threshold personalizado |
| **Confirmacao**        | Nao (consulta, sem efeito colateral)                         |
| **Acao gerada**        | SELECT com filtro de risco + resposta formatada              |
| **Tabela afetada**     | `projetos`, `tarefas`, `financeiro` (somente leitura)        |
| **Role necessaria**    | `admin`, `gerente`, `lider`                                  |
| **Risco**              | Baixo (somente leitura)                                      |

---

### 12. Consultar Tarefas do Dia

| Campo                  | Valor                                                        |
| ---------------------- | ------------------------------------------------------------ |
| **Intencao**           | Listar tarefas pendentes ou com prazo para hoje              |
| **Dados obrigatorios** | Nenhum (padrao: data atual)                                  |
| **Dados opcionais**    | Data especifica, projeto, responsavel                        |
| **Confirmacao**        | Nao (consulta, sem efeito colateral)                         |
| **Acao gerada**        | SELECT com filtro de data + resposta formatada               |
| **Tabela afetada**     | `tarefas` (somente leitura)                                  |
| **Role necessaria**    | `admin`, `gerente`, `lider`, `membro`                        |
| **Risco**              | Baixo (somente leitura)                                      |

---

## Regras Fundamentais

### Confirmacao Obrigatoria

Toda acao financeira ou destrutiva exige confirmacao explicita do usuario antes da execucao. Isso inclui:

- Registrar receita (comando 7)
- Registrar custo (comando 8)
- Qualquer DELETE ou UPDATE que afete dados financeiros
- Acoes que alterem status de projetos para "cancelado" ou "encerrado"

### Segredos e Dados Sensiveis

A IA **nunca expoe secrets** em nenhuma circunstancia. Isso inclui:

- Chaves de API, tokens, senhas
- Credenciais de infraestrutura
- Variaveis de ambiente
- Dados de conexao com banco

Se o usuario enviar credenciais por engano via WhatsApp, a IA deve alertar e orientar o descarte seguro da mensagem, sem armazenar o conteudo.

### Audit Log

**Toda acao gera audit log**, sem excecao. Cada registro de auditoria deve conter:

- Timestamp
- Usuario que solicitou
- Comando executado
- Tabela(s) afetada(s)
- ID(s) do(s) registro(s) afetado(s)
- Resumo da alteracao (diffs)
- Canal de origem (`whatsapp`)

### Controle de Acesso por Role

| Role      | Permissoes                                                     |
| --------- | -------------------------------------------------------------- |
| `admin`   | Todos os comandos, inclusive configuracoes e gestao de usuarios |
| `gerente` | Comandos 1-12, exceto acoes administrativas puras              |
| `lider`   | Comandos 3, 4, 5, 6, 11, 12 (operacional + consultas de equipe) |
| `membro`  | Comandos 4, 5, 6, 12 (operacional proprio + consultas basicas) |

## Diagrama de Processamento

```
Mensagem WhatsApp
        │
        ▼
┌──────────────────┐
│  NLP / STT       │  ← Interpretacao de texto, audio, documento
│  (Whisper/GPT)   │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│  Classificador   │  ← Identifica intencao e extrai entidades
│  de Intencao     │    (cliente, projeto, tarefa, financeiro)
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│  Validador de    │  ← Verifica: role do usuario, dados obrigatorios,
│  Regras          │    necessidade de confirmacao
└──────┬───────────┘
       │
       ├── Confirmacao necessaria?
       │       │
       │       ▼
       │   ┌──────────────┐
       │   │  Pede confirm │  ← IA responde no WhatsApp pedindo OK
       │   │  ao usuario   │
       │   └──────┬───────┘
       │          │
       │          ▼
       │   ┌──────────────┐
       │   │  Aguarda      │
       │   │  confirmacao  │
       │   └──────┬───────┘
       │          │
       ▼          ▼
┌──────────────────┐
│  Executor de     │  ← Executa a acao no banco de dados
│  Acao            │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│  Audit Logger    │  ← Registra audit log obrigatoriamente
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│  Painel Web      │  ← Dados atualizados visiveis no dashboard
│  (atualizado)    │
└──────────────────┘
```

## Formatos de Mensagem Aceitos

| Formato   | Suporte | Observacao                                     |
| --------- | ------- | ---------------------------------------------- |
| Texto     | Sim     | Suporte principal, linguagem natural           |
| Audio     | Sim     | Transcrito via Whisper antes da interpretacao  |
| Imagem    | Sim     | OCR para comprovantes, notas fiscais, prints   |
| Documento | Sim     | PDF, CSV, Excel -- extrai dados estruturados   |
| Video     | Nao     | MVP nao suporta; frame unico pode ser extraido |

## Resiliencia e Tratamento de Erros

- Se a IA nao conseguir identificar a intencao com confianca > 80%, pergunta ao usuario
- Se dados obrigatorios estiverem faltando, pede complemento
- Se ocorrer erro na execucao, informa o usuario com mensagem clara e registra no audit log
- Timeout de confirmacao: 15 minutos. Apos isso, a sessao de confirmacao expira
