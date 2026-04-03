import { Module, Global, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { MongoClient, Db } from 'mongodb';

let client: MongoClient;
let db: Db;

export const getDb = (): Db => db;
export const getClient = (): MongoClient => client;

@Global()
@Module({
  providers: [
    {
      provide: 'DATABASE_CONNECTION',
      useFactory: async () => {
        const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017';
        const dbName = process.env.DB_NAME || 'sports_miniapp';
        
        client = new MongoClient(mongoUrl);
        await client.connect();
        db = client.db(dbName);
        
        console.log('MongoDB connected');
        return db;
      },
    },
  ],
  exports: ['DATABASE_CONNECTION'],
})
export class DatabaseModule implements OnModuleDestroy {
  async onModuleDestroy() {
    if (client) {
      await client.close();
    }
  }
}
