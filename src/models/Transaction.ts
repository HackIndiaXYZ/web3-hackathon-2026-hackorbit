import mongoose, { Schema, Document } from 'mongoose';

export interface ITransaction extends Document {
  wallet: string;
  amount: number;
  txHash: string;
  timestamp: Date;
  projectApiKey?: string;
}

const TransactionSchema: Schema = new Schema({
  wallet: { type: String, required: true, index: true },
  amount: { type: Number, required: true },
  txHash: { type: String, required: true, unique: true, index: true },
  timestamp: { type: Date, default: Date.now },
  projectApiKey: { type: String, index: true },
});

export default mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema);
