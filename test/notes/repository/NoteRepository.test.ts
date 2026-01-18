// Mock the AWS SDK modules before any imports
const mockSend = jest.fn();

jest.mock('@aws-sdk/client-dynamodb', () => ({
  DynamoDBClient: jest.fn()
}));

jest.mock('@aws-sdk/lib-dynamodb', () => ({
  DynamoDBDocumentClient: {
    from: jest.fn(() => ({ send: mockSend }))
  },
  PutCommand: jest.fn(),
  GetCommand: jest.fn(),
  QueryCommand: jest.fn(),
  UpdateCommand: jest.fn(),
  DeleteCommand: jest.fn()
}));

import { NoteRepository } from '../../../src/notes/repository/NoteRepository';
import { CreateNoteDto } from '../../../src/notes/dtos/createNoteDto';
import { UpdateNoteDto } from '../../../src/notes/dtos/updateNoteDto';
import { PutCommand, GetCommand, QueryCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';

describe('NoteRepository', () => {
  let repository: NoteRepository;

  beforeEach(() => {
    process.env.NOTES_TABLE = 'test-notes-table';
    repository = new NoteRepository();
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a note successfully', async () => {
      const noteData = {
        user: 'user123',
        date: '2024-01-01',
        title: 'Test Note',
        content: 'Test content',
        sentiment: 'positive'
      };
      const noteDto = new CreateNoteDto(noteData);

      mockSend.mockResolvedValueOnce({});

      const result = await repository.create(noteDto);

      expect(PutCommand).toHaveBeenCalledWith({
        TableName: 'test-notes-table',
        Item: noteDto,
      });
      expect(mockSend).toHaveBeenCalled();
      expect(result).toEqual(noteDto);
    });
  });

  describe('findById', () => {
    it('should return a note when found', async () => {
      const noteId = '123';
      const mockNote = {
        id: '123',
        title: 'Test Note',
        content: 'Test content',
        user: 'user123',
        date: '2024-01-01',
        sentiment: 'positive'
      };

      mockSend.mockResolvedValueOnce({ Item: mockNote });

      const result = await repository.findById(noteId);

      expect(GetCommand).toHaveBeenCalledWith({
        TableName: 'test-notes-table',
        Key: { id: noteId },
      });
      expect(result).toEqual(mockNote);
    });

    it('should return null when note not found', async () => {
      mockSend.mockResolvedValueOnce({ Item: undefined });

      const result = await repository.findById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('findByUserId', () => {
    it('should return notes for a user', async () => {
      const userId = 'user123';
      const mockNotes = [
        { id: '1', title: 'Note 1', user: userId, date: '2024-01-01', content: 'Content 1', sentiment: 'positive' },
        { id: '2', title: 'Note 2', user: userId, date: '2024-01-02', content: 'Content 2', sentiment: 'neutral' }
      ];

      mockSend.mockResolvedValueOnce({ Items: mockNotes });

      const result = await repository.findByUserId(userId);

      expect(QueryCommand).toHaveBeenCalledWith({
        TableName: 'test-notes-table',
        IndexName: 'UserIndex',
        KeyConditionExpression: '#user = :user',
        ExpressionAttributeNames: { '#user': 'user' },
        ExpressionAttributeValues: { ':user': userId },
        ScanIndexForward: false,
      });
      expect(result).toEqual(mockNotes);
    });

    it('should return empty array when no notes found', async () => {
      mockSend.mockResolvedValueOnce({ Items: undefined });

      const result = await repository.findByUserId('user123');

      expect(result).toEqual([]);
    });
  });

  describe('update', () => {
    it('should update a note successfully', async () => {
      const noteId = '123';
      const updateData = new UpdateNoteDto({
        title: 'Updated Title',
        content: 'Updated content'
      });
      const updatedNote = { id: noteId, title: 'Updated Title', content: 'Updated content' };

      mockSend.mockResolvedValueOnce({ Attributes: updatedNote });

      const result = await repository.update(noteId, updateData);

      expect(UpdateCommand).toHaveBeenCalledWith({
        TableName: 'test-notes-table',
        Key: { id: noteId },
        UpdateExpression: expect.stringContaining('SET'),
        ExpressionAttributeNames: expect.any(Object),
        ExpressionAttributeValues: expect.any(Object),
        ReturnValues: 'ALL_NEW',
      });
      expect(result).toEqual(updatedNote);
    });

    it('should throw error when noteId is missing', async () => {
      const updateData = new UpdateNoteDto({ title: 'Test' });
      await expect(repository.update('', updateData)).rejects.toThrow(
        'noteId and updateData are required'
      );
    });

    it('should throw error when updateData has no valid fields', async () => {
      // Create object with all undefined/null values to trigger the error
      const updateData = {
        title: undefined,
        content: undefined,
        sentiment: undefined,
        tags: undefined,
        update: undefined
      } as unknown as UpdateNoteDto;
      
      await expect(repository.update('123', updateData)).rejects.toThrow(
        'No valid fields to update'
      );
    });

    it('should handle ValidationException', async () => {
      const error = new Error('Invalid field');
      error.name = 'ValidationException';
      mockSend.mockRejectedValueOnce(error);
      const updateData = new UpdateNoteDto({ title: 'Test' });

      await expect(repository.update('123', updateData)).rejects.toThrow(
        'Invalid update data: Invalid field'
      );
    });
  });

  describe('delete', () => {
    it('should delete a note successfully', async () => {
      const noteId = '123';
      mockSend.mockResolvedValueOnce({});

      await repository.delete(noteId);

      expect(DeleteCommand).toHaveBeenCalledWith({
        TableName: 'test-notes-table',
        Key: { id: noteId },
      });
      expect(mockSend).toHaveBeenCalled();
    });
  });
});