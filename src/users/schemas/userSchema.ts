import { FastifySchema } from 'fastify';

export const createUserSchema: FastifySchema = {
  body: {
    type: 'object',
    required: ['email', 'name'],
    properties: {
      email: { 
        type: 'string', 
        format: 'email'
      },
      email_verified: { type: 'boolean' },
      family_name: { type: 'string' },
      given_name: { type: 'string' },
      name: { 
        type: 'string'
      },
      picture: { type: 'string' },
      sub: { type: 'string' },
      password: {
        type: 'string',
        minLength: 8,
        maxLength: 50,
        pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])'
      }
    }
  },
  response: {
    201: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        email: { type: 'string' },
        email_verified: { type: 'boolean' },
        family_name: { type: 'string' },
        given_name: { type: 'string' },
        name: { type: 'string' },
        picture: { type: 'string' },
        sub: { type: 'string' },
        createdAt: { type: 'string' },
        updatedAt: { type: 'string' }
      }
    }
  }
};

export const updateUserSchema: FastifySchema = {
  params: {
    type: 'object',
    properties: {
      id: { type: 'string' }
    }
  },
  body: {
    type: 'object',
    properties: {
      email: { type: 'string', format: 'email' },
      email_verified: { type: 'boolean' },
      family_name: { type: 'string' },
      given_name: { type: 'string' },
      name: { type: 'string' },
      picture: { type: 'string' },
      sub: { type: 'string' }
    }
  }
};

export const getUserSchema: FastifySchema = {
  params: {
    type: 'object',
    properties: {
      id: { type: 'string' }
    }
  }
};

export const getUserByEmailSchema: FastifySchema = {
  params: {
    type: 'object',
    properties: {
      email: { type: 'string' }
    }
  }
};