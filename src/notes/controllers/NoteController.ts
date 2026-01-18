import { NoteService } from '../services/NoteService';
import { FastifyRequest, FastifyReply, preHandlerHookHandler } from 'fastify';
import { jwtMiddleware } from '../../middlewares/jwtMiddleware';
import { createNoteSchema } from '../schemas/noteSchema';
import { CreateNoteRequest } from '../dtos/createNoteDto';
import { UpdateNoteRequest } from '../dtos/updateNoteDto';

export class NoteController {
  private noteService: NoteService;

  constructor() {
    this.noteService = new NoteService();
  }

  async registerRoutes(fastify: any): Promise<void> {
    // Create note
    fastify.post('/notes', {
      preHandler: jwtMiddleware as preHandlerHookHandler,
      schema: createNoteSchema,
      handler: this.createNote.bind(this),
    });

    // get note by id
    fastify.get('/notes/:id', {
      preHandler: jwtMiddleware as preHandlerHookHandler,
      handler: this.getNoteById.bind(this),
    });

    // get notes by user id
    fastify.get('/notes/user/:userId', {
      preHandler: jwtMiddleware as preHandlerHookHandler,
      handler: this.getNotesByUserId.bind(this),
    });

    // update note
    fastify.put('/notes/:id', {
      preHandler: jwtMiddleware as preHandlerHookHandler,
      handler: this.updateNote.bind(this),
    });

    // delete note
    fastify.delete('/notes/:id', {
      preHandler: jwtMiddleware as preHandlerHookHandler,
      handler: this.deleteNote.bind(this),
    });
  }

  private async createNote(
    request: FastifyRequest<{ Body: CreateNoteRequest }>,
    reply: FastifyReply
  ) {
    try {
      const note = await this.noteService.createNote(request.body);
      reply.code(201).send(note);
    } catch (error) {
      reply.code(400).send({ error: (error as Error).message });
    }
  }

  private async getNoteById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const note = await this.noteService.getNoteById(request.params.id);
      reply.code(200).send(note);
    } catch (error) {
      reply.code(404).send({ error: (error as Error).message });
    }
  }

  private async getNotesByUserId(
    request: FastifyRequest<{ Params: { userId: string } }>,
    reply: FastifyReply
  ) {
    try {
      const notes = await this.noteService.getNotesByUserId(
        request.params.userId
      );
      reply.code(200).send(notes);
    } catch (error) {
      reply.code(404).send({ error: (error as Error).message });
    }
  }

  private async updateNote(
    request: FastifyRequest<{
      Params: { id: string };
      Body: UpdateNoteRequest;
    }>,
    reply: FastifyReply
  ) {
    try {
      await this.noteService.updateNote(request.params.id, request.body);
      reply.code(200).send({ message: 'Nota actualizada correctamente' });
    } catch (error) {
      reply.code(400).send({ error: (error as Error).message });
    }
  }

  private async deleteNote(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      await this.noteService.deleteNote(request.params.id);
      reply.code(200).send({ message: 'Nota eliminada correctamente' });
    } catch (error) {
      reply.code(400).send({ error: (error as Error).message });
    }
  }
}
