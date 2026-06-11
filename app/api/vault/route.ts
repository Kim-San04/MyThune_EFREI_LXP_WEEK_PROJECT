import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const vault = await prisma.vaultBackup.findUnique({ where: { userId: session.user.id } });
  if (!vault) {
    return NextResponse.json({ hasVault: false });
  }

  return NextResponse.json({
    hasVault: true,
    wrappedDek: vault.wrappedDek,
    wrappedDekIv: vault.wrappedDekIv,
    kdfSalt: vault.kdfSalt,
    kdfIterations: vault.kdfIterations,
    encryptedData: vault.encryptedData,
    dataIv: vault.dataIv,
  });
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const salt = typeof body?.salt === "string" ? body.salt : "";
  const wrappedDek = typeof body?.wrappedDek === "string" ? body.wrappedDek : "";
  const wrappedDekIv = typeof body?.wrappedDekIv === "string" ? body.wrappedDekIv : "";

  if (!salt || !wrappedDek || !wrappedDekIv) {
    return NextResponse.json({ error: "Données de chiffrement invalides." }, { status: 400 });
  }

  await prisma.vaultBackup.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id, wrappedDek, wrappedDekIv, kdfSalt: salt },
    update: { wrappedDek, wrappedDekIv, kdfSalt: salt },
  });

  return NextResponse.json({ ok: true });
}
