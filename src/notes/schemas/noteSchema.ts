import { FastifySchema } from 'fastify';

export const createNoteSchema: FastifySchema = {
    body: {
        type: 'object',
        required: ['user', 'date', 'title', 'content', 'sentiment'],
        properties: {
            user: {
                type: 'string',
                minLength: 1
            },
            date: {
                type: 'string',
                format: 'date-time'
            },
            update: {
                type: 'string',
                format: 'date-time'
            },
            title: {
                type: 'string',
                minLength: 3,
                maxLength: 100
            },
            content: {
                type: 'string',
                minLength: 10
            },
            sentiment: {
                type: 'string',
                enum: [
                    'Euforia',
                    'Miedo',
                    'Aversión al riesgo',
                    'Codicia',
                    'Esperanza',
                    'Frustración',
                    'Impaciencia',
                    'Duda',
                    'Ansiedad',
                    'Culpa',
                    'Arrepentimiento',
                    'Confianza',
                    'Desesperación',
                    'Vergüenza',
                    'Autoengaño',
                    'Agotamiento mental',
                    'Desapego emocional'
                ]
            },
            tags: {
                type: 'array',
                items: {
                    type: 'string',
                    maxLength: 25
                }
            }
        }
    }
}


export const updateNoteSchema: FastifySchema = {
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'string' }
        }
    },
    body: {
        type: 'object',
        properties: {
            title: {
                type: 'string',
                minLength: 3,
                maxLength: 100
            },
            content: {
                type: 'string',
                minLength: 10
            },
            sentiment: {
                type: 'string',
                enum: [
                    'Euforia',
                    'Miedo',
                    'Aversión al riesgo',
                    'Codicia',
                    'Esperanza',
                    'Frustración',
                    'Impaciencia',
                    'Duda',
                    'Ansiedad',
                    'Culpa',
                    'Arrepentimiento',
                    'Confianza',
                    'Desesperación',
                    'Vergüenza',
                    'Autoengaño',
                    'Agotamiento mental',
                    'Desapego emocional'
                ]
            },
            tags: {
                type: 'array',
                items: {
                    type: 'string',
                    maxLength: 25
                }
            }
        }
    }
}

export const getNoteSchema: FastifySchema = {
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'string' }
        }
    }
}
