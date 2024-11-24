import { Globe2Icon } from "lucide-react";
import Image from "next/image";
import logo from "../../public/Hyper_Hosting_Logo.png"

export function BrandLogo() {
  return (
    <span className="flex items-center gap-2 font-semibold flex-shrink-0 text-lg">
      {/* <Globe2Icon className="size-8" /> */}
      <Image
                      width={35}
                      height={35}
                      alt="Hyper Hosting"
                      title="Hyper Hosting"
                      src={logo} />
      <span>Hyper Hosting</span>
    </span>
  );
}
