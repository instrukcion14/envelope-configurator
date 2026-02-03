import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Type, ImagePlus, Trash2, Copy,
  AlignLeft, AlignCenter, AlignRight,
  Bold, Italic, Layers, Save, FolderOpen, X
} from 'lucide-react';
import opentype from 'opentype.js';

/* =========================================================
   i18n  \u2013  every diacritic is a \uXXXX escape so the file
   stays safe no matter what encoding GitHub picks.
   ========================================================= */
const i18n = {
  sk: {
    title:            'Konfigur\u00E1tor drevenej ob\u00E1lky',
    subtitle:         'Drag & drop \u2022 \u00DApr\u00E1va textov \u2022 SVG export \u2022 Vlastn\u00E9 pozadie',
    preview:          'N\u00E1h\u013Ead',
    addText:          'Prida\u0165 text',
    uploadImage:      'Nahra\u0165 obr\u00E1zok / SVG',
    exportSvg:        'Export SVG',
    fetchingFonts:    '\u23F3 H\u013Ead\u00E1 sa fonty\u2026',
    elementsTab:      'Prvky',
    backgroundTab:    '\uD83D\uDDBC\uFE0F Pozadie',
    backgroundTitle:  'Pozadn\u00E1 vrstva',
    backgroundDesc:   'Nahra\u0165 vlastn\u00FD SVG alebo obr\u00E1zok ako pozadie. Podporuj\u00FA sa PNG, JPG, SVG.',
    uploadBg:         '\uD83D\uDDBC\uFE0F Nahra\u0165 pozadie (SVG / PNG / JPG)',
    uploadBgHint:     'Drag & drop alebo kliknite',
    removeBg:         '\uD83D\uDDD1\uFE0F Odstr\u00E1nir pozadie (vr\u00E1ti sa default drevo)',
    currentBg:        'Moment\u00E1lne: v\u00FDchoz\u00E1 dreven\u00E1 text\u00FAra',
    elementsTitle:    'Prvky na ob\u00E1lke',
    noElements:       '\u017Eiadne prvky. Pridajte text alebo obr\u00E1zok.',
    editTitle:        '\u00DApr\u00E1va',
    editText:         'Text',
    editImage:        'Obr\u00E1zok',
    labelText:        'Text',
    labelFont:        'P\u00EDsmo',
    labelSize:        'Ve\u013Ekos\u0165',
    labelColor:       'Farba',
    labelStyle:       '\u0161t\u00FDl',
    labelAlign:       'Zarovnanie',
    labelWidth:       '\u0161\u00EDrka',
    labelRotation:    'Rot\u00E1cia',
    labelOpacity:     'Prieh\u013Ealos\u0165',
    saveConfig:       'Ulo\u017Ei\u0165 konfigur\u00E1ciu (JSON)',
    loadConfig:       'Otvori\u0165 konfigur\u00E1ciu (JSON)',
    exportToSvg:      'Export do SVG',
    textAsVectors:    'Text ako vektory',
    invalidJson:      'Neplatn\u00FD JSON s\u00FAbor.',
    newText:          'Nov\u00FD text',
    hint:             '\uD83D\uDCA1 Kliknite a \u0165ahajte prvky \u2022 Fonty optimalizovan\u00E9 pre svadobn\u00E9 grav\u00EDrovanie',
    fontGroup1:       '\u2728 Wedding / Ornamental',
    fontGroup2:       '\uD83D\uDDD1\uFE0F Elegant / Classic',
    fontGroup3:       '\uD83D\uDCDD Modern / Other',
    closeTitle:       'Zatvori\u0165',
  },
  cs: {
    title:            'Konfigur\u00E1tor d\u0159even\u011Bn\u00E9 ob\u00E1lky',
    subtitle:         'Drag & drop \u2022 \u00DApr\u00E1va text\u016F \u2022 SVG export \u2022 Vlastn\u00ED pozad\u00ED',
    preview:          'N\u00E1hled',
    addText:          'P\u0159idat text',
    uploadImage:      'Nahr\u00E1t obr\u00E1zek / SVG',
    exportSvg:        'Export SVG',
    fetchingFonts:    '\u23F3 Hled\u00E1 se fonty\u2026',
    elementsTab:      'Prvky',
    backgroundTab:    '\uD83D\uDDBC\uFE0F Pozad\u00ED',
    backgroundTitle:  'Vrstva pozad\u00ED',
    backgroundDesc:   'Nahr\u00E1te vlastn\u00ED SVG nebo obr\u00E1zek jako pozad\u00ED. Podporuj\u00ED se PNG, JPG, SVG.',
    uploadBg:         '\uD83D\uDDBC\uFE0F Nahr\u00E1it pozad\u00ED (SVG / PNG / JPG)',
    uploadBgHint:     'Drag & drop nebo klikn\u011Bte',
    removeBg:         '\uD83D\uDDD1\uFE0F Odstranit pozad\u00ED (vr\u00E1t\u00ED se default d\u0159evo)',
    currentBg:        'Nyn\u00ED: v\u00FDchoz\u00E1 d\u0159ev\u011Bn\u00E1 textura',
    elementsTitle:    'Prvky na ob\u00E1lce',
    noElements:       '\u017E\u00E1dn\u00E9 prvky. P\u0159idejte text nebo obr\u00E1zek.',
    editTitle:        '\u00DApr\u00E1va',
    editText:         'Text',
    editImage:        'Obr\u00E1zek',
    labelText:        'Text',
    labelFont:        'P\u00EDsmo',
    labelSize:        'Velikost',
    labelColor:       'Barva',
    labelStyle:       'Styl',
    labelAlign:       'Zarovn\u00E1n\u00ED',
    labelWidth:       '\u0161\u00ED\u0159ka',
    labelRotation:    'Rotace',
    labelOpacity:     'Pr\u016Fhlednost',
    saveConfig:       'Ulo\u017Eit konfiguraci (JSON)',
    loadConfig:       'Otev\u0159\u00EDt konfiguraci (JSON)',
    exportToSvg:      'Export do SVG',
    textAsVectors:    'Text jako vektory',
    invalidJson:      'Neplatn\u00FD JSON soubor.',
    newText:          'Nov\u00FD text',
    hint:             '\uD83D\uDCA1 Klikn\u011Bte a p\u0159it\u00E1hn\u011Bte prvky \u2022 Fonty optimalizovan\u00E9 pro svatebn\u00ED gravuru',
    fontGroup1:       '\u2728 Wedding / Ornamental',
    fontGroup2:       '\uD83D\uDDD1\uFE0F Elegant / Classic',
    fontGroup3:       '\uD83D\uDCDD Modern / Other',
    closeTitle:       'Zav\u0159\u00EDt',
  },
  en: {
    title:            'Wooden Envelope Configurator',
    subtitle:         'Drag & drop \u2022 Edit texts \u2022 SVG export \u2022 Custom background',
    preview:          'Preview',
    addText:          'Add text',
    uploadImage:      'Upload image / SVG',
    exportSvg:        'Export SVG',
    fetchingFonts:    '\u23F3 Fetching fonts\u2026',
    elementsTab:      'Elements',
    backgroundTab:    '\uD83D\uDDBC\uFE0F Background',
    backgroundTitle:  'Background layer',
    backgroundDesc:   'Upload your own SVG or image as background. PNG, JPG, SVG supported.',
    uploadBg:         '\uD83D\uDDBC\uFE0F Upload background (SVG / PNG / JPG)',
    uploadBgHint:     'Drag & drop or click',
    removeBg:         '\uD83D\uDDD1\uFE0F Remove background (restores default wood)',
    currentBg:        'Currently: default wood texture',
    elementsTitle:    'Elements on envelope',
    noElements:       'No elements. Add text or an image.',
    editTitle:        'Edit',
    editText:         'Text',
    editImage:        'Image',
    labelText:        'Text',
    labelFont:        'Font',
    labelSize:        'Size',
    labelColor:       'Color',
    labelStyle:       'Style',
    labelAlign:       'Alignment',
    labelWidth:       'Width',
    labelRotation:    'Rotation',
    labelOpacity:     'Opacity',
    saveConfig:       'Save configuration (JSON)',
    loadConfig:       'Open configuration (JSON)',
    exportToSvg:      'Export to SVG',
    textAsVectors:    'Text as vectors',
    invalidJson:      'Invalid JSON file.',
    newText:          'New text',
    hint:             '\uD83D\uDCA1 Click and drag elements \u2022 Fonts optimised for wedding engraving',
    fontGroup1:       '\u2728 Wedding / Ornamental',
    fontGroup2:       '\uD83D\uDDD1\uFE0F Elegant / Classic',
    fontGroup3:       '\uD83D\uDCDD Modern / Other',
    closeTitle:       'Close',
  },
};

/* =========================================================
   Google Fonts master URL
   ========================================================= */
const GOOGLE_FONTS_URL =
  'https://fonts.googleapis.com/css2?' +
  'family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&' +
  'family=Montserrat:wght@400;700&' +
  'family=Great+Vibes&' +
  'family=Dancing+Script:wght@400;700&' +
  'family=Pacifico&' +
  'family=Alex+Brush&' +
  'family=Allura&' +
  'family=Pinyon+Script&' +
  'family=Sacramento&' +
  'family=Caveat:wght@400;700&' +
  'family=Cinzel:wght@400;700&' +
  'family=Cormorant+Garamond:ital,wght@0,400;0,700;1,400&' +
  'family=Lora:ital,wght@0,400;0,700;1,400&' +
  'display=swap';

const GOOGLE_FONT_NAMES = [
  'Playfair Display','Montserrat','Great Vibes','Dancing Script',
  'Pacifico','Alex Brush','Allura','Pinyon Script','Sacramento',
  'Caveat','Cinzel','Cormorant Garamond','Lora',
];

/* =========================================================
   Font groups
   ========================================================= */
function getFontGroups(t) {
  return [
    { label: t.fontGroup1, fonts: [
      { value:'Great Vibes',    label:'Great Vibes'    },
      { value:'Dancing Script', label:'Dancing Script' },
      { value:'Pacifico',       label:'Pacifico'       },
      { value:'Alex Brush',     label:'Alex Brush'     },
      { value:'Allura',         label:'Allura'         },
      { value:'Pinyon Script',  label:'Pinyon Script'  },
      { value:'Sacramento',     label:'Sacramento'     },
    ]},
    { label: t.fontGroup2, fonts: [
      { value:'Playfair Display',   label:'Playfair Display'   },
      { value:'Cinzel',             label:'Cinzel'             },
      { value:'Cormorant Garamond', label:'Cormorant Garamond' },
      { value:'Lora',               label:'Lora'               },
    ]},
    { label: t.fontGroup3, fonts: [
      { value:'Montserrat', label:'Montserrat'          },
      { value:'Caveat',     label:'Caveat (Handwritten)'},
      { value:'Courier New',label:'Courier New'         },
      { value:'Georgia',    label:'Georgia'             },
    ]},
  ];
}

/* =========================================================
   Helpers
   ========================================================= */
function escapeXml(s) {
  return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;');
}

/* Google Fonts CSS2 URL for ONE family + weight/style variant */
function googleFontVariantUrl(family, weight, style) {
  const w = weight === 'bold'   ? '700' : '400';
  const i = style  === 'italic' ? '1'   : '0';
  return 'https://fonts.googleapis.com/css2?family=' +
    encodeURIComponent(family) + ':ital,wght@' + i + ',' + w + '&display=swap';
}

/* Fetch woff2 for one variant \u2192 opentype.Font | null */
async function loadOpentypeFont(family, weight, style) {
  if (!GOOGLE_FONT_NAMES.includes(family)) return null;
  try {
    const css = await (await fetch(googleFontVariantUrl(family, weight, style))).text();
    const m   = css.match(/url\(([^)]+)\)/);
    if (!m) return null;
    const buf = await (await fetch(m[1])).arrayBuffer();
    return opentype.parse(buf);
  } catch (_) { return null; }
}

/* Inline @font-face blocks for a list of families */
async function fetchInlinedFontCSS(families) {
  const toFetch = families.filter(f => GOOGLE_FONT_NAMES.includes(f));
  if (!toFetch.length) return '';
  const params = toFetch.map(f => 'family='+encodeURIComponent(f)).join('&');
  try {
    const css    = await (await fetch('https://fonts.googleapis.com/css2?'+params+'&display=swap')).text();
    const blocks = css.match(/@font-face\s*\{[^}]+\}/g) || [];
    let out = '';
    for (const block of blocks) {
      const m = block.match(/url\(([^)]+)\)/);
      if (!m) continue;
      try {
        const buf = await (await fetch(m[1])).arrayBuffer();
        const b64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
        out += block.replace(m[1], 'data:font/woff2;base64,'+b64)+'\n';
      } catch (_) { out += block+'\n'; }
    }
    return out;
  } catch (_) { return ''; }
}

/* Pre-load <img> from data-URL */
function preloadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload  = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src     = src;
  });
}

/* Language from ?lang=XX */
function detectLang() {
  const p = new URLSearchParams(window.location.search);
  const l = (p.get('lang') || 'sk').toLowerCase().slice(0,2);
  return i18n[l] ? l : 'sk';
}

/* Inside iframe? */
function isInModal() {
  try { return window.self !== window.top; } catch(_) { return false; }
}

/* =========================================================
   MAIN COMPONENT
   ========================================================= */
export default function App() {
  const [lang, setLang]                   = useState(detectLang);
  const t                                 = i18n[lang];

  useEffect(() => {
    const handler = (ev) => {
      if (!ev.data) return;
      /* parent wants to switch language */
      if (ev.data.type === 'set-lang' && i18n[ev.data.lang])
        setLang(ev.data.lang);
      /* parent pushes a previously-saved config back into the configurator */
      if (ev.data.type === 'load-config' && ev.data.config) {
        const cfg = ev.data.config;
        if (cfg.elements)           setElements(cfg.elements);
        if ('backgroundSrc' in cfg) setBackgroundSrc(cfg.backgroundSrc);
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  const [elements, setElements]           = useState([
    { id:1, type:'text', content:'Meno Priezvisko',
      x:50, y:30, fontSize:32, fontFamily:'Great Vibes',
      color:'#2c1810', fontWeight:'normal', fontStyle:'normal',
      align:'center', rotation:0, opacity:1 },
  ]);
  const [backgroundSrc, setBackgroundSrc] = useState(null);
  const [selectedId, setSelectedId]       = useState(1);
  const [isDragging, setIsDragging]       = useState(false);
  const [dragOffset, setDragOffset]       = useState({ x:0, y:0 });
  const [activeTab, setActiveTab]         = useState('elements');
  const [isExporting, setIsExporting]     = useState(false);
  const [textAsVectors, setTextAsVectors] = useState(true);
  const canvasRef                         = useRef(null);

  const selectedElement = elements.find(el => el.id === selectedId);
  const modal           = isInModal();

  /* ---- element CRUD ---- */
  const updateElement = (id, upd) =>
    setElements(prev => prev.map(el => el.id===id ? {...el,...upd} : el));

  const addTextElement = () => {
    const newId = Math.max(...elements.map(e=>e.id), 0)+1;
    setElements(prev => [...prev, {
      id:newId, type:'text', content:t.newText,
      x:50, y:50, fontSize:24, fontFamily:'Great Vibes',
      color:'#2c1810', fontWeight:'normal', fontStyle:'normal',
      align:'center', rotation:0, opacity:1,
    }]);
    setSelectedId(newId);
  };

  const addImageElement = (dataUrl) => {
    const newId = Math.max(...elements.map(e=>e.id), 0)+1;
    setElements(prev => [...prev, {
      id:newId, type:'image', src:dataUrl,
      x:50, y:50, width:25, rotation:0, opacity:1,
    }]);
    setSelectedId(newId);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => addImageElement(ev.target.result);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleBackgroundUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setBackgroundSrc(ev.target.result);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const deleteElement = (id) => {
    setElements(prev => prev.filter(el => el.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const duplicateElement = (id) => {
    const el = elements.find(e => e.id === id);
    if (!el) return;
    const newId = Math.max(...elements.map(e=>e.id), 0)+1;
    setElements(prev => [...prev, {...el, id:newId, x:el.x+5, y:el.y+5}]);
    setSelectedId(newId);
  };

  /* ---- drag ---- */
  const handleMouseDown = (id, e) => {
    e.stopPropagation();
    setSelectedId(id);
    setIsDragging(true);
    const el   = elements.find(e2 => e2.id === id);
    const rect = canvasRef.current.getBoundingClientRect();
    setDragOffset({
      x: ((e.clientX-rect.left)/rect.width)*100  - el.x,
      y: ((e.clientY-rect.top) /rect.height)*100 - el.y,
    });
  };

  const handleMouseMove = useCallback((e) => {
    if (!isDragging || !selectedId || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const nx = ((e.clientX-rect.left)/rect.width)*100  - dragOffset.x;
    const ny = ((e.clientY-rect.top) /rect.height)*100 - dragOffset.y;
    setElements(prev => prev.map(el =>
      el.id===selectedId
        ? {...el, x:Math.max(0,Math.min(100,nx)), y:Math.max(0,Math.min(100,ny))}
        : el
    ));
  }, [isDragging, selectedId, dragOffset]);

  const handleMouseUp = () => setIsDragging(false);

  /* ---- thumbnail (async, images pre-loaded) ---- */
  const generateThumbnail = useCallback(async () => {
    const W = 400, H = 267;
    const cvs = document.createElement('canvas');
    cvs.width = W; cvs.height = H;
    const ctx = cvs.getContext('2d');

    /* background */
    if (backgroundSrc) {
      const bg = await preloadImage(backgroundSrc);
      if (bg) ctx.drawImage(bg, 0, 0, W, H);
    } else {
      const grad = ctx.createLinearGradient(0,0,W,H);
      grad.addColorStop(0,   '#f5e6c8');
      grad.addColorStop(0.4, '#eddcb0');
      grad.addColorStop(1,   '#faf0d7');
      ctx.fillStyle = grad;
      ctx.fillRect(0,0,W,H);
    }

    /* pre-load all image elements in parallel */
    const imgCache = {};
    await Promise.all(
      elements.filter(el => el.type==='image').map(async (el) => {
        imgCache[el.id] = await preloadImage(el.src);
      })
    );

    /* draw */
    elements.forEach(el => {
      ctx.save();
      ctx.translate((el.x/100)*W, (el.y/100)*H);
      ctx.rotate((el.rotation||0)*Math.PI/180);
      ctx.globalAlpha = el.opacity ?? 1;

      if (el.type === 'text') {
        const italic = el.fontStyle==='italic' ? 'italic ' : '';
        const bold   = el.fontWeight==='bold'   ? 'bold '   : '';
        ctx.font         = `${italic}${bold}${el.fontSize}px '${el.fontFamily}', cursive, serif`;
        ctx.fillStyle    = el.color;
        ctx.textBaseline = 'middle';
        ctx.textAlign    = el.align==='right' ? 'right' : el.align==='center' ? 'center' : 'left';
        ctx.fillText(el.content||'', 0, 0);
      } else if (el.type==='image' && imgCache[el.id]) {
        const imgW = (el.width/100)*W;
        const imgH = imgW * (imgCache[el.id].naturalHeight / imgCache[el.id].naturalWidth);
        ctx.drawImage(imgCache[el.id], -imgW/2, -imgH/2, imgW, imgH);
      }
      ctx.restore();
    });

    return cvs.toDataURL('image/png');
  }, [elements, backgroundSrc]);

  /* ---- modal close ---- */
  const closeModal = async () => {
    const thumb  = await generateThumbnail();
    try {
      window.parent.postMessage({
        type:'configurator-close',
        thumbnail: thumb,
        config: { elements, backgroundSrc }
      }, '*');
    } catch(_) {}
  };

  /* ---- save / load JSON ---- */
  const saveConfiguration = () => {
    const blob = new Blob(
      [JSON.stringify({ elements, backgroundSrc, lang, savedAt: new Date().toISOString() }, null, 2)],
      { type:'application/json' }
    );
    const a = document.createElement('a');
    a.href  = URL.createObjectURL(blob);
    a.download = 'obalka-konfigur\u00E1cia.json';
    document.body.appendChild(a); a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
  };

  const loadConfiguration = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const cfg = JSON.parse(ev.target.result);
        if (cfg.elements)           setElements(cfg.elements);
        if ('backgroundSrc' in cfg) setBackgroundSrc(cfg.backgroundSrc);
        if (cfg.lang && i18n[cfg.lang]) setLang(cfg.lang);
      } catch(_) { alert(t.invalidJson); }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  /* ---- SVG export ---- */
  const exportSVG = async () => {
    setIsExporting(true);
    const W = 900, H = 600;
    let defs = '', body = '';

    /* background */
    if (backgroundSrc) {
      body += `<image href="${backgroundSrc}" x="0" y="0" width="${W}" height="${H}" preserveAspectRatio="xMidYMid slice"/>`;
    } else {
      defs += `<linearGradient id="woodBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%"   stop-color="#f5e6c8"/>
        <stop offset="40%"  stop-color="#eddcb0"/>
        <stop offset="100%" stop-color="#faf0d7"/>
      </linearGradient>`;
      body += `<rect width="${W}" height="${H}" fill="url(#woodBg)"/>`;
      for (let i=0; i<30; i++) {
        const y  = (i/30)*H;
        const op = 0.04 + (((i*7)%10)/10)*0.06;
        body += `<line x1="0" y1="${y}" x2="${W}" y2="${y+10}" stroke="#8B4513" stroke-width="1" opacity="${op}"/>`;
      }
    }

    /* unique (family|weight|style) combos used */
    const textEls  = elements.filter(el => el.type==='text');
    const comboSet = new Set(textEls.map(el => `${el.fontFamily}|${el.fontWeight}|${el.fontStyle}`));
    const combos   = [...comboSet].map(s => { const [f,w,st]=s.split('|'); return {family:f,weight:w,style:st}; });

    /* load opentype variants in parallel if vectors ON */
    const fontCache = {};
    if (textAsVectors) {
      await Promise.all(combos.map(async (c) => {
        const key = `${c.family}|${c.weight}|${c.style}`;
        fontCache[key] = await loadOpentypeFont(c.family, c.weight, c.style);
      }));
    }

    /* track which families fell back to <text> */
    const fallbackFamilies = new Set();

    /* text elements */
    textEls.forEach(el => {
      const cx  = (el.x/100)*W;
      const cy  = (el.y/100)*H;
      const rot = el.rotation||0;
      const op  = el.opacity??1;
      const key = `${el.fontFamily}|${el.fontWeight}|${el.fontStyle}`;
      const font = textAsVectors ? fontCache[key] : null;

      if (font) {
        try {
          const path = font.stringToPath(el.content||'', 0, 0, el.fontSize);
          const d    = path.toSVGString();
          const bb   = path.getBoundingBox();
          const offX = cx - (bb.x1+bb.x2)/2;
          const offY = cy - (bb.y1+bb.y2)/2;
          body += `<path d="${d}" fill="${el.color}" opacity="${op}" transform="translate(${offX},${offY}) rotate(${rot},${cx},${cy})"/>`;
          return;
        } catch(_) { /* fall through */ }
      }

      /* <text> fallback */
      fallbackFamilies.add(el.fontFamily);
      const anchor = el.align==='right' ? 'end' : el.align==='center' ? 'middle' : 'start';
      body += `<text x="${cx}" y="${cy}"
                 font-family="${el.fontFamily}, cursive, serif"
                 font-size="${el.fontSize}" fill="${el.color}"
                 font-weight="${el.fontWeight}" font-style="${el.fontStyle}"
                 text-anchor="${anchor}" dominant-baseline="middle"
                 opacity="${op}" transform="rotate(${rot},${cx},${cy})"
               >${escapeXml(el.content)}</text>`;
    });

    /* image elements */
    elements.filter(el => el.type==='image').forEach(el => {
      const cx   = (el.x/100)*W;
      const cy   = (el.y/100)*H;
      const rot  = el.rotation||0;
      const op   = el.opacity??1;
      const imgW = (el.width/100)*W;
      body += `<image href="${el.src}"
                 x="${cx-imgW/2}" y="${cy-imgW/3}" width="${imgW}"
                 opacity="${op}" transform="rotate(${rot},${cx},${cy})"
                 preserveAspectRatio="xMidYMid meet"/>`;
    });

    /* inline @font-face only for families that actually ended up as <text> */
    let styleCSS = '';
    if (fallbackFamilies.size > 0) {
      styleCSS = await fetchInlinedFontCSS([...fallbackFamilies]);
    }

    /* assemble */
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
     viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <defs>
    ${defs}
    ${styleCSS ? '<style type="text/css">'+styleCSS+'</style>' : ''}
  </defs>
  ${body}
</svg>`;

    const blob = new Blob([svg], {type:'image/svg+xml'});
    const a    = document.createElement('a');
    a.href     = URL.createObjectURL(blob);
    a.download = 'obalka-design.svg';
    document.body.appendChild(a); a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
    setIsExporting(false);
  };

  /* =========================================================
     RENDER
     ========================================================= */
  const fontGroups = getFontGroups(t);

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-amber-50 p-4"
         onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href={GOOGLE_FONTS_URL} rel="stylesheet" />

      <div className="max-w-7xl mx-auto">
        {/* header */}
        <div className="relative text-center mb-6">
          {modal && (
            <button onClick={closeModal}
              className="absolute top-0 right-0 z-50 w-10 h-10 flex items-center justify-center bg-white bg-opacity-90 rounded-full shadow-lg border border-gray-200 hover:bg-red-50 hover:border-red-300 transition"
              title={t.closeTitle}>
              <X className="w-5 h-5 text-gray-700" />
            </button>
          )}
          <h1 className="text-3xl font-bold text-amber-900 mb-1">{t.title}</h1>
          <p className="text-amber-700 text-sm">{t.subtitle}</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* ============ CANVAS ============ */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-2xl p-5">
              <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
                <h2 className="text-lg font-semibold text-amber-900">{t.preview}</h2>
                <div className="flex flex-wrap gap-2">
                  <button onClick={addTextElement}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition text-sm">
                    <Type className="w-4 h-4" /> {t.addText}
                  </button>
                  <label className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition cursor-pointer text-sm">
                    <ImagePlus className="w-4 h-4" /> {t.uploadImage}
                    <input type="file" accept="image/*,.svg" onChange={handleImageUpload} className="hidden" />
                  </label>
                  <button onClick={exportSVG} disabled={isExporting}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm disabled:opacity-60">
                    {isExporting ? t.fetchingFonts : t.exportSvg}
                  </button>
                </div>
              </div>

              <div ref={canvasRef}
                className="relative aspect-[3/2] rounded-lg shadow-inner overflow-hidden border-4 border-amber-300 cursor-crosshair"
                style={backgroundSrc ? {} : {
                  background:'linear-gradient(135deg,#f5e6c8 0%,#eddcb0 40%,#faf0d7 100%)',
                  backgroundImage:`repeating-linear-gradient(90deg,transparent,transparent 2px,rgba(139,69,19,0.08) 2px,rgba(139,69,19,0.08) 4px),
                    repeating-linear-gradient(0deg,transparent,transparent 20px,rgba(139,69,19,0.05) 20px,rgba(139,69,19,0.05) 22px)`,
                }}>
                {backgroundSrc && (
                  <img src={backgroundSrc} alt="bg"
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none" style={{zIndex:0}} />
                )}
                {elements.map(el =>
                  el.type==='text' ? (
                    <div key={el.id} onMouseDown={(e)=>handleMouseDown(el.id,e)}
                      className={`absolute cursor-move select-none ${selectedId===el.id ? 'ring-2 ring-blue-500 ring-offset-1 rounded' : ''}`}
                      style={{
                        zIndex:10, left:`${el.x}%`, top:`${el.y}%`,
                        transform:`translate(-50%,-50%) rotate(${el.rotation}deg)`,
                        fontSize:`${el.fontSize}px`,
                        fontFamily:`'${el.fontFamily}', cursive, serif`,
                        color:el.color, fontWeight:el.fontWeight, fontStyle:el.fontStyle,
                        textAlign:el.align, opacity:el.opacity,
                        textShadow:'1px 1px 2px rgba(0,0,0,0.15)',
                        padding:'2px 6px', whiteSpace:'nowrap',
                      }}
                    >{el.content||'(pr\u00E1zdne)'}</div>
                  ) : (
                    <img key={el.id} src={el.src} alt="prvok"
                      onMouseDown={(e)=>handleMouseDown(el.id,e)}
                      className={`absolute cursor-move select-none ${selectedId===el.id ? 'ring-2 ring-blue-500 ring-offset-1 rounded' : ''}`}
                      style={{
                        zIndex:10, left:`${el.x}%`, top:`${el.y}%`,
                        width:`${el.width}%`, height:'auto',
                        transform:`translate(-50%,-50%) rotate(${el.rotation}deg)`,
                        opacity:el.opacity,
                      }}
                    />
                  )
                )}
              </div>
              <p className="text-xs text-amber-600 mt-3 text-center">{t.hint}</p>
            </div>
          </div>

          {/* ============ SIDEBAR ============ */}
          <div className="space-y-4">
            {/* tabs */}
            <div className="flex bg-white rounded-xl shadow-xl overflow-hidden">
              <button onClick={()=>setActiveTab('elements')}
                className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-1.5 transition ${activeTab==='elements' ? 'bg-amber-600 text-white' : 'text-amber-900 hover:bg-amber-50'}`}>
                <Layers className="w-4 h-4" /> {t.elementsTab}
              </button>
              <button onClick={()=>setActiveTab('background')}
                className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-1.5 transition ${activeTab==='background' ? 'bg-amber-600 text-white' : 'text-amber-900 hover:bg-amber-50'}`}>
                {t.backgroundTab}
              </button>
            </div>

            {/* BACKGROUND */}
            {activeTab==='background' && (
              <div className="bg-white rounded-xl shadow-xl p-5 space-y-4">
                <h3 className="text-lg font-semibold text-amber-900">{t.backgroundTitle}</h3>
                <p className="text-sm text-gray-500">{t.backgroundDesc}</p>
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-amber-300 rounded-xl cursor-pointer hover:bg-amber-50 transition">
                  <span className="text-amber-700 text-sm font-medium">{t.uploadBg}</span>
                  <span className="text-xs text-gray-400 mt-1">{t.uploadBgHint}</span>
                  <input type="file" accept="image/*,.svg" onChange={handleBackgroundUpload} className="hidden" />
                </label>
                {backgroundSrc && (
                  <div className="space-y-3">
                    <div className="rounded-lg overflow-hidden border border-gray-200" style={{height:100}}>
                      <img src={backgroundSrc} alt="bg preview" className="w-full h-full object-cover" />
                    </div>
                    <button onClick={()=>setBackgroundSrc(null)}
                      className="w-full py-2 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition">
                      {t.removeBg}
                    </button>
                  </div>
                )}
                {!backgroundSrc && <p className="text-xs text-gray-400 italic">{t.currentBg}</p>}
              </div>
            )}

            {/* ELEMENTS */}
            {activeTab==='elements' && (
              <>
                <div className="bg-white rounded-xl shadow-xl p-5">
                  <h3 className="text-lg font-semibold text-amber-900 mb-3">{t.elementsTitle}</h3>
                  <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                    {elements.length===0 && <p className="text-sm text-gray-400 text-center py-4">{t.noElements}</p>}
                    {elements.map(el => (
                      <div key={el.id} onClick={()=>setSelectedId(el.id)}
                        className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition text-sm
                          ${selectedId===el.id ? 'bg-blue-100 border-2 border-blue-500' : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'}`}>
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {el.type==='text' ? <Type className="w-4 h-4 flex-shrink-0 text-amber-700"/> : <ImagePlus className="w-4 h-4 flex-shrink-0 text-blue-600"/>}
                          <span className="truncate">{el.type==='text' ? el.content : t.editImage}</span>
                        </div>
                        <div className="flex gap-1 ml-2">
                          <button onClick={(e)=>{e.stopPropagation();duplicateElement(el.id);}} className="p-1 hover:bg-blue-200 rounded"><Copy className="w-4 h-4"/></button>
                          <button onClick={(e)=>{e.stopPropagation();deleteElement(el.id);}}  className="p-1 hover:bg-red-200 rounded"><Trash2 className="w-4 h-4 text-red-600"/></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedElement && (
                  <div className="bg-white rounded-xl shadow-xl p-5 space-y-4">
                    <h3 className="text-lg font-semibold text-amber-900">
                      {t.editTitle}: {selectedElement.type==='text' ? t.editText : t.editImage}
                    </h3>

                    {selectedElement.type==='text' ? (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">{t.labelText}</label>
                          <textarea value={selectedElement.content}
                            onChange={(e)=>updateElement(selectedId,{content:e.target.value})}
                            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-amber-500 focus:outline-none text-sm" rows="2" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">{t.labelFont}</label>
                          <select value={selectedElement.fontFamily}
                            onChange={(e)=>updateElement(selectedId,{fontFamily:e.target.value})}
                            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-amber-500 focus:outline-none text-sm">
                            {fontGroups.map(g => (
                              <optgroup key={g.label} label={g.label}>
                                {g.fonts.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                              </optgroup>
                            ))}
                          </select>
                          <div className="mt-2 px-3 py-2 bg-amber-50 rounded-lg border border-amber-200 text-center truncate"
                            style={{fontFamily:`'${selectedElement.fontFamily}', cursive, serif`, fontSize:22, color:'#2c1810'}}>
                            {selectedElement.content || 'Preview'}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">{t.labelSize}: {selectedElement.fontSize}px</label>
                          <input type="range" min="10" max="80" value={selectedElement.fontSize}
                            onChange={(e)=>updateElement(selectedId,{fontSize:parseInt(e.target.value)})} className="w-full" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">{t.labelColor}</label>
                          <div className="flex items-center gap-3">
                            <input type="color" value={selectedElement.color}
                              onChange={(e)=>updateElement(selectedId,{color:e.target.value})}
                              className="h-9 w-16 rounded cursor-pointer border border-gray-200" />
                            <div className="flex gap-1.5 flex-wrap">
                              {['#2c1810','#1a1a2e','#4a0e0e','#0a3d62','#2d5016','#ffffff','#c9a84c'].map(c => (
                                <button key={c} onClick={()=>updateElement(selectedId,{color:c})}
                                  className={`w-6 h-6 rounded-full border-2 transition ${selectedElement.color===c ? 'border-blue-500 scale-110' : 'border-gray-300'}`}
                                  style={{background:c}} />
                              ))}
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">{t.labelStyle}</label>
                          <div className="flex gap-2">
                            <button onClick={()=>updateElement(selectedId,{fontWeight:selectedElement.fontWeight==='bold'?'normal':'bold'})}
                              className={`flex-1 py-2 rounded-lg border-2 transition flex items-center justify-center ${selectedElement.fontWeight==='bold' ? 'bg-amber-600 text-white border-amber-600' : 'bg-white border-gray-200 hover:border-amber-300'}`}>
                              <Bold className="w-4 h-4"/>
                            </button>
                            <button onClick={()=>updateElement(selectedId,{fontStyle:selectedElement.fontStyle==='italic'?'normal':'italic'})}
                              className={`flex-1 py-2 rounded-lg border-2 transition flex items-center justify-center ${selectedElement.fontStyle==='italic' ? 'bg-amber-600 text-white border-amber-600' : 'bg-white border-gray-200 hover:border-amber-300'}`}>
                              <Italic className="w-4 h-4"/>
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">{t.labelAlign}</label>
                          <div className="flex gap-2">
                            {[{v:'left',I:AlignLeft},{v:'center',I:AlignCenter},{v:'right',I:AlignRight}].map(({v,I})=>(
                              <button key={v} onClick={()=>updateElement(selectedId,{align:v})}
                                className={`flex-1 py-2 rounded-lg border-2 transition flex items-center justify-center ${selectedElement.align===v ? 'bg-amber-600 text-white border-amber-600' : 'bg-white border-gray-200 hover:border-amber-300'}`}>
                                <I className="w-4 h-4"/>
                              </button>
                            ))}
                          </div>
                        </div>
                      </>
                    ) : (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t.labelWidth}: {selectedElement.width}%</label>
                        <input type="range" min="5" max="60" value={selectedElement.width}
                          onChange={(e)=>updateElement(selectedId,{width:parseInt(e.target.value)})} className="w-full" />
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t.labelRotation}: {selectedElement.rotation}\u00B0</label>
                      <input type="range" min="0" max="360" value={selectedElement.rotation}
                        onChange={(e)=>updateElement(selectedId,{rotation:parseInt(e.target.value)})} className="w-full" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t.labelOpacity}: {Math.round(selectedElement.opacity*100)}%</label>
                      <input type="range" min="0" max="1" step="0.05" value={selectedElement.opacity}
                        onChange={(e)=>updateElement(selectedId,{opacity:parseFloat(e.target.value)})} className="w-full" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">X: {Math.round(selectedElement.x)}%</label>
                        <input type="range" min="0" max="100" value={selectedElement.x}
                          onChange={(e)=>updateElement(selectedId,{x:parseFloat(e.target.value)})} className="w-full" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Y: {Math.round(selectedElement.y)}%</label>
                        <input type="range" min="0" max="100" value={selectedElement.y}
                          onChange={(e)=>updateElement(selectedId,{y:parseFloat(e.target.value)})} className="w-full" />
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* action buttons */}
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-3 bg-white rounded-xl shadow-xl px-4 py-3 cursor-pointer">
                <div className="relative">
                  <input type="checkbox" checked={textAsVectors} onChange={(e)=>setTextAsVectors(e.target.checked)} className="sr-only" />
                  <div className={`w-11 h-6 rounded-full transition ${textAsVectors ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${textAsVectors ? 'translate-x-5' : ''}`} />
                </div>
                <span className="text-sm font-medium text-gray-700">{t.textAsVectors}</span>
              </label>

              <button onClick={saveConfiguration}
                className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 px-4 rounded-xl transition shadow-lg text-sm">
                <Save className="w-4 h-4"/> {t.saveConfig}
              </button>
              <label className="w-full flex items-center justify-center gap-2 bg-stone-600 hover:bg-stone-700 text-white font-semibold py-3 px-4 rounded-xl transition shadow-lg text-sm cursor-pointer">
                <FolderOpen className="w-4 h-4"/> {t.loadConfig}
                <input type="file" accept=".json" onChange={loadConfiguration} className="hidden" />
              </label>
              <button onClick={exportSVG} disabled={isExporting}
                className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-xl transition shadow-lg text-sm disabled:opacity-60">
                {isExporting ? t.fetchingFonts : t.exportToSvg}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
