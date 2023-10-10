import { Module } from '@nestjs/common';
import { DatabaseModule } from './modules/database/database.module';
import { ConfigurationModule } from './modules/config/config.module';
import { AuthenticationModule } from './modules/authentication/authentication.module';

@Module({
  imports: [ConfigurationModule, DatabaseModule, AuthenticationModule],
})
export class AppModule {}
