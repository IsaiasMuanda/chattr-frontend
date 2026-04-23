# chattr — frontend

Interface de chat em tempo real. Construída com React 19 e TypeScript, comunicação via Socket.io e design minimalista com shadcn/ui.

Parte do projecto chattr — desenvolvido para demonstrar integração de WebSockets, gestão de estado com Zustand e boas práticas de arquitectura frontend.

→ **Backend:** https://github.com/IsaiasMuanda/chattr-backend.git
→ **Demo:** https://chattr-frontend-three.vercel.app/login

---

## Funcionalidades

- Login e registo com validação
- Lista de contactos com status online em tempo real
- Mensagens instantâneas via Socket.io
- Envio de imagens
- Tema dark/light persistido
- Edição de perfil (nome, bio, foto, senha)
- Pesquisa de contactos

## Stack e decisões técnicas

| Tecnologia | Motivo da escolha |
|---|---|
| **React 19 + TypeScript** | Type safety end-to-end; detecção de erros em tempo de compilação |
| **Vite 6** | Build extremamente rápido em desenvolvimento |
| **Zustand** | Estado global simples sem boilerplate — auth, chat e tema em stores separadas |
| **socket.io-client** | Sincronização bidirecional com o backend; re-subscrição automática ao reconectar |
| **shadcn/ui + Radix UI** | Componentes acessíveis e headless; controlo total sobre o estilo |
| **Tailwind CSS** | Utilitários consistentes; sem CSS customizado excepto variáveis de tema |
| **Axios** | Instância centralizada com `withCredentials` para cookies JWT |

## Arquitectura

```
src/
├── components/
│   ├── ui/          # Componentes shadcn/ui (Button, Input, Dialog…)
│   ├── chat/        # Sidebar, ChatWindow, MessageBubble, MessageInput
│   └── UserAvatar.tsx
├── pages/           # LoginPage, SignupPage, ChatPage
├── store/           # authStore (auth + socket), chatStore, themeStore
├── lib/             # axios.ts, utils.ts
└── types/           # Tipos partilhados (User, Message)
```

A gestão de estado está dividida em três stores independentes com responsabilidades claras. O socket é inicializado dentro do `authStore` após login e partilhado com o `chatStore` via `getState()`, evitando prop drilling e re-renders desnecessários.

## Correr localmente

```bash
git clone https://github.com/IsaiasMuanda/chattr-frontend.git
cd chattr-frontend
npm install
cp .env.example .env   # preenche com o URL do backend
npm run dev
```

**Variáveis necessárias:**

```env
VITE_API_URL=http://localhost:5001/api
VITE_SOCKET_URL=http://localhost:5001
```

## Deploy

Frontend em produção no **Vercel**.

O ficheiro `vercel.json` na raiz configura o rewrite de rotas para suporte ao React Router:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

---

Feito por [Isaias Muanda](https://isaias.vercel.app)
