import { NoteRepository } from '../repository/NoteRepository';
import { CreateNoteDto, Note, CreateNoteRequest } from '../dtos/createNoteDto';
import { UpdateNoteDto, UpdateNoteRequest } from '../dtos/updateNoteDto';
import { v4 as uuidv4 } from 'uuid';

export class NoteService {
  private noteRepository: NoteRepository;

  constructor() {
    this.noteRepository = new NoteRepository();
  }

  async createNote(noteData: CreateNoteRequest): Promise<Note> {
    const timestamp = new Date().toISOString();
    const newNote: CreateNoteDto = {
      ...noteData,
      id: uuidv4(),
      update: timestamp,
    };
    return await this.noteRepository.create(newNote);
  }

  async getNoteById(noteId: string): Promise<Note> {
    const note = await this.noteRepository.findById(noteId);
    if (!note) {
      throw new Error('Nota no encontrada');
    }
    return note;
  }

  async getNotesByUserId(userId: string): Promise<Note[]> {
    return await this.noteRepository.findByUserId(userId);
  }

  async updateNote(
    noteId: string,
    updateData: UpdateNoteRequest
  ): Promise<void> {
    const existingNote = await this.noteRepository.findById(noteId);
    if (!existingNote) {
      throw new Error('Nota no encontrada');
    }

    updateData.update = new Date().toISOString();
    const updateDto = new UpdateNoteDto(updateData);
    await this.noteRepository.update(noteId, updateDto);
  }

  async deleteNote(noteId: string): Promise<void> {
    const note = await this.noteRepository.findById(noteId);
    if (!note) {
      throw new Error('Nota no encontrada');
    }
    await this.noteRepository.delete(noteId);
  }
}
