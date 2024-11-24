// import mongoose, { Document, Model, ObjectId, Schema } from "mongoose";

// export interface IExample extends Document {
//   _id: ObjectId;
//   clerkUserId: string;
//   name: string;
//   url: string;
//   description: string | null;
// }

// const schema = new Schema<IExample>(
//   {
//     clerkUserId: { type: String, required: true },
//     name: { type: String, required: true },
//     url: { type: String, required: true },
//     description: { type: String },
//   },
//   {
//     timestamps: true,
//   }
// );

// export const ProductsModel: Model<IExample> =
//   mongoose.models.Products || mongoose.model<IExample>("Products", schema);
