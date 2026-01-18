import { CreateStrategyDto, CreateStrategyRequest } from '../../../src/strategies/dtos/createStrategy.dto';

describe('CreateStrategyDto', () => {
  it('should create CreateStrategyDto with all required fields', () => {
    const data: CreateStrategyRequest = {
      strategyName: 'Test Strategy',
      entryType: 'breakout',
      exitType: 'stop-loss',
      user: 'user123',
      date: '2024-01-01T00:00:00.000Z',
      update: '2024-01-01T12:00:00.000Z'
    };

    const dto = new CreateStrategyDto(data);

    expect(dto.strategyName).toBe('Test Strategy');
    expect(dto.entryType).toBe('breakout');
    expect(dto.exitType).toBe('stop-loss');
    expect(dto.user).toBe('user123');
    expect(dto.date).toBe('2024-01-01T00:00:00.000Z');
    expect(dto.update).toBe('2024-01-01T12:00:00.000Z');
    expect(dto.id).toBeDefined();
    expect(typeof dto.id).toBe('string');
  });

  it('should auto-generate UUID when id not provided', () => {
    const data: CreateStrategyRequest = {
      strategyName: 'Test Strategy',
      entryType: 'breakout',
      exitType: 'stop-loss',
      user: 'user123',
      date: '2024-01-01T00:00:00.000Z'
    };

    const dto = new CreateStrategyDto(data);

    expect(dto.id).toBeDefined();
    expect(dto.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  });

  it('should use provided id when given', () => {
    const customId = 'custom-strategy-id-123';
    const data: CreateStrategyRequest = {
      id: customId,
      strategyName: 'Test Strategy',
      entryType: 'breakout',
      exitType: 'stop-loss',
      user: 'user123',
      date: '2024-01-01T00:00:00.000Z'
    };

    const dto = new CreateStrategyDto(data);

    expect(dto.id).toBe(customId);
  });

  it('should handle optional update field', () => {
    const data: CreateStrategyRequest = {
      strategyName: 'Test Strategy',
      entryType: 'breakout',
      exitType: 'stop-loss',
      user: 'user123',
      date: '2024-01-01T00:00:00.000Z'
    };

    const dto = new CreateStrategyDto(data);

    expect(dto.update).toBeUndefined();
  });

  it('should preserve update field when provided', () => {
    const updateTime = '2024-01-01T12:00:00.000Z';
    const data: CreateStrategyRequest = {
      strategyName: 'Test Strategy',
      entryType: 'breakout',
      exitType: 'stop-loss',
      user: 'user123',
      date: '2024-01-01T00:00:00.000Z',
      update: updateTime
    };

    const dto = new CreateStrategyDto(data);

    expect(dto.update).toBe(updateTime);
  });
});