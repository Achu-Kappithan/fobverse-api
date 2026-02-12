import { plainToInstance, ClassConstructor } from 'class-transformer';

export class MappingUtil {
  /**
   * Standardized wrapper for plainToInstance with default project options.
   * @param cls The class to map to
   * @param plain The plain object or array of objects to map
   */
  static map<T, V>(cls: ClassConstructor<T>, plain: V[]): T[];
  static map<T, V>(cls: ClassConstructor<T>, plain: V): T;
  static map<T, V>(cls: ClassConstructor<T>, plain: V | V[]): T | T[] {
    // If it's a Mongoose document, convert to object first
    const cleanPlain = this._preparePlain(plain);

    return plainToInstance(cls, cleanPlain as object | object[], {
      excludeExtraneousValues: true,
      enableImplicitConversion: true,
    });
  }

  /**
   * Helper to ensure Mongoose documents or arrays of documents are converted to plain objects
   */
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
