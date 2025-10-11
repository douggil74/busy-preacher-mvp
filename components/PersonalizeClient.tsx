// components/PersonalizeClient.tsx
'use client'

import { useSearchParams } from 'next/navigation'

export default function PersonalizeClient() {
  const searchParams = useSearchParams()
  const name = searchParams.get('name')

  return (
    <div>
      {name ? (
        <p>Hello, {name}! Welcome to your personalized experience.</p>
      ) : (
        <p>No personalization data found.</p>
      )}
    </div>
  )
}
