import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { RefreshTokenStrategy } from './strategies/refresh-token.strategy';

@Module({
  imports: [
  PrismaModule,
  JwtModule.register({}),
  PassportModule.register({ defaultStrategy: 'jwt-refresh' }),
],
  providers: [AuthService, RefreshTokenStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
