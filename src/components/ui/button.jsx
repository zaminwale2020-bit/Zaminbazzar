import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EDB015] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 dark:ring-offset-neutral-950",
  {
    variants: {
      variant: {
        default:
          "bg-[#EDB015] text-white hover:bg-[#d9a013] dark:bg-[#EDB015] dark:text-neutral-900 dark:hover:bg-[#f1be3b]",
        destructive:
          "bg-red-500 text-white hover:bg-red-600 dark:bg-red-900 dark:text-white",
        outline:
          "border border-[#EDB015] text-[#EDB015] hover:bg-[#EDB015]/10 hover:text-[#d9a013] dark:border-[#EDB015] dark:text-[#EDB015] dark:hover:bg-[#EDB015]/20",
        secondary:
          "bg-neutral-100 text-neutral-900 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-50",
        ghost:
          "hover:bg-[#EDB015]/10 hover:text-[#EDB015] dark:hover:bg-[#EDB015]/20 dark:hover:text-[#EDB015]",
        link:
          "text-[#EDB015] underline-offset-4 hover:underline dark:text-[#EDB015]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
