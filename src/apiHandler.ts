import fastify from 'fastify';
import awsLambdaFastify from '@fastify/aws-lambda';
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from 'aws-lambda';
import { AuthController } from './auth/controllers/AuthController';
import { UserController } from './users/controllers/UserController';
import { NoteController } from './notes/controllers/NoteController';

// Initialize Fastify app outside handler for reuse
const app = fastify({
  logger: true,
});

// CORS middleware
app.addHook('preHandler', async (request, reply) => {
  reply.header('Access-Control-Allow-Origin', '*');
  reply.header(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS'
  );
  reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (request.method === 'OPTIONS') {
    reply.code(200).send();
  }
});

// Register all routes
const authController = new AuthController();
const userController = new UserController();
const noteController = new NoteController();

authController.registerRoutes(app);
userController.registerRoutes(app);
noteController.registerRoutes(app);

// Create Lambda handler
const proxy = awsLambdaFastify(app);

// Export handler
export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  return await proxy(event, context);
};
