import { plainToInstance, ClassConstructor } from 'class-transformer';
export class MappingUtil {
  static map<T, V>(cls: ClassConstructor<T>, plain: V[]): T[];
  static map<T, V>(cls: ClassConstructor<T>, plain: V): T;
  static map<T, V>(cls: ClassConstructor<T>, plain: V | V[]): T | T[] {
    const cleanPlain = this._preparePlain(plain);
    return plainToInstance(cls, cleanPlain as object | object[], {
      excludeExtraneousValues: true,
      enableImplicitConversion: true,
    });
  }
  private static _preparePlain(plain: unknown): unknown {
    if (Array.isArray(plain)) {
      return plain.map((item) => this._preparePlain(item));
    }
    if (plain && typeof plain === 'object') {
      const obj = plain as Record<string, unknown>;
      if (typeof obj.toObject === 'function') {
        return (obj as { toObject: () => unknown }).toObject();
      }
      if (typeof obj.toJSON === 'function') {
        return (obj as { toJSON: () => unknown }).toJSON();
      }
    }
    return plain;
  }
}
