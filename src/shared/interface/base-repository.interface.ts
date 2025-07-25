import { Document, FilterQuery, UpdateQuery } from 'mongoose';

export interface IBaseRepository<T extends Document> {
  create(document: T | any): Promise<T>;
  findById(id: string): Promise<T | null>;
  findOne(filter: FilterQuery<T>): Promise<T | null>;
  findAll(filter?: FilterQuery<T>): Promise<T[]>;
  update(filter: FilterQuery<T>, update: UpdateQuery<T>): Promise<T | null>;
  delete(filter: FilterQuery<T>): Promise<T | null>;
  findManyWithPagination(filter?:FilterQuery<T>,
    Options?:{limit?:number,skip?:number,sort?:Record<string, 1|-1>,projection?:any}
  ):Promise<{data:T[];total:number}>
}
