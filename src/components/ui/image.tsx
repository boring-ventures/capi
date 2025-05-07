import { cn } from "@/lib/utils";
import { forwardRef } from "react";

export interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
}

const Image = forwardRef<HTMLImageElement, ImageProps>(
  ({ src, alt, className, ...props }, ref) => {
    return (
      <img
        ref={ref}
        src={src}
        alt={alt}
        className={cn("object-cover", className)}
        {...props}
      />
    );
  }
);

Image.displayName = "Image";

export { Image }; 