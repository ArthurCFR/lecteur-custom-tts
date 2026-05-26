import { NextResponse } from 'next/server';
import { deleteEntry, updateEntry } from '@/lib/historyStore';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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
