import { NoteController } from '../../../src/notes/controllers/NoteController';
import { NoteService } from '../../../src/notes/services/NoteService';
import { FastifyRequest, FastifyReply } from 'fastify';

jest.mock('../../../src/notes/services/NoteService');

describe('NoteController', () => {
  let noteController: NoteController;
  let mockNoteService: jest.Mocked<NoteService>;
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;

  beforeEach(() => {
    mockNoteService = new NoteService() as jest.Mocked<NoteService>;
    noteController = new NoteController();
    (noteController as any).noteService = mockNoteService;

    mockReply = {
      code: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };
  });

  describe('createNote', () => {
    it('should create note successfully', async () => {
      const noteData = {
        user: 'user123',
        date: '2024-01-01',
        title: 'Test Note',
        content: 'Test content',
        sentiment: 'positive',
      };
      const createdNote = { id: 'note123', ...noteData };

      mockRequest = { body: noteData };
      mockNoteService.createNote.mockResolvedValue(createdNote);

      await (noteController as any).createNote(mockRequest, mockReply);

      expect(mockNoteService.createNote).toHaveBeenCalledWith(noteData);
      expect(mockReply.code).toHaveBeenCalledWith(201);
      expect(mockReply.send).toHaveBeenCalledWith(createdNote);
    });

    it('should handle create note error', async () => {
      const noteData = { user: 'user123', title: 'Test' };
      mockRequest = { body: noteData };
      mockNoteService.createNote.mockRejectedValue(
        new Error('Creation failed')
      );

      await (noteController as any).createNote(mockRequest, mockReply);

      expect(mockReply.code).toHaveBeenCalledWith(400);
      expect(mockReply.send).toHaveBeenCalledWith({ error: 'Creation failed' });
    });
  });

  describe('getNoteById', () => {
    it('should get note by id successfully', async () => {
      const noteId = 'note123';
      const note = { id: noteId, title: 'Test Note' };

      mockRequest = { params: { id: noteId } };
      mockNoteService.getNoteById.mockResolvedValue(note as any);

      await (noteController as any).getNoteById(mockRequest, mockReply);

      expect(mockNoteService.getNoteById).toHaveBeenCalledWith(noteId);
      expect(mockReply.code).toHaveBeenCalledWith(200);
      expect(mockReply.send).toHaveBeenCalledWith(note);
    });

    it('should handle note not found', async () => {
      const noteId = 'nonexistent';
      mockRequest = { params: { id: noteId } };
      mockNoteService.getNoteById.mockRejectedValue(
        new Error('Nota no encontrada')
      );

      await (noteController as any).getNoteById(mockRequest, mockReply);

      expect(mockReply.code).toHaveBeenCalledWith(404);
      expect(mockReply.send).toHaveBeenCalledWith({
        error: 'Nota no encontrada',
      });
    });
  });

  describe('getNotesByUserId', () => {
    it('should get notes by user id successfully', async () => {
      const userId = 'user123';
      const notes = [{ id: 'note1' }, { id: 'note2' }];

      mockRequest = { params: { userId } };
      mockNoteService.getNotesByUserId.mockResolvedValue(notes as any);

      await (noteController as any).getNotesByUserId(mockRequest, mockReply);

      expect(mockNoteService.getNotesByUserId).toHaveBeenCalledWith(userId);
      expect(mockReply.code).toHaveBeenCalledWith(200);
      expect(mockReply.send).toHaveBeenCalledWith(notes);
    });

    it('should handle error getting notes by user id', async () => {
      const userId = 'user123';
      mockRequest = { params: { userId } };
      mockNoteService.getNotesByUserId.mockRejectedValue(
        new Error('User not found')
      );

      await (noteController as any).getNotesByUserId(mockRequest, mockReply);

      expect(mockReply.code).toHaveBeenCalledWith(404);
      expect(mockReply.send).toHaveBeenCalledWith({ error: 'User not found' });
    });
  });

  describe('updateNote', () => {
    it('should update note successfully', async () => {
      const noteId = 'note123';
      const updateData = { title: 'Updated Title' };

      mockRequest = { params: { id: noteId }, body: updateData };
      mockNoteService.updateNote.mockResolvedValue();

      await (noteController as any).updateNote(mockRequest, mockReply);

      expect(mockNoteService.updateNote).toHaveBeenCalledWith(
        noteId,
        updateData
      );
      expect(mockReply.code).toHaveBeenCalledWith(200);
      expect(mockReply.send).toHaveBeenCalledWith({
        message: 'Nota actualizada correctamente',
      });
    });

    it('should handle update note error', async () => {
      const noteId = 'note123';
      const updateData = { title: 'Updated Title' };

      mockRequest = { params: { id: noteId }, body: updateData };
      mockNoteService.updateNote.mockRejectedValue(new Error('Update failed'));

      await (noteController as any).updateNote(mockRequest, mockReply);

      expect(mockReply.code).toHaveBeenCalledWith(400);
      expect(mockReply.send).toHaveBeenCalledWith({ error: 'Update failed' });
    });
  });

  describe('deleteNote', () => {
    it('should delete note successfully', async () => {
      const noteId = 'note123';

      mockRequest = { params: { id: noteId } };
      mockNoteService.deleteNote.mockResolvedValue();

      await (noteController as any).deleteNote(mockRequest, mockReply);

      expect(mockNoteService.deleteNote).toHaveBeenCalledWith(noteId);
      expect(mockReply.code).toHaveBeenCalledWith(200);
      expect(mockReply.send).toHaveBeenCalledWith({
        message: 'Nota eliminada correctamente',
      });
    });

    it('should handle delete note error', async () => {
      const noteId = 'note123';

      mockRequest = { params: { id: noteId } };
      mockNoteService.deleteNote.mockRejectedValue(new Error('Delete failed'));

      await (noteController as any).deleteNote(mockRequest, mockReply);

      expect(mockReply.code).toHaveBeenCalledWith(400);
      expect(mockReply.send).toHaveBeenCalledWith({ error: 'Delete failed' });
    });
  });
});
