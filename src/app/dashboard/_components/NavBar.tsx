import { BrandLogo } from "@/components/BrandLogo";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

export function NavBar() {
  return (
    <header className="flex py-6 shadow bg-background">
      <nav className="flex items-center gap-10 container font-semibold">
        <Link href="/" className="mr-auto">
          <BrandLogo />
        </Link>
        <span className="text-lg">
          <Link href="/dashboard">Dashboard</Link>
        </span>
        <UserButton />
      </nav>
    </header>
  );
}
