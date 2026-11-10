import React from "react";

export interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fill?: boolean;
  priority?: boolean;
  quality?: number;
  sizes?: string;
}

export default function Image({
  fill,
  priority,
  quality,
  sizes,
  className = "",
  style,
  alt = "",
  loading,
  decoding,
  ...props
}: ImageProps) {
  const combinedStyle: React.CSSProperties = {
    ...style,
    ...(fill
      ? {
          position: "absolute",
          height: "100%",
          width: "100%",
          left: 0,
          top: 0,
          right: 0,
          bottom: 0,
          objectFit: (style?.objectFit as React.CSSProperties["objectFit"]) || "cover",
        }
      : {}),
  };

  return (
    <img
      alt={alt}
      loading={priority ? "eager" : loading || "lazy"}
      decoding={priority ? "sync" : decoding || "async"}
      className={className}
      style={combinedStyle}
      sizes={sizes}
      {...props}
    />
  );
}

