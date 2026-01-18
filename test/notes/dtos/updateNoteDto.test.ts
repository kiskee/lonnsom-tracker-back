import { UpdateNoteDto, UpdateNoteRequest } from '../../../src/notes/dtos/updateNoteDto';

describe('UpdateNoteDto', () => {
  it('should create UpdateNoteDto with all fields', () => {
    const data: UpdateNoteRequest = {
      title: 'Updated Title',
      content: 'Updated content',
      sentiment: 'positive',
      tags: ['tag1', 'tag2'],
      update: '2024-01-01T00:00:00.000Z'
    };

    const dto = new UpdateNoteDto(data);

    expect(dto.title).toBe('Updated Title');
    expect(dto.content).toBe('Updated content');
    expect(dto.sentiment).toBe('positive');
    expect(dto.tags).toEqual(['tag1', 'tag2']);
    expect(dto.update).toBe('2024-01-01T00:00:00.000Z');
  });

  it('should create UpdateNoteDto with partial fields', () => {
    const data: UpdateNoteRequest = {
      title: 'Only Title'
    };

    const dto = new UpdateNoteDto(data);

    expect(dto.title).toBe('Only Title');
    expect(dto.content).toBeUndefined();
    expect(dto.sentiment).toBeUndefined();
    expect(dto.tags).toBeUndefined();
    expect(dto.update).toBeDefined();
    expect(typeof dto.update).toBe('string');
  });

  it('should auto-generate update timestamp when not provided', () => {
    const data: UpdateNoteRequest = {
      title: 'Test Title'
    };

    const dto = new UpdateNoteDto(data);

    expect(dto.update).toBeDefined();
    expect(new Date(dto.update)).toBeInstanceOf(Date);
  });

  it('should not set fields when they are undefined', () => {
    const data: UpdateNoteRequest = {
      title: undefined,
      content: undefined,
      sentiment: undefined,
      tags: undefined
    };

    const dto = new UpdateNoteDto(data);

    expect(dto.title).toBeUndefined();
    expect(dto.content).toBeUndefined();
    expect(dto.sentiment).toBeUndefined();
    expect(dto.tags).toBeUndefined();
    expect(dto.update).toBeDefined();
  });
});