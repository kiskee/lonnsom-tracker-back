import {
  CreateNoteDto,
  CreateNoteRequest,
} from '../../../src/notes/dtos/createNoteDto';

describe('CreateNoteDto', () => {
  it('should create CreateNoteDto with all required fields', () => {
    const data: CreateNoteRequest = {
      title: 'Test Note',
      content: 'Test content',
      user: 'user123',
      date: '2024-01-01T00:00:00.000Z',
      sentiment: 'positive',
      tags: ['tag1', 'tag2'],
    };

    const dto = new CreateNoteDto(data);

    expect(dto.title).toBe('Test Note');
    expect(dto.content).toBe('Test content');
    expect(dto.user).toBe('user123');
    expect(dto.date).toBe('2024-01-01T00:00:00.000Z');
    expect(dto.sentiment).toBe('positive');
    expect(dto.tags).toEqual(['tag1', 'tag2']);
    expect(dto.id).toBeDefined();
    expect(typeof dto.id).toBe('string');
  });

  it('should auto-generate UUID when id not provided', () => {
    const data: CreateNoteRequest = {
      title: 'Test Note',
      content: 'Test content',
      user: 'user123',
      date: '2024-01-01T00:00:00.000Z',
      sentiment: 'positive',
    };

    const dto = new CreateNoteDto(data);

    expect(dto.id).toBeDefined();
    expect(dto.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );
  });

  it('should use provided id when given', () => {
    const customId = 'custom-id-123';
    const data: CreateNoteRequest = {
      id: customId,
      title: 'Test Note',
      content: 'Test content',
      user: 'user123',
      date: '2024-01-01T00:00:00.000Z',
      sentiment: 'positive',
    };

    const dto = new CreateNoteDto(data);

    expect(dto.id).toBe(customId);
  });

  it('should set empty array for tags when not provided', () => {
    const data: CreateNoteRequest = {
      title: 'Test Note',
      content: 'Test content',
      user: 'user123',
      date: '2024-01-01T00:00:00.000Z',
      sentiment: 'positive',
    };

    const dto = new CreateNoteDto(data);

    expect(dto.tags).toEqual([]);
  });

  it('should preserve update field when provided', () => {
    const updateTime = '2024-01-01T12:00:00.000Z';
    const data: CreateNoteRequest = {
      title: 'Test Note',
      content: 'Test content',
      user: 'user123',
      date: '2024-01-01T00:00:00.000Z',
      sentiment: 'positive',
      update: updateTime,
    };

    const dto = new CreateNoteDto(data);

    expect(dto.update).toBe(updateTime);
  });
});
