import { Module } from '@nestjs/common';
import { DatabaseModule } from './modules/database/database.module';
import { ConfigurationModule } from './modules/config/config.module';
import { AuthenticationModule } from './modules/authentication/authentication.module';
import { LoggerModule } from './modules/logger/logger.module';

@Module({
  imports: [ConfigurationModule, DatabaseModule, AuthenticationModule, LoggerModule],
})
export class AppModule {}
