# Rifas Backend

## Estrutura de Pastas

```plain
src/
├── config/                 # Configurações globais (banco de dados, variáveis de ambiente)
│   └── data-source.ts      # Arquivo principal de conexão do TypeORM
├── controllers/            # Recebem as requisições HTTP (req, res)
│   ├── user.controller.ts
│   ├── raffle.controller.ts
│   └── ...
├── entities/               # Nossas classes TypeORM (mapeamento do banco)
│   ├── user.entity.ts
│   ├── raffle.entity.ts
│   └── ...
├── middlewares/            # Interceptadores (auth, tratamento de erros global)
│   ├── auth.middleware.ts
│   └── error.middleware.ts
├── repositories/           # Isolamento das consultas complexas ao banco
│   ├── user.repository.ts
│   ├── raffle.repository.ts
│   └── ...
├── routes/                 # Definição dos Endpoints (GET, POST, etc.)
├── services/               # Lógica de negócio (ex: criação de usuário, sorteio de rifa)
│   ├── user.service.ts
│   ├── raffle.service.ts
│   └── ...
├── shared/                 # Funções e utilitários compartilhados
├── app.ts                  # Configuração inicial do Express
└── server.ts               # Arquivo que roda o app.listen()
package.json                # Gerenciador de dependências do Node.js
tsconfig.json               # Configuração do TypeScript
```
