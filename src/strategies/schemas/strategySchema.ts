import { FastifySchema } from 'fastify';

export const createStrategySchema: FastifySchema = {
  body: {
    type: 'object',
    required: ['strategyName', 'entryType', 'exitType', 'user', 'date'],
    properties: {
      strategyName: {
        type: 'string',
        minLength: 1,
      },
      entryType: {
        type: 'string',
        minLength: 1,
      },
      exitType: {
        type: 'string',
        minLength: 1,
      },
      user: {
        type: 'string',
        minLength: 1,
      },
      date: {
        type: 'string',
        format: 'date-time',
      },
      update: {
        type: 'string',
        format: 'date-time',
      },
    },
  },
};

export const updateStrategySchema: FastifySchema = {
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string' },
    },
  },
  body: {
    type: 'object',
    properties: {
      strategyName: {
        type: 'string',
        minLength: 1,
      },
      entryType: {
        type: 'string',
        minLength: 1,
      },
      exitType: {
        type: 'string',
        minLength: 1,
      },
      update: {
        type: 'string',
        format: 'date-time',
      },
    },
  },
};

export const getStrategySchema: FastifySchema = {
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string' },
    },
  },
};
