import { AppDataSource } from '@config/data-source';
import { type PaginatedResponse } from '@dtos/pagination.dto';
import { type CreateUserDTO, type UpdateUserDTO, type UserFiltersDTO } from '@dtos/user.dto';
import { User } from '@entities/user.entity';
import { runInTransaction } from '@shared/typeorm/run-in-transaction';
import { type DeleteResult, type Repository, type UpdateResult } from 'typeorm';

export class UsersRepository {
  private readonly ormRepository: Repository<User>;

  constructor() {
    this.ormRepository = AppDataSource.getRepository(User);
  }

  async create(data: CreateUserDTO): Promise<User> {
    return await runInTransaction(this.ormRepository, async manager => {
      const user = manager.create(User, {
        name: data.name,
        email: data.email,
        password: data.password
      });

      return await manager.save(user);
    });
  }

  async findById(id: number): Promise<User | null> {
    return await this.ormRepository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.ormRepository.findOne({ where: { email } });
  }

  async findByEmailWithCredentials(email: string): Promise<User | null> {
    return await this.ormRepository
      .createQueryBuilder('user')
      .addSelect(['user.password', 'user.refreshTokenHash', 'user.refreshTokenExpiresAt'])
      .where('user.email = :email', { email })
      .getOne();
  }

  async findByIdWithRefreshToken(id: number): Promise<User | null> {
    return await this.ormRepository
      .createQueryBuilder('user')
      .addSelect(['user.refreshTokenHash', 'user.refreshTokenExpiresAt'])
      .where('user.id = :id', { id })
      .getOne();
  }

  async findPaginated(
    page: number = 1,
    limit: number = 12,
    filters?: UserFiltersDTO
  ): Promise<PaginatedResponse<User>> {
    const query = this.ormRepository.createQueryBuilder('user');

    if (filters?.search) {
      query.andWhere('(user.name ILIKE :search OR user.email ILIKE :search)', {
        search: `%${filters.search}%`
      });
    }

    query.skip((page - 1) * limit).take(limit);
    query.orderBy('user.created_at', 'DESC');

    const [data, total] = await query.getManyAndCount();

    return {
      items: data,
      totalItems: total,
      itemCount: data.length,
      currentPage: page,
      itemsPerPage: limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async update(id: number, data: UpdateUserDTO): Promise<UpdateResult> {
    return await runInTransaction(this.ormRepository, async manager => {
      return await manager.update(User, id, data);
    });
  }

  async updateRefreshToken(
    id: number,
    refreshTokenHash: string,
    refreshTokenExpiresAt: Date
  ): Promise<UpdateResult> {
    return await runInTransaction(this.ormRepository, async manager => {
      return await manager.update(User, id, {
        refreshTokenHash,
        refreshTokenExpiresAt
      });
    });
  }

  async clearRefreshToken(id: number): Promise<UpdateResult> {
    return await runInTransaction(this.ormRepository, async manager => {
      return await manager.update(User, id, {
        refreshTokenHash: null,
        refreshTokenExpiresAt: null
      });
    });
  }

  async delete(id: number): Promise<DeleteResult> {
    return await runInTransaction(this.ormRepository, async manager => {
      return await manager.delete(User, { id });
    });
  }
}
