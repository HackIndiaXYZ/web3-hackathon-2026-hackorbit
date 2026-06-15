import mongoose, { Schema, Document } from 'mongoose';

export interface IProject extends Document {
  name: string;
  apiKey: string;
  owner: string; // User walletAddress or email
  createdAt: Date;
}

const ProjectSchema: Schema = new Schema({
  name: { type: String, required: true },
  apiKey: { type: String, required: true, unique: true, index: true },
  owner: { type: String, required: true, index: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);
