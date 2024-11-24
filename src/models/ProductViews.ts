// import mongoose, { Document, Model, ObjectId, Schema } from "mongoose";

// export interface IExample extends Document {
//   _id: ObjectId;
//   productId: ObjectId;
//   countryId: ObjectId;
//   visitedAt: Date;
// }

// const schema = new Schema<IExample>({
//   productId: {
//     type: mongoose.Schema.ObjectId,
//     required: true,
//     unique: true,
//     ref: "Products",
//   },
//   countryId: {
//     type: mongoose.Schema.ObjectId,
//     required: true,
//     unique: true,
//     ref: "Countries",
//   },
//   visitedAt: { type: Date, required: true, default: new Date() },
// });

// export const ProductViewsModel: Model<IExample> =
//   mongoose.models.Product_Views ||
//   mongoose.model<IExample>("Product_Views", schema);
