export class AppError extends Error {
    constructor(
      public message: string,
      public statusCode: number
    ) {
      super(message);
    }
  }

  export const handleError = (error: any, res: Response) => {
    console.error(error);
  
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }