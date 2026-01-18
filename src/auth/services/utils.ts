import jwt from 'jsonwebtoken';
import { FastifyRequest } from 'fastify';

const JWT_SECRET = process.env.JWT_SECRET!;

export const getUserFromRequest = (req: FastifyRequest): any | null => {
  try {
    const authHeader = req.headers.authorization || '';

    // Extrae el token del header "Authorization: Bearer <token>"
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) return null;

    // Verifica y decodifica el token
    const decoded = jwt.verify(token, JWT_SECRET);
    // Devuelve la info del usuario (payload del JWT)
    return decoded;
  } catch (error) {
    console.error(
      'Error al obtener usuario desde el request:',
      (error as Error).message
    );
    return null;
  }
};
