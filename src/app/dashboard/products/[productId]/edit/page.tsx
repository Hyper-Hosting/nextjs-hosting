import { CountryDiscountsForm } from "@/app/dashboard/_components/forms/CountryDiscountsForm";
import { ProductCustomizationForm } from "@/app/dashboard/_components/forms/ProductCustomizationForm";
import { ProductDetailsForm } from "@/app/dashboard/_components/forms/ProductDetailsForm";
import { PageWithBackButton } from "@/app/dashboard/_components/PageWithBackButton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getProduct,
  getProductCountryGroups,
  getProductCustomization,
} from "@/server/db/products";
import { canCustomizeBanner, canRemoveBranding } from "@/server/permissions";
import { auth } from "@clerk/nextjs/server";
import { ObjectId } from "mongoose";
import { notFound } from "next/navigation";

export default async function EditProductPage({
  params: { productId },
  searchParams: { tab = "details" },
}: {
  params: {
    productId: string;
  };
  searchParams: {
    tab?: string;
  };
}) {
  const { userId, redirectToSignIn } = auth();
  if (userId == null) return redirectToSignIn();

  const product = await getProduct({ _id: productId, userId });
  if (product == null) return notFound();

  return (
    <PageWithBackButton
      backButtonHref="/dashboard/products"
      pageTitle="Edit Product"
    >
      <Tabs defaultValue={tab}>
        <TabsList className="bg-background/65">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="country">Country</TabsTrigger>
          <TabsTrigger value="customization">Customization</TabsTrigger>
        </TabsList>
        <TabsContent value="details">
          <DetailsTab product={product} />
        </TabsContent>
        <TabsContent value="country">
          <CountryTab productId={productId} userId={userId} />
        </TabsContent>
        <TabsContent value="customization">
          <CustomizationTab productId={productId} userId={userId} />
        </TabsContent>
      </Tabs>
    </PageWithBackButton>
  );
}

function DetailsTab({
  product,
}: {
  product: {
    _id: string;
    name: string;
    description: string | null;
    url: string;
  };
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Product Details</CardTitle>
      </CardHeader>
      <CardContent>
        <ProductDetailsForm product={product} />
      </CardContent>
    </Card>
  );
}

async function CountryTab({
  productId,
  userId,
}: {
  productId: string;
  userId: string;
}) {
  const countryGroups = await getProductCountryGroups({
    productId,
    userId,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Country Discounts</CardTitle>
        <CardDescription>
          Leave the discount field blank if you do notwant to display deals for
          any specific parity group.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <CountryDiscountsForm
          productId={productId}
          countryGroups={countryGroups}
        />
      </CardContent>
    </Card>
  );
}

async function CustomizationTab({
  productId,
  userId,
}: {
  productId: string;
  userId: string;
}) {
  const customization = await getProductCustomization({ productId, userId });

  if (customization == null) return notFound();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Banner Customization</CardTitle>
      </CardHeader>
      <CardContent>
        <ProductCustomizationForm
          canRemoveBranding={await canRemoveBranding(userId)}
          canCustomizeBanner={await canCustomizeBanner(userId)}
          customization={customization}
        />
      </CardContent>
    </Card>
  );
}