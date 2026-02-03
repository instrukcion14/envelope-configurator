import React, { useState, useRef } from 'react';
import { Type, ImagePlus, Trash2, Copy, AlignLeft, AlignCenter, AlignRight, Bold, Italic } from 'lucide-react';

export default function AdvancedEnvelopeConfigurator() {
  const [elements, setElements] = useState([
    { 
      id: 1, 
      type: 'text', 
      content: 'Meno Priezvisko', 
      x: 50, 
      y: 30, 
      fontSize: 32, 
      fontFamily: 'Playfair Display',
      color: '#2c1810',
      fontWeight: 'normal',
      fontStyle: 'normal',
      align: 'left',
      rotation: 0,
      opacity: 1
    },
  ]);
  
  const [selectedId, setSelectedId] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const canvasRef = useRef(null);

  const fonts = [
    { value: 'Playfair Display', label: 'Playfair (Elegantný)' },
    { value: 'Montserrat', label: 'Montserrat (Moderný)' },
    { value: 'Courier New', label: 'Courier (Písací stroj)' },
    { value: 'Brush Script MT', label: 'Brush Script (Rukopis)' },
    { value: 'Georgia', label: 'Georgia (Klasický)' },
  ];

  const selectedElement = elements.find(el => el.id === selectedId);

  const updateElement = (id, updates) => {
    setElements(elements.map(el => el.id === id ? { ...el, ...updates } : el));
  };

  const addTextElement = () => {
    const newId = Math.max(...elements.map(e => e.id), 0) + 1;
    setElements([...elements, {
      id: newId,
      type: 'text',
      content: 'Nový text',
      x: 50,
      y: 50,
      fontSize: 24,
      fontFamily: 'Playfair Display',
      color: '#2c1810',
      fontWeight: 'normal',
      fontStyle: 'normal',
      align: 'left',
      rotation: 0,
      opacity: 1
    }]);
    setSelectedId(newId);
  };

  const addImageElement = (imageUrl) => {
    const newId = Math.max(...elements.map(e => e.id), 0) + 1;
    setElements([...elements, {
      id: newId,
      type: 'image',
      src: imageUrl,
      x: 40,
      y: 40,
      width: 20,
      height: 20,
      rotation: 0,
      opacity: 1
    }]);
    setSelectedId(newId);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        addImageElement(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const deleteElement = (id) => {
    setElements(elements.filter(el => el.id !== id));
    if (selectedId === id) {
      setSelectedId(elements[0]?.id || null);
    }
  };

  const duplicateElement = (id) => {
    const element = elements.find(el => el.id === id);
    if (element) {
      const newId = Math.max(...elements.map(e => e.id), 0) + 1;
      setElements([...elements, { ...element, id: newId, x: element.x + 5, y: element.y + 5 }]);
      setSelectedId(newId);
    }
  };

  const handleMouseDown = (id, e) => {
    e.stopPropagation();
    setSelectedId(id);
    setIsDragging(true);
    
    const element = elements.find(el => el.id === id);
    const rect = canvasRef.current.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;
    
    setDragOffset({
      x: clickX - element.x,
      y: clickY - element.y
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !selectedId) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const newX = ((e.clientX - rect.left) / rect.width) * 100 - dragOffset.x;
    const newY = ((e.clientY - rect.top) / rect.height) * 100 - dragOffset.y;
    
    updateElement(selectedId, {
      x: Math.max(0, Math.min(100, newX)),
      y: Math.max(0, Math.min(100, newY))
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const exportConfiguration = () => {
    return {
      elements: elements,
      timestamp: new Date().toISOString()
    };
  };

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-stone-50 to-amber-50 p-4"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Montserrat:wght@400;700&display=swap');
        `}
      </style>
      
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-amber-900 mb-2">
            Pokročilý konfigurátor drevenej obálky
          </h1>
          <p className="text-amber-700">
            Drag & drop • Úprava textov • Nahrávanie grafiky
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* CANVAS - Náhľad obálky */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-2xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-amber-900">Náhľad</h2>
                <div className="flex gap-2">
                  <button
                    onClick={addTextElement}
                    className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition"
                  >
                    <Type className="w-4 h-4" />
                    Pridať text
                  </button>
                  <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition cursor-pointer">
                    <ImagePlus className="w-4 h-4" />
                    Nahrať obrázok
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div 
                ref={canvasRef}
                className="relative aspect-[3/2] bg-gradient-to-br from-amber-100 via-amber-200 to-yellow-100 rounded-lg shadow-inner overflow-hidden border-4 border-amber-300 cursor-crosshair"
                style={{
                  backgroundImage: `
                    repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(139,69,19,0.08) 2px, rgba(139,69,19,0.08) 4px),
                    repeating-linear-gradient(0deg, transparent, transparent 20px, rgba(139,69,19,0.05) 20px, rgba(139,69,19,0.05) 22px)
                  `
                }}
              >
                {elements.map(element => (
                  element.type === 'text' ? (
                    <div
                      key={element.id}
                      onMouseDown={(e) => handleMouseDown(element.id, e)}
                      className={`absolute cursor-move select-none transition-all ${selectedId === element.id ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
                      style={{
                        left: `${element.x}%`,
                        top: `${element.y}%`,
                        transform: `translate(-50%, -50%) rotate(${element.rotation}deg)`,
                        fontSize: `${element.fontSize}px`,
                        fontFamily: element.fontFamily,
                        color: element.color,
                        fontWeight: element.fontWeight,
                        fontStyle: element.fontStyle,
                        textAlign: element.align,
                        opacity: element.opacity,
                        textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
                        padding: '4px 8px',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {element.content || '(prázdne)'}
                    </div>
                  ) : (
                    <img
                      key={element.id}
                      src={element.src}
                      onMouseDown={(e) => handleMouseDown(element.id, e)}
                      className={`absolute cursor-move select-none ${selectedId === element.id ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
                      style={{
                        left: `${element.x}%`,
                        top: `${element.y}%`,
                        width: `${element.width}%`,
                        height: 'auto',
                        transform: `translate(-50%, -50%) rotate(${element.rotation}deg)`,
                        opacity: element.opacity
                      }}
                      alt="Logo"
                    />
                  )
                ))}
              </div>

              <p className="text-sm text-amber-600 mt-4 text-center">
                💡 Kliknite a ťahajte prvky na presné umiestnenie
              </p>
            </div>
          </div>

          {/* OVLÁDACIE PRVKY */}
          <div className="space-y-4">
            {/* Zoznam prvkov */}
            <div className="bg-white rounded-xl shadow-xl p-6">
              <h3 className="text-lg font-semibold text-amber-900 mb-4">Prvky na obálke</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {elements.map(element => (
                  <div
                    key={element.id}
                    onClick={() => setSelectedId(element.id)}
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition ${
                      selectedId === element.id ? 'bg-blue-100 border-2 border-blue-500' : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {element.type === 'text' ? (
                        <>
                          <Type className="w-4 h-4 flex-shrink-0" />
                          <span className="text-sm truncate">{element.content}</span>
                        </>
                      ) : (
                        <>
                          <ImagePlus className="w-4 h-4 flex-shrink-0" />
                          <span className="text-sm">Obrázok</span>
                        </>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); duplicateElement(element.id); }}
                        className="p-1 hover:bg-blue-200 rounded"
                        title="Duplikovať"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteElement(element.id); }}
                        className="p-1 hover:bg-red-200 rounded"
                        title="Zmazať"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Editor vybraného prvku */}
            {selectedElement && (
              <div className="bg-white rounded-xl shadow-xl p-6 space-y-4">
                <h3 className="text-lg font-semibold text-amber-900">
                  Úprava: {selectedElement.type === 'text' ? 'Text' : 'Obrázok'}
                </h3>

                {selectedElement.type === 'text' ? (
                  <>
                    {/* Text content */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Text</label>
                      <textarea
                        value={selectedElement.content}
                        onChange={(e) => updateElement(selectedId, { content: e.target.value })}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-amber-500 focus:outline-none"
                        rows="2"
                      />
                    </div>

                    {/* Font */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Písmo</label>
                      <select
                        value={selectedElement.fontFamily}
                        onChange={(e) => updateElement(selectedId, { fontFamily: e.target.value })}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-amber-500 focus:outline-none"
                      >
                        {fonts.map(font => (
                          <option key={font.value} value={font.value}>{font.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Font size */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Veľkosť: {selectedElement.fontSize}px
                      </label>
                      <input
                        type="range"
                        min="12"
                        max="72"
                        value={selectedElement.fontSize}
                        onChange={(e) => updateElement(selectedId, { fontSize: parseInt(e.target.value) })}
                        className="w-full"
                      />
                    </div>

                    {/* Color */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Farba</label>
                      <input
                        type="color"
                        value={selectedElement.color}
                        onChange={(e) => updateElement(selectedId, { color: e.target.value })}
                        className="w-full h-10 rounded cursor-pointer"
                      />
                    </div>

                    {/* Style buttons */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Štýl</label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateElement(selectedId, { 
                            fontWeight: selectedElement.fontWeight === 'bold' ? 'normal' : 'bold' 
                          })}
                          className={`flex-1 py-2 px-3 rounded-lg border-2 transition ${
                            selectedElement.fontWeight === 'bold' 
                              ? 'bg-amber-600 text-white border-amber-600' 
                              : 'bg-white border-gray-200 hover:border-amber-300'
                          }`}
                        >
                          <Bold className="w-4 h-4 mx-auto" />
                        </button>
                        <button
                          onClick={() => updateElement(selectedId, { 
                            fontStyle: selectedElement.fontStyle === 'italic' ? 'normal' : 'italic' 
                          })}
                          className={`flex-1 py-2 px-3 rounded-lg border-2 transition ${
                            selectedElement.fontStyle === 'italic' 
                              ? 'bg-amber-600 text-white border-amber-600' 
                              : 'bg-white border-gray-200 hover:border-amber-300'
                          }`}
                        >
                          <Italic className="w-4 h-4 mx-auto" />
                        </button>
                      </div>
                    </div>

                    {/* Alignment */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Zarovnanie</label>
                      <div className="flex gap-2">
                        {[
                          { value: 'left', icon: AlignLeft },
                          { value: 'center', icon: AlignCenter },
                          { value: 'right', icon: AlignRight }
                        ].map(({ value, icon: Icon }) => (
                          <button
                            key={value}
                            onClick={() => updateElement(selectedId, { align: value })}
                            className={`flex-1 py-2 px-3 rounded-lg border-2 transition ${
                              selectedElement.align === value
                                ? 'bg-amber-600 text-white border-amber-600'
                                : 'bg-white border-gray-200 hover:border-amber-300'
                            }`}
                          >
                            <Icon className="w-4 h-4 mx-auto" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Image width */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Šírka: {selectedElement.width}%
                      </label>
                      <input
                        type="range"
                        min="5"
                        max="50"
                        value={selectedElement.width}
                        onChange={(e) => updateElement(selectedId, { width: parseInt(e.target.value) })}
                        className="w-full"
                      />
                    </div>
                  </>
                )}

                {/* Rotation - pre oba typy */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rotácia: {selectedElement.rotation}°
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={selectedElement.rotation}
                    onChange={(e) => updateElement(selectedId, { rotation: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>

                {/* Opacity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priehľadnosť: {Math.round(selectedElement.opacity * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={selectedElement.opacity}
                    onChange={(e) => updateElement(selectedId, { opacity: parseFloat(e.target.value) })}
                    className="w-full"
                  />
                </div>

                {/* Position */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      X: {Math.round(selectedElement.x)}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={selectedElement.x}
                      onChange={(e) => updateElement(selectedId, { x: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Y: {Math.round(selectedElement.y)}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={selectedElement.y}
                      onChange={(e) => updateElement(selectedId, { y: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Export button */}
            <button
              onClick={() => {
                const config = exportConfiguration();
                console.log('Konfigurácia:', config);
                alert('Konfigurácia pripravená! (Uložená do konzoly)');
              }}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-lg transition shadow-lg"
            >
              💾 Uložiť konfiguráciu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
