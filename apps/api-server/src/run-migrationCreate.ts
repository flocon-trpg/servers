import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MigrationService } from './migration/migration.service';

async function main() {
    const app = await NestFactory.create(AppModule);
    const migrationService = app.get(MigrationService);
    await migrationService.doMigrationCreate();
}
void main();
