import { NextResponse } from 'next/server';
import { deleteEntry } from '@/lib/historyStore';

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await deleteEntry(id);
  return NextResponse.json({ ok: true });
}
