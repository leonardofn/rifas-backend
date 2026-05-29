import { AppDataSource } from '@config/data-source';
import app from './app';

const PORT = process.env.PORT ?? 3000;

function log(message: string): void {
  process.stdout.write(`${message}\n`);
}

function logError(message: string): void {
  process.stderr.write(`${message}\n`);
}

async function bootstrap(): Promise<void> {
  await AppDataSource.initialize();
  log('✅ Conexão com Postgres estabelecida com sucesso.');
  app.listen(PORT, () => {
    log(`🌐 Servidor rodando na porta ${PORT}`);
  });
}

bootstrap().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  logError(`❌ Erro ao inicializar a aplicação: ${message}`);
  process.exit(1);
});
