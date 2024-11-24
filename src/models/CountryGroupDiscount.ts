// import mongoose, { Document, Model, ObjectId, Schema } from "mongoose";

// export interface IExample extends Document {
//   _id: ObjectId;
//   countryGroupId: ObjectId;
//   productId: ObjectId;
//   coupon: string | null;
//   discountPercentage: number | null;
// }

// const schema = new Schema<IExample>(
//   {
//     countryGroupId: {
//       type: mongoose.Schema.ObjectId,
//       required: true,
//       ref: "Country Groups",
//     },
//     productId: {
//       type: mongoose.Schema.ObjectId,
//       required: true,
//       ref: "Products",
//     },
//     coupon: {
//       type: String,
//     },
//     discountPercentage: {
//       type: Number,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// export const CountryGroupDiscountModel: Model<IExample> =
//   mongoose.models.Country_Group_Discount ||
//   mongoose.model<IExample>("Country_Group_Discount", schema);
