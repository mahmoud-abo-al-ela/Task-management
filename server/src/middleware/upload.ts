import { Request, Response, NextFunction } from "express";
import multer from "multer";

export const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2 MB

const ALLOWED_TYPES = ["image/png", "image/jpeg"];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_SIZE },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_TYPES.includes(file.mimetype)) {
      return cb(new Error("Only PNG and JPG images are allowed"));
    }
    cb(null, true);
  },
});

export function uploadImage(req: Request, res: Response, next: NextFunction) {
  upload.single("image")(req, res, (err: unknown) => {
    if (err instanceof multer.MulterError) {
      const message =
        err.code === "LIMIT_FILE_SIZE"
          ? "Image must be 2MB or smaller"
          : "Could not upload the image";

      return res.status(400).json({ message });
    }

    if (err instanceof Error) {
      return res.status(400).json({ message: err.message });
    }

    next();
  });
}
