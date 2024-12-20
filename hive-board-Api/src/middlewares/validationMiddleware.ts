import { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";
import _ from "lodash";

export function validateData(schema: z.ZodObject<any, any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {

      // Determine the data source based on content-type
      const dataToValidate = req.is("multipart/form-data")
        ? JSON.parse(req.body.data || '{}')  // Parse string to JSON object
        : req.body;

      schema.parse(dataToValidate);
      req.cleanBody = _.pick(dataToValidate, Object.keys(schema.shape));
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map((issue: any) => ({
          message: `${issue.path.join(".")} is ${issue.message}`,
        }));
        res.status(400).json({ error: "Invalid data", details: errorMessages });
      } else {
        res.status(500).json({ error: "Internal Server Error" });
      }
    }
  };
}
