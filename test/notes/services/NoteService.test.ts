import { NoteService } from '../../../src/notes/services/NoteService';
import { NoteRepository } from '../../../src/notes/repository/NoteRepository';
import { CreateNoteRequest } from '../../../src/notes/dtos/createNoteDto';
import { UpdateNoteRequest } from '../../../src/notes/dtos/updateNoteDto';

jest.mock('../../../src/notes/repository/NoteRepository');

describe('NoteService', () => {
  let noteService: NoteService;
  let mockNoteRepository: jest.Mocked<NoteRepository>;

  beforeEach(() => {
    mockNoteRepository = new NoteRepository() as jest.Mocked<NoteRepository>;
    noteService = new NoteService();
    (noteService as any).noteRepository = mockNoteRepository;
  });

  describe('createNote', () => {
    it('should create a note successfully', async () => {
      const noteData: CreateNoteRequest = {
        title: 'Test Note',
        content: 'Test content',
        user: 'user123',
        date: '2024-01-01T00:00:00.000Z',
        sentiment: 'positive',
      };
      const expectedNote = {
        ...noteData,
        id: expect.any(String),
        update: expect.any(String),
      };

      mockNoteRepository.create.mockResolvedValue(expectedNote);

      const result = await noteService.createNote(noteData);

      expect(mockNoteRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          ...noteData,
          id: expect.any(String),
          update: expect.any(String),
        })
      );
      expect(result).toEqual(expectedNote);
    });
  });

  describe('getNoteById', () => {
    it('should return note when found', async () => {
      const noteId = 'note123';
      const expectedNote = {
        id: noteId,
        title: 'Test',
        content: 'Content',
        user: 'user123',
        date: '2024-01-01T00:00:00.000Z',
        sentiment: 'positive',
      };

      mockNoteRepository.findById.mockResolvedValue(expectedNote);

      const result = await noteService.getNoteById(noteId);

      expect(mockNoteRepository.findById).toHaveBeenCalledWith(noteId);
      expect(result).toEqual(expectedNote);
    });

    it('should throw error when note not found', async () => {
      const noteId = 'nonexistent';

      mockNoteRepository.findById.mockResolvedValue(null);

      await expect(noteService.getNoteById(noteId)).rejects.toThrow(
        'Nota no encontrada'
      );
    });
  });

  describe('getNotesByUserId', () => {
    it('should return notes for user', async () => {
      const userId = 'user123';
      const expectedNotes = [
        {
          id: '1',
          title: 'Note 1',
          user: userId,
          date: '2024-01-01T00:00:00.000Z',
          content: 'Content',
          sentiment: 'positive',
        },
      ];

      mockNoteRepository.findByUserId.mockResolvedValue(expectedNotes);

      const result = await noteService.getNotesByUserId(userId);

      expect(mockNoteRepository.findByUserId).toHaveBeenCalledWith(userId);
      expect(result).toEqual(expectedNotes);
    });
  });

  describe('updateNote', () => {
    it('should update note successfully', async () => {
      const noteId = 'note123';
      const updateData: UpdateNoteRequest = { title: 'Updated Title' };
      const existingNote = {
        id: noteId,
        title: 'Old Title',
        user: 'user123',
        date: '2024-01-01T00:00:00.000Z',
        content: 'Content',
        sentiment: 'positive',
      };

      mockNoteRepository.findById.mockResolvedValue(existingNote);
      mockNoteRepository.update.mockResolvedValue({});

      await noteService.updateNote(noteId, updateData);

      expect(mockNoteRepository.findById).toHaveBeenCalledWith(noteId);
      expect(mockNoteRepository.update).toHaveBeenCalledWith(
        noteId,
        expect.objectContaining({
          title: 'Updated Title',
          update: expect.any(String),
        })
      );
    });

    it('should throw error when note not found', async () => {
      const noteId = 'nonexistent';
      const updateData: UpdateNoteRequest = { title: 'Updated' };

      mockNoteRepository.findById.mockResolvedValue(null);

      await expect(noteService.updateNote(noteId, updateData)).rejects.toThrow(
        'Nota no encontrada'
      );
    });
  });

  describe('deleteNote', () => {
    it('should delete note successfully', async () => {
      const noteId = 'note123';
      const existingNote = {
        id: noteId,
        title: 'Test',
        user: 'user123',
        date: '2024-01-01T00:00:00.000Z',
        content: 'Content',
        sentiment: 'positive',
      };

      mockNoteRepository.findById.mockResolvedValue(existingNote);
      mockNoteRepository.delete.mockResolvedValue();

      await noteService.deleteNote(noteId);

      expect(mockNoteRepository.findById).toHaveBeenCalledWith(noteId);
      expect(mockNoteRepository.delete).toHaveBeenCalledWith(noteId);
    });

    it('should throw error when note not found', async () => {
      const noteId = 'nonexistent';

      mockNoteRepository.findById.mockResolvedValue(null);

      await expect(noteService.deleteNote(noteId)).rejects.toThrow(
        'Nota no encontrada'
      );
    });
  });
});
