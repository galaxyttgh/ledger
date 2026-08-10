// import jwt from 'jsonwebtoken';

// export const authMiddleware = (req: any, res: any, next: any) => {
//   const token = req.headers.authorization?.split(' ')[1];
  
//   if (token) {
//     try {
//       const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'primeledger_jwt_secret_2026');
//       req.userId = decoded.id;
//       req.userRole = decoded.role;
//     } catch (error) {
//       // Token invalid, continue without user
//     }
//   }
  
//   next();
// };

import jwt from 'jsonwebtoken';

export const authMiddleware = (req: any, res: any, next: any) => {
  // Public routes that don't need authentication
  const publicPaths = [
    '/api/auth/login', 
    '/api/auth/register', 
    '/api/auth/forgot-password', 
    '/api/auth/reset-password', 
    '/api/health'
  ];
  
  if (publicPaths.some(p => req.path.startsWith(p))) {
    return next();
  }

  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};