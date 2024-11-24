// import {
//   CountryGroupTable,
//   CountryTable,
//   ProductTable,
//   ProductViewTable,
// } from "@/drizzle/schema";
// import {
//   CACHE_TAGS,
//   dbCache,
//   getGlobalTag,
//   getIdTag,
//   getUserTag,
//   revalidateDbCache,
// } from "@/lib/cache";
// import { startOfDay, subDays } from "date-fns";
// import { and, count, desc, eq, gte, SQL, sql } from "drizzle-orm";
// import { tz } from "@date-fns/tz";
// import { ProductViewsModel } from "@/models/ProductViews";
// import { ProductsModel } from "@/models/Products";
// import { connectToDatabase } from "@/lib/mongoose";

// export function getProductViewCount(userId: string, startDate: Date) {
//   const cacheFn = dbCache(getProductViewCountInternal, {
//     tags: [getUserTag(userId, CACHE_TAGS.productViews)],
//   });

//   return cacheFn(userId, startDate);
// }

// export function getViewsByCountryChartData({
//   timezone,
//   productId,
//   userId,
//   interval,
// }: {
//   timezone: string;
//   productId?: string;
//   userId: string;
//   interval: (typeof CHART_INTERVALS)[keyof typeof CHART_INTERVALS];
// }) {
//   const cacheFn = dbCache(getViewsByCountryChartDataInternal, {
//     tags: [
//       getUserTag(userId, CACHE_TAGS.productViews),
//       productId == null
//         ? getUserTag(userId, CACHE_TAGS.products)
//         : getIdTag(productId, CACHE_TAGS.products),
//       getGlobalTag(CACHE_TAGS.countries),
//     ],
//   });

//   return cacheFn({
//     timezone,
//     productId,
//     userId,
//     interval,
//   });
// }

// export function getViewsByPPPChartData({
//   timezone,
//   productId,
//   userId,
//   interval,
// }: {
//   timezone: string;
//   productId?: string;
//   userId: string;
//   interval: (typeof CHART_INTERVALS)[keyof typeof CHART_INTERVALS];
// }) {
//   const cacheFn = dbCache(getViewsByPPPChartDataInternal, {
//     tags: [
//       getUserTag(userId, CACHE_TAGS.productViews),
//       productId == null
//         ? getUserTag(userId, CACHE_TAGS.products)
//         : getIdTag(productId, CACHE_TAGS.products),
//       getGlobalTag(CACHE_TAGS.countries),
//       getGlobalTag(CACHE_TAGS.countryGroups),
//     ],
//   });

//   return cacheFn({
//     timezone,
//     productId,
//     userId,
//     interval,
//   });
// }

// export function getViewsByDayChartData({
//   timezone,
//   productId,
//   userId,
//   interval,
// }: {
//   timezone: string;
//   productId?: string;
//   userId: string;
//   interval: (typeof CHART_INTERVALS)[keyof typeof CHART_INTERVALS];
// }) {
//   const cacheFn = dbCache(getViewsByDayChartDataInternal, {
//     tags: [
//       getUserTag(userId, CACHE_TAGS.productViews),
//       productId == null
//         ? getUserTag(userId, CACHE_TAGS.products)
//         : getIdTag(productId, CACHE_TAGS.products),
//     ],
//   });

//   return cacheFn({
//     timezone,
//     productId,
//     userId,
//     interval,
//   });
// }

// export async function createProductView({
//   productId,
//   countryId,
//   userId,
// }: {
//   productId: string;
//   countryId?: string;
//   userId: string;
// }) {
//   await connectToDatabase();

//   const newRow = await new ProductViewsModel({
//     productId,
//     visitedAt: new Date(),
//     countryId,
//   }).save();

//   if (newRow != null) {
//     revalidateDbCache({
//       tag: CACHE_TAGS.productViews,
//       userId,
//       _id: newRow._id,
//     });
//   }
// }

// async function getProductViewCountInternal(userId: string, startDate: Date) {
//   const products = await ProductsModel.find({
//     clerkUserId: userId,
//   });

//   let count = 0;

//   for (const product of products) {
//     const views = await ProductViewsModel.find({
//       productId: product._id,
//       visitedAt: {
//         $gte: startDate,
//       },
//     }).countDocuments();

//     count = count + views;
//   }

//   return count;
// }

// async function getViewsByCountryChartDataInternal({
//   timezone,
//   productId,
//   userId,
//   interval,
// }: {
//   timezone: string;
//   productId?: string;
//   userId: string;
//   interval: (typeof CHART_INTERVALS)[keyof typeof CHART_INTERVALS];
// }) {
//   const startDate = startOfDay(interval.startDate, { in: tz(timezone) });
//   const productsSq = getProductSubQuery(userId, productId);
//   return await db
//     .with(productsSq)
//     .select({
//       views: count(ProductViewTable.visitedAt),
//       countryName: CountryTable.name,
//       countryCode: CountryTable.code,
//     })
//     .from(ProductViewTable)
//     .innerJoin(productsSq, eq(productsSq.id, ProductViewTable.productId))
//     .innerJoin(CountryTable, eq(CountryTable.id, ProductViewTable.countryId))
//     .where(
//       gte(
//         sql`${ProductViewTable.visitedAt} AT TIME ZONE ${timezone}`.inlineParams(),
//         startDate
//       )
//     )
//     .groupBy(({ countryCode, countryName }) => [countryCode, countryName])
//     .orderBy(({ views }) => desc(views))
//     .limit(25);
// }

// async function getViewsByPPPChartDataInternal({
//   timezone,
//   productId,
//   userId,
//   interval,
// }: {
//   timezone: string;
//   productId?: string;
//   userId: string;
//   interval: (typeof CHART_INTERVALS)[keyof typeof CHART_INTERVALS];
// }) {
//   const startDate = startOfDay(interval.startDate, { in: tz(timezone) });
//   const productsSq = getProductSubQuery(userId, productId);
//   const productViewSq = db.$with("productViews").as(
//     db
//       .with(productsSq)
//       .select({
//         visitedAt: sql`${ProductViewTable.visitedAt} AT TIME ZONE ${timezone}`
//           .inlineParams()
//           .as("visitedAt"),
//         countryGroupId: CountryTable.countryGroupId,
//       })
//       .from(ProductViewTable)
//       .innerJoin(productsSq, eq(productsSq.id, ProductViewTable.productId))
//       .innerJoin(CountryTable, eq(CountryTable.id, ProductViewTable.countryId))
//       .where(({ visitedAt }) => gte(visitedAt, startDate))
//   );

//   return await db
//     .with(productViewSq)
//     .select({
//       pppName: CountryGroupTable.name,
//       views: count(productViewSq.visitedAt),
//     })
//     .from(CountryGroupTable)
//     .leftJoin(
//       productViewSq,
//       eq(productViewSq.countryGroupId, CountryGroupTable.id)
//     )
//     .groupBy(({ pppName }) => [pppName])
//     .orderBy(({ pppName }) => [pppName]);
// }

// async function getViewsByDayChartDataInternal({
//   timezone,
//   productId,
//   userId,
//   interval,
// }: {
//   timezone: string;
//   productId?: string;
//   userId: string;
//   interval: (typeof CHART_INTERVALS)[keyof typeof CHART_INTERVALS];
// }) {
//   const productsSq = getProductSubQuery(userId, productId);
//   const productViewSq = db.$with("productViews").as(
//     db
//       .with(productsSq)
//       .select({
//         visitedAt: sql`${ProductViewTable.visitedAt} AT TIME ZONE ${timezone}`
//           .inlineParams()
//           .as("visitedAt"),
//         productId: productsSq.id,
//       })
//       .from(ProductViewTable)
//       .innerJoin(productsSq, eq(productsSq.id, ProductViewTable.productId))
//   );

//   return await db
//     .with(productViewSq)
//     .select({
//       date: interval
//         .dateGrouper(sql.raw("series"))
//         .mapWith((dateString) => interval.dateFormatter(new Date(dateString))),
//       views: count(productViewSq.visitedAt),
//     })
//     .from(interval.sql)
//     .leftJoin(productViewSq, ({ date }) =>
//       eq(interval.dateGrouper(productViewSq.visitedAt), date)
//     )
//     .groupBy(({ date }) => [date])
//     .orderBy(({ date }) => date);
// }

// function getProductSubQuery(userId: string, productId: string | undefined) {
//   return db.$with("products").as(
//     db
//       .select()
//       .from(ProductTable)
//       .where(
//         and(
//           eq(ProductTable.clerkUserId, userId),
//           productId == null ? undefined : eq(ProductTable.id, productId)
//         )
//       )
//   );
// }

// export const CHART_INTERVALS = {
//   last7Days: {
//     dateFormatter: (date: Date) => dateFormatter.format(date),
//     startDate: subDays(new Date(), 7),
//     label: "Last 7 Days",
//     sql: sql`GENERATE_SERIES(current_date - 7, current_date, '1 day'::interval) as series`,
//     dateGrouper: (col: SQL | SQL.Aliased) =>
//       sql<string>`DATE(${col})`.inlineParams(),
//   },
//   last30Days: {
//     dateFormatter: (date: Date) => dateFormatter.format(date),
//     startDate: subDays(new Date(), 30),
//     label: "Last 30 Days",
//     sql: sql`GENERATE_SERIES(current_date - 30, current_date, '1 day'::interval) as series`,
//     dateGrouper: (col: SQL | SQL.Aliased) =>
//       sql<string>`DATE(${col})`.inlineParams(),
//   },
//   last365Days: {
//     dateFormatter: (date: Date) => monthFormatter.format(date),
//     startDate: subDays(new Date(), 365),
//     label: "Last 365 Days",
//     sql: sql`GENERATE_SERIES(DATE_TRUNC('month', current_date - 365), DATE_TRUNC('month', current_date), '1 month'::interval) as series`,
//     dateGrouper: (col: SQL | SQL.Aliased) =>
//       sql<string>`DATE_TRUNC('month', ${col})`.inlineParams(),
//   },
// };

// const dateFormatter = new Intl.DateTimeFormat(undefined, {
//   dateStyle: "short",
//   timeZone: "UTC",
// });

// const monthFormatter = new Intl.DateTimeFormat(undefined, {
//   year: "2-digit",
//   month: "short",
//   timeZone: "UTC",
// });
