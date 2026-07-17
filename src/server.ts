import { AppDataSource } from '@config/data-source';
import { AppConstants } from '@shared/constants';
import Logger from '@shared/loggers/logger';
import app from './app';

const PORT = process.env.PORT ?? AppConstants.DEFAULT_SERVER_PORT;

Logger.logInfo('🚀 Iniciando a aplicação...');

async function bootstrap(): Promise<void> {
  await AppDataSource.initialize();
  Logger.logSuccess('✅ Conexão com Postgres estabelecida com sucesso.');
  app.listen(PORT, () => {
    Logger.logInfo(`🌐 Servidor rodando na porta ${PORT}.`);
  });
}

bootstrap().catch(error => {
  const message = error instanceof Error ? error.message : String(error);
  Logger.logError(`❌ Erro ao inicializar a aplicação: ${message}`);
  process.exit(AppConstants.PROCESS_EXIT_FAILURE_CODE);
});
