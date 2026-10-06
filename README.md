# Plataforma E-learning & Cursos — Backend

API em Node.js (ES Modules) + Express + Prisma 7 (MySQL/MariaDB) com a **camada de serviços** isolada para ser testada com Jest.

> ⚠️ Este README ainda tem seções marcadas com `TODO` que o grupo precisa preencher (exigência da atividade).

---

## 1. Visão Geral do Sistema

<!-- TODO (grupo): escrever com as suas palavras uma breve explicação do tema. -->

### Regras de negócio implementadas (camada `src/services`)

| Service | Regra | Resultado quando viola |
|---|---|---|
| `EnrollmentService.enroll` | Turma precisa estar `OPEN` | 422 |
| | Aluno não pode já estar na turma, já ter concluído o curso, nem ter o mesmo curso ativo em outra turma | 409 |
| | **Pré-requisitos**: todos os cursos exigidos precisam estar `COMPLETED` para o aluno | 422 (lista os que faltam) |
| | **Limite de vagas**: matrículas `ACTIVE` < `max_students` | 409 |
| | E-mail de confirmação é efeito colateral: se falhar, a matrícula é mantida | — |
| `EnrollmentService.lockEnrollment` | **Trancamento**: só matrícula `ACTIVE` e do próprio aluno | 422 / 409 / 403 |
| | Só até **50%** da duração da turma (no instante exato ainda pode) | 422 |
| | No máximo **2** matrículas trancadas ao mesmo tempo | 422 |
| | Trancar libera a vaga da turma | — |
| `EnrollmentService.reactivateEnrollment` | Só matrícula `LOCKED`, turma `OPEN` e não encerrada, e precisa haver vaga de novo | 422 / 409 |
| `GradeService.launchGrade` | Nota entre 0 e 10; peso > 0; soma dos pesos ≤ 100; título não repetido; matrícula `ACTIVE` | 422 / 409 |
| `GradeService.calculateAverage` | Média **ponderada** (`Σ nota×peso / Σ peso`), arredondada em 2 casas | — |
| `CertificateService.issueCertificate` | Matrícula do aluno e não trancada; certificado ainda não emitido | 403 / 422 / 409 |
| | Soma dos pesos = 100 (sem avaliações pendentes) | 422 |
| | **Média mínima 7,0** para emitir (6,99 não emite) | 422 |
| | Emitir cria o certificado e conclui a matrícula numa transação | — |
| `CourseService.addPrerequisite` | Curso não exige a si mesmo; sem duplicidade; **sem pré-requisito circular** (direto ou indireto) | 422 / 409 |
| `ClassService` | Turma com ≥ 1 vaga e `end_date` > `start_date`; consulta de vagas livres | 422 |
| `AuthService` | E-mail único; login com mensagem única para usuário/senha inválidos | 409 / 401 |

Constantes (média mínima, % de trancamento, etc.) ficam em `src/constants/businessRules.js`.

## 2. Conceitos de Testes Aplicados

<!-- TODO (grupo): 1 parágrafo cada, escrito pelo grupo -->

### Pirâmide de Testes
### Mocks vs. Stubs
### Padrão Factory
### Princípios F.I.R.S.T.

## 3. Como Executar

### Pré-requisitos
- Node.js (LTS) e Git
- MySQL ou MariaDB rodando localmente

### Instalação
```bash
npm install
cp env.example .env      # no Windows: copy env.example .env  (e preencha os valores)
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

O Jest com ES Modules precisa da flag `--experimental-vm-modules` do Node; os scripts acima já a incluem.
Se quiser o comando puro `npx jest --coverage`, defina a variável antes:

```bash
# Linux / macOS / Git Bash
NODE_OPTIONS=--experimental-vm-modules npx jest --coverage

# Windows PowerShell
$env:NODE_OPTIONS="--experimental-vm-modules"; npx jest --coverage
```

## 4. Relatório de Resultados

<!-- TODO (grupo): colar a tabela/print da cobertura e a análise crítica dos cenários mais complexos -->

---

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

Os services **não importam o Prisma**: recebem `models`, `emailGateway`, `clock` etc. pelo construtor.
Por isso nos testes basta passar `jest.fn()` no lugar de cada dependência.

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
