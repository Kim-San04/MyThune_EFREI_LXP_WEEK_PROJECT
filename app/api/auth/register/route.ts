import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  const vault = body?.vault;
  const vaultSalt = typeof vault?.salt === "string" ? vault.salt : "";
  const vaultWrappedDek = typeof vault?.wrappedDek === "string" ? vault.wrappedDek : "";
  const vaultWrappedDekIv = typeof vault?.wrappedDekIv === "string" ? vault.wrappedDekIv : "";

  if (!name || !EMAIL_RE.test(email) || password.length < 8) {
    return NextResponse.json(
      { error: "Vérifie ton nom, ton email et ton mot de passe (8 caractères minimum)." },
      { status: 400 }
    );
  }

  if (!vaultSalt || !vaultWrappedDek || !vaultWrappedDekIv) {
    return NextResponse.json({ error: "Données de chiffrement invalides." }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Un compte existe déjà avec cet email." }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      vaultBackup: {
        create: {
          wrappedDek: vaultWrappedDek,
          wrappedDekIv: vaultWrappedDekIv,
          kdfSalt: vaultSalt,
        },
      },
    },
  });

  return NextResponse.json({ ok: true });
}
