import { ObjectId } from "mongoose";
import { revalidateTag, unstable_cache } from "next/cache";
import { cache } from "react";

export type ValidTags =
  | ReturnType<typeof getGlobalTag>
  | ReturnType<typeof getUserTag>
  | ReturnType<typeof getIdTag>;

export const CACHE_TAGS = {
  users: "users",
  servers: "servers",

  products: "products",
  productViews: "productViews",
  subscription: "subscription",
  countries: "countries",
  countryGroups: "countryGroups",
} as const;

export function getGlobalTag(tag: keyof typeof CACHE_TAGS) {
  return `global:${CACHE_TAGS[tag]}` as const;
}

export function getUserTag(userId: string, tag: keyof typeof CACHE_TAGS) {
  return `user:${userId}-${CACHE_TAGS[tag]}` as const;
}

export function getIdTag(_id: ObjectId | string, tag: keyof typeof CACHE_TAGS) {
  return `id:${_id}-${CACHE_TAGS[tag]}` as const;
}

export function clearFullCache() {
  revalidateTag("*");
}

export function dbCache<T extends (...args: any[]) => Promise<any>>(
  cb: Parameters<typeof unstable_cache<T>>[0],
  {
    tags,
  }: {
    tags: ValidTags[];
  }
) {
  return cache(unstable_cache<T>(cb, undefined, { tags: [...tags, "*"] }));
}

export function revalidateDbCache({
  tag,
  userId,
  _id,
}: {
  tag: keyof typeof CACHE_TAGS;
  userId?: string;
  _id?: ObjectId | string;
}) {
  revalidateTag(getGlobalTag(tag));
  if (userId != null) {
    revalidateTag(getUserTag(userId, tag));
  }
  if (_id != null) {
    revalidateTag(getIdTag(_id, tag));
  }
}
