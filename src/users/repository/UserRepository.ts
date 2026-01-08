import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand, ScanCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { User } from '../types/User';

// Initialize DynamoDB client outside constructor for reuse (AWS best practice)
const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export class UserRepository {
  private tableName: string;

  constructor() {
    this.tableName = process.env.USERS_TABLE!;
  }

  async create(user: User): Promise<User> {
    await docClient.send(new PutCommand({
      TableName: this.tableName,
      Item: user
    }));
    return user;
  }

  async findById(userId: string): Promise<User | null> {
    const result = await docClient.send(new GetCommand({
      TableName: this.tableName,
      Key: { id: userId }
    }));
    return result.Item as User || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await docClient.send(new QueryCommand({
      TableName: this.tableName,
      IndexName: 'EmailIndex',
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': email
      }
    }));
    return result.Items && result.Items.length > 0 ? result.Items[0] as User : null;
  }

  async findAll(): Promise<User[]> {
    const result = await docClient.send(new ScanCommand({
      TableName: this.tableName
    }));
    return result.Items as User[] || [];
  }

  async update(userId: string, updateData: Partial<User>): Promise<void> {
    const updateExpression: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};

    Object.keys(updateData).forEach(key => {
      updateExpression.push(`#${key} = :${key}`);
      expressionAttributeNames[`#${key}`] = key;
      expressionAttributeValues[`:${key}`] = updateData[key as keyof User];
    });

    await docClient.send(new UpdateCommand({
      TableName: this.tableName,
      Key: { id: userId },
      UpdateExpression: `SET ${updateExpression.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues
    }));
  }

  async delete(userId: string): Promise<void> {
    await docClient.send(new DeleteCommand({
      TableName: this.tableName,
      Key: { id: userId }
    }));
  }
}