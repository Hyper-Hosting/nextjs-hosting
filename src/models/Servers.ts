import { TierNames } from "@/data/subscriptionTiers";
import mongoose, { Document, Model, ObjectId, Schema } from "mongoose";

export interface IExample extends Document {
  _id: ObjectId;
  clerkUserId: string;
  name: string;
  url: string;
  tier: TierNames;
  stripeSubscriptionItemId: string;
  stripeSubscriptionId: string;
  cancel_at_period_end: boolean;
  pteroId: string,
  pteroIdentifier: string
}

const schema = new Schema<IExample>(
  {
    clerkUserId: { type: String, required: true },
    name: { type: String, required: true, default: "New Server" },
    url: { type: String, required: true },
    tier: { type: String, required: true },
    stripeSubscriptionItemId: { type: String, required: true },
    stripeSubscriptionId: { type: String, required: true },
    cancel_at_period_end: { type: Boolean, required: true, default: false },
    pteroId: { type: String },
    pteroIdentifier: { type: String },
  },
  {
    timestamps: true,
  }
);

export const ServersModel: Model<IExample> =
  mongoose.models.Servers || mongoose.model<IExample>("Servers", schema);
