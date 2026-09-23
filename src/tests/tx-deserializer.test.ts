import { describe, it, expect } from 'vitest';
import { inspectPantaTransaction } from '../solana/tx-deserializer';

describe('Solana Transaction Deserializer', () => {
  it('gracefully handles and flags invalid or corrupt transaction base64 strings', () => {
    const result = inspectPantaTransaction('invalid-base64-payload!!!');
    expect(result.isValid).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.numInstructions).toBe(0);
  });

  it('safely parses empty string input without crashing', () => {
    const result = inspectPantaTransaction('');
    expect(result.isValid).toBe(false);
  });
});
