import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';

import { databaseOptions } from './database-options.js';
import { InitialOrders1760000000000 } from './migrations/initial-orders.js';

const dataSource = new DataSource({
  ...databaseOptions(new ConfigService()),
  migrations: [InitialOrders1760000000000],
});
await dataSource.initialize();

try {
  await dataSource.runMigrations();
  console.log('Migrations du service Commande appliquées.');
} finally {
  await dataSource.destroy();
}
