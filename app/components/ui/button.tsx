import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        default: "bg-primary-500 text-white hover:bg-primary-600",
        outline: "border border-primary-300 bg-transparent hover:bg-primary-100 text-primary-700",
        ghost: "bg-transparent hover:bg-primary-100 text-primary-700",
        link: "bg-transparent underline-offset-4 hover:underline text-primary-700 p-0",
      },
      size: {
        default: "h-10 py-2 px-4",
        sm: "h-8 px-3 rounded-full text-xs",
        lg: "h-12 px-8 rounded-full text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants }; 