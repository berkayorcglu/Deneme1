
import React, { useState, useEffect, useRef, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { Activity, Eye, Zap, Layers, FileText, Radar, Info, Smile, MousePointer2, Cloud, BrainCircuit, Share2, Download } from 'lucide-react';
import { Translations, SentimentItem } from '../types';

declare const Chart: any;

interface ReportViewProps {
  markdown: string;
  heatmapBase64: string | null;
  t: Translations;
}

export const ReportView: React.FC<ReportViewProps> = ({ markdown, heatmapBase64, t }) => {
  const [activeTab, setActiveTab] = useState<'report' | 'heatmap' | 'metrics' | 'sentiment'>('report');
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<any>(null);

  // 1. Extract JSON Block and Clean Text
  const { cleanMarkdown, sentimentData } = useMemo(() => {
    // Regex to capture the JSON block
    const jsonBlockRegex = /```json\s*([\s\S]*?)\s*```/;
    const match = markdown.match(jsonBlockRegex);
    
    let extractedSentiment: SentimentItem[] = [];
    let cleaned = markdown;

    // Parse JSON if found
    if (match) {
      try {
        const jsonString = match[1];
        const parsed = JSON.parse(jsonString);
        if (parsed.sentiment_cloud && Array.isArray(parsed.sentiment_cloud)) {
          extractedSentiment = parsed.sentiment_cloud;
        }
      } catch (e) {
        console.error("Failed to parse sentiment JSON", e);
      }
    }

    // CUT everything after the Sentiment Header to strictly hide it from Report Tab
    // We look for the header defined in the prompt "### ☁️ SENTIMENT"
    const splitMarker = "### ☁️ SENTIMENT";
    if (cleaned.includes(splitMarker)) {
      cleaned = cleaned.split(splitMarker)[0];
    } else {
      // Fallback: just remove the code block if header isn't found perfectly
      if (match) {
        cleaned = cleaned.replace(match[0], '');
      }
    }

    return { cleanMarkdown: cleaned, sentimentData: extractedSentiment };
  }, [markdown]);

  // Helper to extract score
  const extractScore = (text: string): number | null => {
    const match = text.match(/(\d+)\/10/);
    return match ? parseInt(match[1], 10) : null;
  };

  // Chart Logic
  useEffect(() => {
    if (activeTab === 'metrics' && chartRef.current && typeof Chart !== 'undefined') {
      if (chartInstance.current) chartInstance.current.destroy();

      const ctx = chartRef.current.getContext('2d');
      if (!ctx) return;

      const salienceScore = extractScore(markdown) || 7; 
      const clarityScore = Math.max(1, 10 - (extractScore(markdown) || 5));
      const flowScore = 6; 
      const emotionScore = 5;
      const simplicityScore = 7;

      const isDark = document.documentElement.classList.contains('dark');
      const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
      const textColor = isDark ? '#94a3b8' : '#64748b';
      const pointColor = isDark ? '#22d3ee' : '#8b5cf6'; // Cyan vs Violet
      const areaColor = isDark ? 'rgba(34, 211, 238, 0.2)' : 'rgba(139, 92, 246, 0.2)';
      const borderColor = isDark ? '#22d3ee' : '#8b5cf6';

      chartInstance.current = new Chart(ctx, {
        type: 'radar',
        data: {
          labels: [t.labelSalience, t.labelClarity, t.labelFlow, t.labelEmotion, t.labelSimplicity],
          datasets: [{
            label: 'Cognitive Metrics',
            data: [salienceScore, clarityScore, flowScore, emotionScore, simplicityScore],
            backgroundColor: areaColor,
            borderColor: borderColor,
            pointBackgroundColor: pointColor,
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: pointColor,
            borderWidth: 3
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            r: {
              angleLines: { color: gridColor },
              grid: { color: gridColor },
              pointLabels: {
                color: textColor,
                font: { size: 13, family: "'Inter', sans-serif", weight: 600 }
              },
              ticks: { display: false, max: 10, min: 0 }
            }
          },
          plugins: {
            legend: { display: false }
          }
        }
      });
    }
    return () => {
      if (chartInstance.current) chartInstance.current.destroy();
    };
  }, [activeTab, markdown, t]);

  const score = extractScore(markdown);
  const salienceScore = extractScore(markdown) || 7; 
  const clarityScore = Math.max(1, 10 - (extractScore(markdown) || 5));
  const flowScore = 6;
  const emotionScore = 5;
  const simplicityScore = 7;
  
  let scoreColor = "text-emerald-500";
  let ringColor = "stroke-emerald-500";
  let scoreLabel = t.badgeLow;

  if (score) {
      if (score > 7) {
          scoreColor = "text-rose-500";
          ringColor = "stroke-rose-500";
          scoreLabel = t.badgeHigh;
      } else if (score > 4) {
          scoreColor = "text-amber-500";
          ringColor = "stroke-amber-500";
          scoreLabel = t.badgeMed;
      }
  }

  const getSentimentStyle = (item: SentimentItem) => {
    const fontSize = "text-sm sm:text-lg md:text-xl lg:text-2xl"; // Responsive font sizes
    const padding = item.weight >= 8 ? "px-6 py-3 sm:px-8 sm:py-4" : item.weight >= 5 ? "px-4 py-2 sm:px-6 sm:py-3" : "px-3 py-1.5 sm:px-4 sm:py-2";
    const weightBoldness = item.weight >= 7 ? "font-extrabold" : "font-semibold";

    let colorStyle = "";
    if (item.type === 'positive') {
      colorStyle = "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] shadow-[0_0_10px_rgba(16,185,129,0.1)]";
    } else if (item.type === 'negative') {
      colorStyle = "bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400 hover:shadow-[0_0_25px_rgba(244,63,94,0.5)] shadow-[0_0_10px_rgba(244,63,94,0.1)]";
    } else {
      colorStyle = "bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400 hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] shadow-[0_0_10px_rgba(59,130,246,0.1)]";
    }

    return { className: `backdrop-blur-xl border transition-all duration-500 hover:scale-110 rounded-2xl ${fontSize} ${padding} ${weightBoldness} ${colorStyle} cursor-default select-none` };
  };

  // Calculate circle circumference for score ring
  const radius = 36; // Slightly reduced to ensure fit within 96x96 viewBox
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - ((score || 0) / 10) * circumference;

  return (
    <div className="bg-white/90 dark:bg-[#0b0c10]/90 backdrop-blur-2xl rounded-[2rem] shadow-2xl border border-slate-200 dark:border-slate-800/60 overflow-hidden h-full flex flex-col min-h-[800px] transition-all duration-500 relative group w-full">
      
      {/* Top Glow Line */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-neuro-500 to-transparent opacity-60"></div>

      {/* Header & Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-md z-20 sticky top-0">
        <div className="px-6 py-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            
            {/* Title & Score - BIGGER */}
            <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
                   {/* Score Ring */}
                   <svg className="transform -rotate-90 w-24 h-24 drop-shadow-lg overflow-visible" viewBox="0 0 96 96">
                     <circle cx="48" cy="48" r={radius} stroke="currentColor" strokeWidth="6" fill="transparent" className="text-slate-200 dark:text-slate-800" />
                     <circle cx="48" cy="48" r={radius} stroke="currentColor" strokeWidth="6" fill="transparent" strokeDasharray={circumference} strokeDashoffset={offset} className={`${ringColor} transition-all duration-1000 ease-out`} strokeLinecap="round" />
                   </svg>
                   <span className={`absolute text-3xl font-black ${scoreColor}`}>{score}</span>
                </div>
                <div className="text-center sm:text-left">
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white flex items-center justify-center sm:justify-start gap-2">
                        {t.resultsTitle}
                    </h2>
                    <span className={`text-sm font-bold ${scoreColor} uppercase tracking-widest mt-1 block`}>
                        {scoreLabel}
                    </span>
                </div>
            </div>
            
            {/* Modern Pill Tabs - Hide Scrollbar */}
            <div className="flex p-1.5 bg-slate-200/50 dark:bg-slate-800/50 rounded-full backdrop-blur-md overflow-x-auto no-scrollbar shadow-inner shrink-0 w-full lg:w-auto">
               {[
                 { id: 'report', icon: FileText, label: t.reportTab },
                 { id: 'heatmap', icon: Layers, label: t.heatmapTab },
                 { id: 'metrics', icon: Radar, label: t.metricsTab },
                 { id: 'sentiment', icon: Cloud, label: t.sentimentTab },
               ].map((tab) => (
                 <button
                   key={tab.id}
                   onClick={() => setActiveTab(tab.id as any)}
                   className={`
                     flex items-center justify-center gap-2.5 px-5 py-3 rounded-full text-sm font-semibold transition-all duration-300 whitespace-nowrap flex-1 lg:flex-none
                     ${activeTab === tab.id 
                       ? 'bg-white dark:bg-neuro-600 text-neuro-700 dark:text-white shadow-md scale-105' 
                       : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-700/50'}
                   `}
                 >
                   <tab.icon size={18} className={activeTab === tab.id ? "animate-pulse" : ""} />
                   {tab.label}
                 </button>
               ))}
            </div>
        </div>
      </div>
      
      {/* Content Area - Thinner Scrollbar */}
      <div className="flex-grow overflow-y-auto custom-scrollbar relative bg-slate-50/30 dark:bg-transparent p-6 lg:p-10">
        
        {/* TEXT REPORT TAB */}
        {activeTab === 'report' && (
            <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700">
                <div className="prose prose-lg lg:prose-xl prose-slate dark:prose-invert max-w-none
                    prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-neuro-800 dark:prose-headings:text-neuro-100
                    prose-h3:text-transparent prose-h3:bg-clip-text prose-h3:bg-gradient-to-r prose-h3:from-neuro-600 prose-h3:to-fuchsia-600 dark:prose-h3:from-neuro-400 dark:prose-h3:to-fuchsia-400
                    prose-strong:text-neuro-700 dark:prose-strong:text-neuro-300 prose-strong:font-bold
                    prose-li:marker:text-neuro-500
                    prose-p:leading-loose
                ">
                    <ReactMarkdown
                        components={{
                        h3: ({node, ...props}) => (
                            <div className="flex items-center gap-4 mt-12 mb-6 border-b border-slate-200 dark:border-slate-800/50 pb-4">
                                <div className="p-2 rounded-xl bg-neuro-100 dark:bg-neuro-900/50 text-neuro-600 dark:text-neuro-400 shadow-sm">
                                    <BrainCircuit size={24} />
                                </div>
                                <h3 className="!m-0 !p-0 text-2xl" {...props} />
                            </div>
                        ),
                        p: ({node, ...props}) => <p className="text-slate-600 dark:text-slate-300 text-lg mb-6" {...props} />,
                        li: ({node, ...props}) => <li className="text-slate-600 dark:text-slate-300 text-lg mb-2" {...props} />
                        }}
                    >
                        {cleanMarkdown}
                    </ReactMarkdown>
                </div>
            </div>
        )}

        {/* VISUAL METRICS TAB - SIDE BY SIDE LAYOUT RESTORED */}
        {activeTab === 'metrics' && (
           <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 h-full animate-in fade-in slide-in-from-bottom-6 duration-700">
              
              {/* Chart Container - Takes 3/5 Width on Large Screens */}
              <div className="lg:col-span-3 bg-white dark:bg-slate-800/40 rounded-[2rem] border border-slate-200 dark:border-slate-700/50 p-8 shadow-lg flex flex-col relative overflow-hidden group min-h-[400px] lg:min-h-[500px]">
                 {/* Background Decoration */}
                 <div className="absolute -right-20 -top-20 w-64 h-64 bg-neuro-500/10 rounded-full blur-3xl animate-pulse"></div>
                 
                 <div className="flex items-center gap-3 text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-8 relative z-10">
                    <Radar size={20} /> {t.visualMetricsTitle}
                 </div>
                 <div className="w-full flex-grow relative z-10">
                   <canvas ref={chartRef}></canvas>
                 </div>
              </div>

              {/* Cards Grid - Takes 2/5 Width on Large Screens */}
              <div className="lg:col-span-2 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar h-full max-h-[700px]">
                 {[
                    { label: t.labelSalience, score: salienceScore, icon: Zap, color: 'amber', desc: t.descSalience },
                    { label: t.labelClarity, score: clarityScore, icon: Eye, color: 'sky', desc: t.descClarity },
                    { label: t.labelFlow, score: flowScore, icon: MousePointer2, color: 'emerald', desc: t.descFlow },
                    { label: t.labelEmotion, score: emotionScore, icon: Activity, color: 'rose', desc: t.descEmotion },
                    { label: t.labelSimplicity, score: simplicityScore, icon: Smile, color: 'violet', desc: t.descSimplicity },
                 ].map((metric, idx) => (
                    <div key={idx} className="p-5 bg-white dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700/50 hover:border-neuro-500/40 transition-all hover:shadow-lg hover:translate-x-1 group cursor-default">
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-3">
                                <div className={`p-2.5 rounded-xl bg-${metric.color}-100 dark:bg-${metric.color}-900/30 text-${metric.color}-600 dark:text-${metric.color}-400`}>
                                    <metric.icon size={20} />
                                </div>
                                <span className={`text-base font-bold text-${metric.color}-700 dark:text-${metric.color}-300`}>{metric.label}</span>
                            </div>
                            <span className="text-xl font-black text-slate-300 dark:text-slate-600 group-hover:text-slate-500 dark:group-hover:text-slate-400 transition-colors">
                                {metric.score}/10
                            </span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-700/50 h-1.5 rounded-full mb-3 overflow-hidden">
                            <div 
                                className={`h-full bg-${metric.color}-500 rounded-full transition-all duration-1000 ease-out`} 
                                style={{ width: `${metric.score * 10}%` }}
                            ></div>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{metric.desc}</p>
                    </div>
                 ))}
              </div>
           </div>
        )}

        {/* SENTIMENT CLOUD TAB */}
        {activeTab === 'sentiment' && (
          <div className="h-full flex flex-col items-center justify-center relative animate-in fade-in zoom-in-95 duration-700 min-h-[600px]">
             <div className="text-center mb-10 relative z-10 max-w-3xl">
               <h3 className="text-3xl font-bold text-slate-800 dark:text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-cyan-500 to-violet-500 dark:from-cyan-400 dark:to-violet-400">{t.sentimentTitle}</h3>
               <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed">
                 {t.sentimentDesc}
               </p>
             </div>

             {sentimentData.length > 0 ? (
               <>
                 <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-8 p-4 max-w-6xl relative z-10 mb-12">
                     {sentimentData.map((item, index) => {
                       const { className } = getSentimentStyle(item);
                       return (
                         <div key={index} className={className} title={`Weight: ${item.weight}/10`}>
                           {item.word}
                         </div>
                       );
                     })}
                 </div>
                 
                 {/* Sentiment Color Legend */}
                 <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 bg-slate-100/50 dark:bg-slate-800/50 px-6 py-3 rounded-full border border-slate-200 dark:border-slate-700 backdrop-blur-sm">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
                        <span className="w-3 h-3 rounded-full bg-emerald-500"></span> {t.sentimentPos}
                    </div>
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
                        <span className="w-3 h-3 rounded-full bg-rose-500"></span> {t.sentimentNeg}
                    </div>
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
                        <span className="w-3 h-3 rounded-full bg-blue-500"></span> {t.sentimentNeu}
                    </div>
                 </div>
               </>
             ) : (
               <div className="flex flex-col items-center text-slate-400 dark:text-slate-600">
                 <Cloud size={80} strokeWidth={1} className="mb-6 opacity-50 animate-bounce" />
                 <p className="text-xl">{t.emptyStateDesc}</p>
               </div>
             )}
          </div>
        )}

        {/* HEATMAP TAB - REFINED */}
        {activeTab === 'heatmap' && (
            <div className="h-full flex flex-col items-center animate-in fade-in duration-700">
                {heatmapBase64 ? (
                    <div className="w-full max-w-7xl flex flex-col gap-12 items-center justify-center h-full">
                        
                        {/* Image Container (Center & Large) */}
                        <div className="w-full flex flex-col items-center">
                            <div className="relative rounded-[2rem] overflow-hidden border-[6px] border-white dark:border-slate-700 shadow-2xl bg-slate-900 group w-auto max-w-full transition-transform duration-500 hover:scale-[1.01]">
                                <img 
                                    src={`data:image/png;base64,${heatmapBase64}`} 
                                    alt="Attention Heatmap" 
                                    className="w-full h-auto max-h-[55vh] object-contain"
                                />
                            </div>
                            
                            {/* Floating Legend */}
                            <div className="mt-8 flex flex-wrap justify-center gap-4 sm:gap-8 text-sm sm:text-base font-bold text-slate-600 dark:text-slate-300 bg-white/80 dark:bg-slate-800/80 py-4 px-8 rounded-full border border-slate-200 dark:border-slate-700 shadow-lg backdrop-blur-xl cursor-default">
                                <div className="flex items-center gap-3">
                                    <span className="w-4 h-4 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.6)] animate-pulse"></span> {t.legendHigh}
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="w-4 h-4 rounded-full bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.4)]"></span> {t.legendMed}
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="w-4 h-4 rounded-full bg-blue-400/40 border border-blue-400/50"></span> {t.legendLow}
                                </div>
                            </div>
                        </div>

                        {/* Explanation Removed as requested */}

                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center text-slate-400 opacity-50 mt-20">
                        <Layers size={64} />
                        <span className="mt-6 text-xl">{t.emptyStateDesc}</span>
                    </div>
                )}
            </div>
        )}

      </div>
    </div>
  );
};
