# 🎨 Konfigurátor drevenej gravírovanej obálky

Pokročilý web konfigurátor pre personalizáciu drevených obálok s gravírovaním.

## ✨ Funkcie

- ✅ **Drag & Drop** - Voľné pozicovanie prvkov
- ✅ **Úprava textov** - Neomedzený počet textových polí
- ✅ **Nahrávanie grafiky** - Logá, obrázky
- ✅ **Pokročilá editácia** - Farba, font, veľkosť, rotácia, priehľadnosť
- ✅ **Náhľad v reálnom čase** - Okamžité zobrazenie zmien
- ✅ **Export konfigurácie** - Uloženie do JSON

## 🚀 Inštalácia a spustenie

### Lokálne spustenie

```bash
# Nainštalovať závislosti
npm install

# Spustiť vývojový server
npm start
```

Aplikácia sa otvorí na `http://localhost:3000`

### Deploy na GitHub Pages

1. **Vytvorte GitHub repository**
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/VASE-MENO/envelope-configurator.git
git push -u origin main
```

2. **Nastavte GitHub Pages**
   - Choďte do Settings > Pages
   - Source: GitHub Actions (alebo gh-pages branch)

3. **Deploy**
```bash
npm run deploy
```

Aplikácia bude dostupná na: `https://VASE-MENO.github.io/envelope-configurator/`

## 🔗 Integrácia do Shoptetu

### Metóda 1: Iframe (najjednoduchšie)

Pridajte do popisu produktu v Shoptete:

```html
<iframe 
  src="https://VASE-MENO.github.io/envelope-configurator/" 
  width="100%" 
  height="1000px"
  frameborder="0"
  style="border: none; border-radius: 8px;"
></iframe>
```

### Metóda 2: Direct Link

Pridajte tlačidlo v popise produktu:

```html
<a href="https://VASE-MENO.github.io/envelope-configurator/" 
   target="_blank"
   style="display: inline-block; padding: 15px 30px; background: #d97706; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
   🎨 Navrhnúť vlastnú obálku
</a>
```

## 📝 Ako používať

1. **Pridať text** - Kliknite na "Pridať text"
2. **Nahrať obrázok** - Kliknite na "Nahrať obrázok" a vyberte súbor
3. **Upraviť prvky** - Kliknite na prvok v zozname alebo priamo na canvase
4. **Posunúť** - Ťahajte prvky myšou alebo použite posúvače
5. **Rotovať** - Použite rotačný posúvač
6. **Zmeniť štýl** - Font, farba, veľkosť, tučné, kurzíva
7. **Duplikovať/Zmazať** - Ikony v zozname prvkov
8. **Uložiť** - Kliknite "Uložiť konfiguráciu"

## 🛠️ Technológie

- React 18
- Tailwind CSS
- Lucide React Icons
- GitHub Pages

## 📦 Štruktúra projektu

```
envelope-configurator/
├── public/
│   └── index.html
├── src/
│   ├── App.js          # Hlavný konfigurátor
│   ├── index.js        # Entry point
│   └── index.css       # Globálne štýly
├── package.json
├── .gitignore
└── README.md
```

## 🎨 Prispôsobenie

### Zmena farieb

V `src/App.js` upravte farby:
```javascript
// Pozadie
className="bg-gradient-to-br from-stone-50 to-amber-50"

// Tlačidlá
className="bg-amber-600 hover:bg-amber-700"
```

### Pridanie fontov

V `src/App.js` upravte pole `fonts`:
```javascript
const fonts = [
  { value: 'Playfair Display', label: 'Playfair (Elegantný)' },
  { value: 'Váš font', label: 'Váš popis' },
];
```

### Zmena textúry obálky

V `src/App.js` nájdite canvas div a upravte `backgroundImage` alebo pridajte vlastný obrázok.

## 📄 Licencia

MIT License - voľne použiteľné pre komerčné účely

## 🤝 Kontakt

Pre otázky alebo prispôsobenie kontaktujte autora.

---

**Vytvorené s ❤️ pre gravírovanie drevených obálok**
