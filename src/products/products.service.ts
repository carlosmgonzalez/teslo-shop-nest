import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { DataSource, Repository } from 'typeorm';
import { isDatabaseError } from 'src/common/utils/error.utils';
import { PaginationDto } from 'src/common/dto/paginationDto';
import { isUUID } from 'class-validator';
import { ProductImage } from './entities/product-image.entity';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductsServices');

  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private productImageRepository: Repository<ProductImage>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createProductDto: CreateProductDto) {
    const { images = [], ...productValues } = createProductDto;

    try {
      const product = this.productRepository.create({
        ...productValues,
        images: images.map((imageUrl) =>
          this.productImageRepository.create({ url: imageUrl }),
        ),
      });
      await this.productRepository.save(product);
      return { ...product, images };
    } catch (error: unknown) {
      this.handleExceptions(error, 'Create');
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;
    try {
      const products = await this.productRepository.find({
        skip: offset,
        take: limit,
        relations: {
          images: true,
        },
      });
      return products.map((product) => ({
        ...product,
        images: product.images?.map((img) => img.url),
      }));
    } catch (error) {
      this.handleExceptions(error, 'FindAll');
    }
  }

  async findOne(term: string) {
    let product: Product | null;

    if (isUUID(term)) {
      product = await this.productRepository.findOneBy({ id: term });
    } else {
      const query = this.productRepository.createQueryBuilder('prod');
      product = await query
        .where('LOWER(title)=:title or slug=:slug', {
          title: term.toLowerCase(),
          slug: term.toLowerCase(),
        })
        .leftJoinAndSelect('prod.images', 'prodImage')
        .getOne();
    }

    if (!product)
      throw new NotFoundException(`Product with term: {term} not found`);

    return product;
  }

  async findOnePlane(term: string) {
    const { images = [], ...rest } = await this.findOne(term);
    return { ...rest, images: images.map((img) => img.url) };
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const { images, ...toUpdate } = updateProductDto;

    const product = await this.productRepository.preload({
      id,
      ...toUpdate,
    });

    if (!product)
      throw new NotFoundException(`Product with id: ${id} not found`);

    // Create query runner:
    const query = this.dataSource.createQueryRunner();
    await query.connect();
    await query.startTransaction();

    try {
      if (images) {
        await query.manager.delete(ProductImage, { product: { id } });
        product.images = images.map((imageUrl) =>
          this.productImageRepository.create({ url: imageUrl }),
        );
      }

      await query.manager.save(product);
      await query.commitTransaction();
      await query.release();

      return await this.findOnePlane(id);
    } catch (error) {
      await query.rollbackTransaction();
      await query.release();

      this.handleExceptions(error, 'Update');
    }
  }

  async remove(id: string) {
    const result = await this.productRepository.delete({ id });

    if (result.affected === 0) {
      throw new NotFoundException(`Product with id: ${id} not found`);
    }

    return `Product with id: ${id} was successfully deleted`;
  }

  async removeAllProducts() {
    const query = this.productRepository.createQueryBuilder('product');

    try {
      return await query.delete().where({}).execute();
    } catch (error) {
      this.handleExceptions(error, 'RemoveAllProducts');
    }
  }

  private handleExceptions(error: unknown, message: string) {
    this.logger.error(error);

    const isValidError = isDatabaseError(error);
    if (isValidError && error.code === '23505')
      throw new BadRequestException(JSON.stringify(error.detail));

    if (error instanceof NotFoundException) {
      throw error;
    }

    throw new InternalServerErrorException(`Something went wrong - ${message}`);
  }
}
