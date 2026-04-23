# chattr — frontend

Interface de chat em tempo real para o backend chattr.

## Stack

- **React 19** + **TypeScript**
- **Vite 6**
- **Tailwind CSS v3** + **shadcn/ui** (componentes headless com Radix UI)
- **Zustand** — gerenciamento de estado (auth, chat, tema)
- **Axios** — chamadas HTTP com cookies JWT
- **socket.io-client** — mensagens em tempo real
- **react-hot-toast** — notificações
- **lucide-react** — ícones

## Estrutura

```
src/
├── components/
│   ├── ui/           # Componentes shadcn/ui (Button, Input, Dialog…)
│   ├── chat/         # Sidebar, ChatWindow, MessageBubble, MessageInput
│   └── UserAvatar.tsx
├── pages/
│   ├── LoginPage.tsx
│   ├── SignupPage.tsx
│   └── ChatPage.tsx
├── store/
│   ├── authStore.ts  # Auth + Socket.io
│   ├── chatStore.ts  # Usuários + Mensagens
│   └── themeStore.ts # Dark/light (persistido)
├── lib/
│   ├── axios.ts
│   └── utils.ts
└── types/index.ts
```

## Como rodar

```bash
# Instalar dependências
npm install

# Copiar variáveis de ambiente
cp .env.example .env

# Iniciar em desenvolvimento (requer backend na porta 5001)
npm run dev
```

## Funcionalidades

- Login / Cadastro com validação
- Lista de contatos com status online em tempo real
- Chat em tempo real via Socket.io
- Envio de imagens (base64 → Cloudinary)
- Tema dark/light persistido
- Edição de perfil (nome, bio, foto, senha)
- Exclusão de conta
- Pesquisa de contatos
