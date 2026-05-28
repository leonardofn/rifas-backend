import { Client } from 'pg';

const DB_HOST = process.env.DB_HOST ?? 'localhost';
const DB_PORT = Number(process.env.DB_PORT ?? '5432');
const DB_USER = process.env.DB_USER ?? 'postgres';
const DB_PASSWORD = process.env.DB_PASSWORD ?? 'postgres';
const DB_NAME = process.env.DB_NAME ?? 'rifas_db';
const MAX_ATTEMPTS = Number(process.env.DB_WAIT_MAX_ATTEMPTS ?? '30');
const RETRY_DELAY_MS = Number(process.env.DB_WAIT_RETRY_DELAY_MS ?? '2000');

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function canConnect(): Promise<boolean> {
  const client = new Client({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    connectionTimeoutMillis: 2000
  });

  try {
    await client.connect();
    return true;
  } catch {
    return false;
  } finally {
    await client.end().catch(() => undefined);
  }
}

async function waitForDb(): Promise<void> {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    const connected = await canConnect();
    if (connected) {
      process.stdout.write('Postgres pronto para conexao.\n');
      return;
    }

    process.stdout.write(
      `Aguardando Postgres (${attempt}/${MAX_ATTEMPTS}) em ${DB_HOST}:${DB_PORT}...\n`
    );

    await sleep(RETRY_DELAY_MS);
  }

  process.stderr.write('Nao foi possivel conectar ao Postgres dentro do tempo limite.\n');
  process.exit(1);
}

void waitForDb();
