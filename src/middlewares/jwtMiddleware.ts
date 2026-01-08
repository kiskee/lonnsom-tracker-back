import { FastifyRequest, FastifyReply, RouteGenericInterface } from 'fastify';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;

export interface AuthenticatedRequest<T extends RouteGenericInterface = RouteGenericInterface> extends FastifyRequest<T> {
  user?: any;
}

export const jwtMiddleware = async (request: AuthenticatedRequest, reply: FastifyReply) => {
  const authHeader = request.headers.authorization || request.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return reply.status(401).send({ error: 'Token no proporcionado' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    request.user = decoded;
  } catch (err) {
    return reply.status(401).send({ error: 'Token inválido o expirado' });
  }
};