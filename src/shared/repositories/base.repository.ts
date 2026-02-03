import { Model, Document, FilterQuery, UpdateQuery, Types } from 'mongoose';
import { IBaseRepository } from '../interface/base-repository.interface';

export class BaseRepository<T extends Document> implements IBaseRepository<T> {
  constructor(private readonly model: Model<T>) {}

  async create(document: T | Partial<T>): Promise<T> {
    const createdModel = new this.model(document);
    return createdModel.save();
  }

  async findById(id: string): Promise<T | null> {
    const userId = new Types.ObjectId(id);
    const user = await this.model.findById(userId).exec();
    return user;
  }

  async findOne(filter: FilterQuery<T>): Promise<T | null> {
    return this.model.findOne(filter).exec();
  }

  async findAll(filter: FilterQuery<T> = {}): Promise<T[]> {
    return this.model.find(filter).exec();
  }

  async update(
    filter: FilterQuery<T>,
    update: UpdateQuery<T>,
  ): Promise<T | null> {
    return this.model.findOneAndUpdate(filter, update, { new: true }).exec();
  }

  async delete(filter: FilterQuery<T>): Promise<T | null> {
    return this.model.findOneAndDelete(filter).exec();
  }

  async findManyWithPagination(
    filter: FilterQuery<T> = {},
    options?: {
      limit?: number;
      skip?: number;
      sort?: Record<string, -1 | 1>;
      projection?: any;
    },
  ): Promise<{ data: T[]; total: number }> {
    const query = this.model.find(filter, options?.projection);

    if (options?.sort) {
      query.sort(options.sort);
    } else {
      query.sort({ createdAt: -1 });
    }

    if (options?.skip !== undefined) {
      query.skip(options.skip);
    }
    if (options?.limit !== undefined) {
      query.limit(options.limit);
    }

    const [data, total] = await Promise.all([
      query.exec(),
      this.model.countDocuments(filter).exec(),
    ]);

    return { data, total };
  }

  async count(filter: FilterQuery<T> = {}): Promise<number> {
    return this.model.countDocuments(filter).exec();
  }

  async aggregate(pipeline: any[]): Promise<any[]> {
    return this.model.aggregate(pipeline).exec();
  }

  async findMany(
    filter: FilterQuery<T> = {},
    options?: {
      limit?: number;
      skip?: number;
      sort?: Record<string, -1 | 1>;
      projection?: any;
    },
  ): Promise<T[]> {
    const query = this.model.find(filter, options?.projection);

    if (options?.sort) {
      query.sort(options.sort);
    }
    if (options?.skip !== undefined) {
      query.skip(options.skip);
    }
    if (options?.limit !== undefined) {
      query.limit(options.limit);
    }

    return query.exec();
  }
}
