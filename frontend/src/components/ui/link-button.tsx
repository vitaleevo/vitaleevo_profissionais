import Link, { type LinkProps } from "next/link";
import type { AnchorHTMLAttributes } from "react";
import type { VariantProps } from "class-variance-authority";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type LinkButtonProps = LinkProps &
  AnchorHTMLAttributes<HTMLAnchorElement> &
  VariantProps<typeof buttonVariants>;

export function LinkButton({ className, variant, size, ...props }: LinkButtonProps) {
  return <Link className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}
