import Image from "next/image";
import lslLogo from "../../../../public/SalrpLogo.png";

export function SalrpIcon({ className }: { className?: string }) {
  return (
    <Image
      src={lslLogo}
      alt="San Andreas Life Roleplay"
      className={className}
    />
  );
}
