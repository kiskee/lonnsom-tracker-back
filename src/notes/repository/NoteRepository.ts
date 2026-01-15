import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  QueryCommand,
  ScanCommand,
  UpdateCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import { Note, NoteResponse } from "../types/Note";
import { CreateNoteDto } from "../dtos/createNoteDto";
import { UpdateNoteDto } from "../dtos/updateNoteDto";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export class NoteRepository {
  private tableName: string;

  constructor() {
    this.tableName = process.env.NOTES_TABLE!;
  }

  async create(note: CreateNoteDto): Promise<Note> {
    await docClient.send(
      new PutCommand({
        TableName: this.tableName,
        Item: note,
      })
    );
    return note;
  }

  async findById(noteId: string): Promise<NoteResponse | null> {
    const result = await docClient.send(
      new GetCommand({
        TableName: this.tableName,
        Key: { id: noteId },
      })
    );
    return (result.Item as NoteResponse) || null;
  }

  async findByUserId(userId: string): Promise<NoteResponse[]> {
    const result = await docClient.send(
      new QueryCommand({
        TableName: this.tableName,
        IndexName: "UserIndex",
        KeyConditionExpression: "#user = :user",
        ExpressionAttributeNames: {
          "#user": "user",
        },
        ExpressionAttributeValues: {
          ":user": userId,
        },
        ScanIndexForward: false,
      })
    );

    return (result.Items as NoteResponse[]) || [];
  }

  async update(noteId: string, updateData: UpdateNoteDto): Promise<any> {
    if (!noteId || !updateData || Object.keys(updateData).length === 0) {
      throw new Error("noteId and updateData are required");
    }

    const updateExpression: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};

    (Object.keys(updateData) as (keyof UpdateNoteDto)[]).forEach((key) => {
      if (updateData[key] !== undefined && updateData[key] !== null) {
        updateExpression.push(`#${key} = :${key}`);
        expressionAttributeNames[`#${key}`] = key;
        expressionAttributeValues[`:${key}`] = updateData[key];
      }
    });

    if (updateExpression.length === 0) {
      throw new Error("No valid fields to update");
    }

    try {
      const result = await docClient.send(
        new UpdateCommand({
          TableName: this.tableName,
          Key: { id: noteId },
          UpdateExpression: `SET ${updateExpression.join(", ")}`,
          ExpressionAttributeNames: expressionAttributeNames,
          ExpressionAttributeValues: expressionAttributeValues,
          ReturnValues: "ALL_NEW",
        })
      );

      return result.Attributes;
    } catch (error: any) {
      if (error.name === "ValidationException") {
        throw new Error(`Invalid update data: ${error.message}`);
      }
      throw error;
    }
  }

  async delete(noteId: string): Promise<void> {
    await docClient.send(
      new DeleteCommand({
        TableName: this.tableName,
        Key: { id: noteId },
      })
    );
  }
}
