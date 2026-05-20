# Operação Inicial — Softhouse Finance

Guia completo para colocar o sistema em operação pela primeira vez.

---

## 1. Pré-requisitos

Antes de começar, confirmar:

```txt
[x] Deploy ativo: https://softhouse.nanoai.com.br
[x] Supabase projeto configurado
[x] Envs configuradas no Vercel/Netlify
[x] Admin inicial criado — "Stayne Vision", aprovado 2026-05-16
[ ] Backup configurado
```

---

## 2. Ordem de Setup

Executar nesta ordem:

| # | Passo | Documento |
|---|-------|-----------|
| 1 | Validar deploy e healthcheck | Esta página |
| 2 | Criar primeiro admin | `admin-bootstrap.md` |
| 3 | Validar fluxo signup → approve | `first-run-checklist.md` §2 |
| 4 | Criar organização base | `admin-bootstrap.md` (SQL) |
| 5 | Criar usuários de teste por role | `first-run-checklist.md` §3 |
| 6 | Validar matriz de permissões | `first-run-checklist.md` §3 |
| 7 | Criar dados mínimos de teste | `first-run-checklist.md` §4 |
| 8 | Configurar Evolution (se WhatsApp) | `first-run-checklist.md` §5 |
| 9 | Validar IA Heads | `first-run-checklist.md` §6 |
| 10 | Validar notificações | `first-run-checklist.md` §7 |
| 11 | Configurar backup diário | `backup-and-restore.md` |
| 12 | Rodar smoke test semanal | `production-smoke-test.md` |

---

## 3. Validar Deploy e Healthcheck

```bash
# Healthcheck
curl -i https://softhouse.nanoai.com.br/api/health
# Esperado: HTTP 200, {"ok":true,...}

# Páginas públicas
# Verificar no navegador:
# - https://softhouse.nanoai.com.br/login
# - https://softhouse.nanoai.com.br/criar-conta
```

---

## 4. Primeiro Admin

✅ **Concluído.** Admin "Stayne Vision" cadastrado e aprovado em 2026-05-16. Organização "Softhouse" criada.

Ver [admin-bootstrap.md](admin-bootstrap.md) para referência do SQL de bootstrap (restore/reset).

Resumo do estado atual:

1. ~~Cadastrar usuário via `/criar-conta`~~ — ✅ Feito
2. ~~Executar SQL de bootstrap no Supabase SQL Editor~~ — ✅ Feito
3. Login e acesso admin — verificar com navegador

---

## 5. Primeira Organização

✅ **Concluído.** Organização "Softhouse" (slug: softhouse, id: `66b4dd11-f7eb-4b0e-9a2f-d9668ad0afac`) criada via SQL de bootstrap em 2026-05-16.

---

## 6. Aprovação de Usuários

Após o primeiro admin:

1. Usuários se cadastram via `/criar-conta`
2. Nascem com `approval_status = 'pending'`
3. Admin aprova em `/app/admin/usuarios`

**Nunca aprovar usuários diretamente via SQL após o bootstrap inicial.** Use a interface `/app/admin/usuarios`.

---

## 7. Primeiro Cliente e Projeto

1. Acessar `/app/clientes` → Criar cliente
2. Acessar `/app/projetos` → Criar projeto vinculado ao cliente
3. Preencher: nome, cliente, status, datas

---

## 8. Primeiro Registro Financeiro

1. Acessar `/app/financeiro`
2. Criar receita vinculada ao projeto
3. Criar custo vinculado ao projeto
4. Verificar KPIs e gráficos

---

## 9. Evolution API

Ver [first-run-checklist.md §5](first-run-checklist.md).

Requisitos:
- Instância Evolution ativa
- API Key e Webhook Secret gerados
- Admin/socio para configurar

---

## 10. Backup

Ver [backup-and-restore.md](backup-and-restore.md).

Após primeiro uso com dados reais:

```txt
[ ] Configurar backup diário (Supabase nativo ou pg_dump)
[ ] Executar primeiro backup manual
[ ] Agendar backup automático (GitHub Actions ou cron)
```

---

## 11. Smoke Test Semanal

Toda semana, executar:

```bash
# 1. Healthcheck
curl -i https://softhouse.nanoai.com.br/api/health

# 2. Verificar páginas públicas no navegador
# /login, /criar-conta

# 3. Login admin e verificar:
# /app/dashboard (métricas)
# /app/admin/usuarios (membros)
# /app/financeiro (KPIs)

# 4. Verificar logs (Vercel/Netlify)
# Sem erros 500, sem secrets
```

---

## 12. Contatos e Recursos

| Recurso | Link |
|---------|------|
| Produção | https://softhouse.nanoai.com.br |
| Healthcheck | https://softhouse.nanoai.com.br/api/health |
| Supabase | Dashboard > Project |
| Deploy | Vercel Dashboard |
| Backup Doc | `docs/operations/backup-and-restore.md` |
| Runbook | `docs/operations/incident-runbook.md` |
| Go-Live Checklist | `docs/operations/go-live-checklist.md` |
| Admin Bootstrap | `docs/operations/admin-bootstrap.md` |
| First-Run Checklist | `docs/operations/first-run-checklist.md` |
