import { Button } from "@/components/ui/button";
import { SignUpButton } from "@clerk/nextjs";
import { ArrowRightIcon, CheckIcon } from "lucide-react";
import { NeonIcon } from "./_icons/Neon";
import Link from "next/link";
import { ClerkIcon } from "./_icons/Clerk";
import { subscriptionTiersInOrder } from "@/data/subscriptionTiers";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCompactNumber } from "@/lib/formatters";
import { Children, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/BrandLogo";

export default function HomePage() {
  return (
    <>
      <section className="min-h-screen bg-[radial-gradient(hsl(204,89%,39%,40%),hsl(204,62%,73%,40%),hsl(var(--background))_60%)] flex items-center justify-center text-center text-balance flex-col gap-8 px-4">
        <h1 className="text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight m-4">
          Power Up Your Hosting <br />
          Reliable, Affordable, Scalable!
        </h1>
        <p className="text-lg lg:text-3xl max-w-screen-xl">
          Optimized Hosting for Node.js Developers. Fast, Scalable, and Built
          for Your Framework. Deploy, Scale, and Run Seamlessly!
        </p>
        <SignUpButton>
          <Button className="text-lg p-6 rounded-xl flex gap-2">
            Get Started Today <ArrowRightIcon className="size-5" />
          </Button>
        </SignUpButton>
      </section>
      <section className="bg-primary text-primary-foreground">
        <div className="container py-16 flex flex-col gap-16 px-8 md:px-16">
          <h2 className="text-3xl text-center text-balance">
            Trusted by the top modern companies
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-16">
            <Link href="https://neon.tech">
              <NeonIcon />
            </Link>
            <Link href="https://clerk.com">
              <ClerkIcon />
            </Link>
            <Link href="https://neon.tech">
              <NeonIcon />
            </Link>
            <Link href="https://clerk.com">
              <ClerkIcon />
            </Link>
            <Link href="https://neon.tech">
              <NeonIcon />
            </Link>
            <Link href="https://clerk.com">
              <ClerkIcon />
            </Link>
            <Link href="https://neon.tech">
              <NeonIcon />
            </Link>
            <Link href="https://clerk.com">
              <ClerkIcon />
            </Link>
            <Link href="https://neon.tech">
              <NeonIcon />
            </Link>
            <Link className="md:max-xl:hidden" href="https://clerk.com">
              <ClerkIcon />
            </Link>
          </div>
        </div>
      </section>
      <section id="pricing" className="px-8 py-16 bg-accent/5">
        <h2 className="text-4xl text-center text-balance font-semibold mb-8">
          Pricing software which pays for itself 20x over
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-screen-xl mx-auto">
          {subscriptionTiersInOrder.map((tier) => (
            <PricingCard key={tier.name} {...tier} />
          ))}
        </div>
      </section>
      <footer className="container pt-16 pb-8 flex flex-col sm:flex-row gap-8 sm:gap-4 justify-between items-start">
        <Link href="/">
          <BrandLogo />
        </Link>
        <div className="flex flex-col sm:flex-row gap-8">
          <div className="flex flex-col gap-8">
            <FooterLinkGroup
              title="Help"
              links={[
                {
                  label: "PPP Discounts",
                  href: "#",
                },
                {
                  label: "Discount API",
                  href: "#1",
                },
              ]}
            />
            <FooterLinkGroup
              title="Solutions"
              links={[
                {
                  label: "Newsletter",
                  href: "#",
                },
                {
                  label: "SaaS Business",
                  href: "#1",
                },
                {
                  label: "Online Courses",
                  href: "#2",
                },
              ]}
            />
          </div>
          <div className="flex flex-col gap-8">
            <FooterLinkGroup
              title="Features"
              links={[
                {
                  label: "PPP Discounts",
                  href: "#",
                },
              ]}
            />
            <FooterLinkGroup
              title="Tools"
              links={[
                {
                  label: "Salary Converter",
                  href: "#",
                },
                {
                  label: "Coupon Generator",
                  href: "#1",
                },
                {
                  label: "Stripe App",
                  href: "#2",
                },
              ]}
            />
            <FooterLinkGroup
              title="Company"
              links={[
                {
                  label: "Affilate",
                  href: "#",
                },
                {
                  label: "Twitter",
                  href: "#1",
                },
                {
                  label: "Terms of Service",
                  href: "#2",
                },
              ]}
            />
          </div>
          <div className="flex flex-col gap-8">
            <FooterLinkGroup
              title="Integrations"
              links={[
                {
                  label: "Lemon Squeezy",
                  href: "#",
                },
                {
                  label: "Gumroad",
                  href: "#1",
                },
                {
                  label: "Stripe",
                  href: "#2",
                },
                {
                  label: "Chargebee",
                  href: "#3",
                },
                {
                  label: "Paddle",
                  href: "#4",
                },
              ]}
            />
            <FooterLinkGroup
              title="Tutorials"
              links={[
                {
                  label: "Any Website",
                  href: "#",
                },
                {
                  label: "Lemon Squeezy",
                  href: "#1",
                },
                {
                  label: "Gumroad",
                  href: "#2",
                },
                {
                  label: "Stripe",
                  href: "#3",
                },
                {
                  label: "Chargebee",
                  href: "#4",
                },
                {
                  label: "Paddle",
                  href: "#5",
                },
              ]}
            />
          </div>
        </div>
      </footer>
    </>
  );
}

function PricingCard({
  name,
  priceInCents,
  diskSpace,
  memory,
  backups,
}: (typeof subscriptionTiersInOrder)[number]) {
  const isMostPopular = name === "Standard";
  return (
    <Card
      className={cn(
        "relative shadow-none rounded-3xl overflow-hidden",
        isMostPopular ? "border-accent border-2" : "border-none"
      )}
    >
      {isMostPopular && (
        <div className="bg-accent text-accent-foreground absolute py-1 px-10 -right-8 top-24 rotate-45 origin-top-right">
          Most Popular
        </div>
      )}
      <CardHeader>
        <div className="text-accent font-semibold mb-8">{name}</div>
        <CardTitle className="text-xl font-bold">
          ${priceInCents / 100} /mo
        </CardTitle>
        <CardDescription>
          {/* {formatCompactNumber(maxNumberOfVisits)} pricing page visits/mo */}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SignUpButton>
          <Button
            className="text-lg w-full rounded-lg"
            variant={isMostPopular ? "accent" : "default"}
          >
            Get Started
          </Button>
        </SignUpButton>
      </CardContent>
      <CardFooter className="flex flex-col gap-4 items-start">
        <Feature>Node JS</Feature>
        <Feature>{diskSpace}MB Disk Space</Feature>
        <Feature>{memory}MB Memory</Feature>
        {backups != 0 && <Feature>{backups} Backups</Feature>}
      </CardFooter>
    </Card>
  );
}

function Feature({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <CheckIcon className="size-4 stroke-accent bg-accent/25 rounded-full p-0.5" />
      <span>{children}</span>
    </div>
  );
}

function FooterLinkGroup({
  title,
  links,
}: {
  title: string;
  links: {
    label: string;
    href: string;
  }[];
}) {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="font-semibold">{title}</h3>
      <ul className="flex flex-col gap-2 text-sm">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href}>{link.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}