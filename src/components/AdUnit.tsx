'use client'

import { useEffect } from 'react'

interface AdUnitProps {
  slot: string
  format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical'
  className?: string
}

export default function AdUnit({ slot, format = 'auto', className = '' }: AdUnitProps) {
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

  return (
    <div className={className} style={{ minHeight, display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '1.5rem 0' }}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', width: '100%', minHeight }}
        data-ad-client="ca-pub-6068297962050182"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="false"
      />
    </div>
  )
}
