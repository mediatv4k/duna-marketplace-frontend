'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  MapPin, Search, Clock, ChevronRight, ChevronLeft, 
  X, ShoppingCart, Star, ArrowLeft, Sparkles, SlidersHorizontal, Plus, Info
} from 'lucide-react';

const BCV_RATE = 48.50;

const aliadoData = {
  nombre: "Papá Helado",
  categoria: "Heladería & Combos Familiares",
  rating: "5.0",
  reviews: "320+",
  deliveryTime: "15 - 25 min",
  deliveryFee: "$1.50",
  bannerImg: "/images/banner-papa.png",
  logoImg: "/images/logo-papa.png"
};

const promocionesImperdibles = [
  { id: 1, name: "SÚPER COMBO", price: 8.55, img: "/images/promo-1.png" },
  { id: 2, name: "LÍNEA ECONÓMICA", price: 19.25, img: "/images/promo-2.png" },
  { id: 3, name: "LÍNEA BÁSICA", price: 22.55, img: "/images/promo-3.png" },
  { id: 4, name: "LÍNEA ESPECIAL", price: 27.50, img: "/images/promo-4.png" },
  { id: 5, name: "LÍNEA PAPÁ PLUS", price: 30.25, img: "/images/promo-5.png" },
];

const categoriasComercio = [
  { id: "todos", name: "Todos" },
  { id: "ropa", name: "TIENDA DE ROPA" },
  { id: "fastfood", name: "COMIDA RÁPIDA" },
  { id: "bodegon", name: "BODEGÓN & LICORES" },
  { id: "papeleria", name: "PAPELERÍA & ÚTILES" },
  { id: "pizzeria", name: "PIZZERÍA ARTESANAL" },
];

const catalogoDemo = [
  { 
    id: 1, 
    rubro: "ropa",
    name: "Franela Oversize Premium D'una", 
    desc: "100% Algodón peinado 24/1. Costuras reforzadas, acabado suave pre-lavado.", 
    price: 18.00, 
    cat: "ropa",
    img: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=80",
    schema: {
      tipo: "ropa",
      tallas: ["S", "M", "L", "XL"],
      colores: [
        { name: "Negro", hex: "#18181b" },
        { name: "Blanco", hex: "#f4f4f5" },
        { name: "Arena / Beige", hex: "#d6c7b2" },
        { name: "Naranja D'una", hex: "#fe6712" }
      ],
      guiaTallas: "Corte holgado unisex. Si prefieres ajuste entallado, pide una talla menos."
    }
  },
  { 
    id: 2, 
    rubro: "fastfood",
    name: "Smash Burger Doble Queso & Bacon", 
    desc: "2 carnes smash de 100g c/u, queso cheddar fundido, tocineta crocante y salsa especial.", 
    price: 8.50, 
    cat: "fastfood",
    img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80",
    schema: {
      tipo: "fastfood",
      terminoCarne: ["Bien Cocida (Smash)", "Punto Medio"],
      comboOptions: [
        { name: "Solo Hamburguesa", add: 0 },
        { name: "Con Papas Fritas Rústicas", add: 2.00 },
        { name: "Combo Completo (Papas + Refresco 355ml)", add: 3.50 }
      ],
      adicionales: [
        { name: "Extra Tocineta Ahumada", price: 1.50 },
        { name: "Doble Queso Cheddar", price: 1.00 },
        { name: "Huevo Frito a la Plancha", price: 0.80 },
        { name: "Pepinillos Agridulces", price: 0.50 }
      ],
      notaPlaceholder: "Ej: Sin cebolla, salsas aparte, etc."
    }
  },
  { 
    id: 3, 
    rubro: "bodegon",
    name: "Whisky Escocés 12 Años Reserva", 
    desc: "Destilado de malta madurado en barricas de roble americano. 40% Alc. Vol.", 
    price: 34.00, 
    cat: "bodegon",
    img: "https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=500&auto=format&fit=crop&q=80",
    schema: {
      tipo: "bodegon",
      presentaciones: [
        { label: "Botella 750 ml", add: 0 },
        { label: "Botella 1 Litro (+33%)", add: 8.00 }
      ],
      temperatura: ["Al Ambiente", "Fría de Nevera"],
      complementos: [
        { name: "Bolsa de Hielo en Cubos 2kg", price: 1.50 },
        { name: "Pack 4 Vasos de Vidrio Corto", price: 3.00 },
        { name: "Agua Mineral con Gas 500ml", price: 1.20 }
      ]
    }
  },
  { 
    id: 4, 
    rubro: "papeleria",
    name: "Cuaderno Espiral Universitario 100H", 
    desc: "Tapa dura plastificada, hojas microperforadas de 75g con margen reforzado.", 
    price: 3.20, 
    cat: "papeleria",
    img: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=80",
    schema: {
      tipo: "papeleria",
      formatoHoja: ["Una Línea", "Doble Línea", "Cuadriculado 5mm"],
      colorPortada: ["Azul Marino", "Rojo Pasión", "Verde Neón", "Negro Mate"],
      adicionales: [
        { name: "Forro Plástico Protector", price: 0.60 },
        { name: "Bolígrafo Tinta Seca Azul", price: 0.50 },
        { name: "Set 3 Resaltadores Pastel", price: 2.10 }
      ]
    }
  },
  { 
    id: 5, 
    rubro: "pizzeria",
    name: "Pizza Suprema Especial Nápoles", 
    desc: "Masa madre fermentada 48h, salsa pomodoro San Marzano, mozzarella fior di latte y jamón ahumado.", 
    price: 12.00, 
    cat: "pizzeria",
    img: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=80",
    schema: {
      tipo: "pizzeria",
      tamanios: [
        { label: "Mediana (8 Porciones - 30cm)", base: 12.00 },
        { label: "Familiar (12 Porciones - 40cm)", base: 17.50 },
        { label: "Jumbo Fiesta (16 Porciones - 50cm)", base: 22.00 }
      ],
      bordes: [
        { name: "Borde Tradicional Crujiente", price: 0 },
        { name: "Borde Relleno de Queso Crema / Mozzarella", price: 3.00 }
      ],
      toppings: [
        { name: "Champiñones Salteados", price: 1.50 },
        { name: "Tocineta Crocante", price: 2.00 },
        { name: "Maíz Tierno", price: 1.00 },
        { name: "Pimientos Asados", price: 1.00 }
      ]
    }
  }
];

export default function StoreTemplateView() {
  const [mounted, setMounted] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedCat, setSelectedCat] = useState("todos");
  const [qty, setQty] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const promoRef = useRef<HTMLDivElement>(null);

  const [tallaSel, setTallaSel] = useState("M");
  const [colorSel, setColorSel] = useState("Negro");
  const [comboSel, setComboSel] = useState(0);
  const [presSel, setPresSel] = useState(0);
  const [tempSel, setTempSel] = useState("Al Ambiente");
  const [hojaSel, setHojaSel] = useState("Una Línea");
  const [portadaSel, setPortadaSel] = useState("Azul Marino");
  const [tamanioPizzaSel, setTamanioPizzaSel] = useState(0);
  const [bordePizzaSel, setBordePizzaSel] = useState(0);
  const [toppingsSel, setToppingsSel] = useState<Record<string, boolean>>({});
  const [notaTexto, setNotaTexto] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const openProductModal = (prod: any) => {
    setSelectedProduct(prod);
    setQty(1);
    setToppingsSel({});
    setNotaTexto("");
    if (prod.schema) {
      if (prod.schema.tallas) setTallaSel(prod.schema.tallas[0]);
      if (prod.schema.colores) setColorSel(prod.schema.colores[0].name);
      setComboSel(0);
      setPresSel(0);
      setTamanioPizzaSel(0);
      setBordePizzaSel(0);
      if (prod.schema.formatoHoja) setHojaSel(prod.schema.formatoHoja[0]);
    }
  };

  const toggleTopping = (name: string) => {
    setToppingsSel(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const calculateFinalPrice = () => {
    if (!selectedProduct) return 0;
    let base = selectedProduct.price;
    const s = selectedProduct.schema;
    if (!s) return base * qty;

    if (s.tipo === "fastfood") {
      base += s.comboOptions[comboSel]?.add || 0;
      s.adicionales?.forEach((a: any) => {
        if (toppingsSel[a.name]) base += a.price;
      });
    } else if (s.tipo === "bodegon") {
      base += s.presentaciones[presSel]?.add || 0;
      s.complementos?.forEach((c: any) => {
        if (toppingsSel[c.name]) base += c.price;
      });
    } else if (s.tipo === "papeleria") {
      s.adicionales?.forEach((a: any) => {
        if (toppingsSel[a.name]) base += a.price;
      });
    } else if (s.tipo === "pizzeria") {
      base = s.tamanios[tamanioPizzaSel]?.base || base;
      base += s.bordes[bordePizzaSel]?.price || 0;
      s.toppings?.forEach((t: any) => {
        if (toppingsSel[t.name]) base += t.price;
      });
    }

    return base * qty;
  };

  const filteredProducts = catalogoDemo.filter(p => {
    const matchesCat = selectedCat === "todos" || p.cat === selectedCat;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-900 pb-20">
      
      {/* 1. TOPBAR GLOBAL ULTRA-COMPACTA */}
      <div className="bg-[#0f172a] text-white text-[11px] py-1.5 sm:py-2 px-3 sm:px-8 border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-1 text-slate-300 hover:text-[#fe6712] font-semibold bg-white/5 px-2 py-0.5 rounded-md border border-white/10">
              <ArrowLeft className="w-3 h-3" />
              <span>Volver</span>
            </Link>
            <div className="flex items-center gap-1 text-slate-300 truncate max-w-[200px] sm:max-w-none">
              <MapPin className="w-3 h-3 text-[#fe6712] shrink-0" />
              <span className="truncate">Cabimas, Zulia</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 font-bold">
            <span className="text-amber-300 bg-white/5 px-2 py-0.5 rounded border border-white/10">
              BCV: <strong className="text-white">${BCV_RATE.toFixed(2)}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* 2. BANNER COMPACTO CON RATIO HORIZONTAL */}
      <div className="relative">
        <div className="w-full max-w-[1440px] mx-auto px-2 sm:px-4 md:px-6 pt-1.5 sm:pt-2">
          <div className="relative w-full h-28 sm:h-40 md:h-52 rounded-2xl md:rounded-3xl overflow-hidden shadow-xs border border-slate-200/80 bg-[#2fa8f9]">
            
            <img 
              src={aliadoData.bannerImg} 
              alt={aliadoData.nombre} 
              className="w-full h-full object-contain object-center"
              onError={(e: any) => {
                e.target.onerror = null;
                e.target.src = "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1600&auto=format&fit=crop&q=80";
              }}
            />

            {/* BOTÓN ISOLOGO D'UNA */}
            <Link 
              href="/" 
              title="Volver a D'una Marketplace"
              className="absolute top-2 right-2 sm:top-4 sm:right-4 z-30 bg-white/90 hover:bg-white text-[#fe6712] p-1.5 sm:px-3 sm:py-2 rounded-xl sm:rounded-2xl shadow-md border border-white/40 flex items-center gap-1.5 transition backdrop-blur-md"
            >
              <img 
                src="/images/isotipo-duna.png" 
                alt="D'una Marketplace" 
                className="w-5 h-5 sm:w-6 sm:h-6 object-contain" 
                onError={(e: any) => {
                  e.target.style.display = 'none';
                }}
              />
              <span className="hidden sm:inline text-xs font-black text-slate-800">D'una</span>
            </Link>

            {/* AVATAR + IDENTIDAD DEL COMERCIO */}
            <div className="absolute bottom-8 left-2 sm:bottom-11 sm:left-6 z-20 flex items-center gap-2 sm:gap-3">
              <div className="w-9 h-9 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-white p-1 shadow-md border border-white/60 flex items-center justify-center shrink-0">
                <img 
                  src={aliadoData.logoImg} 
                  alt={aliadoData.nombre} 
                  className="w-full h-full object-contain"
                  onError={(e: any) => {
                    e.target.onerror = null;
                    e.target.src = "https://carjos-marketplace.cloud/uploads/uploads/files/images/cm614aslh00282omrgpvy2e4k.png";
                  }}
                />
              </div>
              <div className="text-white drop-shadow-md">
                <h1 className="text-xs sm:text-2xl font-black leading-tight flex items-center gap-1.5">
                  {aliadoData.nombre}
                </h1>
                <div className="flex items-center gap-1 mt-0.5">
                  <div className="inline-flex items-center gap-0.5 bg-black/40 backdrop-blur-md px-1.5 py-0.5 rounded-full text-[9px] sm:text-[11px] font-black border border-white/20">
                    <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                    <span>{aliadoData.rating}</span>
                  </div>
                  <span className="text-[9px] sm:text-[11px] text-slate-100 hidden sm:inline">• {aliadoData.categoria}</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* BUSCADOR FLOTANTE CON PADDING ADAPTABLE */}
        <div className="max-w-2xl mx-auto px-4 sm:px-6 -mt-4 sm:-mt-5 md:-mt-6 relative z-20">
          <div className="bg-white/95 backdrop-blur-md rounded-xl sm:rounded-2xl border border-slate-200 shadow-md px-3 sm:px-4 py-1.5 sm:py-2 flex items-center gap-2.5">
            <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 shrink-0" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="¿Qué se te antoja de esta tienda?"
              className="w-full bg-transparent text-xs sm:text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="text-slate-400 hover:text-slate-600">
                <X className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </button>
            )}
            <button className="p-1 rounded-lg text-slate-400 hover:text-[#fe6712] hover:bg-orange-50 transition shrink-0">
              <SlidersHorizontal className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#fe6712]" />
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-3 sm:px-6 md:px-8 pt-4 sm:pt-6 space-y-4 sm:space-y-6">
        
        {/* 3. PROMOCIONES ULTRA-COMPACTAS */}
        <section className="space-y-2">
          <div className="flex justify-between items-center">
            <h2 className="text-xs sm:text-base font-black text-slate-900 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#fe6712]" /> Promociones Imperdibles
            </h2>
          </div>

          <div ref={promoRef} className="flex gap-2 sm:gap-3 overflow-x-auto no-scrollbar pb-1 scroll-smooth">
            {promocionesImperdibles.map((promo) => (
              <div 
                key={promo.id} 
                onClick={() => openProductModal({
                  name: promo.name,
                  code: `PROMO-${promo.id}`,
                  desc: "Promoción oficial activa con precio de oferta preferencial.",
                  price: promo.price,
                  img: promo.img,
                  cat: "promo"
                })}
                className="w-[95px] sm:w-[130px] md:w-[140px] aspect-[2/3] rounded-xl sm:rounded-2xl overflow-hidden shadow-2xs hover:shadow-md transition-all cursor-pointer shrink-0 border border-slate-200/80 group relative bg-blue-600"
              >
                <img 
                  src={promo.img} 
                  alt={promo.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e: any) => {
                    e.target.onerror = null;
                    e.target.src = "https://carjos-marketplace.cloud/uploads/uploads/files/images/cmioua6xw000v1uo5f1x4e10g.png";
                  }}
                />
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    openProductModal({
                      name: promo.name,
                      code: `PROMO-${promo.id}`,
                      desc: "Promoción oficial activa con precio de oferta preferencial.",
                      price: promo.price,
                      img: promo.img,
                      cat: "promo"
                    });
                  }}
                  className="absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#fe6712] text-white flex items-center justify-center shadow-md"
                >
                  <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[3]" />
                </button>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* 4. BARRA DE CATEGORÍAS STICKY SLIM */}
      <div className="sticky top-[31px] sm:top-[37px] z-40 bg-white/95 backdrop-blur-md border-y border-slate-200 shadow-xs py-1.5 sm:py-2.5 transition-all mt-3 sm:mt-4">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 md:px-8 flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar">
          {categoriasComercio.map((cat) => {
            const active = selectedCat === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCat(cat.id)}
                className={`px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-[10px] sm:text-[11px] font-black uppercase tracking-wider transition whitespace-nowrap cursor-pointer ${
                  active 
                    ? 'bg-[#fe6712] text-white shadow-xs' 
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:text-slate-900'
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. CATÁLOGO COMPACTO: 2 COLUMNAS EN MÓVIL, 4 EN ESCRITORIO */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 md:px-8 pt-4 sm:pt-6 space-y-6">
        <section className="space-y-3 sm:space-y-4">
          <div className="flex justify-between items-center border-b border-slate-200/80 pb-1.5">
            <div>
              <h2 className="text-xs sm:text-base font-black text-slate-900 uppercase tracking-wide">
                {categoriasComercio.find(c => c.id === selectedCat)?.name || "CATÁLOGO"}
              </h2>
            </div>
            <span className="text-[10px] sm:text-xs font-bold text-slate-400">
              {filteredProducts.length} productos
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3.5 md:gap-4">
            {filteredProducts.map((p) => (
              <div 
                key={p.id} 
                onClick={() => openProductModal(p)}
                className="bg-white rounded-xl sm:rounded-2xl p-2 sm:p-3 border border-slate-200/80 shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group relative"
              >
                {/* Imagen Cuadrada 512x512 Compacta */}
                <div className="w-full aspect-square bg-slate-50 rounded-lg sm:rounded-xl flex items-center justify-center p-1 sm:p-2 mb-1.5 sm:mb-2.5 overflow-hidden border border-slate-100 relative">
                  <img 
                    src={p.img} 
                    alt={p.name} 
                    className="w-full h-full object-cover rounded-md group-hover:scale-105 transition-transform duration-300" 
                  />
                  <span className="absolute top-1.5 left-1.5 bg-[#fe6712] text-white text-[7.5px] sm:text-[9px] font-black px-1.5 py-0.5 rounded uppercase">
                    {p.cat.toUpperCase()}
                  </span>
                </div>

                {/* Textos con altura fija controlada */}
                <div className="space-y-0.5 flex-1 min-h-[32px] sm:min-h-[44px]">
                  <h4 className="text-[11px] sm:text-xs md:text-sm font-bold text-slate-900 leading-tight line-clamp-1 sm:line-clamp-2">
                    {p.name}
                  </h4>
                  <p className="hidden sm:block text-[10px] text-slate-400 line-clamp-1 leading-tight">
                    {p.desc}
                  </p>
                </div>

                {/* Precios y Botón Reducido */}
                <div className="mt-1.5 pt-1.5 border-t border-slate-100 flex items-end justify-between gap-1">
                  <div>
                    <span className="text-xs sm:text-sm md:text-base font-black text-slate-900">${p.price.toFixed(2)}</span>
                    <span className="text-[8.5px] sm:text-[9.5px] text-slate-400 font-bold block leading-none">
                      ~ Bs. {(p.price * BCV_RATE).toFixed(2)}
                    </span>
                  </div>
                  <button className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-slate-900 group-hover:bg-[#fe6712] text-white flex items-center justify-center transition shadow-2xs shrink-0">
                    <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* 6. MODAL ADAPTATIVO POR RUBRO */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300">
            
            <div className="p-3.5 sm:p-4 border-b border-slate-100 flex justify-between items-start bg-white z-20">
              <div>
                <span className="text-[8.5px] sm:text-[9px] font-black text-white bg-[#fe6712] px-2 py-0.5 rounded uppercase">
                  {selectedProduct.cat.toUpperCase()}
                </span>
                <h3 className="text-sm sm:text-lg font-black text-slate-900 mt-0.5 leading-tight">{selectedProduct.name}</h3>
              </div>
              <button 
                onClick={() => setSelectedProduct(null)} 
                className="w-7 h-7 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-200 transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-3.5 sm:p-4 overflow-y-auto space-y-3 sm:space-y-4 flex-1 bg-white">
              <div className="grid grid-cols-2 gap-3 items-center bg-slate-50 p-2.5 sm:p-3.5 rounded-2xl border border-slate-100">
                <div className="w-full aspect-square bg-white rounded-xl flex items-center justify-center border border-slate-200 p-1.5 overflow-hidden">
                  <img src={selectedProduct.img} alt={selectedProduct.name} className="max-h-full max-w-full object-cover rounded-lg" />
                </div>
                <div className="space-y-1 sm:space-y-2">
                  <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-wider block">Precio Base</span>
                  <div className="text-base sm:text-xl font-black text-slate-900 leading-tight">
                    ${selectedProduct.price.toFixed(2)}
                  </div>
                  <span className="text-[10px] text-slate-500 font-bold block">~ Bs. {(selectedProduct.price * BCV_RATE).toFixed(2)}</span>
                  <p className="text-[10.5px] sm:text-xs text-slate-600 line-clamp-2">{selectedProduct.desc}</p>
                </div>
              </div>

              {/* ROPA */}
              {selectedProduct.schema?.tipo === "ropa" && (
                <div className="space-y-3 p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <div>
                    <label className="text-[11px] font-black text-slate-900 uppercase block mb-1.5">Talla:</label>
                    <div className="flex gap-1.5">
                      {selectedProduct.schema.tallas.map((t: string) => (
                        <button
                          key={t}
                          onClick={() => setTallaSel(t)}
                          className={`w-9 h-8 sm:w-11 sm:h-10 rounded-xl font-black text-xs border ${
                            tallaSel === t ? 'bg-[#fe6712] text-white border-[#fe6712]' : 'bg-white text-slate-700 border-slate-200'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-black text-slate-900 uppercase block mb-1.5">
                      Color: <span className="text-[#fe6712]">{colorSel}</span>
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedProduct.schema.colores.map((c: any) => (
                        <button
                          key={c.name}
                          onClick={() => setColorSel(c.name)}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-xl border text-[11px] font-bold ${
                            colorSel === c.name ? 'border-[#fe6712] bg-white' : 'border-slate-200 bg-white'
                          }`}
                        >
                          <span className="w-3 h-3 rounded-full border border-slate-300" style={{ backgroundColor: c.hex }}></span>
                          <span className="text-slate-800">{c.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* COMIDA RÁPIDA */}
              {selectedProduct.schema?.tipo === "fastfood" && (
                <div className="space-y-3 p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <div>
                    <label className="text-[11px] font-black text-slate-900 uppercase block mb-1.5">Modalidad:</label>
                    <div className="space-y-1">
                      {selectedProduct.schema.comboOptions.map((opt: any, idx: number) => (
                        <div 
                          key={opt.name}
                          onClick={() => setComboSel(idx)}
                          className={`p-2 rounded-xl border text-[11px] font-bold flex justify-between items-center ${
                            comboSel === idx ? 'bg-orange-50 border-[#fe6712]' : 'bg-white border-slate-200 text-slate-700'
                          }`}
                        >
                          <span>{opt.name}</span>
                          <span className="text-[#fe6712] font-black">{opt.add > 0 ? `+$${opt.add.toFixed(2)}` : 'Incluido'}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-black text-slate-900 uppercase block mb-1.5">Toppings Extra:</label>
                    <div className="grid grid-cols-2 gap-1">
                      {selectedProduct.schema.adicionales.map((a: any) => (
                        <button
                          key={a.name}
                          onClick={() => toggleTopping(a.name)}
                          className={`p-1.5 rounded-xl border text-[10px] font-bold flex justify-between items-center ${
                            toppingsSel[a.name] ? 'bg-[#fe6712] text-white border-[#fe6712]' : 'bg-white text-slate-700 border-slate-200'
                          }`}
                        >
                          <span className="truncate pr-1">{a.name}</span>
                          <span>+${a.price.toFixed(2)}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* BODEGÓN */}
              {selectedProduct.schema?.tipo === "bodegon" && (
                <div className="space-y-3 p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <div>
                    <label className="text-[11px] font-black text-slate-900 uppercase block mb-1.5">Tamaño:</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {selectedProduct.schema.presentaciones.map((pres: any, idx: number) => (
                        <button
                          key={pres.label}
                          onClick={() => setPresSel(idx)}
                          className={`p-2 rounded-xl border text-xs font-black text-left ${
                            presSel === idx ? 'bg-[#fe6712] text-white border-[#fe6712]' : 'bg-white text-slate-700 border-slate-200'
                          }`}
                        >
                          <div>{pres.label}</div>
                          <div className="text-[9px] opacity-90">{pres.add > 0 ? `+$${pres.add.toFixed(2)}` : 'Estándar'}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* PAPELERÍA */}
              {selectedProduct.schema?.tipo === "papeleria" && (
                <div className="space-y-3 p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <div>
                    <label className="text-[11px] font-black text-slate-900 uppercase block mb-1.5">Hojas:</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {selectedProduct.schema.formatoHoja.map((h: string) => (
                        <button
                          key={h}
                          onClick={() => setHojaSel(h)}
                          className={`py-1.5 px-1 rounded-xl border text-[10px] font-black ${
                            hojaSel === h ? 'bg-[#fe6712] text-white border-[#fe6712]' : 'bg-white text-slate-700 border-slate-200'
                          }`}
                        >
                          {h}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* PIZZERÍA */}
              {selectedProduct.schema?.tipo === "pizzeria" && (
                <div className="space-y-3 p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <div>
                    <label className="text-[11px] font-black text-slate-900 uppercase block mb-1.5">Tamaño:</label>
                    <div className="space-y-1">
                      {selectedProduct.schema.tamanios.map((tam: any, idx: number) => (
                        <div
                          key={tam.label}
                          onClick={() => setTamanioPizzaSel(idx)}
                          className={`p-2 rounded-xl border text-[11px] font-bold flex justify-between items-center ${
                            tamanioPizzaSel === idx ? 'bg-orange-50 border-[#fe6712]' : 'bg-white border-slate-200 text-slate-700'
                          }`}
                        >
                          <span>{tam.label}</span>
                          <span className="text-[#fe6712] font-black">${tam.base.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Cantidad */}
              <div className="flex items-center justify-between pt-1.5 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-700">Cantidad:</span>
                <div className="flex items-center gap-2 bg-slate-100 px-2.5 py-0.5 rounded-xl border border-slate-200">
                  <button onClick={() => setQty(Math.max(1, qty - 1))} className="text-[#fe6712] font-black text-sm px-1">-</button>
                  <span className="font-black text-xs w-4 text-center text-slate-900">{qty}</span>
                  <button onClick={() => setQty(qty + 1)} className="text-[#fe6712] font-black text-sm px-1">+</button>
                </div>
              </div>

            </div>

            <div className="p-3 sm:p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-2.5">
              <div>
                <span className="text-[8.5px] font-black text-slate-400 uppercase block">Total</span>
                <span className="text-base sm:text-lg font-black text-slate-900">${calculateFinalPrice().toFixed(2)}</span>
              </div>
              <button 
                onClick={() => setSelectedProduct(null)} 
                className="flex-1 bg-[#fe6712] hover:bg-[#e05305] text-white font-black py-2.5 sm:py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5"
              >
                <ShoppingCart className="w-3.5 h-3.5" /> Agregar (${calculateFinalPrice().toFixed(2)})
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
