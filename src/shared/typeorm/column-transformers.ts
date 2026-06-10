import { type ValueTransformer } from 'typeorm';

/**
 * Converte colunas `bigint` do PostgreSQL para `number`.
 * O driver `pg` retorna bigint como string para preservar precisão.
 */
export const bigintTransformer: ValueTransformer = {
  to: (value: number) => value,
  from: (value: string) => {
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? null : parsed;
  }
};

/**
 * Converte colunas `numeric`/`decimal` do PostgreSQL para `number`.
 * O driver `pg` retorna numeric como string para preservar precisão arbitrária.
 */
export const numericTransformer: ValueTransformer = {
  to: (value: number) => value,
  from: (value: string) => {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? null : parsed;
  }
};

/**
 * Converte colunas de data/hora do PostgreSQL para strings formatadas no padrão brasileiro.
 * O driver `pg` retorna timestamptz como string ISO 8601.
 */
export const dateTransformer: ValueTransformer = {
  to: (value: Date) => value,
  from: (value: string) => {
    const date = new Date(value);

    if (isNaN(date.getTime())) {
      return null;
    }

    const dataFormatada = date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    const horaFormatada = date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    return `${dataFormatada} ${horaFormatada}`;
  }
};
