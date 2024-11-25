import Image from "next/image";
import cbLogo from "../../../../public/CodeBlueLogo.png";

export function CodeBlueIcon({ className }: { className?: string }) {
  return <Image src={cbLogo} alt="Code Blue" className={className} />;
}
