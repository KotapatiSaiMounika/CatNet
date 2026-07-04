import multer from 'multer';
import path from 'path';
import fs from 'fs';
import ApiError from '../utils/ApiError.js';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new ApiError(400, 'Only image files (jpeg, jpg, png, webp) are allowed.'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

// ── In-memory upload for AI Match search ───────────────────────────────
// The "search by photo" flow never persists the uploaded image — only its
// embedding is computed and used for that one request (see
// aiMatch.controller.js) — so there's no need to ever write it to disk or
// Cloudinary. 10MB matches the AI service's own limit and the frontend copy.
export const uploadMemory = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

// ── Content-based verification ──────────────────────────────────────────
// multer's fileFilter above only sees the client-supplied extension and
// mimetype header, both of which are trivial to spoof (e.g. rename a
// script to photo.png). This middleware runs *after* the file has been
// written to disk and checks its actual byte signature, so a disguised
// non-image file gets rejected and deleted before it ever reaches
// Cloudinary or the database.
const SIGNATURES = [
  { type: 'jpeg', bytes: [0xff, 0xd8, 0xff] },
  { type: 'png',  bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
];

const isValidWebp = (buffer) =>
  buffer.length >= 12 &&
  buffer.toString('ascii', 0, 4) === 'RIFF' &&
  buffer.toString('ascii', 8, 12) === 'WEBP';

// Exported (not just used internally) so aiMatch.controller.js can run the
// same real-content check against an in-memory buffer, since that flow has
// no disk file for verifyImageSignature below to open.
export const matchesSignature = (buffer) =>
  SIGNATURES.some(
    (sig) =>
      buffer.length >= sig.bytes.length &&
      sig.bytes.every((byte, i) => buffer[i] === byte)
  ) || isValidWebp(buffer);

export const verifyImageSignature = (req, res, next) => {
  if (!req.file) return next();

  fs.open(req.file.path, 'r', (openErr, fd) => {
    if (openErr) return next(openErr);

    const buffer = Buffer.alloc(12);
    fs.read(fd, buffer, 0, 12, 0, (readErr) => {
      fs.close(fd, () => {});
      if (readErr) return next(readErr);

      if (!matchesSignature(buffer)) {
        fs.unlink(req.file.path, () => {});
        return next(
          new ApiError(400, 'File content does not match an allowed image type.')
        );
      }
      next();
    });
  });
};