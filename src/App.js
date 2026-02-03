import React, { useState, useRef, useCallback } from 'react';
import { Type, ImagePlus, Trash2, Copy, AlignLeft, AlignCenter, AlignRight, Bold, Italic, Layers, Save, FolderOpen } from 'lucide-react';

/* --------------------------------------------------------
   Google Fonts â€“ every font we offer must be listed here.
   The same URL is used both for the live <link> tag and
   (via the CSS subset trick) to fetch @font-face blocks
   for embedding inside exported SVGs.
   -------------------------------------------------------- */
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

/* --------------------------------------------------------
   Font groups shown in the sidebar <select>
   -------------------------------------------------------- */
const FONT_GROUPS = [
  {
    label: '\u2728 Wedding / Ornamental',
    fonts: [
      { value: 'Great Vibes',    label: 'Great Vibes' },
      { value: 'Dancing Script', label: 'Dancing Script' },
      { value: 'Pacifico',       label: 'Pacifico' },
      { value: 'Alex Brush',     label: 'Alex Brush' },
      { value: 'Allura',         label: 'Allura' },
      { value: 'Pinyon Script',  label: 'Pinyon Script' },
      { value: 'Sacramento',     label: 'Sacramento' },
    ],
  },
  {
    label: '\uD83D\uDDD1\uFE0F Elegant / Classic',
    fonts: [
      { value: 'Playfair Display',    label: 'Playfair Display' },
      { value: 'Cinzel',              label: 'Cinzel' },
      { value: 'Cormorant Garamond',  label: 'Cormorant Garamond' },
      { value: 'Lora',                label: 'Lora' },
    ],
  },
  {
    label: '\uD83D\uDCDD Modern / Other',
    fonts: [
      { value: 'Montserrat', label: 'Montserrat' },
      { value: 'Caveat',     label: 'Caveat (Handwritten)' },
      { value: 'Courier New',label: 'Courier New' },
      { value: 'Georgia',    label: 'Georgia' },
    ],
  },
];

/* --------------------------------------------------------
   Utility â€“ escape special XML characters
   -------------------------------------------------------- */
function escapeXml(str) {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/* --------------------------------------------------------
   Utility â€“ given a list of font-family names that are
   actually used, fetch the Google Fonts CSS and return
   only the @font-face blocks we need.
   Uses format=woff2 which is universally supported.
   -------------------------------------------------------- */
async function fetchFontFaceCSS(usedFamilies) {
  // Only fetch families that come from Google Fonts
  const googleFonts = FONT_GROUPS.flatMap(g => g.fonts).map(f => f.value);
  const toFetch = usedFamilies.filter(f => googleFonts.includes(f));
  if (toFetch.length === 0) return '';

  // Build a targeted URL with only the families we need
  const params = toFetch.map(f => 'family=' + encodeURIComponent(f)).join('&');
  const url = 'https://fonts.googleapis.com/css2?' + params + '&display=swap';

  try {
    // Request with a modern user-agent so Google returns woff2
    const res = await fetch(url);
    const css = await res.text();

    // The CSS contains @font-face blocks with url(...) pointing to
    // fonts.gstatic.com.  We need to download each font file and
    // base64-encode it so the SVG is fully self-contained.
    const fontFaceBlocks = css.match(/@font-face\s*\{[^}]+\}/g) || [];
    let inlinedCSS = '';

    for (const block of fontFaceBlocks) {
      const urlMatch = block.match(/url\(([^)]+)\)/);
      if (!urlMatch) continue;

      const fontUrl = urlMatch[1];
      try {
        const fontRes  = await fetch(fontUrl);
        const fontBuf  = await fontRes.arrayBuffer();
        const base64   = btoa(String.fromCharCode(...new Uint8Array(fontBuf)));
        const inlined  = block.replace(fontUrl, 'data:font/woff2;base64,' + base64);
        inlinedCSS    += inlined + '\n';
      } catch (_) {
        // If one font file fails, keep the remote URL as fallback
        inlinedCSS += block + '\n';
      }
    }

    return inlinedCSS;
  } catch (_) {
    return ''; // network error â€“ SVG will still work if viewer is online
  }
}

/* --------------------------------------------------------
   MAIN COMPONENT
   -------------------------------------------------------- */
export default function AdvancedEnvelopeConfigurator() {
  /* ---------- state ---------- */
  const [elements, setElements] = useState([
    {
      id: 1, type: 'text', content: 'Meno Priezvisko',
      x: 50, y: 30, fontSize: 32,
      fontFamily: 'Great Vibes', color: '#2c1810',
      fontWeight: 'normal', fontStyle: 'normal',
      align: 'left', rotation: 0, opacity: 1,
    },
  ]);
  const [backgroundSrc, setBackgroundSrc] = useState(null);
  const [selectedId, setSelectedId]       = useState(1);
  const [isDragging, setIsDragging]       = useState(false);
  const [dragOffset, setDragOffset]       = useState({ x: 0, y: 0 });
  const [activeTab, setActiveTab]         = useState('elements');
  const [isExporting, setIsExporting]     = useState(false); // loading state while fonts are fetched
  const canvasRef                         = useRef(null);

  const selectedElement = elements.find(el => el.id === selectedId);

  /* ---------- element helpers ---------- */
  const updateElement = (id, updates) =>
    setElements(prev => prev.map(el => el.id === id ? { ...el, ...updates } : el));

  const addTextElement = () => {
    const newId = Math.max(...elements.map(e => e.id), 0) + 1;
    setElements(prev => [...prev, {
      id: newId, type: 'text', content: 'Nov\u00FD text',
      x: 50, y: 50, fontSize: 24,
      fontFamily: 'Great Vibes', color: '#2c1810',
      fontWeight: 'normal', fontStyle: 'normal',
      align: 'left', rotation: 0, opacity: 1,
    }]);
    setSelectedId(newId);
  };

  const addImageElement = (dataUrl) => {
    const newId = Math.max(...elements.map(e => e.id), 0) + 1;
    setElements(prev => [...prev, {
      id: newId, type: 'image', src: dataUrl,
      x: 50, y: 50, width: 25, rotation: 0, opacity: 1,
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
    const newId = Math.max(...elements.map(e => e.id), 0) + 1;
    setElements(prev => [...prev, { ...el, id: newId, x: el.x + 5, y: el.y + 5 }]);
    setSelectedId(newId);
  };

  /* ---------- drag & drop ---------- */
  const handleMouseDown = (id, e) => {
    e.stopPropagation();
    setSelectedId(id);
    setIsDragging(true);
    const el   = elements.find(e2 => e2.id === id);
    const rect = canvasRef.current.getBoundingClientRect();
    setDragOffset({
      x: ((e.clientX - rect.left) / rect.width)  * 100 - el.x,
      y: ((e.clientY - rect.top)  / rect.height) * 100 - el.y,
    });
  };

  const handleMouseMove = useCallback((e) => {
    if (!isDragging || !selectedId || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const newX = ((e.clientX - rect.left) / rect.width)  * 100 - dragOffset.x;
    const newY = ((e.clientY - rect.top)  / rect.height) * 100 - dragOffset.y;
    setElements(prev => prev.map(el =>
      el.id === selectedId
        ? { ...el, x: Math.max(0, Math.min(100, newX)), y: Math.max(0, Math.min(100, newY)) }
        : el
    ));
  }, [isDragging, selectedId, dragOffset]);

  const handleMouseUp = () => setIsDragging(false);

  /* ---------- SAVE / LOAD config (JSON) ---------- */
  const saveConfiguration = () => {
    const config = { elements, backgroundSrc, savedAt: new Date().toISOString() };
    const blob   = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url    = URL.createObjectURL(blob);
    const a      = document.createElement('a');
    a.href       = url;
    a.download   = 'obalka-konfigurĂˇcia.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const loadConfiguration = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const config = JSON.parse(ev.target.result);
        if (config.elements)      setElements(config.elements);
        if ('backgroundSrc' in config) setBackgroundSrc(config.backgroundSrc);
      } catch (_) {
        alert('NeplatnĂ˝ JSON sĂşbor.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  /* ---------- SVG EXPORT (with inlined fonts) ---------- */
  const exportSVG = async () => {
    setIsExporting(true);
    const W = 900, H = 600;
    let svgContent = '';

    /* -- background -- */
    if (backgroundSrc) {
      svgContent += `<image href="${backgroundSrc}" x="0" y="0" width="${W}" height="${H}" preserveAspectRatio="xMidYMid slice"/>`;
    } else {
      svgContent += `
        <defs>
          <linearGradient id="woodBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stop-color="#f5e6c8"/>
            <stop offset="40%"  stop-color="#eddcb0"/>
            <stop offset="100%" stop-color="#faf0d7"/>
          </linearGradient>
        </defs>
        <rect width="${W}" height="${H}" fill="url(#woodBg)"/>`;
      for (let i = 0; i < 30; i++) {
        const y       = (i / 30) * H;
        const opacity = 0.04 + (((i * 7) % 10) / 10) * 0.06;
        svgContent += `<line x1="0" y1="${y}" x2="${W}" y2="${y + 10}" stroke="#8B4513" stroke-width="1" opacity="${opacity}"/>`;
      }
    }

    /* -- elements -- */
    elements.forEach(el => {
      const cx      = (el.x / 100) * W;
      const cy      = (el.y / 100) * H;
      const rot     = el.rotation || 0;
      const opacity = el.opacity ?? 1;

      if (el.type === 'text') {
        const anchor = el.align === 'right' ? 'end' : el.align === 'center' ? 'middle' : 'start';
        let textX    = cx;
        if (el.align === 'left')  textX = cx - 20;
        if (el.align === 'right') textX = cx + 20;

        svgContent += `
          <text x="${textX}" y="${cy}"
                font-family="${el.fontFamily}, cursive, serif"
                font-size="${el.fontSize}"
                fill="${el.color}"
                font-weight="${el.fontWeight}"
                font-style="${el.fontStyle}"
                text-anchor="${anchor}"
                dominant-baseline="middle"
                opacity="${opacity}"
                transform="rotate(${rot}, ${cx}, ${cy})"
          >${escapeXml(el.content)}</text>`;
      } else if (el.type === 'image') {
        const imgW = (el.width / 100) * W;
        svgContent += `
          <image href="${el.src}"
                 x="${cx - imgW / 2}" y="${cy - imgW / 3}"
                 width="${imgW}"
                 opacity="${opacity}"
                 transform="rotate(${rot}, ${cx}, ${cy})"
                 preserveAspectRatio="xMidYMid meet"/>`;
      }
    });

    /* -- fetch & inline fonts for every text element -- */
    const usedFamilies = [...new Set(
      elements.filter(el => el.type === 'text').map(el => el.fontFamily)
    )];
    const fontCSS = await fetchFontFaceCSS(usedFamilies);

    /* -- assemble final SVG -- */
    const svgString = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
     viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <defs>
    <style type="text/css">
      ${fontCSS}
    </style>
  </defs>
  ${svgContent}
</svg>`;

    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = 'obalka-konfigurĂˇcia.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setIsExporting(false);
  };

  /* ---------- RENDER ---------- */
  return (
    <div
      className="min-h-screen bg-gradient-to-br from-stone-50 to-amber-50 p-4"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Google Fonts live loader */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href={GOOGLE_FONTS_URL} rel="stylesheet" />

      <div className="max-w-7xl mx-auto">
        {/* ---- TITLE (unicode escapes so diacritics survive any file-encoding) ---- */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-amber-900 mb-1">
            {'KonfigurĂˇtor drevenej obĂˇlky'}
          </h1>
          <p className="text-amber-700 text-sm">
            Drag &amp; drop &bull; Ăšprava textov &bull; SVG export &bull; VlastnĂ© pozadie
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* ============================================================
              CANVAS
              ============================================================ */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-2xl p-5">
              {/* toolbar */}
              <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
                <h2 className="text-lg font-semibold text-amber-900">NĂˇhÄľad</h2>
                <div className="flex flex-wrap gap-2">
                  <button onClick={addTextElement}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition text-sm">
                    <Type className="w-4 h-4" /> PridaĹĄ text
                  </button>
                  <label className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition cursor-pointer text-sm">
                    <ImagePlus className="w-4 h-4" /> NahraĹĄ obrĂˇzok / SVG
                    <input type="file" accept="image/*,.svg" onChange={handleImageUpload} className="hidden" />
                  </label>
                  <button onClick={exportSVG} disabled={isExporting}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm disabled:opacity-60">
                    {isExporting ? 'âŹł Fetching fontsâ€¦' : 'â¬‡ď¸Ź Export SVG'}
                  </button>
                </div>
              </div>

              {/* canvas area */}
              <div
                ref={canvasRef}
                className="relative aspect-[3/2] rounded-lg shadow-inner overflow-hidden border-4 border-amber-300 cursor-crosshair"
                style={backgroundSrc ? {} : {
                  background: 'linear-gradient(135deg, #f5e6c8 0%, #eddcb0 40%, #faf0d7 100%)',
                  backgroundImage: `
                    repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(139,69,19,0.08) 2px, rgba(139,69,19,0.08) 4px),
                    repeating-linear-gradient(0deg, transparent, transparent 20px, rgba(139,69,19,0.05) 20px, rgba(139,69,19,0.05) 22px)`,
                }}
              >
                {backgroundSrc && (
                  <img src={backgroundSrc} alt="pozadie"
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none" style={{ zIndex: 0 }} />
                )}

                {elements.map(element =>
                  element.type === 'text' ? (
                    <div key={element.id}
                      onMouseDown={(e) => handleMouseDown(element.id, e)}
                      className={`absolute cursor-move select-none ${selectedId === element.id ? 'ring-2 ring-blue-500 ring-offset-1 rounded' : ''}`}
                      style={{
                        zIndex: 10,
                        left: `${element.x}%`, top: `${element.y}%`,
                        transform: `translate(-50%, -50%) rotate(${element.rotation}deg)`,
                        fontSize: `${element.fontSize}px`,
                        fontFamily: `'${element.fontFamily}', cursive, serif`,
                        color: element.color,
                        fontWeight: element.fontWeight,
                        fontStyle: element.fontStyle,
                        textAlign: element.align,
                        opacity: element.opacity,
                        textShadow: '1px 1px 2px rgba(0,0,0,0.15)',
                        padding: '2px 6px', whiteSpace: 'nowrap',
                      }}
                    >
                      {element.content || '(prĂˇzdne)'}
                    </div>
                  ) : (
                    <img key={element.id} src={element.src} alt="prvok"
                      onMouseDown={(e) => handleMouseDown(element.id, e)}
                      className={`absolute cursor-move select-none ${selectedId === element.id ? 'ring-2 ring-blue-500 ring-offset-1 rounded' : ''}`}
                      style={{
                        zIndex: 10,
                        left: `${element.x}%`, top: `${element.y}%`,
                        width: `${element.width}%`, height: 'auto',
                        transform: `translate(-50%, -50%) rotate(${element.rotation}deg)`,
                        opacity: element.opacity,
                      }}
                    />
                  )
                )}
              </div>

              <p className="text-xs text-amber-600 mt-3 text-center">
                đź’ˇ Kliknite a ĹĄahajte prvky â€˘ Fonty optimalizovanĂ© pre svadobnĂ© gravĂ­rovanie
              </p>
            </div>
          </div>

          {/* ============================================================
              SIDEBAR
              ============================================================ */}
          <div className="space-y-4">
            {/* tab switcher */}
            <div className="flex bg-white rounded-xl shadow-xl overflow-hidden">
              <button onClick={() => setActiveTab('elements')}
                className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-1.5 transition ${activeTab === 'elements' ? 'bg-amber-600 text-white' : 'text-amber-900 hover:bg-amber-50'}`}>
                <Layers className="w-4 h-4" /> Prvky
              </button>
              <button onClick={() => setActiveTab('background')}
                className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-1.5 transition ${activeTab === 'background' ? 'bg-amber-600 text-white' : 'text-amber-900 hover:bg-amber-50'}`}>
                đź–Ľď¸Ź Pozadie
              </button>
            </div>

            {/* ---- BACKGROUND TAB ---- */}
            {activeTab === 'background' && (
              <div className="bg-white rounded-xl shadow-xl p-5 space-y-4">
                <h3 className="text-lg font-semibold text-amber-900">PozadnĂˇ vrstva</h3>
                <p className="text-sm text-gray-500">
                  NahrĂˇte vlastnĂ˝ SVG alebo obrĂˇzok ako pozadie. PodporujĂş sa PNG, JPG, SVG.
                </p>
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-amber-300 rounded-xl cursor-pointer hover:bg-amber-50 transition">
                  <span className="text-amber-700 text-sm font-medium">đź–Ľď¸Ź NahrĂˇĹĄ pozadie (SVG / PNG / JPG)</span>
                  <span className="text-xs text-gray-400 mt-1">Drag & drop alebo kliknite</span>
                  <input type="file" accept="image/*,.svg" onChange={handleBackgroundUpload} className="hidden" />
                </label>
                {backgroundSrc && (
                  <div className="space-y-3">
                    <div className="rounded-lg overflow-hidden border border-gray-200" style={{ height: 100 }}>
                      <img src={backgroundSrc} alt="preview pozadie" className="w-full h-full object-cover" />
                    </div>
                    <button onClick={() => setBackgroundSrc(null)}
                      className="w-full py-2 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition">
                      đź—‘ď¸Ź OdstrĂˇnir pozadie (vrĂˇti sa default drevo)
                    </button>
                  </div>
                )}
                {!backgroundSrc && <p className="text-xs text-gray-400 italic">MomentĂˇlne: vĂ˝chozĂˇ drevenĂˇ textĂşra</p>}
              </div>
            )}

            {/* ---- ELEMENTS TAB ---- */}
            {activeTab === 'elements' && (
              <>
                {/* element list */}
                <div className="bg-white rounded-xl shadow-xl p-5">
                  <h3 className="text-lg font-semibold text-amber-900 mb-3">Prvky na obĂˇlke</h3>
                  <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                    {elements.length === 0 && (
                      <p className="text-sm text-gray-400 text-center py-4">Ĺ˝iadne prvky. Pridajte text alebo obrĂˇzok.</p>
                    )}
                    {elements.map(element => (
                      <div key={element.id} onClick={() => setSelectedId(element.id)}
                        className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition text-sm
                          ${selectedId === element.id ? 'bg-blue-100 border-2 border-blue-500' : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'}`}>
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {element.type === 'text'
                            ? <Type className="w-4 h-4 flex-shrink-0 text-amber-700" />
                            : <ImagePlus className="w-4 h-4 flex-shrink-0 text-blue-600" />}
                          <span className="truncate">{element.type === 'text' ? element.content : 'ObrĂˇzok'}</span>
                        </div>
                        <div className="flex gap-1 ml-2">
                          <button onClick={(e) => { e.stopPropagation(); duplicateElement(element.id); }} className="p-1 hover:bg-blue-200 rounded" title="DuplikovaĹĄ"><Copy className="w-4 h-4" /></button>
                          <button onClick={(e) => { e.stopPropagation(); deleteElement(element.id); }}  className="p-1 hover:bg-red-200 rounded" title="ZmazaĹĄ"><Trash2 className="w-4 h-4 text-red-600" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* element editor */}
                {selectedElement && (
                  <div className="bg-white rounded-xl shadow-xl p-5 space-y-4">
                    <h3 className="text-lg font-semibold text-amber-900">
                      Ăšprava: {selectedElement.type === 'text' ? 'Text' : 'ObrĂˇzok'}
                    </h3>

                    {selectedElement.type === 'text' ? (
                      <>
                        {/* text content */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Text</label>
                          <textarea value={selectedElement.content}
                            onChange={(e) => updateElement(selectedId, { content: e.target.value })}
                            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-amber-500 focus:outline-none text-sm" rows="2" />
                        </div>

                        {/* font select â€“ grouped */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">PĂ­smo</label>
                          <select value={selectedElement.fontFamily}
                            onChange={(e) => updateElement(selectedId, { fontFamily: e.target.value })}
                            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-amber-500 focus:outline-none text-sm">
                            {FONT_GROUPS.map(group => (
                              <optgroup key={group.label} label={group.label}>
                                {group.fonts.map(font => (
                                  <option key={font.value} value={font.value}>{font.label}</option>
                                ))}
                              </optgroup>
                            ))}
                          </select>
                          {/* live font preview */}
                          <div className="mt-2 px-3 py-2 bg-amber-50 rounded-lg border border-amber-200 text-center truncate"
                            style={{ fontFamily: `'${selectedElement.fontFamily}', cursive, serif`, fontSize: 22, color: '#2c1810' }}>
                            {selectedElement.content || 'NĂˇhÄľad fontu'}
                          </div>
                        </div>

                        {/* size */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">VeÄľkosĹĄ: {selectedElement.fontSize}px</label>
                          <input type="range" min="10" max="80" value={selectedElement.fontSize}
                            onChange={(e) => updateElement(selectedId, { fontSize: parseInt(e.target.value) })} className="w-full" />
                        </div>

                        {/* color + palette */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Farba</label>
                          <div className="flex items-center gap-3">
                            <input type="color" value={selectedElement.color}
                              onChange={(e) => updateElement(selectedId, { color: e.target.value })}
                              className="h-9 w-16 rounded cursor-pointer border border-gray-200" />
                            <div className="flex gap-1.5 flex-wrap">
                              {['#2c1810','#1a1a2e','#4a0e0e','#0a3d62','#2d5016','#ffffff','#c9a84c'].map(c => (
                                <button key={c} onClick={() => updateElement(selectedId, { color: c })}
                                  className={`w-6 h-6 rounded-full border-2 transition ${selectedElement.color === c ? 'border-blue-500 scale-110' : 'border-gray-300'}`}
                                  style={{ background: c }} />
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* bold / italic */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Ĺ tĂ˝l</label>
                          <div className="flex gap-2">
                            <button onClick={() => updateElement(selectedId, { fontWeight: selectedElement.fontWeight === 'bold' ? 'normal' : 'bold' })}
                              className={`flex-1 py-2 rounded-lg border-2 transition flex items-center justify-center ${selectedElement.fontWeight === 'bold' ? 'bg-amber-600 text-white border-amber-600' : 'bg-white border-gray-200 hover:border-amber-300'}`}>
                              <Bold className="w-4 h-4" />
                            </button>
                            <button onClick={() => updateElement(selectedId, { fontStyle: selectedElement.fontStyle === 'italic' ? 'normal' : 'italic' })}
                              className={`flex-1 py-2 rounded-lg border-2 transition flex items-center justify-center ${selectedElement.fontStyle === 'italic' ? 'bg-amber-600 text-white border-amber-600' : 'bg-white border-gray-200 hover:border-amber-300'}`}>
                              <Italic className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* alignment */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Zarovnanie</label>
                          <div className="flex gap-2">
                            {[{ value: 'left', icon: AlignLeft }, { value: 'center', icon: AlignCenter }, { value: 'right', icon: AlignRight }].map(({ value, icon: Icon }) => (
                              <button key={value} onClick={() => updateElement(selectedId, { align: value })}
                                className={`flex-1 py-2 rounded-lg border-2 transition flex items-center justify-center ${selectedElement.align === value ? 'bg-amber-600 text-white border-amber-600' : 'bg-white border-gray-200 hover:border-amber-300'}`}>
                                <Icon className="w-4 h-4" />
                              </button>
                            ))}
                          </div>
                        </div>
                      </>
                    ) : (
                      /* image width */
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ĺ Ă­rka: {selectedElement.width}%</label>
                        <input type="range" min="5" max="60" value={selectedElement.width}
                          onChange={(e) => updateElement(selectedId, { width: parseInt(e.target.value) })} className="w-full" />
                      </div>
                    )}

                    {/* rotation */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">RotĂˇcia: {selectedElement.rotation}Â°</label>
                      <input type="range" min="0" max="360" value={selectedElement.rotation}
                        onChange={(e) => updateElement(selectedId, { rotation: parseInt(e.target.value) })} className="w-full" />
                    </div>

                    {/* opacity */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">PriehÄľadnosĹĄ: {Math.round(selectedElement.opacity * 100)}%</label>
                      <input type="range" min="0" max="1" step="0.05" value={selectedElement.opacity}
                        onChange={(e) => updateElement(selectedId, { opacity: parseFloat(e.target.value) })} className="w-full" />
                    </div>

                    {/* position X / Y */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">X: {Math.round(selectedElement.x)}%</label>
                        <input type="range" min="0" max="100" value={selectedElement.x}
                          onChange={(e) => updateElement(selectedId, { x: parseFloat(e.target.value) })} className="w-full" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Y: {Math.round(selectedElement.y)}%</label>
                        <input type="range" min="0" max="100" value={selectedElement.y}
                          onChange={(e) => updateElement(selectedId, { y: parseFloat(e.target.value) })} className="w-full" />
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ---- action buttons (always visible) ---- */}
            <div className="flex flex-col gap-2">
              {/* Save JSON */}
              <button onClick={saveConfiguration}
                className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 px-4 rounded-xl transition shadow-lg text-sm">
                <Save className="w-4 h-4" /> UloĹľiĹĄ konfigurĂˇciu (JSON)
              </button>

              {/* Load JSON */}
              <label className="w-full flex items-center justify-center gap-2 bg-stone-600 hover:bg-stone-700 text-white font-semibold py-3 px-4 rounded-xl transition shadow-lg text-sm cursor-pointer">
                <FolderOpen className="w-4 h-4" /> OtvoriĹĄ konfigurĂˇciu (JSON)
                <input type="file" accept=".json" onChange={loadConfiguration} className="hidden" />
              </label>

              {/* Export SVG */}
              <button onClick={exportSVG} disabled={isExporting}
                className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-xl transition shadow-lg text-sm disabled:opacity-60">
                {isExporting ? 'âŹł Fetching fontsâ€¦' : 'â¬‡ď¸Ź Export do SVG'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
