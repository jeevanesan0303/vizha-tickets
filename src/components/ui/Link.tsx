import React from "react";
import { Link as RouterLink, type LinkProps as RouterLinkProps } from "react-router-dom";

export interface LinkProps extends Omit<RouterLinkProps, "to" | "prefetch"> {
  href?: string;
  to?: string;
  prefetch?: boolean | "intent" | "render" | "none";
  children?: React.ReactNode;
}

export default function Link({ href, to, children, prefetch, ...props }: LinkProps) {
  const destination = to || href || "#";
  const isExternal =
    typeof destination === "string" &&
    (destination.startsWith("http://") ||
      destination.startsWith("https://") ||
      destination.startsWith("mailto:") ||
      destination.startsWith("tel:") ||
      destination.startsWith("#"));

  if (isExternal) {
    return (
      <a href={destination} {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {children}
      </a>
    );
  }

  return (
    <RouterLink to={destination} {...props}>
      {children}
    </RouterLink>
  );
}

