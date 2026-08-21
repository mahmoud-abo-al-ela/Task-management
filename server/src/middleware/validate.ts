import { Request, Response, NextFunction } from "express";
import { ZodType } from "zod";

export function validate(schema: ZodType) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const fields: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = String(issue.path[0]);
        if (key && !fields[key]) fields[key] = issue.message;
      }

      return res.status(400).json({
        message: Object.values(fields)[0] || "Invalid request",
        fields,
      });
    }

    req.body = result.data;
    next();
  };
}
