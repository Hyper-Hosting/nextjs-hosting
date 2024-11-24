// import mongoose, { Document, Model, ObjectId, Schema } from "mongoose";

// export interface IExample extends Document {
//   _id: ObjectId;
//   classPrefix: string | null;
//   productId: ObjectId;
//   locationMessage: string;
//   backgroundColor: string;
//   textColor: string;
//   fontSize: string;
//   bannerContainer: string;
//   isSticky: boolean;
// }

// const schema = new Schema<IExample>(
//   {
//     classPrefix: { type: String },
//     productId: {
//       type: mongoose.Schema.ObjectId,
//       required: true,
//       unique: true,
//       ref: "Products",
//     },
//     locationMessage: {
//       type: String,
//       required: true,
//       default:
//         "Hey! It looks like you are from <b>{country}</b>. We support Parity Purchasing Power, so if you need it, use code <b>“{coupon}”</b> to get <b>{discount}%</b> off.",
//     },
//     backgroundColor: {
//       type: String,
//       required: true,
//       default: "hsl(193, 82%, 31%)",
//     },
//     textColor: {
//       type: String,
//       required: true,
//       default: "hsl(0, 0%, 100%)",
//     },
//     fontSize: {
//       type: String,
//       required: true,
//       default: "1rem",
//     },
//     bannerContainer: {
//       type: String,
//       required: true,
//       default: "body",
//     },
//     isSticky: {
//       type: Boolean,
//       required: true,
//       default: true,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// export const ProductCustomizationsModel: Model<IExample> =
//   mongoose.models.Product_Customizations ||
//   mongoose.model<IExample>("Product_Customizations", schema);
