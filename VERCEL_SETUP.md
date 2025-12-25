# 🚀 Nastavení pro Vercel

## Krok 1: Environment Variables

1. Přejděte na [Vercel Dashboard](https://vercel.com/dashboard)
2. Vyberte váš projekt
3. Přejděte na **Settings** → **Environment Variables**
4. Přidejte novou proměnnou:
   - **Name:** `OPENAI_API_KEY`
   - **Value:** Váš OpenAI API klíč (začíná `sk-...`)
   - **Environment:** Production, Preview, Development (vyberte všechny)

## Krok 2: Deploy

Po nastavení environment variables:

1. Pushněte změny do repozitáře:
```bash
git add .
git commit -m "Připraveno pro Vercel"
git push
```

2. Vercel automaticky nasadí aplikaci

## Krok 3: Ověření

Po nasazení:
- Frontend bude dostupný na vaší Vercel URL
- API endpoint bude na `/api/generate-posts`
- Otestujte nahrání fotky a generování příspěvků

## ⚠️ Důležité poznámky

- **API klíč:** Ujistěte se, že máte platný OpenAI API klíč
- **Limity:** Vercel Free plan má timeout 10 sekund, Pro plan má 60 sekund
- **Velikost souborů:** Maximální velikost fotky je 10MB
- **Náklady:** OpenAI API volání jsou zpoplatněna podle ceníku OpenAI

## 🔧 Lokální testování s Vercel CLI

Pokud chcete testovat lokálně s Vercel prostředím:

```bash
npm i -g vercel
vercel dev
```

Tím se spustí lokální server, který simuluje Vercel prostředí.
