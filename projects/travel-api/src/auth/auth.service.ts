import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PlatformUsersService } from '../platform-users/platform-users.service';
import { LoginDto } from './dto/login.dto';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  name: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: PlatformUsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email.toLowerCase());
    if (!user || !user.password) throw new UnauthorizedException('Invalid email or password');
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
}
