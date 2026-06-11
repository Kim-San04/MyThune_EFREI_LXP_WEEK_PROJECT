import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const encryptedData = typeof body?.encryptedData === "string" ? body.encryptedData : "";
  const dataIv = typeof body?.dataIv === "string" ? body.dataIv : "";

  if (!encryptedData || !dataIv) {
    return NextResponse.json({ error: "Données chiffrées invalides." }, { status: 400 });
  }

  const vault = await prisma.vaultBackup.findUnique({ where: { userId: session.user.id } });
  if (!vault) {
    return NextResponse.json({ error: "Vault non initialisé." }, { status: 409 });
  }

  await prisma.vaultBackup.update({
    where: { userId: session.user.id },
    data: { encryptedData, dataIv },
  });

  return NextResponse.json({ ok: true });
}
