// import mongoose, { Document, Model, ObjectId, Schema } from "mongoose";

// export interface IExample extends Document {
//   _id: ObjectId;
//   name: string;
//   recommendedDiscountPercentage: number | null;
// }

// const schema = new Schema<IExample>(
//   {
//     name: {
//       type: String,
//       required: true,
//       unique: true,
//     },
//     recommendedDiscountPercentage: {
//       type: Number,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// export const CountryGroupsModel: Model<IExample> =
//   mongoose.models.country_groups ||
//   mongoose.model<IExample>("country_groups", schema);
