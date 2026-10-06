# Plataforma E-learning & Cursos — Backend

API em Node.js (ES Modules) + Express + Prisma 7 (MySQL/MariaDB) com a **camada de serviços** isolada para ser testada com Jest.

> ⚠️ Este README ainda tem seções marcadas com `TODO` que o grupo precisa preencher (exigência da atividade).

---


## 3. Como Executar

### Pré-requisitos
- Node.js (LTS) e Git
- MySQL ou MariaDB rodando localmente

### Instalação
```bash
npm install
npx prisma generate
npx prisma migrate dev --name criacao_das_tabelas   # ou: npx prisma db push
npm run dev
```

> ⚠️ No `.env` use `CHAVE=valor` (com `=`). Com `:` o dotenv não lê a variável.

### Rodando os testes
```bash
npm test                 # roda a suíte
npm run test:coverage    # roda a suíte com cobertura (mínimo exigido: 80%)
```

## Arquitetura

```
server.js                     -> sobe o Express e registra as rotas
db.js                         -> conexão Prisma + MariaDB (não alterar)
src/
  routes/        -> define endpoints e middlewares (auth, role, validação)
  controllers/   -> recebe req/res e chama o service (sem regra de negócio)
  services/      -> REGRAS DE NEGÓCIO (classes com dependências injetadas)  <- alvo dos testes
  models/        -> consultas ao banco com Prisma (dependência a ser mockada)
  gateways/      -> serviços externos (e-mail simulado)
  schemas/       -> validação de entrada com Zod
  middleware/    -> authMiddleware (JWT), roleMiddleware, validateMiddleware
  constants/     -> status e regras de negócio configuráveis
  errors/        -> AppError, NotFoundError, ConflictError, BusinessRuleError, ...
  utils/         -> handleError (converte erros de domínio em status HTTP)
  container.js   -> monta os services com os models reais
tests/
  services/      -> testes unitários (a escrever)
  factories/     -> factories de dados de teste (a escrever)
```

Fluxo: `rota → (auth/validação) → controller → service → model → banco`.



## Endpoints

| Método | Rota | Acesso |
|---|---|---|
| POST | `/auth/register` · `/auth/login` | Público |
| GET | `/courses` · `/courses/:id` · `/courses/:id/prerequisites` | Público |
| POST/PUT | `/courses` · `/courses/:id` | Instrutor |
| POST/DELETE | `/courses/:id/prerequisites` · `/courses/:id/prerequisites/:requiredId` | Instrutor |
| GET | `/classes` · `/classes/:id` · `/classes/:id/availability` | Público |
| POST | `/classes` | Instrutor |
| PATCH | `/classes/:id/close` | Instrutor |
| POST | `/enrollments` | Logado |
| GET | `/enrollments/me` | Logado |
| PATCH | `/enrollments/:id/lock` · `/enrollments/:id/reactivate` | Logado (dono) |
| POST | `/grades` | Instrutor |
| GET | `/grades/enrollment/:enrollmentId` | Dono ou instrutor |
| POST | `/certificates` | Logado (dono) |
| GET | `/certificates/me` | Logado |

Enviar o token no header: `Authorization: Bearer <TOKEN>`.
