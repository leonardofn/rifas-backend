/// <reference types="node" />

import { execSync } from 'child_process';
import readline from 'readline';

// Configura a interface de leitura do terminal
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Pergunta o nome ao usuário
rl.question(
  'Digite o nome da migration em PascalCase (ex: CreateUsers, AddEmailToUser): ',
  inputName => {
    const name = inputName.trim();

    // Validação do input
    if (!name) {
      process.stderr.write('❌ Erro: O nome é obrigatório.\n');
      rl.close();
      process.exit(1);
    }

    // Valida se o nome está em PascalCase (ex: CreateUsers, AddEmailToUser)
    if (!/^[A-Z][a-zA-Z0-9]*$/.test(name)) {
      process.stderr.write(
        '❌ Erro: O nome deve estar em PascalCase (ex: CreateUsers, AddEmailToUser).\n'
      );
      rl.close();
      process.exit(1);
    }

    try {
      // Executa o comando do TypeORM
      execSync(`pnpm run typeorm migration:create src/migrations/${name}`, { stdio: 'inherit' });
    } catch {
      process.stderr.write('❌ Erro ao executar o comando.\n');
      process.exit(1);
    } finally {
      rl.close();
    }
  }
);
