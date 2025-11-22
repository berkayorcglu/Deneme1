
import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { FileUpload } from './components/FileUpload';
import { ReportView } from './components/ReportView';
import { analyzeImage, generateHeatmap } from './services/geminiService';
import { ImageFile, AnalysisState, Language, Translations, Theme } from './types';
import { Sparkles, Loader2, AlertCircle, BrainCircuit, Zap, Eye, Type, Palette, Box } from 'lucide-react';

// Declare global variable for particlesJS loaded via CDN
declare global {
  interface Window {
    particlesJS: any;
  }
}

const TRANSLATIONS: Record<Language, Translations> = {
  tr: {
    title: "Neurify",
    subtitle: "Bilişsel Yük & Görsel Dikkat Analizi",
    sourceTitle: "Görsel Kaynağı",
    uploadTitle: "Görsel Yükle",
    uploadDesc: "Analiz etmek istediğiniz reklamı veya ekran görüntüsünü seçin.",
    uploadFormats: "JPG • PNG • WEBP",
    changeImage: "Değiştir",
    analyzeBtn: "Nöro-Analizi Başlat",
    analyzingBtn: "Bilişsel Simülasyon Yapılıyor...",
    errorTitle: "Analiz Hatası",
    criteriaTitle: "Analiz Kriterleri",
    criteriaSalience: "Görsel hiyerarşideki en baskın, \"pop-out\" etkisi yaratan öğeler.",
    criteriaLoad: "İşleyen belleği zorlayan karmaşıklık ve görsel gürültü miktarı.",
    criteriaFlow: "Gözün bilgiyi tüketmek için izlediği bilinçdışı rota.",
    criteriaTypography: "Metinlerin okunabilirliği, font seçimi ve hiyerarşik düzeni.",
    criteriaContrast: "Renklerin erişilebilirliği ve nörolojik kontrast etkisi.",
    criteriaObjects: "Görseldeki temel objelerin tespiti ve bilişsel ağırlıkları.",
    resultsTitle: "Analiz Sonuçları",
    reportTab: "Detaylı Rapor",
    heatmapTab: "Isı Haritası",
    metricsTab: "Görsel Metrikler",
    sentimentTab: "Duygu Bulutu",
    emptyStateTitle: "Sonuçlar burada görünecek",
    emptyStateDesc: "Analizi başlattığınızda yapay zeka, görseli bilişsel bilim prensiplerine göre parçalarına ayıracaktır.",
    legendTitle: "Nasıl Okunmalı?",
    legendHigh: "Yüksek Dikkat (Sıcak Bölgeler)",
    legendMed: "Orta Dikkat",
    legendLow: "Düşük Dikkat (Soğuk Bölgeler)",
    poweredBy: "Gemini 2.5 Flash ile güçlendirilmiştir",
    badgeLow: "Düşük Bilişsel Yük",
    badgeMed: "Orta Bilişsel Yük",
    badgeHigh: "Yüksek Bilişsel Yük",
    legendSalience: "Beynin ilk dikkat ettiği görsel \"çapa\".",
    legendFlow: "Gözün tarama rotası (Z-Pattern / F-Pattern).",
    legendDead: "Kullanıcının görmezden geldiği alanlar.",
    heatmapAnalysisTitle: "Görsel Dikkat Analizi",
    heatmapInsightDesc: "Yapay zeka, ısı haritasındaki sıcak bölgeleri aşağıdaki nöro-bilimsel nedenlere dayandırıyor:",
    // Chart Labels
    labelSalience: "Belirginlik",
    labelClarity: "Netlik",
    labelFlow: "Akış",
    labelEmotion: "Duygu",
    labelSimplicity: "Sadelik",
    visualMetricsTitle: "Görsel Metrikler",
    // Metric Descriptions
    descSalience: "Görselin 'pop-out' etkisi ve dikkati ilk bakışta yakalama gücü.",
    descClarity: "Mesajın ne kadar net iletildiği ve gürültüden ne kadar arındırıldığı.",
    descFlow: "Gözün bir öğeden diğerine geçerken izlediği yolun pürüzsüzlüğü.",
    descEmotion: "Tasarımın izleyicide uyandırdığı bilinçdışı duygusal tepki.",
    descSimplicity: "Bilişsel yükü azaltan minimalist ve odaklanmış tasarım yapısı.",
    // Sentiment
    sentimentTitle: "Duygu & Atmosfer Analizi",
    sentimentDesc: "Kullanıcının görselle karşılaştığı ilk 2 saniyede hissettiği bilinçdışı duygular ve yoğunlukları.",
    sentimentPos: "Pozitif",
    sentimentNeg: "Negatif",
    sentimentNeu: "Nötr",
    // Missing Card Titles
    titleLoad: "Bilişsel Yük",
    titleTypography: "Okunabilirlik",
    titleContrast: "Renk & Kontrast",
    titleObjects: "Obje Tespiti"
  },
  en: {
    title: "Neurify",
    subtitle: "Cognitive Load & Visual Attention Analysis",
    sourceTitle: "Visual Source",
    uploadTitle: "Upload Image",
    uploadDesc: "Select the advertisement or screenshot you want to analyze.",
    uploadFormats: "JPG • PNG • WEBP",
    changeImage: "Change",
    analyzeBtn: "Start Neuro-Analysis",
    analyzingBtn: "Running Cognitive Simulation...",
    errorTitle: "Analysis Error",
    criteriaTitle: "Analysis Criteria",
    criteriaSalience: "Dominant elements in the visual hierarchy creating a \"pop-out\" effect.",
    criteriaLoad: "Amount of complexity and visual noise straining working memory.",
    criteriaFlow: "The unconscious path the eye takes to consume information.",
    criteriaTypography: "Text readability, font choices, and hierarchical arrangement.",
    criteriaContrast: "Color accessibility and neurological contrast impact.",
    criteriaObjects: "Detection of key visual objects and their cognitive weight.",
    resultsTitle: "Analysis Results",
    reportTab: "Detailed Report",
    heatmapTab: "Heatmap",
    metricsTab: "Visual Metrics",
    sentimentTab: "Sentiment Cloud",
    emptyStateTitle: "Results will appear here",
    emptyStateDesc: "Once started, AI will deconstruct the image based on cognitive science principles.",
    legendTitle: "How to read?",
    legendHigh: "High Attention (Hot Zones)",
    legendMed: "Medium Attention",
    legendLow: "Low Attention (Cool Zones)",
    poweredBy: "Powered by Gemini 2.5 Flash",
    badgeLow: "Low Cognitive Load",
    badgeMed: "Medium Cognitive Load",
    badgeHigh: "High Cognitive Load",
    legendSalience: "The visual \"anchor\" the brain notices first.",
    legendFlow: "Eye scanning route (Z-Pattern / F-Pattern).",
    legendDead: "Areas the user ignores.",
    heatmapAnalysisTitle: "Visual Attention Analysis",
    heatmapInsightDesc: "AI attributes the hot zones in the heatmap to the following neuro-scientific reasons:",
    // Chart Labels
    labelSalience: "Salience",
    labelClarity: "Clarity",
    labelFlow: "Flow",
    labelEmotion: "Emotion",
    labelSimplicity: "Simplicity",
    visualMetricsTitle: "Visual Metrics",
    // Metric Descriptions
    descSalience: "The 'pop-out' effect and power to capture attention at first glance.",
    descClarity: "How clearly the message is conveyed and stripped of visual noise.",
    descFlow: "The smoothness of the path the eye takes from one element to another.",
    descEmotion: "The unconscious emotional response elicited by the design.",
    descSimplicity: "Minimalist and focused structure that reduces cognitive load.",
    // Sentiment
    sentimentTitle: "Sentiment & Atmosphere Analysis",
    sentimentDesc: "Subconscious emotions and their intensity felt by the user in the first 2 seconds.",
    sentimentPos: "Positive",
    sentimentNeg: "Negative",
    sentimentNeu: "Neutral",
    // Missing Card Titles
    titleLoad: "Cognitive Load",
    titleTypography: "Readability",
    titleContrast: "Color & Contrast",
    titleObjects: "Object Detection"
  }
};

/**
 * BioDigitalNetwork Component
 * Renders a realistic, organic, and futuristic neural network using complex SVGs.
 * Adapts colors based on the theme.
 */
const BioDigitalNetwork: React.FC<{theme: Theme}> = ({theme}) => {
  const isDark = theme === 'dark';
  
  // Dark: Teal/Cyan/Violet
  // Light: Violet/Indigo/Slate
  
  const somaColor = isDark ? "#2dd4bf" : "#8b5cf6";
  const somaStop = isDark ? "#0ea5e9" : "#6366f1";
  const axonStart = isDark ? "#2dd4bf" : "#8b5cf6";
  const axonEnd = isDark ? "#8b5cf6" : "#4f46e5";
  const particleColor1 = isDark ? "#2dd4bf" : "#8b5cf6";
  const particleColor2 = isDark ? "#8b5cf6" : "#ec4899";
  const strokeColor = isDark ? "#0ea5e9" : "#94a3b8";

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none transition-colors duration-700">
      {/* Opacity managed for visibility in both themes */}
      <svg className={`w-full h-full ${isDark ? 'opacity-[0.35]' : 'opacity-[0.2]'}`} viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice">
        <defs>
          <radialGradient id="somaGlow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <stop offset="0%" stopColor={somaColor} stopOpacity="0.8" />
            <stop offset="40%" stopColor={somaStop} stopOpacity="0.4" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="axonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={axonStart} stopOpacity="0" />
            <stop offset="50%" stopColor={axonStart} stopOpacity="0.5" />
            <stop offset="100%" stopColor={axonEnd} stopOpacity="0" />
          </linearGradient>
          <filter id="blurFilter" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
          </filter>
          <filter id="deepBlur" x="-50%" y="-50%" width="200%" height="200%">
             <feGaussianBlur in="SourceGraphic" stdDeviation="6" />
          </filter>
        </defs>

        {/* Layer 1: Deep Background Neurons (Blurred) */}
        <g className="transition-colors duration-500" filter="url(#deepBlur)" opacity="0.6">
           <circle cx="200" cy="300" r="60" fill="url(#somaGlow)" />
           <circle cx="1600" cy="200" r="80" fill="url(#somaGlow)" />
           <circle cx="1000" cy="900" r="100" fill="url(#somaGlow)" />
           <path d="M200 300 Q 500 500 800 400 T 1600 200" stroke={strokeColor} strokeWidth="2" fill="none" />
           <path d="M1600 200 Q 1400 600 1000 900" stroke={strokeColor} strokeWidth="2" fill="none" />
        </g>

        {/* Layer 2: Mid-Range Network (Detailed) */}
        <g className="animate-pulse" style={{ animationDuration: '8s' }}>
           {/* Top Left Cluster */}
           <circle cx="150" cy="150" r="8" fill={somaColor} filter="url(#blurFilter)" />
           <circle cx="150" cy="150" r="40" fill="url(#somaGlow)" />
           
           {/* Bottom Right Cluster */}
           <circle cx="1700" cy="900" r="10" fill={axonEnd} filter="url(#blurFilter)" />
           <circle cx="1700" cy="900" r="50" fill="url(#somaGlow)" />

           {/* Curved Connections (Axons) */}
           <path 
             d="M150 150 C 400 250, 200 600, 500 800" 
             stroke="url(#axonGradient)" 
             strokeWidth="1.5" 
             fill="none" 
             strokeDasharray="10 5"
             opacity="0.8"
           />
           <path 
             d="M0 600 C 300 550, 600 700, 900 600 S 1500 400, 1920 500" 
             stroke="url(#axonGradient)" 
             strokeWidth="1" 
             fill="none" 
             opacity="0.6"
           />

           {/* Synaptic Terminals */}
           <circle cx="500" cy="800" r="3" fill={particleColor1} opacity="0.7" />
           <circle cx="900" cy="600" r="4" fill={particleColor2} opacity="0.7" />
        </g>
        
        {/* Layer 3: Floating Synapses */}
        <g opacity="0.5">
           <circle cx="400" cy="200" r="2" fill={isDark ? "white" : "#334155"} className="animate-ping" style={{animationDuration: '3s'}} />
           <circle cx="1200" cy="700" r="2" fill={isDark ? "white" : "#334155"} className="animate-ping" style={{animationDuration: '5s'}} />
           <circle cx="800" cy="400" r="1.5" fill={particleColor1} />
           <circle cx="1500" cy="800" r="1.5" fill={particleColor2} />
        </g>
      </svg>
    </div>
  );
};

/**
 * ParticlesBackground Component
 * Adapts particle colors based on theme prop.
 */
const ParticlesBackground: React.FC<{theme: Theme}> = ({theme}) => {
  
  useEffect(() => {
    const isDark = theme === 'dark';
    const colors = isDark ? ["#2dd4bf", "#8b5cf6"] : ["#8b5cf6", "#0ea5e9"]; // Teal/Violet vs Violet/Sky
    const linkColor = isDark ? "#5eead4" : "#6366f1";
    const opacity = isDark ? 0.3 : 0.5; // Needs to be slightly darker in light mode to see

    if (window.particlesJS) {
      window.particlesJS('particles-js', {
        "particles": {
          "number": {
            "value": 60, 
            "density": {
              "enable": true,
              "value_area": 800
            }
          },
          "color": {
            "value": colors
          },
          "shape": {
            "type": "circle",
          },
          "opacity": {
            "value": opacity,
            "random": true,
            "anim": {
              "enable": true,
              "speed": 1,
              "opacity_min": 0.1,
              "sync": false
            }
          },
          "size": {
            "value": 3,
            "random": true,
            "anim": {
              "enable": false
            }
          },
          "line_linked": {
            "enable": true,
            "distance": 150, 
            "color": linkColor,
            "opacity": 0.08,
            "width": 1
          },
          "move": {
            "enable": true,
            "speed": 0.4,
            "direction": "none",
            "random": true,
            "straight": false,
            "out_mode": "out",
            "bounce": false
          }
        },
        "interactivity": {
          "detect_on": "window", 
          "events": {
            "onhover": {
              "enable": true,
              "mode": "grab" 
            },
            "onclick": {
              "enable": true,
              "mode": "push"
            },
            "resize": true
          },
          "modes": {
            "grab": {
              "distance": 200, 
              "line_linked": {
                "opacity": 0.2
              }
            },
            "push": {
              "particles_nb": 2
            }
          }
        },
        "retina_detect": true
      });
    }
  }, [theme]); // Re-initialize when theme changes

  return (
    <div 
      id="particles-js" 
      className="fixed inset-0 z-1 pointer-events-none"
    />
  );
};

const App: React.FC = () => {
  const [language, setLanguage] = useState<Language>('tr');
  const [theme, setTheme] = useState<Theme>('dark');
  const [selectedImage, setSelectedImage] = useState<ImageFile | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisState>({
    isLoading: false,
    result: null,
    heatmapResult: null,
    error: null,
  });

  // Handle Theme Class on Body/HTML
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const t = TRANSLATIONS[language];

  const handleImageSelect = (image: ImageFile | null) => {
    setSelectedImage(image);
    setAnalysis({ isLoading: false, result: null, heatmapResult: null, error: null });
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;

    setAnalysis({ isLoading: true, result: null, heatmapResult: null, error: null });

    try {
      const [textResult, heatmapBase64] = await Promise.all([
        analyzeImage(selectedImage.base64, selectedImage.mimeType, language),
        generateHeatmap(selectedImage.base64, selectedImage.mimeType, language)
      ]);
      
      setAnalysis({
        isLoading: false,
        result: textResult,
        heatmapResult: heatmapBase64,
        error: null
      });
    } catch (err) {
      setAnalysis({
        isLoading: false,
        result: null,
        heatmapResult: null,
        error: err instanceof Error ? err.message : "An error occurred"
      });
    }
  };

  return (
    <div className="min-h-screen font-sans pb-20 relative overflow-x-hidden transition-colors duration-700 bg-slate-50 dark:bg-[#0b0c10] text-slate-800 dark:text-slate-100">
      
      {/* Layer 1: Realistic Bio-Digital Network (SVG) */}
      <BioDigitalNetwork theme={theme} />

      {/* Layer 2: Interactive Particles */}
      <ParticlesBackground theme={theme} />

      <Header 
        language={language} 
        setLanguage={setLanguage} 
        theme={theme}
        setTheme={setTheme}
        t={t}
      />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8 relative z-10">
        
        {/* Hero Section */}
        <div className="text-center space-y-4 mb-10 relative">
          {/* Ambient Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-48 bg-violet-500/20 blur-[100px] rounded-full pointer-events-none"></div>

          <h2 className="text-5xl sm:text-6xl font-extrabold tracking-tight relative z-10">
            <span className="bg-gradient-to-r from-cyan-500 via-violet-500 to-fuchsia-500 dark:from-cyan-400 dark:via-violet-400 dark:to-fuchsia-400 text-transparent bg-clip-text drop-shadow-[0_0_25px_rgba(139,92,246,0.2)] dark:drop-shadow-[0_0_25px_rgba(139,92,246,0.4)]">
              {t.title}
            </span>
          </h2>
          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300/80 max-w-2xl mx-auto font-light tracking-wide">
            {t.subtitle}
          </p>
        </div>

        {/* Upload & Analysis Section */}
        <div className="flex flex-col items-center gap-8">
          <div className="w-full max-w-2xl relative z-10">
            <FileUpload 
              onImageSelect={handleImageSelect} 
              selectedImage={selectedImage} 
              disabled={analysis.isLoading}
              t={t}
              isLoading={analysis.isLoading}
            />
          </div>

          {selectedImage && (
            <div className="w-full max-w-md animate-in slide-in-from-bottom-4 fade-in duration-500">
              {analysis.error && (
                <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm flex items-center gap-2">
                  <AlertCircle size={18} />
                  {analysis.error}
                </div>
              )}
              
              <button
                onClick={handleAnalyze}
                disabled={analysis.isLoading}
                className="w-full group relative flex items-center justify-center gap-3 py-4 px-8 rounded-xl bg-neuro-600 hover:bg-neuro-700 text-white font-semibold text-lg shadow-lg shadow-neuro-500/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden"
              >
                {analysis.isLoading ? (
                  <>
                    <Loader2 className="animate-spin" />
                    {t.analyzingBtn}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 group-hover:animate-pulse" />
                    {t.analyzeBtn}
                  </>
                )}
                {/* Button glow effect */}
                {!analysis.isLoading && (
                  <div className="absolute inset-0 rounded-xl ring-2 ring-white/20 group-hover:ring-white/40 transition-all" />
                )}
              </button>
            </div>
          )}
        </div>

        {/* Info Cards */}
        {!analysis.result && !analysis.isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 opacity-95">
            {/* Salience */}
            <div className="p-6 rounded-2xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300 group hover:bg-white/80 dark:hover:bg-slate-800/80">
              <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Zap size={20} />
              </div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">{t.labelSalience}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {t.criteriaSalience}
              </p>
            </div>
            
            {/* Cognitive Load */}
            <div className="p-6 rounded-2xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300 group hover:bg-white/80 dark:hover:bg-slate-800/80">
               <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <BrainCircuit size={20} />
              </div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">{t.titleLoad}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {t.criteriaLoad}
              </p>
            </div>

            {/* Eye Flow */}
            <div className="p-6 rounded-2xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300 group hover:bg-white/80 dark:hover:bg-slate-800/80">
               <div className="w-10 h-10 rounded-lg bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Eye size={20} />
              </div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">{t.labelFlow}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {t.criteriaFlow}
              </p>
            </div>

             {/* Typography */}
             <div className="p-6 rounded-2xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300 group hover:bg-white/80 dark:hover:bg-slate-800/80">
               <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Type size={20} />
              </div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">{t.titleTypography}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {t.criteriaTypography}
              </p>
            </div>

             {/* Contrast */}
             <div className="p-6 rounded-2xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300 group hover:bg-white/80 dark:hover:bg-slate-800/80">
               <div className="w-10 h-10 rounded-lg bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Palette size={20} />
              </div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">{t.titleContrast}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {t.criteriaContrast}
              </p>
            </div>

             {/* Objects */}
             <div className="p-6 rounded-2xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300 group hover:bg-white/80 dark:hover:bg-slate-800/80">
               <div className="w-10 h-10 rounded-lg bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Box size={20} />
              </div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">{t.titleObjects}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {t.criteriaObjects}
              </p>
            </div>

          </div>
        )}

        {/* Results View */}
        {(analysis.result || analysis.heatmapResult) && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 pb-12">
            <ReportView 
              markdown={analysis.result || ''} 
              heatmapBase64={analysis.heatmapResult}
              t={t}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
