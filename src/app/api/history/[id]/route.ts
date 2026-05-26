import { NextResponse } from 'next/server';
import { deleteEntry, updateEntry } from '@/lib/historyStore';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const url = new URL(req.url);
  if (url.searchParams.get('action') !== 'update') {
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  }
  const { name, label, category } = await req.json();
  await updateEntry(id, { name, label, category });
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await deleteEntry(id);
  return NextResponse.json({ ok: true });
}
