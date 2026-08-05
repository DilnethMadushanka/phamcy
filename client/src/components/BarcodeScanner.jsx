import React from 'react';
import { useZxing } from 'react-zxing';
import { X } from 'lucide-react';

const BarcodeScanner = ({ onResult, onClose }) => {
  const { ref } = useZxing({
    onDecodeResult(result) {
      onResult(result.getText());
    },
    onError(error) {
      // Handle or ignore errors, zxing throws frequently when no barcode is in frame
    }
  });

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center animate-in fade-in duration-300">
      <div className="absolute top-4 right-4 z-10">
        <button 
          onClick={onClose}
          className="bg-white/20 hover:bg-white/30 text-white rounded-full p-2 backdrop-blur-sm transition-all"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
      
      <div className="relative w-full max-w-sm aspect-[4/3] bg-black rounded-2xl overflow-hidden shadow-2xl border-2 border-slate-800">
        <video ref={ref} className="w-full h-full object-cover" />
        
        {/* Scanning reticle overlay */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="w-3/4 h-1/2 border-2 border-pharmacy-400 rounded-lg shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] relative">
            <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-pharmacy-500 rounded-tl"></div>
            <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-pharmacy-500 rounded-tr"></div>
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-pharmacy-500 rounded-bl"></div>
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-pharmacy-500 rounded-br"></div>
            {/* Animated laser line */}
            <div className="absolute top-0 left-0 w-full h-0.5 bg-pharmacy-400/80 animate-[scan_2s_ease-in-out_infinite] shadow-[0_0_8px_2px_rgba(56,189,248,0.5)]"></div>
          </div>
        </div>
      </div>
      
      <div className="mt-8 text-center text-white space-y-2">
        <h3 className="font-semibold text-lg">Scan Medicine Barcode</h3>
        <p className="text-sm text-slate-400">Position the barcode inside the frame</p>
      </div>

      <style>{`
        @keyframes scan {
          0% { top: 0; }
          50% { top: 100%; }
          100% { top: 0; }
        }
      `}</style>
    </div>
  );
};

export default BarcodeScanner;
