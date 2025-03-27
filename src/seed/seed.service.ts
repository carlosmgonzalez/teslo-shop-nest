import { Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { initialData } from './data/seed-products';

@Injectable()
export class SeedService {
  constructor(private readonly productsService: ProductsService) {}

  async runSeed() {
    await this.productsService.removeAllProducts();

    const products = initialData.products;

    await Promise.all(
      products.map((product) => this.productsService.create(product)),
    );

    return 'Seed executed';
  }
}
