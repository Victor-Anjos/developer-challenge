# Backend — Gestão de Compras Kingspan

API REST para o sistema interno de gestão de solicitações de compra com fluxo de aprovação hierárquico.

## Tecnologias

- Node.js + TypeScript
- Express
- Prisma ORM v6
- PostgreSQL
- JWT (jsonwebtoken)
- bcryptjs

## Pré-requisitos

- Node.js v18+
- Docker

## Instalação

Instalar dependências e configurar variáveis de ambiente:

```bash
npm install
cp .env.example .env
```

## Variáveis de ambiente

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/kingspan"
JWT_SECRET="kingspan-secret-2026"
JWT_EXPIRES_IN="7d"
PORT=3333
```

## Banco de dados

Subir o PostgreSQL via Docker:

```bash
docker run --name kingspan-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=kingspan \
  -p 5432:5432 -d postgres
```

Rodar as migrations:

```bash
npx prisma migrate dev
```

Popular o banco com usuários de exemplo:

```bash
npm run seed
```

## Rodando com Docker Compose (alternativa)

Sobe o banco e a API automaticamente:

```bash
docker-compose up --build
```

Em outro terminal, rode as migrations e o seed:

```bash
docker-compose exec api npx prisma migrate deploy
docker-compose exec api npm run seed
```

## Rodando o projeto

```bash
npm run dev
```

Servidor disponível em `http://localhost:3333`

## Verificando se a API está rodando

```bash
curl http://localhost:3333/health
```

Resposta esperada:

```json
{ "status": "ok" }
```

## Usuários de exemplo

Após rodar o seed, os seguintes usuários estarão disponíveis:

| Email                      | Senha  | Role            |
| -------------------------- | ------ | --------------- |
| solicitante@kingspan.com   | 123456 | REQUESTER       |
| aprovador@kingspan.com     | 123456 | APPROVER        |
| senior@kingspan.com        | 123456 | APPROVER_SENIOR |
| admin@kingspan.com         | 123456 | ADMIN           |

## Endpoints

### Autenticação

| Método | Endpoint        | Descrição               | Auth |
| ------ | --------------- | ----------------------- | ---- |
| POST   | /auth/register  | Cadastrar usuário       | Não  |
| POST   | /auth/login     | Login                   | Não  |
| GET    | /auth/me        | Dados do usuário logado | Sim  |

### Solicitações

| Método | Endpoint                     | Descrição              | Auth |
| ------ | ---------------------------- | ---------------------- | ---- |
| GET    | /requests                    | Listar solicitações    | Sim  |
| POST   | /requests                    | Criar solicitação      | Sim  |
| GET    | /requests/:id                | Detalhar solicitação   | Sim  |
| PATCH  | /requests/:id/approve        | Aprovar                | Sim  |
| PATCH  | /requests/:id/reject         | Rejeitar               | Sim  |
| PATCH  | /requests/:id/cancel         | Cancelar               | Sim  |
| GET    | /requests/:id/history        | Histórico de ações     | Sim  |

### Filtros disponíveis

```
GET /requests?status=PENDING
GET /requests?page=1&limit=10
GET /requests?status=PENDING&page=1&limit=10
```

### Exemplos de payload

**POST /auth/login**

```json
{
  "email": "admin@kingspan.com",
  "password": "123456"
}
```

**POST /requests**

```json
{
  "title": "Compra de notebooks",
  "description": "Aquisição de 5 notebooks para o time de TI",
  "amount": 15000.00,
  "category": "EQUIPMENT"
}
```

**PATCH /requests/:id/approve** (ou reject, cancel)

```json
{
  "comment": "Aprovado pela diretoria"
}
```

O campo `comment` é opcional em approve, reject e cancel.

## Regras de aprovação por valor

| Valor                          | Nível   | Quem pode aprovar                            |
| ------------------------------ | ------- | -------------------------------------------- |
| Até R$ 1.000,00                | NIVEL_1 | Qualquer APPROVER, APPROVER_SENIOR ou ADMIN  |
| R$ 1.000,01 a R$ 10.000,00     | NIVEL_2 | APPROVER_SENIOR ou ADMIN                     |
| Acima de R$ 10.000,00          | NIVEL_3 | Somente ADMIN                                |

## Máquina de estados

```
PENDING → APPROVED   (APPROVER com nível compatível ou ADMIN)
PENDING → REJECTED   (APPROVER com nível compatível ou ADMIN)
PENDING → CANCELLED  (próprio REQUESTER ou ADMIN)

APPROVED  → qualquer coisa  ❌ bloqueado
REJECTED  → qualquer coisa  ❌ bloqueado
CANCELLED → qualquer coisa  ❌ bloqueado
```

Transições inválidas retornam **HTTP 422** com mensagem descritiva.

Exemplo:

```
"Não é possível aprovar uma solicitação já cancelada."
```

## Decisões técnicas

- **Máquina de estados centralizada** — todas as regras de transição ficam em `state-machine.ts`. Um único arquivo para alterar regras de negócio, sem lógica espalhada pelos controllers.
- **Decimal para valores monetários** — evita perda de precisão que ocorreria com Float.
- **Histórico em transação atômica** — atualização de status e gravação do histórico acontecem juntos. Se um falhar, nenhum persiste.
- **Aprovação por nível calculada na criação** — o `approvalLevel` é calculado automaticamente com base no valor no momento da criação da solicitação.
- **Downgrade para Prisma v6** — a versão 7 do Prisma mudou a forma de configurar o datasource, incompatível com o padrão de mercado atual. Optou-se pela v6 por estabilidade.