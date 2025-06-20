import { Model, Document, FilterQuery, UpdateQuery } from 'mongoose';
import { IBaseRepository } from '../interface/base-repository.interface';

export class BaseRepository<T extends Document> implements IBaseRepository<T> {
  constructor(private readonly model: Model<T>) {}

  async create(document: T | any): Promise<T> {
    const createdModel = new this.model(document);
    return createdModel.save();
  }

  async findById(id: string): Promise<T | null> {
    return this.model.findById(id).exec();
  }

  async findOne(filter: FilterQuery<T>): Promise<T | null> {
    return this.model.findOne(filter).exec();
  }

  async findAll(filter: FilterQuery<T> = {}): Promise<T[]> {
    return this.model.find(filter).exec();
  }

  async update(filter: FilterQuery<T>, update: UpdateQuery<T>): Promise<T | null> {
    return this.model.findOneAndUpdate(filter, update, { new: true }).exec();
  }

  async delete(filter: FilterQuery<T>): Promise<T | null> {
    return this.model.findOneAndDelete(filter).exec();
  }
}