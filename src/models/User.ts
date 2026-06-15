import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  walletAddress: string;
  email: string;
  avatar?: string;
  createdAt: Date;
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  walletAddress: { type: String, required: true, unique: true, index: true },
  email: { type: String, required: true, unique: true },
  avatar: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
