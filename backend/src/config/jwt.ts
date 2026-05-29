import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET!;
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export function generateToken(payload: {
  sub: string;
  role: string;
  email: string;
}) {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN } as any);
}

export function verifyToken(token: string) {
  return jwt.verify(token, SECRET) as {
    sub: string;
    role: string;
    email: string;
  };
}