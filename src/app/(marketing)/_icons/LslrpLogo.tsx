import Image from "next/image";
import lslLogo from "../../../../public/LslrpLogo.svg";

export function LslrpIcon({ className }: { className?: string }) {
  return (
    <Image src={lslLogo} alt="Los Santos Life Roleplay" className={className} />
  );
}
