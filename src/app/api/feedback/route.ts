import { NextRequest, NextResponse } from 'next/server';
import { saveFeedback } from '@/utils/db';
import { rateLimit } from '@/utils/rateLimit';
import { validateFeedback } from '@/utils/security';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    // ── 1. Rate Limiting (IP-based, 20 requests per minute) ──────────────────
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
    const limitRes = rateLimit(ip, 20, 60 * 1000);

    const headers = {
      'X-RateLimit-Limit': limitRes.limit.toString(),
      'X-RateLimit-Remaining': limitRes.remaining.toString(),
      'X-RateLimit-Reset': Math.ceil(limitRes.reset / 1000).toString(),
    };

    if (!limitRes.success) {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please try again in 1 minute.' },
        {
          status: 429,
          headers: {
            ...headers,
            'Retry-After': Math.ceil((limitRes.reset - Date.now()) / 1000).toString(),
          }
        }
      );
    }

    // ── 2. Strict Input Validation & Sanitization ───────────────────────────
    const body = await req.json();
    const validation = validateFeedback(body);

    if (!validation.success || !validation.data) {
      return NextResponse.json(
        { success: false, error: validation.error || 'Invalid request body.' },
        { status: 400, headers }
      );
    }

    const { slug, score } = validation.data;

    const saved = await saveFeedback(slug, score);
    if (saved) {
      return NextResponse.json({ success: true }, { headers });
    } else {
      return NextResponse.json(
        { success: false, error: 'Failed to save feedback' },
        { status: 500, headers }
      );
    }
  } catch (error: any) {
    console.error('Error in feedback API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
