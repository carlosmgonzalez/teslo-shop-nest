import { Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { initialData } from './data/seed-products';
import { User } from 'src/auth/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedService {
  constructor(
    private readonly productsService: ProductsService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async runSeed() {
    await this.deleteTables();

    const products = initialData.products;
    const users = initialData.users;

    const [adminUser] = await Promise.all(
      users.map((user) => {
        const userDb = this.userRepository.create({
          ...user,
          password: bcrypt.hashSync(user.password, 10),
        });
        return this.userRepository.save(userDb);
      }),
    );

    if (!adminUser) {
      throw new Error('Admin user creation failed');
    }

    await Promise.all(
      products.map((product) =>
        this.productsService.create(product, adminUser),
      ),
    );

    return 'Seed executed';
  }

  private async deleteTables() {
    await this.productsService.removeAllProducts();

    const query = this.userRepository.createQueryBuilder();
    await query.delete().where({}).execute();
  }
}
