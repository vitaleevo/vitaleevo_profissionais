import Image from "next/image";
import Link from "next/link";

import { ECOSYSTEM_VERTICALS, type EcosystemVertical } from "@/lib/ecosystem/verticals";
import { cn } from "@/lib/utils";

type BrandProps = {
  compact?: boolean;
  className?: string;
  vertical?: EcosystemVertical;
};

export function Brand({ className, vertical = ECOSYSTEM_VERTICALS.conexao }: BrandProps) {
  return (
    <Link href={vertical.homeHref} className={cn("flex min-w-max items-center gap-2.5", className)}>
      <div className="relative flex h-10 w-44 items-center sm:w-52">
        <Image
          src="/logo-novo.png"
          alt="Vitaleevo Human Capital"
          width={180}
          height={38}
          className="h-8 w-auto object-contain object-left dark:brightness-110"
          priority
          unoptimized
        />
      </div>
    </Link>
  );
}
