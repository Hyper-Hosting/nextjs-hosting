/**

import {
  CACHE_TAGS,
  dbCache,
  getGlobalTag,
  getIdTag,
  getUserTag,
  revalidateDbCache,
} from "@/lib/cache";
import { connectToDatabase } from "@/lib/mongoose";
import { removeTrailingSlash } from "@/lib/utils";
import { CountriesModel } from "@/models/Countries";
import { CountryGroupDiscountModel } from "@/models/CountryGroupDiscount";
import { CountryGroupsModel } from "@/models/CountryGroups";
import { ProductCustomizationsModel } from "@/models/ProductCustomization";
import { ProductsModel } from "@/models/Products";

export function getProductCountryGroups({
  productId,
  userId,
}: {
  productId: string;
  userId: string;
}) {
  const cacheFn = dbCache(getProductCountryGroupsInternal, {
    tags: [
      getIdTag(productId, CACHE_TAGS.products),
      getGlobalTag(CACHE_TAGS.countries),
      getGlobalTag(CACHE_TAGS.countryGroups),
    ],
  });

  return cacheFn({ productId, userId });
}

export function getProductCustomization({
  productId,
  userId,
}: {
  productId: string;
  userId: string;
}) {
  const cacheFn = dbCache(getProductCustomizationInternal, {
    tags: [getIdTag(productId, CACHE_TAGS.products)],
  });

  return cacheFn({ productId, userId });
}

export function getProducts(
  userId: string,
  { limit }: { limit?: number } = {}
) {
  const cacheFn = dbCache(getProductsInternal, {
    tags: [getUserTag(userId, CACHE_TAGS.products)],
  });

  return cacheFn(userId, { limit });
}

export function getProduct({ _id, userId }: { _id: string; userId: string }) {
  const cacheFn = dbCache(getProductInternal, {
    tags: [getIdTag(_id, CACHE_TAGS.products)],
  });

  return cacheFn({ _id, userId });
}

export function getProductCount(userId: string) {
  const cacheFn = dbCache(getProductCountInternal, {
    tags: [getUserTag(userId, CACHE_TAGS.products)],
  });

  return cacheFn(userId);
}

export function getProductForBanner({
  _id,
  countryCode,
  url,
}: {
  _id: string;
  countryCode: string;
  url: string;
}) {
  console.log(_id, countryCode, url);
  return {
    product: null,
    discount: null,
    country: null,
  };

  // const cacheFn = dbCache(getProductForBannerInternal, {
  //   tags: [
  //     getIdTag(_id, CACHE_TAGS.products),
  //     getGlobalTag(CACHE_TAGS.countries),
  //     getGlobalTag(CACHE_TAGS.countryGroups),
  //   ],
  // });

  // return cacheFn({
  //   _id,
  //   countryCode,
  //   url,
  // });
}

export async function createProduct(data: typeof ProductsModel.schema.obj) {
  await connectToDatabase();

  const newProduct = await new ProductsModel(data).save();

  try {
    await new ProductCustomizationsModel({
      productId: newProduct._id,
    }).save();
  } catch (e) {
    console.error(e);
    await ProductsModel.findByIdAndDelete(newProduct._id);
  }

  revalidateDbCache({
    tag: CACHE_TAGS.products,
    userId: newProduct.clerkUserId,
    _id: newProduct._id,
  });

  return newProduct;
}

export async function updateProduct(
  data: Partial<(typeof ProductsModel)["schema"]["obj"]>,
  { _id, userId }: { _id: string; userId: string }
) {
  await connectToDatabase();

  const result = await ProductsModel.findOneAndUpdate(
    {
      clerkUserId: userId,
      _id,
    },
    {
      $set: data,
    }
  );

  if (result != null) {
    revalidateDbCache({
      tag: CACHE_TAGS.products,
      userId,
      _id: result._id,
    });
  }

  return result ? true : false;
}

export async function deleteProduct({
  _id,
  userId,
}: {
  _id: string;
  userId: string;
}) {
  await connectToDatabase();

  const result = await ProductsModel.deleteOne({
    clerkUserId: userId,
    _id,
  });

  if (result.deletedCount > 0) {
    await ProductCustomizationsModel.deleteOne({
      productId: _id,
    });

    revalidateDbCache({
      tag: CACHE_TAGS.products,
      userId,
      _id,
    });
  }

  return result.deletedCount > 0;
}

export async function updateCountryDiscounts(
  deleteGroup: { countryGroupId: string }[],
  insertGroup: Partial<(typeof CountryGroupDiscountModel.schema.obj)[]>,
  { productId, userId }: { productId: string; userId: string }
) {
  await connectToDatabase();

  const product = await getProduct({ _id: productId, userId });
  if (product == null) return false;

  const statements = [];

  if (deleteGroup.length > 0) {
    const countryGroupIds = deleteGroup.map((group) => group.countryGroupId);

    statements.push(
      CountryGroupDiscountModel.deleteMany({
        productId,
        countryGroupId: { $in: countryGroupIds },
      })
    );
  }

  if (insertGroup.length > 0) {
    for (const group of insertGroup) {
      statements.push(
        CountryGroupDiscountModel.updateOne(
          {
            productId: group?.productId,
            countryGroupId: group?.countryGroupId,
          },
          {
            coupon: group?.coupon,
            discountPercentage: group?.discountPercentage,
          },
          {
            upsert: true,
          }
        )
      );
    }
  }

  if (statements.length > 0) {
    await Promise.all(statements);
  }

  revalidateDbCache({
    tag: CACHE_TAGS.products,
    userId,
    _id: productId,
  });
}

export async function updateProductCustomization(
  data: Partial<typeof ProductCustomizationsModel.schema.obj>,
  {
    productId,
    userId,
  }: {
    productId: string;
    userId: string;
  }
) {
  await connectToDatabase();

  const product = await getProduct({ _id: productId, userId });
  if (product == null) return;

  await ProductCustomizationsModel.findOneAndUpdate(
    {
      productId,
    },
    {
      $set: data,
    }
  );

  revalidateDbCache({
    tag: CACHE_TAGS.products,
    userId,
    _id: productId,
  });
}

async function getProductCountryGroupsInternal({
  userId,
  productId,
}: {
  userId: string;
  productId: string;
}) {
  await connectToDatabase();

  const product = await getProduct({ _id: productId, userId });
  if (product == null) return [];

  const data = await CountryGroupsModel.find(
    {},
    {
      _id: 1,
      name: 1,
      recommendedDiscountPercentage: 1,
    }
  );

  const result: {
    _id: string;
    name: string;
    recommendedDiscountPercentage: number | null;
    countries: {
      name: string;
      code: string;
    }[];
    discount: { coupon: string | null; discountPercentage: number | null };
  }[] = [];

  for (const group of data) {
    const countries = await CountriesModel.find(
      {
        countryGroupId: group._id,
      },
      { _id: 0, name: 1, code: 1 }
    );

    const discount = await CountryGroupDiscountModel.findOne(
      {
        countryGroupId: group._id,
      },
      {
        _id: 0,
        coupon: 1,
        discountPercentage: 1,
      }
    );

    result.push({
      _id: group._id.toString(),
      name: group.name,
      recommendedDiscountPercentage: group.recommendedDiscountPercentage,
      countries: countries.map((country) => ({
        name: country.name,
        code: country.code,
      })),
      discount: {
        coupon: discount?.coupon || null,
        discountPercentage: discount?.discountPercentage || null,
      },
    });
  }

  return result;
}

async function getProductCustomizationInternal({
  userId,
  productId,
}: {
  userId: string;
  productId: string;
}) {
  await connectToDatabase();

  const product = await ProductsModel.findOne(
    {
      clerkUserId: userId,
      _id: productId,
    },
    {
      _id: 1,
    }
  );

  if (!product) return null;

  const data = await ProductCustomizationsModel.findOne(
    {
      productId: product._id,
    },
    {
      _id: 0,
      productId: 1,
      locationMessage: 1,
      backgroundColor: 1,
      textColor: 1,
      fontSize: 1,
      bannerContainer: 1,
      isSticky: 1,
      classPrefix: 1,
    }
  );

  if (!data) return null;

  return {
    productId: data.productId.toString(),
    locationMessage: data.locationMessage,
    backgroundColor: data.backgroundColor,
    textColor: data.textColor,
    fontSize: data.fontSize,
    bannerContainer: data.bannerContainer,
    isSticky: data.isSticky,
    classPrefix: data.classPrefix,
  };
}

async function getProductsInternal(
  userId: string,
  { limit }: { limit?: number }
) {
  await connectToDatabase();

  const results = await ProductsModel.find(
    {
      clerkUserId: userId,
    },
    {
      _id: 1,
      name: 1,
      description: 1,
      url: 1,
    }
  )
    .sort({
      createdAt: -1,
    })
    .limit(limit || 0);

  return results.map((product) => ({
    _id: product._id.toString(),
    name: product.name,
    description: product.description,
    url: product.url,
  }));
}

async function getProductInternal({
  _id,
  userId,
}: {
  _id: string;
  userId: string;
}) {
  await connectToDatabase();

  const result = await ProductsModel.findOne(
    {
      clerkUserId: userId,
      _id,
    },
    {
      _id: 1,
      name: 1,
      description: 1,
      url: 1,
    }
  );

  if (!result) return null;

  return {
    _id: result._id.toString(),
    name: result.name,
    description: result.description,
    url: result.url,
  };
}

async function getProductCountInternal(userId: string) {
  await connectToDatabase();

  const counts = await ProductsModel.countDocuments({
    clerkUserId: userId,
  });

  return counts;
}

/**
async function getProductForBannerInternal({
  _id,
  countryCode,
  url,
}: {
  _id: string;
  countryCode: string;
  url: string;
}) {
  await connectToDatabase();

  const product = await ProductsModel.findOne(
    {
      _id,
      url: removeTrailingSlash(url),
    },
    {
      _id: 1,
      clerkUserId: 1,
    }
  ).lean();

  console.log(product);

  if (!product)
    return {
      product: null,
      discount: null,
      country: null,
    };

  return {
    product: null,
    discount: null,
    country: null,
  };
  // const productCustomization = await ProductCustomizationsModel.findOne({
  //   productId: product._id,
  // });

  // const discount = await CountryGroupDiscountModel.findOne({
  //   productId: product._id,
  // })
  //   .populate({
  //     path: "countries",
  //     match: { code: countryCode },
  //   })
  //   .lean();

  // const data = await db.query.ProductTable.findFirst({
  //   where: ({ id: idCol, url: urlCol }, { eq, and }) =>
  //     and(eq(idCol, id), eq(urlCol, removeTrailingSlash(url))),
  //   columns: {
  //     id: true,
  //     clerkUserId: true,
  //   },
  //   with: {
  //     productCustomization: true,
  //     countryGroupDiscounts: {
  //       columns: {
  //         coupon: true,
  //         discountPercentage: true,
  //       },
  //       with: {
  //         countryGroup: {
  //           columns: {},
  //           with: {
  //             countries: {
  //               columns: {
  //                 id: true,
  //                 name: true,
  //               },
  //               limit: 1,
  //               where: ({ code }, { eq }) => eq(code, countryCode),
  //             },
  //           },
  //         },
  //       },
  //     },
  //   },
  // });

  // const discount = data?.countryGroupDiscounts.find(
  //   (discount) => discount.countryGroup.countries.length > 0
  // );
  // const country = discount?.countryGroup.countries[0];
  // const product =
  //   data == null || data.productCustomization == null
  //     ? undefined
  //     : {
  //         id: data.id,
  //         clerkUserId: data.clerkUserId,
  //         customization: data.productCustomization,
  //       };

  // return {
  //   product,
  //   country,
  //   discount:
  //     discount == null
  //       ? undefined
  //       : {
  //           coupon: discount.coupon,
  //           percentage: discount.discountPercentage,
  //         },
  // };
}
**/
