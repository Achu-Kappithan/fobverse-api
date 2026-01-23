import { populatedapplicationList } from '../types/repository.types';

export interface applicationResponce<T> {
  message: string;
  data: T;
}

export interface AggregateResult {
  metadata: { total: number }[];
  data: populatedapplicationList[];
}
