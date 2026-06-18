@AGENTS.md

## ⚠️ PRODUCTION SAFETY — Usuários reais ativos

### Regra geral
O FreelanceFlow está em produção com usuários reais.
Qualquer mudança mal feita pode causar perda de dados ou indisponibilidade.
Em caso de dúvida, PERGUNTE antes de implementar.

---

### Branches
- `main` = produção — NUNCA commitar diretamente
- `develop` = staging — toda feature passa por aqui antes da main
- Nomenclatura: `feat/nome`, `fix/nome`, `chore/nome`
- Abrir PR de `feat →  develop`, depois `develop → main`

---

### Banco de dados (regras críticas)
- Toda mudança de schema vai em `supabase/migrations/YYYYMMDD_descricao.sql`
- Migrações SEMPRE additive: adicionar colunas, criar tabelas, criar índices
- NUNCA usar DROP TABLE, DROP COLUMN ou RENAME sem aprovação explícita
- Colunas novas: sempre nullable ou com DEFAULT (nunca NOT NULL sem default em tabela existente)
- Renomear coluna = processo em 2 deploys: cria nova → migra dados → remove antiga
- Ordem obrigatória: aplicar migration em produção ANTES do deploy do código novo

---

### Antes de abrir PR para main
- [ ] Feature testada na preview URL do Vercel
- [ ] Migration aplicada no Supabase produção (se houver)
- [ ] T01 (login), T02 (criar proposta), T04 (rastreamento), T05 (aceitar) verificados
- [ ] Nenhum erro no console do browser ou logs do servidor

---

### Feature flags
Para mudanças grandes que afetam fluxo existente, usar flags via env var:
- Definir em `lib/flags.ts`
- Ativar via NEXT_PUBLIC_FLAG_* no painel da Vercel
- Nunca remover o código antigo antes de validar o novo com usuários reais

---

### O que NUNCA fazer sem avisar
- Mudar nome ou tipo de coluna existente
- Alterar lógica de status da proposta (enviada/vista/aceita/recusada)
- Mexer em RLS policies do Supabase
- Alterar webhook do Stripe
- Mudar o formato do token da proposta
