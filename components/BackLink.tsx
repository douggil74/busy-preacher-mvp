// components/BackLink.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

type Props = {
  href?: string;
  label?: string;
  className?: string;
  /** Optional aria-label (falls back to label) */
  ariaLabel?: string;
};

export default function BackLink({
  href,
  label = "Back",
  className = "",
  ariaLabel,
}: Props) {
  const router = useRouter();

  const shared =
    "inline-flex items-center gap-2 text-sm text-white/80 hover:underline underline-offset-4 decoration-yellow-400";

  const Arrow = (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="-ml-0.5 h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );

  const aria = ariaLabel ?? label;

  if (href) {
    // next/link supports passing `aria-label` to the underlying anchor
    return (
      <Link href={href} className={`${shared} ${className}`} aria-label={aria}>
        {Arrow}
        <span>{label}</span>
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className={`${shared} ${className}`}
      aria-label={aria}
    >
      {Arrow}
      <span>{label}</span>
    </button>
  );
}
