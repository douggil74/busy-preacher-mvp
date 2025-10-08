// components/Logo.tsx
type LogoProps = { withText?: boolean; className?: string; title?: string };

export default function Logo({
  withText = true,
  className = "h-8 w-8",
  title = "Busy Preacher",
}: LogoProps) {
  return (
    <div className="inline-flex items-center gap-3 select-none">
      <img src="/logo.png" alt={title} className={className} />
      {withText && (
        <span className="text-lg font-semibold tracking-tight" title={title}>
          Busy Preacher
        </span>
      )}
    </div>
  );
}
