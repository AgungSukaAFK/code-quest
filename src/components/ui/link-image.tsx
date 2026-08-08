"use client";

import Image, { ImageProps } from "next/image";

type LinkImageProps = ImageProps & {
  /** URL tujuan saat gambar diklik. Jika tidak diisi, gambar tidak menjadi link. */
  link?: string;
};

export function LinkImage({ link, ...props }: LinkImageProps) {
  if (!link) {
    return <Image {...props} />;
  }

  return (
    <a href={link} target="_blank" rel="noopener noreferrer">
      <Image {...props} />
    </a>
  );
}