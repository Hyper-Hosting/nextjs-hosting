"use server";

import {
  productCountryDiscountsSchema,
  productCustomizationSchema,
  productDetailsSchema,
} from "@/schemas/products";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import {
  createProduct as createProductDb,
  deleteProduct as deleteProductDb,
  updateProduct as updateProductDb,
  updateCountryDiscounts as updateCountryDiscountsDb,
  updateProductCustomization as updateProductCustomizationDb,
} from "@/server/db/products";
import { redirect } from "next/navigation";
import { canCreateProduct, canCustomizeBanner } from "../permissions";
import { ObjectId } from "mongoose";

export async function createProduct(
  unsafeData: z.infer<typeof productDetailsSchema>
): Promise<{ error: boolean; message: string } | undefined> {
  const { userId } = await auth();
  const { success, data } = productDetailsSchema.safeParse(unsafeData);
  const canCreate = await canCreateProduct(userId);

  if (!success || userId == null || !canCreate) {
    return { error: true, message: "There was an error creating your product" };
  }

  const { _id } = await createProductDb({ ...data, clerkUserId: userId });

  redirect(`/dashboard/products/${_id}/edit?tab=country`);
}

export async function updateProduct(
  _id: string,
  unsafeData: z.infer<typeof productDetailsSchema>
): Promise<{ error: boolean; message: string } | undefined> {
  const { userId } = await auth();
  const { success, data } = productDetailsSchema.safeParse(unsafeData);
  const errorMessage = "There was an error updating your product";

  if (!success || userId == null) {
    return { error: true, message: errorMessage };
  }

  const isSuccess = await updateProductDb(data, { _id, userId });

  return {
    error: !isSuccess,
    message: isSuccess ? "Product details updated" : errorMessage,
  };
}

export async function deleteProduct(_id: string) {
  const { userId } = auth();
  const errorMessage = "There was an error deleting your product";

  if (userId == null) {
    return { error: true, message: errorMessage };
  }

  const isSuccess = await deleteProductDb({ _id, userId });

  return {
    error: !isSuccess,
    message: isSuccess ? "successfully deleted your product" : errorMessage,
  };
}

export async function updateCountryDiscounts(
  _id: string,
  unsafeData: z.infer<typeof productCountryDiscountsSchema>
) {
  const { userId } = await auth();
  const { success, data } = productCountryDiscountsSchema.safeParse(unsafeData);

  if (!success || userId == null) {
    return {
      error: true,
      message: "There was an error saving your country discounts",
    };
  }

  const insert: {
    countryGroupId: string;
    productId: string;
    coupon: string;
    discountPercentage: number;
  }[] = [];
  const deleteIds: { countryGroupId: string }[] = [];

  data.groups.forEach((group) => {
    if (
      group.coupon != null &&
      group.coupon.length > 0 &&
      group.discountPercentage != null &&
      group.discountPercentage > 0
    ) {
      insert.push({
        countryGroupId: group.countryGroupId,
        coupon: group.coupon,
        discountPercentage: group.discountPercentage / 100,
        productId: _id,
      });
    } else {
      deleteIds.push({ countryGroupId: group.countryGroupId });
    }
  });

  await updateCountryDiscountsDb(deleteIds, insert, { productId: _id, userId });

  return {
    error: false,
    message: "Country discounts saved",
  };
}

export async function updateProductCustomization(
  _id: string,
  unsafeData: z.infer<typeof productCustomizationSchema>
) {
  const { userId } = await auth();
  const { success, data } = productCustomizationSchema.safeParse(unsafeData);
  const canCustomize = (await canCustomizeBanner(userId)) || true;

  if (!success || userId == null || !canCustomize) {
    return {
      error: true,
      message: "There was an error updating your banner",
    };
  }

  await updateProductCustomizationDb(data, { productId: _id, userId });

  return { error: false, message: "Banner updated" };
}
