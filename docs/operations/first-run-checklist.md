# First-Run Checklist — Softhouse Finance

Checklist para o primeiro uso operacional do sistema. Executar após admin bootstrap.

> **Legenda:** [x] = validado tecnicamente (build/estrutura/testes) | [ ] = requer ação manual do operador
> **Última atualização:** 2026-05-20 — Macrofase 9.9

---

## 1. Admin Bootstrap

```txt
[x] /criar-conta carrega (build + produção verificados 2026-05-20)
[x] SQL de bootstrap documentado com placeholders (admin-bootstrap.md)
[x] Cadastrar primeiro admin via /criar-conta — "Stayne Vision" (2026-05-16)
[x] Executar SQL de bootstrap no Supabase SQL Editor — executado 2026-05-16
[x] Confirmar login do admin — perfil aprovado, membership admin ativo
[ ] Confirmar acesso a /app/admin/usuarios — VERIFICAR COM NAVEGADOR
[ ] Confirmar sidebar completa (admin) — VERIFICAR COM NAVEGADOR
```

## 2. Fluxo Signup → Pending → Approve

```txt
[x] Fluxo implementado e validado via build/estrutura (2026-05-20)
[x] trigger handle_new_user cria profile com approval_status='pending'
[x] Sem organização e membership automáticos
[x] /aguardando-aprovacao em publicPaths
[x] /app/* bloqueado para pending (middleware redirect)
[ ] Criar segundo usuário teste via /criar-conta — AÇÃO MANUAL
[ ] Confirmar redirecionamento para /aguardando-aprovacao
[ ] Confirmar que /app/dashboard bloqueia (redirect /login)
[ ] Login como admin
[ ] Acessar /app/admin/usuarios
[ ] Aprovar usuário pendente (escolher role, clicar ✅)
[ ] Login como usuário aprovado
[ ] Confirmar acesso ao dashboard
[ ] Confirmar sidebar correta para o role
```

## 3. Matriz de Roles

Criar um usuário de teste para cada role e validar:

### Admin

```txt
[ ] /app/dashboard — acessa
[ ] /app/admin/usuarios — acessa
[ ] /app/configuracoes/evolution — acessa
[ ] /app/ia/resumo — acessa
[ ] /app/ia/financeiro — acessa
[ ] /app/financeiro — acessa
[ ] /app/projetos — acessa
[ ] /app/tarefas — acessa
```

### Socio

```txt
[ ] /app/dashboard — acessa
[ ] /app/admin/usuarios — NÃO acessa
[ ] /app/configuracoes/evolution — acessa
[ ] /app/ia/resumo — acessa
[ ] /app/ia/financeiro — acessa
[ ] /app/financeiro — acessa
[ ] /app/projetos — acessa
[ ] /app/tarefas — acessa
```

### Financeiro

```txt
[ ] /app/dashboard — acessa
[ ] /app/admin/usuarios — NÃO acessa
[ ] /app/configuracoes/evolution — NÃO acessa
[ ] /app/ia/resumo — NÃO acessa
[ ] /app/ia/financeiro — acessa
[ ] /app/financeiro — acessa
[ ] /app/projetos — acessa
[ ] /app/tarefas — acessa
```

### Gerente

```txt
[ ] /app/dashboard — acessa
[ ] /app/admin/usuarios — NÃO acessa
[ ] /app/configuracoes/evolution — NÃO acessa
[ ] /app/ia/resumo — NÃO acessa
[ ] /app/ia/financeiro — NÃO acessa
[ ] /app/financeiro — NÃO acessa
[ ] /app/projetos — acessa
[ ] /app/tarefas — acessa
```

### Dev

```txt
[ ] /app/dashboard — acessa
[ ] /app/admin/usuarios — NÃO acessa
[ ] /app/configuracoes/evolution — NÃO acessa
[ ] /app/ia/resumo — NÃO acessa
[ ] /app/ia/financeiro — NÃO acessa
[ ] /app/financeiro — NÃO acessa
[ ] /app/projetos — acessa (atribuídos)
[ ] /app/tarefas — acessa (atribuídas)
```

---

## 4. Dados Mínimos de Teste

### Organização

```txt
[x] Organização base criada (via bootstrap SQL) — "Softhouse" (softhouse), 2026-05-16
[x] Nome e slug corretos — id: 66b4dd11-f7eb-4b0e-9a2f-d9668ad0afac
```

### Cliente

```txt
[ ] Acessar /app/clientes
[ ] Criar primeiro cliente de teste
[ ] Nome, email, telefone preenchidos
```

### Projeto

```txt
[ ] Acessar /app/projetos
[ ] Criar primeiro projeto de teste
[ ] Vincular ao cliente criado
[ ] Definir status, datas
[ ] Abrir /app/projetos/[id] — página de detalhes
```

### Kanban / Tarefa

```txt
[ ] Acessar /app/tarefas
[ ] Criar primeira tarefa no Backlog
[ ] Mover entre colunas (drag-and-drop)
[ ] Atribuir a um usuário
[ ] Abrir detalhes da tarefa
```

### Tempo

```txt
[ ] Acessar /app/tempo
[ ] Registrar hora no projeto teste
[ ] Verificar lista de horas registradas
```

### Entrega

```txt
[ ] Acessar /app/entregas
[ ] Criar entrega vinculada ao projeto
[ ] Definir status e data prevista
```

### Financeiro

```txt
[ ] Acessar /app/financeiro
[ ] Criar receita de teste (vincular ao projeto)
[ ] Criar custo de teste (vincular ao projeto)
[ ] Verificar KPIs (receita, custo, margem)
[ ] Verificar gráfico receita vs custo
[ ] Verificar donut de custos
[ ] Acessar /app/financeiro/relatorios
```

### Infraestrutura

```txt
[ ] Acessar /app/infraestrutura
[ ] Criar recurso de teste (servidor, domínio, etc.)
```

---

## 5. Evolution API (se WhatsApp for usar)

```txt
[ ] Acessar /app/configuracoes/evolution como admin
[ ] Inserir Instance URL da instância Evolution
[ ] Inserir API Key (gerada no painel Evolution)
[ ] Inserir Webhook Secret (gerado no painel Evolution)
[ ] Salvar configuração
[ ] Verificar badge "Conectado"
[ ] Testar conexão
[ ] Enviar mensagem teste para número autorizado
[ ] Verificar log com telefone mascarado
[ ] Configurar webhook no painel Evolution:
    URL: https://softhouse.nanoai.com.br/api/webhooks/evolution?config_id=CONFIG_ID
    (CONFIG_ID está visível ao inspecionar a URL em /app/configuracoes/evolution)
[ ] Habilitar HMAC signature no webhook
[ ] Enviar evento teste do Evolution
[ ] Verificar evolution_webhook_logs
[ ] Verificar deduplicação (reenviar mesmo evento)
```

---

## 6. IA Heads

```txt
[ ] Acessar /app/ia/resumo como admin
[ ] Verificar resumo IA Head Softhouse
[ ] Acessar /app/ia/financeiro como admin
[ ] Verificar análise IA Head Financeiro
```

---

## 7. Notificações

```txt
[ ] Verificar bell icon no header
[ ] Criar ação que gere notificação (tarefa, entrega)
[ ] Verificar notificação aparece
[ ] Marcar como lida
```

---

## 8. Healthcheck

```txt
[x] curl https://softhouse.nanoai.com.br/api/health — verificado 2026-05-20
[x] HTTP 200, ok: true
[x] service: softhouse-finance, version: 0.1.0
[x] Sem secrets, sem redirect
```

---

## 9. Backup

```txt
[ ] Verificar backup nativo do Supabase (se plano suporta)
[ ] OU configurar pg_dump agendado
[ ] Primeiro backup executado
[ ] Documentar data do primeiro backup
```

---

## 10. Segurança

```txt
[x] trigger handle_new_user cria pending (verificado em 015_signup_approval.sql)
[x] Nenhum secret visível em HTML/network responses (testes 11/11)
[x] /api/health não vaza secrets (verificado 2026-05-20)
[x] Rotas /app/* bloqueiam sem login (verificado 2026-05-20)
[x] Webhook bloqueia sem HMAC — POST /api/webhooks/evolution → 401
[x] IA bloqueia sem INTERNAL_API_KEY — POST /api/ia/process-webhook → 401
```
