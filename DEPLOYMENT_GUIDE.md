# 🚀 NÁVOD NA DEPLOYMENT - KROK ZA KROKOM

## Predpoklady
- GitHub účet (zadarmo na github.com)
- Git nainštalovaný na počítači (alebo použite GitHub Desktop)

---

## OPTION 1: Cez GitHub Web Interface (Najjednoduchšie - bez inštalácie)

### Krok 1: Vytvorte GitHub repository
1. Choďte na https://github.com/new
2. Názov: `envelope-configurator`
3. Nastavte na **Public**
4. **NEŠKRTAJTE** "Add README"
5. Kliknite **Create repository**

### Krok 2: Nahrajte súbory
1. Na stránke nového repository kliknite **uploading an existing file**
2. Presuňte všetky súbory z projektu (okrem node_modules!)
3. Commit message: "Initial commit"
4. Kliknite **Commit changes**

### Krok 3: Povoľte GitHub Pages
1. V repository choďte na **Settings**
2. V ľavom menu kliknite **Pages**
3. Pod "Build and deployment":
   - Source: Vyberte **GitHub Actions**
4. Počkajte 2-3 minúty

### Krok 4: Nájdite vašu URL
- Váš konfigurátor bude na: `https://VASE-GITHUB-MENO.github.io/envelope-configurator/`
- Skontrolujte v Settings > Pages

---

## OPTION 2: Cez Git (Pokročilejšie)

### Krok 1: Inicializujte Git
```bash
cd envelope-configurator
git init
git add .
git commit -m "Initial commit"
```

### Krok 2: Vytvorte GitHub repository
1. Choďte na https://github.com/new
2. Názov: `envelope-configurator`
3. Public
4. Create repository

### Krok 3: Pushnutie kódu
```bash
git branch -M main
git remote add origin https://github.com/VASE-MENO/envelope-configurator.git
git push -u origin main
```

### Krok 4: Povoľte GitHub Pages
V Settings > Pages > Source: **GitHub Actions**

### Krok 5: Deploy
Automaticky sa spustí pri push, alebo:
```bash
npm install
npm run build
npm run deploy
```

---

## ✅ OVERENIE ŽE TO FUNGUJE

1. Choďte na `https://VASE-MENO.github.io/envelope-configurator/`
2. Malo by sa zobraziť:
   - Drevená obálka
   - Text "Meno Priezvisko"
   - Tlačidlá "Pridať text" a "Nahrať obrázok"

Ak vidíte prázdnu stránku:
- Počkajte 5 minút (deploy trvá)
- Skontrolujte Actions tab v GitHub (musia byť zelené ✓)
- Vyskúšajte Ctrl+F5 (hard refresh)

---

## 🔗 INTEGRÁCIA DO SHOPTETU

### Metóda A: Iframe (odporúčané)

1. V Shoptet admin choďte na produkt "Drevená obálka"
2. V popise produktu prepnite na **HTML režim** (ikona <>)
3. Vložte tento kód:

```html
<div style="margin: 20px 0;">
  <h3>Navrhni si vlastnú obálku</h3>
  <iframe 
    src="https://VASE-MENO.github.io/envelope-configurator/" 
    width="100%" 
    height="1200px"
    frameborder="0"
    style="border: 2px solid #d97706; border-radius: 12px; margin-top: 10px;"
  ></iframe>
</div>
```

4. **DÔLEŽITÉ**: Zmeňte `VASE-MENO` za vaše GitHub meno!
5. Uložte produkt

### Metóda B: Externý link

Pridajte tlačidlo do popisu:

```html
<div style="text-align: center; margin: 30px 0;">
  <a href="https://VASE-MENO.github.io/envelope-configurator/" 
     target="_blank"
     style="display: inline-block; 
            padding: 20px 40px; 
            background: linear-gradient(135deg, #d97706 0%, #b45309 100%); 
            color: white; 
            text-decoration: none; 
            border-radius: 12px; 
            font-weight: bold; 
            font-size: 18px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            transition: transform 0.2s;">
     🎨 Navrhni vlastnú obálku
  </a>
</div>
```

---

## 🔧 RIEŠENIE PROBLÉMOV

### Konfigurátor sa nezobrazuje
- Skontrolujte Actions v GitHub (musia byť zelené)
- Vyskúšajte priamy link vo vašom prehliadači
- Počkajte 5-10 minút po prvom deployi

### Iframe nefunguje v Shoptete
- Uistite sa, že ste v HTML režime
- Skontrolujte, či URL je správna
- Vyskúšajte najskôr priamy link (Metóda B)

### Build zlyhá v GitHub Actions
- Skontrolujte, že package.json je správny
- Overte, že všetky súbory sú nahraté

### 404 Error
- V package.json skontrolujte `"homepage": "."`
- V Settings > Pages skontrolujte, že je zvolené "GitHub Actions"

---

## 📞 ĎALŠIA POMOC

Ak sa niečo nepodarí:
1. Skontrolujte Actions tab v GitHub
2. Pozrite sa na error logy
3. Uistite sa, že URL je správna

---

**HOTOVO! Teraz máte funkčný konfigurátor dostupný online ZADARMO!** 🎉
