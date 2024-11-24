// import { subscriptionTiers, TierNames } from "@/data/subscriptionTiers";
// import mongoose, { Document, Model, ObjectId, Schema } from "mongoose";

// export interface IExample extends Document {
//   _id: ObjectId;
//   clerkUserId: string;
//   stripeSubscriptionItemId: string | null;
//   stripeSubscriptionId: string | null;
//   stripeCustomerId: string | null;
//   tier: TierNames;
// }

// const schema = new Schema<IExample>(
//   {
//     clerkUserId: { type: String, required: true, unique: true },
//     stripeSubscriptionItemId: { type: String },
//     stripeSubscriptionId: { type: String },
//     stripeCustomerId: { type: String },
//     tier: {
//       type: String,
//       required: true,
//       enum: Object.keys(subscriptionTiers),
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// export const UserSubscriptionsModel: Model<IExample> =
//   mongoose.models.User_Subscriptions ||
//   mongoose.model<IExample>("User_Subscriptions", schema);
