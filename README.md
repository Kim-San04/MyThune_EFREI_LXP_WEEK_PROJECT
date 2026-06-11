<div align="center">

![Header](https://capsule-render.vercel.app/api?type=waving&color=0:F97316,100:FBBF24&height=140&section=header&text=MyThune&fontSize=52&fontColor=FFFFFF&fontAlignY=38&desc=Ton%20argent,%20enfin%20facile%20%C3%A0%20comprendre&descAlignY=60&descSize=18)

[![Next.js](https://img.shields.io/badge/Next.js_14-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io)
[![Gemini](https://img.shields.io/badge/Gemini_API-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white)](https://deepmind.google/technologies/gemini)

[![PWA](https://img.shields.io/badge/PWA-Installable-5A0FC8?style=flat-square&logo=pwa)](https://mythune.vercel.app)
[![Auth](https://img.shields.io/badge/Auth.js-S%C3%A9curis%C3%A9-1a1a2e?style=flat-square)](https://authjs.dev)
[![E2E](https://img.shields.io/badge/Sauvegarde-Chiffr%C3%A9e_E2E-00b4d8?style=flat-square)](https://mythune.vercel.app)
[![Status](https://img.shields.io/badge/Status-En_d%C3%A9veloppement-success?style=flat-square)](https://mythune.vercel.app)
[![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-black?style=flat-square&logo=vercel)](https://mythune.vercel.app)

### 🔗 [mythune.vercel.app](https://mythune.vercel.app)

</div>

---

## 🎯 Le projet

**MyThune** est né lors de la **Semaine LXP EFREI — Module 1 : Créer un MVP avec l'IA** (8-12 juin 2026).

En une semaine, notre groupe a conçu, développé et déployé une application web complète : une PWA qui transforme un relevé bancaire PDF en tableau de bord financier clair et intelligent, sans aucune connexion bancaire ni saisie manuelle.

> 💡 **Problème** : Gérer son budget est fastidieux — libellés bancaires illisibles, saisie manuelle interminable, zéro visibilité sur ses dépenses réelles.
>
> ✅ **Solution** : Glisse ton relevé PDF dans MyThune. En quelques secondes, **Thunie** ton coach IA catégorise tout, visualise tes dépenses et te donne des conseils personnalisés.

---

## 📸 Aperçu

### Landing Page

![MyThune Landing Page — Hero](https://github.com/user-attachments/assets/83fd5934-63a2-435f-8322-db8308ad4180)

### Application

![MyThune App — Tableau de bord](https://github.com/user-attachments/assets/3f477026-d11e-4680-8181-4bf9a9747870)

---

## ✨ Fonctionnalités

| Fonctionnalité | Description |
|---|---|
| 📄 **Analyse PDF automatique** | Extraction et catégorisation des transactions via l'API Gemini |
| 📊 **Tableau de bord interactif** | Répartition par catégorie, évolution mensuelle, comparaison entre relevés |
| 🦊 **Thunie, le coach IA** | Chat conversationnel — questions sur tes finances, conseils personnalisés |
| 🎯 **Objectifs d'épargne** | Suggestions automatiques basées sur ton budget, suivi de progression |
| 📱 **PWA installable** | Fonctionne hors-ligne, expérience mobile optimisée |
| 🔒 **Sauvegarde chiffrée E2E** | Chiffrement côté client (Web Crypto AES-GCM) — le serveur ne voit jamais tes données en clair |

---

## 🏗️ Architecture

```
Relevé PDF → Analyse (Gemini) → IndexedDB (par utilisateur) → Dashboard + Thunie
                                        │
                                        ▼
                        Sauvegarde chiffrée E2E (Postgres / Prisma)
```

| Couche | Technologie | Rôle |
|---|---|---|
| **Frontend** | Next.js 14 (App Router), Tailwind, Framer Motion, GSAP | Interface, animations, PWA |
| **IA** | Gemini API (`flash` / `flash-lite`) | Extraction PDF & coach conversationnel |
| **Données locales** | IndexedDB (`idb`) | Relevés, transactions, budgets, objectifs |
| **Comptes & sessions** | Auth.js + Prisma + Postgres (Neon) | Authentification, sauvegarde chiffrée |
| **Sécurité** | Web Crypto (AES-GCM, PBKDF2) | Chiffrement de bout en bout des sauvegardes |

---

## 🚀 Lancer le projet en local

```bash
# Cloner le repo
git clone https://github.com/Kim-San04/MyThune_EFREI_LXP_WEEK_PROJECT.git
cd MyThune_EFREI_LXP_WEEK_PROJECT

# Installer les dépendances
npm install

# Lancer en développement
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000) dans ton navigateur.

### Variables d'environnement

Crée un fichier `.env.local` à la racine :

```env
DATABASE_URL=...
NEXTAUTH_SECRET=...
GEMINI_API_KEY=...
```

---

## 📦 Déploiement

Déployé en continu sur **Vercel** :

```bash
npx vercel --prod
```

---

## 👥 Équipe

Projet réalisé dans le cadre de la **Semaine LXP EFREI 2026 — Module 1** animé par **Antoine Dumas Martin**.

<div align="center">

![Footer](https://capsule-render.vercel.app/api?type=waving&color=0:FBBF24,100:F97316&height=80&section=footer)

</div>
