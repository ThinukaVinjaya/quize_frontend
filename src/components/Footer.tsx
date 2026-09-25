import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950/90 border-t border-slate-900 text-slate-400 py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-1.5">
        <p className="text-xs font-semibold text-slate-300">
          © {new Date().getFullYear()} Sri Lanka National Online Examination Portal
        </p>
        <p className="text-[11px] text-slate-400">
          Equipped with Sinhala Unicode rendering, LaTeX mathematical expressions, and real-time national ranking metrics.
        </p>
      </div>
    </footer>
  );
};
