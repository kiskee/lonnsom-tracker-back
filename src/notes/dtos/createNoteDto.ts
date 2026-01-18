import { v4 as uuidv4 } from 'uuid';

export interface CreateNoteRequest {
  id?: string;
  user: string;
  date: string;
  update?: string;
  title: string;
  content: string;
  sentiment: string;
  tags?: string[];
}

export interface Note extends CreateNoteRequest {
  id: string;
}

export class CreateNoteDto implements Note {
  id: string;
  user: string;
  date: string;
  update?: string;
  title: string;
  content: string;
  sentiment: string;
  tags?: string[];

  constructor(data: CreateNoteRequest) {
    this.id = data.id || uuidv4();
    this.user = data.user;
    this.date = data.date;
    this.update = data.update;
    this.title = data.title;
    this.content = data.content;
    this.sentiment = data.sentiment;
    this.tags = data.tags || [];
  }
}
