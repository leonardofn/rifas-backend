import { type ValueTransformer } from 'typeorm';

/**
 * Converte colunas `bigint` do PostgreSQL para `number`.
 * O driver `pg` retorna bigint como string para preservar precisão.
 */
export const bigintTransformer: ValueTransformer = {
  to: (value: number) => value,
  from: (value: string) => parseInt(value, 10)
};

/**
 * Converte colunas `numeric`/`decimal` do PostgreSQL para `number`.
 * O driver `pg` retorna numeric como string para preservar precisão arbitrária.
 */
export const numericTransformer: ValueTransformer = {
  to: (value: number) => value,
  from: (value: string) => parseFloat(value)
};
