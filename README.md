# Rifas API

## Estrutura de Pastas

```plain
rifas-api/
├── src/
│   ├── config/            # Configurações globais (banco de dados, variáveis de ambiente)
│   │   └── data-source.ts # Arquivo principal de conexão do TypeORM
│   ├── controllers/       # Recebem as requisições HTTP (req, res)
│   │   ├── user.controller.ts
│   │   └── raffle.controller.ts
│   ├── entities/          # Nossas classes TypeORM (mapeamento do banco)
│   │   ├── user.entity.ts
│   │   ├── raffle.entity.ts
│   │   ├── plan.entity.ts
│   │   └── ...
│   ├── middlewares/       # Interceptadores (auth, tratamento de erros global)
│   │   ├── auth.middleware.ts
│   │   └── error.middleware.ts
│   ├── repositories/      # Isolamento das consultas complexas ao banco
│   │   └── raffle.repository.ts
│   ├── routes/            # Definição dos Endpoints (GET, POST, etc.)
│   │   └── index.ts       # Centraliza e exporta todas as rotas
│   ├── schemas/           # Validações do Zod (ex: UserCreateSchema)
│   ├── services/          # ONDE FICA A REGRA DE NEGÓCIO
│   │   ├── user.service.ts
│   │   └── raffle.service.ts
│   ├── app.ts             # Configuração inicial do Express
│   └── server.ts          # Arquivo que roda o app.listen()
├── package.json
└── tsconfig.json
```
