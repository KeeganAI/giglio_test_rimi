import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

/** controlla e prende env */
function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value || !value.trim()) {
    throw new Error(`Errore nel file .env: ${name}`);
  }
  return value;
}

/*
https://www.prisma.io/docs/orm/overview/databases/mysql#1-install-the-dependencies
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    const adapter = new PrismaMariaDb(requireEnv('DATABASE_URL'));
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }
}
