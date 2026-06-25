import multer from 'multer';
import path from 'path';
import fs from 'fs';

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    const dir = './uploads';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    cb(null, dir);
  },
  filename: function (_req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const imageFilter = (_req, file, cb) => {
  const allowedFormats = /jpeg|jpg|png|gif|webp/;
  const validExtension = allowedFormats.test(path.extname(file.originalname).toLowerCase());
  const validMimeType = allowedFormats.test(file.mimetype);

  if (validExtension && validMimeType) {
    cb(null, true);
  } else {
    cb(new Error('File yang diunggah harus berupa gambar png, jpg, jpeg, webp, atau gif.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

export default upload;
