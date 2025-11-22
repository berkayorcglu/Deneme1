import React, { useRef } from 'react';
import { Upload, X } from 'lucide-react';
import { ImageFile, Translations } from '../types';

interface FileUploadProps {
  onImageSelect: (image: ImageFile | null) => void;
  selectedImage: ImageFile | null;
  disabled: boolean;
  t: Translations;
  isLoading?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onImageSelect, selectedImage, disabled, t, isLoading }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    // Basic validation
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (JPEG, PNG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      // Extract base64 data without the prefix (e.g. "data:image/jpeg;base64,")
      const base64Data = result.split(',')[1];
      
      onImageSelect({
        file,
        previewUrl: result,
        base64: base64Data,
        mimeType: file.type
      });
    };
    reader.readAsDataURL(file);
  };

  const clearImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    onImageSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerUpload = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="w-full">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/png, image/jpeg, image/webp"
        disabled={disabled}
      />

      {selectedImage ? (
        <div className="relative group rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 shadow-sm transition-all hover:shadow-md scanner-container">
           <img 
            src={selectedImage.previewUrl} 
            alt="Analysis target" 
            className="w-full h-auto max-h-[500px] object-contain mx-auto"
          />
          
          {/* Scanner Overlay Animation */}
          {isLoading && (
            <div className="absolute inset-0 z-20 pointer-events-none">
              <div className="scanner-line"></div>
              <div className="scanner-overlay"></div>
            </div>
          )}

          <div className="absolute top-3 right-3 z-30">
             <button
              onClick={clearImage}
              disabled={disabled}
              className="p-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur text-slate-600 dark:text-slate-300 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 transition-colors shadow-sm border border-slate-200 dark:border-slate-600"
            >
              <X size={20} />
            </button>
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur px-4 py-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 z-30">
            <span className="truncate max-w-[200px] font-medium">{selectedImage.file.name}</span>
            <button 
              onClick={triggerUpload} 
              disabled={disabled}
              className="text-neuro-600 dark:text-neuro-400 hover:text-neuro-800 dark:hover:text-neuro-300 font-semibold"
            >
              {t.changeImage}
            </button>
          </div>
        </div>
      ) : (
        <div 
          onClick={triggerUpload}
          className={`
            border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300
            ${disabled 
              ? 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-60 cursor-not-allowed' 
              : 'bg-white dark:bg-slate-900/50 border-slate-300 dark:border-slate-700 hover:border-neuro-400 dark:hover:border-neuro-500 hover:bg-neuro-50/50 dark:hover:bg-neuro-900/20'
            }
          `}
        >
          <div className="h-16 w-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-5 text-slate-400 dark:text-slate-500 group-hover:text-neuro-500 dark:group-hover:text-neuro-400 transition-colors">
            <Upload size={32} strokeWidth={1.5} />
          </div>
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-2">{t.uploadTitle}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto mb-6 leading-relaxed">
            {t.uploadDesc}
          </p>
          <div className="flex gap-3 text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            <span>JPG</span>
            <span className="opacity-50">•</span>
            <span>PNG</span>
            <span className="opacity-50">•</span>
            <span>WEBP</span>
          </div>
        </div>
      )}
    </div>
  );
};