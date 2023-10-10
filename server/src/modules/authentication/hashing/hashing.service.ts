import { Injectable } from '@nestjs/common';
import { compare, genSalt, hash } from 'bcrypt';

@Injectable()
export class HashingService {
  async hash(data: string | Buffer, salt: string): Promise<string> {
    return hash(data, salt);
  }

  compare(data: string | Buffer, encrypted: string): Promise<boolean> {
    return compare(data, encrypted);
  }

  getSalt(): Promise<string> {
    return genSalt();
  }
}
