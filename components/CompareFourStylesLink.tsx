"use client";

import Link from "next/link";

type Props = {
  variant?: "inline" | "button";
  className?: string;
  label?: string;
};

export default function CompareFourStylesLink({
  variant = "inline",
  className = "",
  label = "Compare 4 Styles",
}: Props) {
  if (variant === "button") {
    return (
      <Link
        href="/test-styles"
        className={[
          "inline-block rounded-lg border-2 border-yellow-400 bg-yellow-400/20 px-4 py-2",
          "text-sm font-semibold hover:bg-yellow-400/30 transition-colors",
          className,
        ].join(" ")}
      >
        {label} →
      </Link>
    );
  }

  return (
    <Link
      href="/test-styles"
      className={[
        "text-yellow-400 hover:text-yellow-300 font-semibold",
        "underline decoration-yellow-400/50 underline-offset-4",
        className,
      ].join(" ")}
    >
      {label} →
    </Link>
  );
}
