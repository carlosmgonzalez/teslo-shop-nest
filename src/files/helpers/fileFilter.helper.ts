export const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  callback: (error: Error | null, acceptFile: boolean) => void,
) => {
  if (!file) return callback(new Error('File is empty'), false);

  const fileType = file.mimetype.split('/')[1];
  const validTypes = ['jpg', 'jpeg', 'png', 'gif'];

  if (validTypes.includes(fileType)) return callback(null, true);

  callback(null, false);
};
