import { UpdateStrategyDto, UpdateStrategyRequest } from '../../../src/strategies/dtos/updateStrategy.dto';

describe('UpdateStrategyDto', () => {
  it('should create UpdateStrategyDto with all fields', () => {
    const data: UpdateStrategyRequest = {
      strategyName: 'Updated Strategy',
      entryType: 'breakout',
      exitType: 'stop-loss',
      update: '2024-01-01T00:00:00.000Z'
    };

    const dto = new UpdateStrategyDto(data);

    expect(dto.strategyName).toBe('Updated Strategy');
    expect(dto.entryType).toBe('breakout');
    expect(dto.exitType).toBe('stop-loss');
    expect(dto.update).toBe('2024-01-01T00:00:00.000Z');
  });

  it('should create UpdateStrategyDto with partial fields', () => {
    const data: UpdateStrategyRequest = {
      strategyName: 'Only Name'
    };

    const dto = new UpdateStrategyDto(data);

    expect(dto.strategyName).toBe('Only Name');
    expect(dto.entryType).toBeUndefined();
    expect(dto.exitType).toBeUndefined();
    expect(dto.update).toBeDefined();
    expect(typeof dto.update).toBe('string');
  });

  it('should auto-generate update timestamp when not provided', () => {
    const data: UpdateStrategyRequest = {
      strategyName: 'Test Strategy'
    };

    const dto = new UpdateStrategyDto(data);

    expect(dto.update).toBeDefined();
    expect(new Date(dto.update)).toBeInstanceOf(Date);
  });

  it('should not set fields when they are undefined', () => {
    const data: UpdateStrategyRequest = {
      strategyName: undefined,
      entryType: undefined,
      exitType: undefined
    };

    const dto = new UpdateStrategyDto(data);

    expect(dto.strategyName).toBeUndefined();
    expect(dto.entryType).toBeUndefined();
    expect(dto.exitType).toBeUndefined();
    expect(dto.update).toBeDefined();
  });
});