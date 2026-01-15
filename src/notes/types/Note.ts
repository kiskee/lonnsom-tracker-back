export interface Note {
  id: string;
  user: string;
  date: string;
  update?: string;
  title: string;
  content: string;
  sentiment: string;
  tags?: string[];
}

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

export interface UpdateNoteRequest {
  title?: string;
  content?: string;
  sentiment?: string;
  tags?: string[];
  update?: string;
}

export interface NoteResponse {
  id: string;
  user: string;
  date: string;
  update?: string;
  title: string;
  content: string;
  sentiment: string;
  tags?: string[];
}
