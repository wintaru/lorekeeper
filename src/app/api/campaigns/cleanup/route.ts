import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function DELETE() {
  const db = createServiceClient()

  const { data, error } = await db
    .from('campaigns')
    .delete()
    .lt('expires_at', new Date().toISOString())
    .select('id')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ deleted: (data ?? []).length })
}
