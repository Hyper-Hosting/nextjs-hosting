// import { connectToDatabase } from "@/lib/mongoose";
// import mongoose, { Document, Model, ObjectId, Schema } from "mongoose";

// export interface IExample extends Document {
//   _id: ObjectId;
//   name: string;
//   code: string;
//   countryGroupId: ObjectId;
// }

// const schema = new Schema<IExample>(
//   {
//     name: {
//       type: String,
//       required: true,
//       unique: true,
//     },
//     code: {
//       type: String,
//       required: true,
//       unique: true,
//     },
//     countryGroupId: {
//       type: mongoose.Schema.ObjectId,
//       required: true,
//       ref: "Country Groups",
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// export const CountriesModel: Model<IExample> =
//   mongoose.models.Countries || mongoose.model<IExample>("Countries", schema);
