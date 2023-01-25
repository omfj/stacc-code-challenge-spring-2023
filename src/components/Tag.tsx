import { cva, type VariantProps } from "class-variance-authority";

const tag = cva("rounded-xl bg-neutral-200 p-5", {
  variants: {
    size: {
      small: ["text-sm", "py-1", "px-2"],
      medium: ["text-base", "py-2", "px-4"],
      large: ["text-lg", "py-3", "px-6"],
    },
    fullWidth: {
      true: "w-full",
      false: "w-fit",
    },
    outline: {
      true: "bg-neutral-300 border border-neutral-400",
      false: "bg-neutral-200",
    },
  },
  defaultVariants: {
    size: "medium",
    fullWidth: false,
    outline: true,
  },
});

interface TagProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof tag> {}

const Tag: React.FC<TagProps> = ({ className, size, outline, ...props }) => {
  return <div className={tag({ className, outline, size })} {...props} />;
};

export default Tag;
