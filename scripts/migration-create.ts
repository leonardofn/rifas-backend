import { execSync } from 'child_process';

const args = process.argv.slice(2).filter(arg => arg !== '--');
const name = args[0];

if (!name) {
  process.stderr.write('❌ Erro: O nome da migration é obrigatório.\n');
  process.stderr.write('Uso: pnpm run migration:create -- <NomeDaMigration>\n');
  process.exit(1);
}

execSync(`pnpm run typeorm migration:create src/migrations/${name}`, {
  stdio: 'inherit'
});
