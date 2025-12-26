# 🔧 Řešení problémů s Vercel API

## Problém: API endpointy nefungují

### Krok 1: Zkontrolujte, že Vercel rozpoznává API složku

1. Jděte na Vercel Dashboard → Váš projekt
2. Klikněte na **Deployments**
3. Klikněte na poslední deployment
4. Podívejte se na záložku **Functions**

**Co byste měli vidět:**
- `/api/test`
- `/api/hello`
- `/api/status`
- `/api/generate-posts`

**Pokud nevidíte žádné funkce:**
- Vercel nerozpoznává API složku
- Zkontrolujte, že soubory jsou v `/api` složce v root projektu
- Zkontrolujte, že mají správný formát (`export default function handler`)

### Krok 2: Zkontrolujte Build Logs

1. V deploymentu klikněte na **Build Logs**
2. Podívejte se, jestli jsou nějaké chyby

**Možné problémy:**
- Chybějící závislosti
- Chyby v kódu
- Problémy s build procesem

### Krok 3: Zkontrolujte Function Logs

1. V deploymentu → **Functions** → klikněte na `/api/test`
2. Klikněte na **Logs**
3. Zkuste otevřít endpoint v prohlížeči
4. Podívejte se, jestli se v logách objeví nějaké chyby

### Krok 4: Otestujte endpointy

Zkuste otevřít tyto URL v prohlížeči:

1. `https://vaše-url.vercel.app/api/status` - nejjednodušší test
2. `https://vaše-url.vercel.app/api/hello` - jednoduchý test
3. `https://vaše-url.vercel.app/api/test` - test s environment variables

**Co byste měli vidět:**
- JSON odpověď s `status: 'ok'` nebo `message: '...'`

**Pokud vidíte 404:**
- Vercel nerozpoznává API funkce
- Zkontrolujte `vercel.json` konfiguraci

**Pokud vidíte 500:**
- Podívejte se do Function Logs pro detaily chyby

### Krok 5: Zkontrolujte vercel.json

Soubor `vercel.json` by měl obsahovat:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "functions": {
    "api/*.js": {
      "runtime": "nodejs20.x",
      "maxDuration": 30
    }
  }
}
```

### Krok 6: Zkontrolujte strukturu projektu

Projekt by měl mít tuto strukturu:

```
project-root/
├── api/
│   ├── test.js
│   ├── hello.js
│   ├── status.js
│   └── generate-posts.js
├── src/
├── package.json
├── vercel.json
└── ...
```

**Důležité:**
- API soubory musí být v `/api` složce v **root** projektu
- Ne v `/dist/api` nebo `/src/api`
- Musí být commitnuté do Git repozitáře

### Krok 7: Redeploy

Po každé změně v `vercel.json` nebo API souborech:

1. Pushněte změny do Git
2. Počkejte na automatický deploy nebo
3. Manuálně spusťte redeploy v Vercel Dashboard

## Časté chyby

### Chyba: "Cannot find module"
- **Řešení:** Zkontrolujte, že všechny závislosti jsou v `package.json`
- Spusťte `npm install` lokálně a pushněte `package-lock.json`

### Chyba: "Function not found"
- **Řešení:** Zkontrolujte, že API soubory jsou v `/api` složce
- Zkontrolujte, že mají správný formát (`export default function handler`)

### Chyba: "Timeout"
- **Řešení:** Vercel Free plan má timeout 10 sekund
- Zvažte upgrade na Pro plan (60 sekund) nebo optimalizujte kód

### Chyba: "Environment variable not found"
- **Řešení:** Zkontrolujte Settings → Environment Variables
- Ujistěte se, že je proměnná nastavená pro správné prostředí (Production, Preview, Development)

## Kontakt

Pokud nic z výše uvedeného nepomohlo, zkontrolujte:
1. Vercel dokumentaci: https://vercel.com/docs/functions
2. Vercel komunitu: https://github.com/vercel/vercel/discussions
