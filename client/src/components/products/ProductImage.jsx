import { useEffect, useState } from "react";
import { Package } from "lucide-react";
import { getProductImage } from "../../utils";
import { cn } from "../../utils";

export default function ProductImage({
  product,
  className,
  iconClassName,
  containerClassName,
  ...props
}) {
  const [src, setSrc] = useState(() => getProductImage(product));
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setSrc(getProductImage(product));
    setFailed(false);
  }, [product]);

  const handleError = () => {
    const primary = product?.imageUrl;
    const secondary = product?.image;
    const gallery = product?.gallery?.[0];

    if (src === primary && secondary && secondary !== primary) {
      setSrc(secondary);
      return;
    }
    if ((src === primary || src === secondary) && gallery && gallery !== src) {
      setSrc(gallery);
      return;
    }
    setFailed(true);
  };

  if (!src || failed) {
    return (
      <div className={cn("flex items-center justify-center", containerClassName)}>
        <Package className={cn("w-12 h-12 text-[var(--color-rose-300)]", iconClassName)} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={product?.name || "Product"}
      onError={handleError}
      className={className}
      loading="lazy"
      {...props}
    />
  );
}
