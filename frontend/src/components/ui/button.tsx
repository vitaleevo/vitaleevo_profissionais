import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center font-bold whitespace-nowrap transition-all duration-300 outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-white shadow-md shadow-primary/20 hover:-translate-y-0.5 hover:bg-[#6f1bb3] hover:shadow-lg hover:shadow-primary/30 active:scale-[0.98]",
        outline:
          "border border-slate-200 bg-white text-slate-800 hover:-translate-y-0.5 hover:border-primary/50 hover:text-primary hover:bg-slate-50 dark:border-white/15 dark:bg-white/5 dark:text-slate-200 dark:hover:border-primary/50 dark:hover:text-white active:scale-[0.98]",
        secondary:
          "bg-slate-900 text-white hover:bg-slate-800 hover:-translate-y-0.5 shadow-md shadow-slate-900/15 dark:bg-slate-800 dark:hover:bg-slate-700 active:scale-[0.98]",
        ghost:
          "text-slate-700 hover:bg-primary/10 hover:text-primary dark:text-slate-200 dark:hover:bg-white/10 dark:hover:text-white",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 shadow-md shadow-destructive/20 hover:-translate-y-0.5 active:scale-[0.98]",
        link: "text-primary underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        default:
          "h-11 gap-2 rounded-xl px-6 py-2.5 text-sm",
        xs: "h-7 gap-1 rounded-lg px-2.5 text-xs [&_svg:not([class*='size-'])]:size-3",
        sm: "h-9 gap-1.5 rounded-lg px-4 py-2 text-xs [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-12 gap-2.5 rounded-xl px-7 py-3.5 text-base shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30",
        xl: "h-14 gap-3 rounded-2xl px-8 py-4 text-base shadow-xl shadow-primary/30",
        icon: "size-11 rounded-xl",
        "icon-xs": "size-7 rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-9 rounded-lg",
        "icon-lg": "size-12 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
