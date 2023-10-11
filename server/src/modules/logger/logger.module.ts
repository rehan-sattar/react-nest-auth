import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';

@Module({
  imports: [
    PinoLoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const isDevelopmentMode = config.get<string>('NODE_ENV') === 'dev';
        const transport = isDevelopmentMode
          ? {
              target: 'pino-pretty',
              options: {
                singleLine: true,
              },
            }
          : undefined;

        return {
          pinoHttp: {
            transport,
          },
        };
      },
    }),
  ],
})
export class LoggerModule {}
