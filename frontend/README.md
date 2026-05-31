# Frontend — Gestão de Compras Kingspan

Interface web para o sistema interno de gestão de solicitações de compra com fluxo de aprovação hierárquico.

## Tecnologias

- React 19 + TypeScript
- Vite
- React Router DOM
- Axios
- Context API
- React Hook Form + Zod
- react-hot-toast

## Pré-requisitos

- Node.js v18+
- Backend rodando em `http://localhost:3333`

## Instalação

```bash
npm install
```

## Rodando o projeto

Certifique-se de que o backend está rodando antes de iniciar o frontend.

```bash
npm run dev
```

Interface disponível em `http://localhost:5173`

## Variáveis de ambiente

Não são necessárias variáveis de ambiente. O Vite está configurado com proxy que redireciona automaticamente as chamadas `/api` para o backend em `http://localhost:3333`.

## Contas de exemplo

Após rodar o seed do backend (`npm run seed` dentro de `backend/`), as seguintes contas estarão disponíveis:

| Email | Senha | Perfil |
|---|---|---|
| solicitante@kingspan.com | 123456 | Solicitante |
| aprovador@kingspan.com | 123456 | Aprovador |
| senior@kingspan.com | 123456 | Aprovador Sênior |
| admin@kingspan.com | 123456 | Administrador |

## Páginas

| Rota | Descrição | Acesso |
|---|---|---|
| /login | Tela de login | Público |
| /register | Cadastro de novo usuário | Público |
| /dashboard | Painel com resumo e métricas | Autenticado |
| /requests | Listagem completa com filtros e paginação | Autenticado |
| /requests/:id | Detalhe com histórico e ações | Autenticado |

## Regras de interface por perfil

**REQUESTER**
- Vê apenas suas próprias solicitações
- Pode criar novas solicitações via modal na listagem
- Pode cancelar suas próprias solicitações com status PENDING

**APPROVER**
- Vê todas as solicitações
- Pode aprovar e rejeitar solicitações até R$ 1.000,00

**APPROVER_SENIOR**
- Vê todas as solicitações
- Pode aprovar e rejeitar solicitações até R$ 10.000,00

**ADMIN**
- Acesso total
- Pode aprovar, rejeitar e cancelar qualquer solicitação
- Vê card "Aguardando aprovação" no dashboard com atalho para pendentes

## Estrutura do projeto

```
src/
├── components/       — componentes reutilizáveis (Sidebar, StatusBadge, NewRequestModal, etc)
├── contexts/         — AuthContext com estado de autenticação
├── pages/            — páginas da aplicação
├── services/         — chamadas à API (auth, requests)
├── styles/           — CSS modular por feature
└── types/            — tipos TypeScript
```

## Decisões técnicas

- **Proxy Vite** — as chamadas de API usam `/api` como base URL. O Vite redireciona para `http://localhost:3333` em desenvolvimento, evitando problemas de CORS
- **Context API** — gerenciamento de autenticação com persistência no localStorage
- **CSS modular** — estilos separados por feature em `src/styles/` para facilitar manutenção
- **Permissões no cliente** — botões de ação são exibidos condicionalmente com base no role do usuário e no status da solicitação, espelhando as regras do backend
- **Interceptor Axios** — token JWT injetado automaticamente em todas as requisições, com redirect automático para `/login` em caso de 401
- **React Hook Form + Zod** — validação de formulários com mensagens de erro específicas por campo em tempo real
- **Modal de criação** — nova solicitação abre em modal na listagem, mantendo o contexto da página
- **Toast notifications** — feedback visual de sucesso e erro via react-hot-toast em todas as ações