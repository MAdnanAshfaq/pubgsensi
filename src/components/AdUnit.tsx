'use client'

import { useEffect } from 'react'

interface AdUnitProps {
  slot?: string
  format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical'
  className?: string
}

export default function AdUnit({ slot = '8085223740', format = 'auto', className = '' }: AdUnitProps) {
  useEffect(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch (e) {}
  }, [])

  // Calculate dynamic min-height to prevent Cumulative Layout Shift (CLS)
  let minHeight = '90px';
  if (format === 'rectangle') {
    minHeight = '280px';
  } else if (format === 'vertical') {
    minHeight = '600px';
  } else if (format === 'horizontal') {
    minHeight = '90px';
  }

  // Use the verified active ad slot
  const resolvedSlot = slot === '1234567890' || slot === '0987654321' ? '8085223740' : slot;

  return (
    <div className={className} style={{ minHeight, display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '1.5rem 0' }}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', width: '100%', minHeight }}
        data-ad-client="ca-pub-6068297962050182"
        data-ad-slot={resolvedSlot}
        data-ad-format={format === 'rectangle' ? 'rectangle' : format}
        data-full-width-responsive="true"
      />
    </div>
  )
}
