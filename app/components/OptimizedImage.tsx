// components/OptimizedImage.tsx
import Image from 'next/image';
import { ImageProps } from 'next/image';

interface OptimizedImageProps extends Omit<ImageProps, 'priority' | 'loading'> {
  isPriority?: boolean;
}

/**
 * Optimized Image Component
 * - Lazy loads by default (priority=false)
 * - Only prioritizes when explicitly needed (above-the-fold hero images)
 * - Reduces initial page load time
 */
export function OptimizedImage({ 
  isPriority = false, 
  ...props 
}: OptimizedImageProps) {
  return (
    <Image
      {...props}
      priority={isPriority}
      loading={isPriority ? undefined : "lazy"}
      placeholder="blur"
      blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN0cXH5DwAC8AHGqb9fZQAAAABJRU5ErkJggg=="
    />
  );
}

// Usage in your components:
// <OptimizedImage src="/logo.png" alt="Logo" width={150} height={50} />
// <OptimizedImage src="/hero.jpg" alt="Hero" width={1200} height={600} isPriority />