
export interface AnalysisState {
  isLoading: boolean;
  result: string | null;
  heatmapResult: string | null; // Base64 image string for the heatmap
  error: string | null;
}

export interface ImageFile {
  file: File;
  previewUrl: string;
  base64: string;
  mimeType: string;
}

export interface SentimentItem {
  word: string;
  weight: number; // 1-10
  type: 'positive' | 'negative' | 'neutral';
}

// Icon props shared interface
export interface IconProps {
  className?: string;
  size?: number;
}

export type Language = 'tr' | 'en';
export type Theme = 'light' | 'dark';

export interface Translations {
  title: string;
  subtitle: string;
  sourceTitle: string;
  uploadTitle: string;
  uploadDesc: string;
  uploadFormats: string;
  changeImage: string;
  analyzeBtn: string;
  analyzingBtn: string;
  errorTitle: string;
  criteriaTitle: string;
  criteriaSalience: string;
  criteriaLoad: string;
  criteriaFlow: string;
  criteriaTypography: string;
  criteriaContrast: string;
  criteriaObjects: string;
  resultsTitle: string;
  reportTab: string;
  heatmapTab: string;
  metricsTab: string;
  sentimentTab: string;
  emptyStateTitle: string;
  emptyStateDesc: string;
  legendTitle: string;
  legendHigh: string;
  legendMed: string;
  legendLow: string;
  poweredBy: string;
  badgeLow: string;
  badgeMed: string;
  badgeHigh: string;
  legendSalience: string;
  legendFlow: string;
  legendDead: string;
  heatmapAnalysisTitle: string;
  heatmapInsightDesc: string;
  // Chart Labels
  labelSalience: string;
  labelClarity: string;
  labelFlow: string;
  labelEmotion: string;
  labelSimplicity: string;
  visualMetricsTitle: string;
  // Metric Descriptions
  descSalience: string;
  descClarity: string;
  descFlow: string;
  descEmotion: string;
  descSimplicity: string;
  // Sentiment
  sentimentTitle: string;
  sentimentDesc: string;
  sentimentPos: string;
  sentimentNeg: string;
  sentimentNeu: string;
  // Missing Card Titles
  titleLoad: string;
  titleTypography: string;
  titleContrast: string;
  titleObjects: string;
}
