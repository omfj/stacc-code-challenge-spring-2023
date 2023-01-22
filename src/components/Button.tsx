import { cva, type VariantProps } from "class-variance-authority";

const button = cva(
  'rounded-md text-white outline-none focus:ring-2 ring-offset-2 transform active:scale-95 transition-transform"',
  {
    variants: {
      intent: {
        primary: "bg-blue-600 hover:bg-blue-500",
        secondary: "bg-gray-600 hover:bg-gray-500",
      },
      size: {
        small: ["text-sm", "py-1", "px-2"],
        medium: ["text-base", "py-2", "px-4"],
        large: ["text-lg", "py-3", "px-6"],
      },
      fullWidth: {
        true: "w-full",
        false: "w-fit",
      },
    },
    defaultVariants: {
      intent: "primary",
      size: "medium",
      fullWidth: false,
    },
  }
);

interface ButtonProps
  extends React.HTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof button> {}

const Button: React.FC<ButtonProps> = ({
  className,
  intent,
  size,
  ...props
}) => {
  return <button className={button({ className, intent, size })} {...props} />;
};

export default Button;
