import mongoose, { Document, Model, ObjectId, Schema } from "mongoose";

export interface IExample extends Document {
  _id: ObjectId;
  clerkUserId: string;
  stripeCustomerId: string | null;
  pteroId: string | null;
}

const schema = new Schema<IExample>({
  clerkUserId: {
    type: String,
    required: true,
    unique: true,
  },
  stripeCustomerId: {
    type: String,
    default: null,
  },
  pteroId: {
    type: String,
    default: null,
  },
});

export const UsersModel: Model<IExample> =
  mongoose.models.Users || mongoose.model<IExample>("Users", schema);
