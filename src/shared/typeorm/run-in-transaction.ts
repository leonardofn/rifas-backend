import { type EntityManager, type ObjectLiteral, type Repository } from 'typeorm';

/**
 * Executa uma função dentro de uma transação de banco de dados usando o entity manager do repositório fornecido.
 *
 * @template Entity - O tipo da entidade gerenciada pelo repositório.
 * @template R - O tipo de retorno da função transacional.
 * @param repository - O repositório TypeORM usado para acessar o entity manager.
 * @param task - Uma função assíncrona que recebe o entity manager transacional e executa operações dentro da transação.
 * @returns Uma promise que resolve com o resultado da função `task`.
 * @throws Qualquer erro lançado dentro da transação fará com que a transação seja revertida.
 */
export async function runInTransaction<Entity extends ObjectLiteral, R>(
  repository: Repository<Entity>,
  task: (entityManager: EntityManager) => Promise<R>
): Promise<R> {
  return await repository.manager.transaction(async entityManager => {
    return await task(entityManager);
  });
}
