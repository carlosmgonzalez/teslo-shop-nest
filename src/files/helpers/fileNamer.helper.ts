import { v4 as uuid } from 'uuid';

export const fileNamer = (
  req: Express.Request,
  file: Express.Multer.File,
  callback: (error: Error | null, filename: string) => void,
) => {
  if (!file) return callback(new Error('File is empty'), '');

  const fileType = file.mimetype.split('/')[1];

  const fileName = `${uuid()}.${fileType}`;

  callback(null, fileName);
};
