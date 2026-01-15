export interface UpdateNoteRequest {
    title?: string;
    content?: string;
    sentiment?: string;
    tags?: string[];
    update?: string;
}

export class UpdateNoteDto {
    title?: string;
    content?: string;
    sentiment?: string;
    tags?: string[];
    update: string;

    constructor(data: UpdateNoteRequest) {
        if (data.title) this.title = data.title;
        if (data.content) this.content = data.content;
        if (data.sentiment) this.sentiment = data.sentiment;
        if (data.tags) this.tags = data.tags;
        this.update = data.update || new Date().toISOString();
    }
}
