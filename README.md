<div align="center">

![Header](https://capsule-render.vercel.app/api?type=waving&color=0:F97316,100:FBBF24&height=120&section=header&text=&fontSize=0)

# 🦊 MyThune — Ton argent, enfin facile à comprendre

![Next.js](https://img.shields.io/badge/Next.js_14-000000?style=for-the-badge&logo=next.js&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white) ![Tailwind](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white) ![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white) ![Gemini](https://img.shields.io/badge/Gemini_API-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white)

![PWA](https://img.shields.io/badge/PWA-Installable-5A0FC8?style=flat-square) ![Auth](https://img.shields.io/badge/Auth.js-Sécurisé-1a1a2e?style=flat-square) ![E2E](https://img.shields.io/badge/Sauvegarde-Chiffrée_E2E-00b4d8?style=flat-square) ![Status](https://img.shields.io/badge/Status-En_développement-success?style=flat-square)

</div>

---

## 🎯 Objectif

**MyThune** est une application web (PWA) qui transforme un relevé bancaire PDF en
tableau de bord clair en quelques secondes. Glisse ton relevé, et **Thunie**, ton
coach financier IA, décortique tes dépenses, identifie tes habitudes et t'aide à
fixer des objectifs d'épargne — sans connexion bancaire ni saisie manuelle.

---

## ✨ Fonctionnalités

- **Analyse automatique de relevés PDF** : extraction et catégorisation des
  transactions via l'API Gemini
- **Tableau de bord interactif** : répartition des dépenses par catégorie
  (Chart.js), évolution mensuelle, comparaison entre relevés
- **Thunie, le coach IA** : chat conversationnel qui répond à tes questions sur
  tes finances et te donne des conseils personnalisés
- **Objectifs d'épargne** : suggestions automatiques basées sur ton budget,
  suivi de progression
- **Application installable (PWA)** : fonctionne hors-ligne, expérience mobile
  optimisée
- **Sauvegarde chiffrée de bout en bout** : tes données financières sont
  chiffrées côté client (Web Crypto) avant toute synchronisation — le serveur
  ne voit jamais tes données en clair

---

## 🏗️ Architecture

```
Relevé PDF → Analyse (Gemini) → IndexedDB (par utilisateur) → Dashboard + Thunie
                                        │
                                        ▼
                        Sauvegarde chiffrée E2E (Postgres / Prisma)
```

| Couche | Technologie | Rôle |
| :--- | :--- | :--- |
| Frontend | Next.js 14 (App Router), Tailwind, Framer Motion, GSAP | Interface, animations, PWA |
| IA | Gemini API (`flash` / `flash-lite`) | Extraction PDF & coach conversationnel |
| Données locales | IndexedDB (`idb`) | Relevés, transactions, budgets, objectifs |
| Comptes & sessions | Auth.js + Prisma + Postgres (Neon) | Authentification, sauvegarde chiffrée |
| Sécurité | Web Crypto (AES-GCM, PBKDF2) | Chiffrement de bout en bout des sauvegardes |

---

## 🚀 Lancer le projet en local

```bash
npm install
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000) pour voir le résultat.

Variables d'environnement nécessaires (`.env.local`) :

```
DATABASE_URL=...
NEXTAUTH_SECRET=...
GEMINI_API_KEY=...
```

---

## 📦 Déploiement

Déployé sur **Vercel** :

```bash
npx vercel --prod
```

---

<div align="center">

[![Portfolio](https://img.shields.io/badge/Portfolio-00f2ff?style=for-the-badge&logo=firefox&logoColor=black)](https://kim-san04.github.io) [![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/hakim-sawadogo) [![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Kim-San04)

![Footer](https://capsule-render.vercel.app/api?type=waving&color=0:FBBF24,100:F97316&height=80&section=footer)

</div>
