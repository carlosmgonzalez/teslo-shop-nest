import { Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class FilesValidationPipe implements PipeTransform {
  transform(value: Express.Multer.File) {
    return value;
  }
}
