import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PlatformUsersService } from '../platform-users/platform-users.service';
import { TenantUsersService } from '../tenant-users/tenant-users.service';
import { LoginDto } from './dto/login.dto';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  name: string;
  tenantId?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: PlatformUsersService,
    private readonly tenantUsersService: TenantUsersService,
    private readonly jwtService: JwtService,
  ) {}

  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.usersService.findByEmailSafe(email.toLowerCase());
    if (user) {
      const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      await this.usersService.setResetToken(user.id, token);
      return { message: 'If that email is registered, a reset link has been sent.' };
    }
    const tenantUser = await this.tenantUsersService.findByEmail(email.toLowerCase());
    if (tenantUser) {
      const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      await this.tenantUsersService.setResetToken(tenantUser.id, token);
    }
    return { message: 'If that email is registered, a reset link has been sent.' };
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const user = await this.usersService.findByResetToken(token);
    if (user) {
      const hashed = bcrypt.hashSync(newPassword, 10);
      await this.usersService.setPassword(user.id, hashed);
      await this.usersService.clearResetToken(user.id);
      return { message: 'Password reset successfully.' };
    }
    const tenantUser = await this.tenantUsersService.findByResetToken(token);
    if (tenantUser) {
      const hashed = bcrypt.hashSync(newPassword, 10);
      await this.tenantUsersService.setPassword(tenantUser.id, hashed);
      await this.tenantUsersService.clearResetToken(tenantUser.id);
      return { message: 'Password reset successfully.' };
    }
    throw new UnauthorizedException('Invalid or expired reset token');
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{ message: string }> {
    const user = await this.usersService.findByIdWithPassword(userId);
    if (user && user.password) {
      const valid = bcrypt.compareSync(currentPassword, user.password);
      if (!valid) throw new UnauthorizedException('Current password is incorrect');
      const hashed = bcrypt.hashSync(newPassword, 10);
      await this.usersService.setPassword(user.id, hashed);
      return { message: 'Password changed successfully.' };
    }
    throw new UnauthorizedException('User not found');
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email.toLowerCase());
    if (user && user.password) {
      const valid = bcrypt.compareSync(dto.password, user.password);
      if (!valid) throw new UnauthorizedException('Invalid email or password');
      if (user.status !== 'ACTIVE') throw new UnauthorizedException('Account is not active');

      const roleMap: Record<string, string> = {
        PLATFORM_SUPER_ADMIN: 'super_admin',
        PLATFORM_ADMIN: 'platform_admin',
        PLATFORM_SUPPORT: 'operator',
      };

      const payload: JwtPayload = {
        sub: user.id,
        email: user.email,
        role: roleMap[user.roleId] ?? 'operator',
        name: `${user.firstName} ${user.lastName}`,
      };

      return {
        token: this.jwtService.sign(payload),
        user: {
          id: user.id,
          name: payload.name,
          email: user.email,
          role: payload.role,
        },
      };
    }

    // Try tenant user login
    const tenantUser = await this.tenantUsersService.findByEmail(dto.email.toLowerCase());
    if (tenantUser && tenantUser.password) {
      const valid = bcrypt.compareSync(dto.password, tenantUser.password);
      if (!valid) throw new UnauthorizedException('Invalid email or password');
      if (tenantUser.status !== 'ACTIVE') throw new UnauthorizedException('Account is not active');

      const payload: JwtPayload = {
        sub: tenantUser.id,
        email: tenantUser.email,
        role: tenantUser.roleId,
        name: `${tenantUser.firstName} ${tenantUser.lastName}`,
        tenantId: tenantUser.tenantId,
      };

      return {
        token: this.jwtService.sign(payload),
        user: {
          id: tenantUser.id,
          name: payload.name,
          email: tenantUser.email,
          role: payload.role,
          tenantId: tenantUser.tenantId,
        },
      };
    }

    throw new UnauthorizedException('Invalid email or password');
  }
}
