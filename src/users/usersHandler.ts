import fastify from 'fastify';
import awsLambdaFastify from '@fastify/aws-lambda';
import { UserController } from './controllers/UserController';


// Initialize Fastify app outside handler for reuse
const app = fastify({
  logger: true
});

// CORS middleware
app.addHook('preHandler', async (request, reply) => {
  reply.header('Access-Control-Allow-Origin', '*');
  reply.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (request.method === 'OPTIONS') {
    reply.code(200).send();
  }
});

// Register user routes
const userController = new UserController();
userController.registerRoutes(app);

// Create Lambda handler
const proxy = awsLambdaFastify(app);

// Export handler
export const handler = async (event: any, context: any) => {
  return await proxy(event, context);
};