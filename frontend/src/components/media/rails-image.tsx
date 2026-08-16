import Image, { type ImageProps } from "next/image";

import { railsAssetUrl } from "@/lib/config/rails";

type RailsImageProps = Omit<ImageProps, "src" | "unoptimized"> & {
  assetPath: string;
};

export function RailsImage({ assetPath, alt, ...props }: RailsImageProps) {
  return <Image {...props} alt={alt} src={railsAssetUrl(assetPath)} unoptimized />;
}
