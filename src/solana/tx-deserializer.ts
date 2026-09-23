import { VersionedTransaction } from '@solana/web3.js';

export interface DeserializedTxSummary {
  isValid: boolean;
  numSignatures: number;
  recentBlockhash: string;
  numInstructions: number;
  error?: string;
}

/**
 * Safely decodes and inspects a base64-encoded Solana VersionedTransaction from Panta's /orders/build/ API
 */
export function inspectPantaTransaction(base64Payload: string): DeserializedTxSummary {
  try {
    const rawBytes = Uint8Array.from(atob(base64Payload), c => c.charCodeAt(0));
    const tx = VersionedTransaction.deserialize(rawBytes);

    return {
      isValid: true,
      numSignatures: tx.signatures.length,
      recentBlockhash: tx.message.recentBlockhash,
      numInstructions: tx.message.compiledInstructions.length
    };
  } catch (err: any) {
    return {
      isValid: false,
      numSignatures: 0,
      recentBlockhash: 'unknown',
      numInstructions: 0,
      error: err.message
    };
  }
}
