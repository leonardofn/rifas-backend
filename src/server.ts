import { AppDataSource } from '@config/data-source';
import Logger from '@shared/logs/logger';
import app from './app';

const PORT = process.env.PORT ?? 3000;

Logger.logInfo('🚀 Iniciando a aplicação...');

async function bootstrap(): Promise<void> {
  await AppDataSource.initialize();
  Logger.logSuccess('✅ Conexão com Postgres estabelecida com sucesso.');
  app.listen(PORT, () => {
    Logger.logInfo(`🌐 Servidor rodando na porta ${PORT}.`);
  });
}

bootstrap().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  Logger.logError(`❌ Erro ao inicializar a aplicação: ${message}`);
  process.exit(1);
});
