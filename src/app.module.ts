import { Module } from '@nestjs/common';
import { DatabaseModule } from './modules/database/database.module';
import { ConfigurationModule } from './modules/config/config.module';

@Module({
  imports: [ConfigurationModule, DatabaseModule],
})
export class AppModule {}
