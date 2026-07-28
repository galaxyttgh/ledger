import jwt from 'jsonwebtoken';

export const authMiddleware = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (token) {
    try {
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'primeledger_jwt_secret_2026');
      req.userId = decoded.id;
      req.userRole = decoded.role;
    } catch (error) {
      // Token invalid, continue without user
    }
  }
  
  next();
};