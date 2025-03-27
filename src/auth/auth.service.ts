import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { isDatabaseError } from 'src/common/utils/error.utils';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const { password, ...userData } = createUserDto;

      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10),
      });

      await this.userRepository.save(user);

      return {
        ...user,
        token: this.getJwt({ id: user.id }),
      };
    } catch (error) {
      this.handleDatabaseError(error, 'create user');
    }
  }

  async login(loginUserDto: LoginUserDto) {
    const user = await this.userRepository.findOne({
      where: { email: loginUserDto.email },
      select: {
        id: true,
        email: true,
        password: true,
        fullName: true,
        isActive: true,
        roles: true,
      },
    });

    if (!user) throw new UnauthorizedException('Incorrect credentials');

    const { password } = user;

    const isPasswordCorrect = bcrypt.compareSync(
      loginUserDto.password,
      password,
    );

    if (!isPasswordCorrect)
      throw new UnauthorizedException('Incorrect credentials');

    return {
      ...user,
      token: this.getJwt({ id: user.id }),
      password: undefined,
    };
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} auth ${updateUserDto.email}`;
  }

  private getJwt(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);
    return token;
  }

  private handleDatabaseError(error: unknown, message: string) {
    const isErrorDatabase = isDatabaseError(error);
    if (isErrorDatabase && error.code === '23505')
      throw new BadRequestException(JSON.stringify(error.detail));
    throw new InternalServerErrorException(`Something went wrong - ${message}`);
  }
}
