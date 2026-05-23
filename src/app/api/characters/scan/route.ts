import { NextResponse } from 'next/server'

// Scanning is now done client-side with Tesseract.js — no API key required.
export async function POST() {
  return NextResponse.json({ error: 'Use client-side scanning' }, { status: 410 })
}
