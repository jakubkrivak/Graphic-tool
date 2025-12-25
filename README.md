# 📸 Generátor příspěvků na sociální sítě

Moderní webová aplikace pro generování příspěvků na sociální sítě z nahraných fotek pomocí AI.

## 🚀 Funkce

- 📷 Nahrávání více fotek najednou (drag & drop nebo kliknutí)
- 🤖 Automatická analýza fotek pomocí OpenAI GPT-4 Vision
- 📱 Generování příspěvků pro Instagram, Facebook a Twitter/X
- 📋 Kopírování příspěvků jedním kliknutím
- 🎨 Moderní a responzivní UI

## 📋 Požadavky

- Node.js 18+ 
- OpenAI API klíč

## 🛠️ Instalace

1. Nainstalujte závislosti:
```bash
npm install
```

2. Pro lokální vývoj vytvořte soubor `.env` a přidejte svůj OpenAI API klíč:
```bash
cp .env.example .env
```

Poté upravte `.env` a přidejte svůj API klíč:
```
OPENAI_API_KEY=sk-your-actual-api-key-here
```

**Pro Vercel:** Nastavte `OPENAI_API_KEY` v Environment Variables na Vercelu (viz [VERCEL_SETUP.md](./VERCEL_SETUP.md))

## 🎯 Spuštění

### Lokální vývoj:

Otevřete dva terminály:

**Terminál 1 - Backend server:**
```bash
npm run server
```

**Terminál 2 - Frontend:**
```bash
npm run dev
```

Aplikace bude dostupná na `http://localhost:3000`

### Nasazení na Vercel:

1. **Nastavte Environment Variables na Vercelu:**
   - Přejděte do projektu na Vercelu
   - Settings → Environment Variables
   - Přidejte: `OPENAI_API_KEY` s vaším API klíčem

2. **Pushněte změny:**
```bash
git push
```

Vercel automaticky nasadí aplikaci. API endpoint bude dostupný na `/api/generate-posts`

## 📝 Použití

1. Otevřete aplikaci v prohlížeči
2. Nahrajte jednu nebo více fotek (přetáhněte nebo klikněte)
3. Klikněte na "Vygenerovat příspěvky"
4. Zkopírujte vygenerované příspěvky pro jednotlivé platformy

## 🏗️ Struktura projektu

```
├── src/
│   ├── components/
│   │   ├── PhotoUpload.jsx    # Komponenta pro nahrávání fotek
│   │   └── PostGenerator.jsx  # Komponenta pro zobrazení příspěvků
│   ├── App.jsx                # Hlavní komponenta
│   ├── main.jsx               # Entry point
│   └── index.css              # Globální styly
├── server.js                  # Express backend server
├── package.json
└── vite.config.js
```

## 🔧 Technologie

- **Frontend:** React + Vite
- **Backend:** Express.js
- **AI:** OpenAI GPT-4 Vision API
- **File Upload:** Multer

## ⚠️ Poznámky

- Pro použití aplikace potřebujete platný OpenAI API klíč
- API volání jsou zpoplatněna podle ceníku OpenAI
- Nahrané fotky jsou dočasně uloženy a po zpracování smazány
