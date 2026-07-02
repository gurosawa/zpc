import type { ComponentPropsWithoutRef } from "react";
import { slugify } from "@/lib/slug";
import { CircuitPlayground } from "@/components/circuit-playground";
import { HashLab } from "@/components/hash-lab";
import { InteractiveTLS } from "@/components/interactive-tls";
import { WasmDemo } from "@/components/wasm-demo";

function textFromChildren(children: React.ReactNode): string {
  if (typeof children === "string") {
    return children;
  }

  if (Array.isArray(children)) {
    return children.map(textFromChildren).join("");
  }

  if (typeof children === "number") {
    return String(children);
  }

  return "";
}

function createHeading(level: 2 | 3) {
  const Tag = `h${level}` as const;

  return function Heading({ children, ...props }: ComponentPropsWithoutRef<"h2">) {
    const id = slugify(textFromChildren(children));
    return (
      <Tag id={id} {...props}>
        <a href={`#${id}`} aria-label={`${textFromChildren(children)} 섹션 링크`}>
          {children}
        </a>
      </Tag>
    );
  };
}

export const mdxComponents = {
  h2: createHeading(2),
  h3: createHeading(3),
  InteractiveTLS,
  HashLab,
  WasmDemo,
  CircuitPlayground,
};
