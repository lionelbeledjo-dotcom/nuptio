import React, { useState, useMemo } from 'react';

// ─── EVENT TYPES ─────────────────────────────────────────────────────────────

export const EVENT_TYPES = [
  { id: 'wedding', label: 'Mariage', icon: 'Heart' },
  { id: 'anniversary', label: 'Anniversaire', icon: 'Cake' },
  { id: 'baptism', label: 'Baptême', icon: 'Baby' },
  { id: 'engagement', label: 'Fiançailles', icon: 'Ring' },
  { id: 'other', label: 'Autre cérémonie', icon: 'Star' },
] as const;

// ─── TYPES ───────────────────────────────────────────────────────────────────

export interface TemplatePreviewProps {
  name1: string;
  name2?: string;
  date: string;
  venue?: string;
  message?: string;
  eventType: string;
  photos?: string[];
}

export interface Template {
  id: string;
  name: string;
  category: string;
  eventTypes: string[];
  gradient: string;
  textColor: string;
  accentColor: string;
  font: string;
  preview: React.FC<TemplatePreviewProps>;
}

// ─── SHIMMER KEYFRAMES (injected once) ───────────────────────────────────────

const shimmerStyle = `
@keyframes nuptio-shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
@keyframes nuptio-float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-4px); }
}
@keyframes nuptio-pulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}
@keyframes nuptio-confetti {
  0% { transform: translateY(0) rotate(0deg); opacity: 1; }
  100% { transform: translateY(20px) rotate(360deg); opacity: 0.3; }
}
`;

function ShimmerStyles() {
  return <style dangerouslySetInnerHTML={{ __html: shimmerStyle }} />;
}

// ─── HELPER: format date ─────────────────────────────────────────────────────

function formatDate(date: string): string {
  if (!date) return '';
  try {
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return date;
  }
}

// ─── TEMPLATE 1: Classique Royal ─────────────────────────────────────────────

const ClassiqueRoyalPreview: React.FC<TemplatePreviewProps> = ({
  name1,
  name2,
  date,
  venue,
}) => (
  <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-gradient-to-b from-white via-amber-50 to-white border-2 border-amber-200 group">
    {/* Gold corner ornaments */}
    <div className="absolute top-3 left-3 w-10 h-10 border-t-2 border-l-2 border-amber-400 rounded-tl-sm" />
    <div className="absolute top-3 right-3 w-10 h-10 border-t-2 border-r-2 border-amber-400 rounded-tr-sm" />
    <div className="absolute bottom-3 left-3 w-10 h-10 border-b-2 border-l-2 border-amber-400 rounded-bl-sm" />
    <div className="absolute bottom-3 right-3 w-10 h-10 border-b-2 border-r-2 border-amber-400 rounded-br-sm" />
    {/* Crown motif */}
    <div className="absolute top-6 left-1/2 -translate-x-1/2 text-amber-400 text-2xl">♛</div>
    {/* Shimmer overlay */}
    <div
      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
      style={{
        background: 'linear-gradient(90deg, transparent, rgba(255,215,0,0.1), transparent)',
        backgroundSize: '200% 100%',
        animation: 'nuptio-shimmer 2s infinite',
      }}
    />
    {/* Content */}
    <div className="relative flex flex-col items-center justify-center h-full px-6 text-center">
      <p className="text-xs text-amber-600 uppercase tracking-[0.3em] mb-3">Nous vous invitons</p>
      <h2 className="text-xl font-serif text-gray-800 leading-tight">{name1}</h2>
      {name2 && (
        <>
          <span className="text-amber-500 text-lg my-1">&amp;</span>
          <h2 className="text-xl font-serif text-gray-800 leading-tight">{name2}</h2>
        </>
      )}
      <div className="w-16 h-px bg-amber-300 my-4" />
      <p className="text-sm text-gray-600">{formatDate(date)}</p>
      {venue && <p className="text-xs text-gray-500 mt-2">{venue}</p>}
    </div>
    <p className="absolute bottom-2 left-0 right-0 text-center text-[10px] text-amber-400">Classique Royal</p>
  </div>
);

// ─── TEMPLATE 2: Bohème Terre ────────────────────────────────────────────────

const BohemeTerrePreview: React.FC<TemplatePreviewProps> = ({
  name1,
  name2,
  date,
  venue,
}) => (
  <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-gradient-to-br from-amber-100 via-orange-50 to-rose-100 group">
    {/* Watercolor blobs */}
    <div className="absolute top-4 right-4 w-20 h-20 bg-amber-200/40 rounded-full blur-xl" />
    <div className="absolute bottom-8 left-4 w-16 h-16 bg-rose-200/40 rounded-full blur-xl" />
    <div className="absolute top-1/3 left-8 w-12 h-12 bg-orange-200/30 rounded-full blur-lg" />
    {/* Shimmer */}
    <div
      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
      style={{
        background: 'linear-gradient(90deg, transparent, rgba(210,150,100,0.15), transparent)',
        backgroundSize: '200% 100%',
        animation: 'nuptio-shimmer 2s infinite',
      }}
    />
    {/* Dried flower accents */}
    <div className="absolute top-6 left-1/2 -translate-x-1/2 flex gap-1">
      <div className="w-1 h-6 bg-amber-300/60 rounded-full rotate-[-15deg]" />
      <div className="w-1 h-8 bg-rose-300/60 rounded-full" />
      <div className="w-1 h-6 bg-amber-300/60 rounded-full rotate-[15deg]" />
    </div>
    {/* Content */}
    <div className="relative flex flex-col items-center justify-center h-full px-6 text-center">
      <p className="text-xs text-amber-700/70 tracking-widest mb-4">avec amour</p>
      <h2 className="text-xl text-amber-900 italic leading-tight">{name1}</h2>
      {name2 && (
        <>
          <span className="text-rose-400 text-sm my-1">et</span>
          <h2 className="text-xl text-amber-900 italic leading-tight">{name2}</h2>
        </>
      )}
      <div className="flex items-center gap-2 my-4">
        <div className="w-8 h-px bg-amber-400/60" />
        <div className="w-2 h-2 rounded-full bg-amber-400/60" />
        <div className="w-8 h-px bg-amber-400/60" />
      </div>
      <p className="text-sm text-amber-800/80">{formatDate(date)}</p>
      {venue && <p className="text-xs text-amber-700/60 mt-2">{venue}</p>}
    </div>
    <p className="absolute bottom-2 left-0 right-0 text-center text-[10px] text-amber-600/60">Bohème Terre</p>
  </div>
);

// ─── TEMPLATE 3: Minimaliste Noir ────────────────────────────────────────────

const MinimalisteNoirPreview: React.FC<TemplatePreviewProps> = ({
  name1,
  name2,
  date,
  venue,
}) => (
  <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-black group">
    {/* Subtle grid pattern */}
    <div
      className="absolute inset-0 opacity-10"
      style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
        backgroundSize: '20px 20px',
      }}
    />
    {/* Shimmer */}
    <div
      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
      style={{
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)',
        backgroundSize: '200% 100%',
        animation: 'nuptio-shimmer 2s infinite',
      }}
    />
    {/* Content */}
    <div className="relative flex flex-col items-center justify-center h-full px-6 text-center">
      <div className="w-8 h-px bg-white/40 mb-6" />
      <h2 className="text-xl font-light text-white tracking-wide uppercase">{name1}</h2>
      {name2 && (
        <>
          <span className="text-white/40 text-xs my-2 tracking-[0.5em]">ET</span>
          <h2 className="text-xl font-light text-white tracking-wide uppercase">{name2}</h2>
        </>
      )}
      <div className="w-8 h-px bg-white/40 my-6" />
      <p className="text-sm text-white/70 font-light tracking-wider">{formatDate(date)}</p>
      {venue && <p className="text-xs text-white/40 mt-3 tracking-wide">{venue}</p>}
    </div>
    <p className="absolute bottom-2 left-0 right-0 text-center text-[10px] text-white/30">Minimaliste Noir</p>
  </div>
);

// ─── TEMPLATE 4: Floral Rose ─────────────────────────────────────────────────

const FloralRosePreview: React.FC<TemplatePreviewProps> = ({
  name1,
  name2,
  date,
  venue,
}) => (
  <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-gradient-to-b from-pink-50 via-white to-rose-50 border border-pink-200 group">
    {/* Rose decorations - top */}
    <div className="absolute top-2 left-2 w-8 h-8 rounded-full bg-pink-200/50" />
    <div className="absolute top-4 left-6 w-5 h-5 rounded-full bg-rose-300/40" />
    <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-pink-200/50" />
    <div className="absolute top-4 right-6 w-5 h-5 rounded-full bg-rose-300/40" />
    {/* Rose decorations - bottom */}
    <div className="absolute bottom-6 left-4 w-6 h-6 rounded-full bg-pink-200/50" />
    <div className="absolute bottom-8 left-8 w-4 h-4 rounded-full bg-rose-300/40" />
    <div className="absolute bottom-6 right-4 w-6 h-6 rounded-full bg-pink-200/50" />
    <div className="absolute bottom-8 right-8 w-4 h-4 rounded-full bg-rose-300/40" />
    {/* Leaf accents */}
    <div className="absolute top-8 left-1 w-3 h-6 bg-green-200/40 rounded-full rotate-45" />
    <div className="absolute top-8 right-1 w-3 h-6 bg-green-200/40 rounded-full -rotate-45" />
    {/* Border frame */}
    <div className="absolute inset-4 border border-pink-200/60 rounded-lg" />
    {/* Shimmer */}
    <div
      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
      style={{
        background: 'linear-gradient(90deg, transparent, rgba(255,182,193,0.15), transparent)',
        backgroundSize: '200% 100%',
        animation: 'nuptio-shimmer 2s infinite',
      }}
    />
    {/* Content */}
    <div className="relative flex flex-col items-center justify-center h-full px-8 text-center">
      <p className="text-[10px] text-rose-400 uppercase tracking-[0.2em] mb-3">Invitation</p>
      <h2 className="text-lg font-serif text-rose-700 leading-tight">{name1}</h2>
      {name2 && (
        <>
          <span className="text-pink-400 text-lg my-0.5">♥</span>
          <h2 className="text-lg font-serif text-rose-700 leading-tight">{name2}</h2>
        </>
      )}
      <div className="flex items-center gap-2 my-3">
        <div className="w-6 h-px bg-pink-300" />
        <div className="w-1.5 h-1.5 rounded-full bg-pink-300" />
        <div className="w-6 h-px bg-pink-300" />
      </div>
      <p className="text-sm text-rose-600/80">{formatDate(date)}</p>
      {venue && <p className="text-xs text-rose-500/60 mt-2">{venue}</p>}
    </div>
    <p className="absolute bottom-2 left-0 right-0 text-center text-[10px] text-pink-300">Floral Rose</p>
  </div>
);

// ─── TEMPLATE 5: Oriental Gold ───────────────────────────────────────────────

const OrientalGoldPreview: React.FC<TemplatePreviewProps> = ({
  name1,
  name2,
  date,
  venue,
}) => (
  <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-gradient-to-b from-amber-950 via-red-950 to-amber-950 group">
    {/* Islamic geometric pattern overlay */}
    <div
      className="absolute inset-0 opacity-20"
      style={{
        backgroundImage: `repeating-conic-gradient(rgba(212,175,55,0.3) 0% 25%, transparent 0% 50%)`,
        backgroundSize: '24px 24px',
      }}
    />
    {/* Gold arch frame */}
    <div className="absolute top-6 left-1/2 -translate-x-1/2 w-3/4 h-3/4 border-2 border-amber-400/40 rounded-t-full" />
    {/* Gold corner pieces */}
    <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-amber-400/60" />
    <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-amber-400/60" />
    <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-amber-400/60" />
    <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-amber-400/60" />
    {/* Star ornament */}
    <div className="absolute top-8 left-1/2 -translate-x-1/2 text-amber-400/80 text-xl">✦</div>
    {/* Shimmer */}
    <div
      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
      style={{
        background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.15), transparent)',
        backgroundSize: '200% 100%',
        animation: 'nuptio-shimmer 2s infinite',
      }}
    />
    {/* Content */}
    <div className="relative flex flex-col items-center justify-center h-full px-6 text-center">
      <p className="text-[10px] text-amber-300/70 uppercase tracking-[0.3em] mb-3">بسم الله</p>
      <h2 className="text-lg text-amber-100 font-serif leading-tight">{name1}</h2>
      {name2 && (
        <>
          <span className="text-amber-400 text-sm my-1">&</span>
          <h2 className="text-lg text-amber-100 font-serif leading-tight">{name2}</h2>
        </>
      )}
      <div className="w-12 h-px bg-amber-400/50 my-4" />
      <p className="text-sm text-amber-200/80">{formatDate(date)}</p>
      {venue && <p className="text-xs text-amber-300/50 mt-2">{venue}</p>}
    </div>
    <p className="absolute bottom-2 left-0 right-0 text-center text-[10px] text-amber-400/40">Oriental Gold</p>
  </div>
);

// ─── TEMPLATE 6: Africain Wax ────────────────────────────────────────────────

const AfricainWaxPreview: React.FC<TemplatePreviewProps> = ({
  name1,
  name2,
  date,
  venue,
}) => (
  <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-gradient-to-br from-amber-500 via-orange-500 to-red-600 group">
    {/* Wax print geometric patterns */}
    <div
      className="absolute inset-0 opacity-30"
      style={{
        backgroundImage: `
          radial-gradient(circle at 20% 20%, rgba(255,255,255,0.3) 2px, transparent 2px),
          radial-gradient(circle at 80% 80%, rgba(255,255,255,0.3) 2px, transparent 2px),
          radial-gradient(circle at 50% 50%, rgba(0,100,0,0.3) 8px, transparent 8px)
        `,
        backgroundSize: '30px 30px, 30px 30px, 60px 60px',
      }}
    />
    {/* Bold geometric frame */}
    <div className="absolute inset-3 border-4 border-yellow-300/60 rounded-lg" />
    <div className="absolute inset-5 border-2 border-green-800/40 rounded-lg" />
    {/* Diamond shapes */}
    <div className="absolute top-3 left-1/2 -translate-x-1/2 w-4 h-4 bg-yellow-300/70 rotate-45" />
    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-4 h-4 bg-yellow-300/70 rotate-45" />
    {/* Shimmer */}
    <div
      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
      style={{
        background: 'linear-gradient(90deg, transparent, rgba(255,215,0,0.2), transparent)',
        backgroundSize: '200% 100%',
        animation: 'nuptio-shimmer 2s infinite',
      }}
    />
    {/* Content */}
    <div className="relative flex flex-col items-center justify-center h-full px-8 text-center">
      <p className="text-[10px] text-yellow-100 uppercase tracking-[0.3em] mb-3 font-bold">Célébration</p>
      <h2 className="text-xl font-bold text-white leading-tight drop-shadow-md">{name1}</h2>
      {name2 && (
        <>
          <span className="text-yellow-200 text-sm font-bold my-1">&</span>
          <h2 className="text-xl font-bold text-white leading-tight drop-shadow-md">{name2}</h2>
        </>
      )}
      <div className="flex items-center gap-1 my-3">
        <div className="w-2 h-2 bg-yellow-300 rotate-45" />
        <div className="w-6 h-0.5 bg-yellow-300" />
        <div className="w-2 h-2 bg-yellow-300 rotate-45" />
        <div className="w-6 h-0.5 bg-yellow-300" />
        <div className="w-2 h-2 bg-yellow-300 rotate-45" />
      </div>
      <p className="text-sm text-yellow-100 font-medium">{formatDate(date)}</p>
      {venue && <p className="text-xs text-white/70 mt-2">{venue}</p>}
    </div>
    <p className="absolute bottom-2 left-0 right-0 text-center text-[10px] text-yellow-200/60">Africain Wax</p>
  </div>
);

// ─── TEMPLATE 7: Champêtre Lavande ──────────────────────────────────────────

const ChampetreLavandePreview: React.FC<TemplatePreviewProps> = ({
  name1,
  name2,
  date,
  venue,
}) => (
  <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-gradient-to-b from-purple-50 via-white to-green-50 border border-purple-100 group">
    {/* Lavender stems */}
    <div className="absolute top-4 left-6 flex flex-col items-center gap-0.5">
      <div className="w-1.5 h-1.5 rounded-full bg-purple-300" />
      <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
      <div className="w-1.5 h-1.5 rounded-full bg-purple-300" />
      <div className="w-0.5 h-6 bg-green-400/60" />
    </div>
    <div className="absolute top-4 right-6 flex flex-col items-center gap-0.5">
      <div className="w-1.5 h-1.5 rounded-full bg-purple-300" />
      <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
      <div className="w-1.5 h-1.5 rounded-full bg-purple-300" />
      <div className="w-0.5 h-6 bg-green-400/60" />
    </div>
    {/* Wildflowers bottom */}
    <div className="absolute bottom-6 left-4 flex gap-2">
      <div className="w-2 h-2 rounded-full bg-purple-200" />
      <div className="w-2 h-2 rounded-full bg-green-200" />
      <div className="w-2 h-2 rounded-full bg-purple-300" />
    </div>
    <div className="absolute bottom-6 right-4 flex gap-2">
      <div className="w-2 h-2 rounded-full bg-green-200" />
      <div className="w-2 h-2 rounded-full bg-purple-200" />
      <div className="w-2 h-2 rounded-full bg-purple-300" />
    </div>
    {/* Shimmer */}
    <div
      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
      style={{
        background: 'linear-gradient(90deg, transparent, rgba(168,130,200,0.1), transparent)',
        backgroundSize: '200% 100%',
        animation: 'nuptio-shimmer 2s infinite',
      }}
    />
    {/* Content */}
    <div className="relative flex flex-col items-center justify-center h-full px-6 text-center">
      <p className="text-[10px] text-purple-400 tracking-[0.2em] mb-3">vous êtes conviés</p>
      <h2 className="text-lg text-purple-800 italic leading-tight">{name1}</h2>
      {name2 && (
        <>
          <span className="text-green-500 text-xs my-1">~</span>
          <h2 className="text-lg text-purple-800 italic leading-tight">{name2}</h2>
        </>
      )}
      <div className="flex items-center gap-2 my-3">
        <div className="w-1 h-1 rounded-full bg-purple-300" />
        <div className="w-8 h-px bg-purple-200" />
        <div className="w-1 h-1 rounded-full bg-purple-300" />
      </div>
      <p className="text-sm text-purple-600/80">{formatDate(date)}</p>
      {venue && <p className="text-xs text-green-600/70 mt-2">{venue}</p>}
    </div>
    <p className="absolute bottom-2 left-0 right-0 text-center text-[10px] text-purple-300">Champêtre Lavande</p>
  </div>
);

// ─── TEMPLATE 8: Luxe Velvet ─────────────────────────────────────────────────

const LuxeVelvetPreview: React.FC<TemplatePreviewProps> = ({
  name1,
  name2,
  date,
  venue,
}) => (
  <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-gradient-to-b from-purple-950 via-violet-950 to-purple-950 group">
    {/* Velvet texture overlay */}
    <div
      className="absolute inset-0 opacity-20"
      style={{
        backgroundImage: 'radial-gradient(ellipse at 50% 0%, rgba(168,85,247,0.2), transparent 70%)',
      }}
    />
    {/* Gold foil accents */}
    <div className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
    <div className="absolute top-6 left-1/2 -translate-x-1/2 w-12 h-px bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />
    {/* Gold frame */}
    <div className="absolute inset-4 border border-amber-400/30 rounded-lg" />
    {/* Diamond ornament top */}
    <div className="absolute top-10 left-1/2 -translate-x-1/2 w-3 h-3 border border-amber-400/60 rotate-45" />
    {/* Shimmer */}
    <div
      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
      style={{
        background: 'linear-gradient(90deg, transparent, rgba(168,85,247,0.15), transparent)',
        backgroundSize: '200% 100%',
        animation: 'nuptio-shimmer 2s infinite',
      }}
    />
    {/* Content */}
    <div className="relative flex flex-col items-center justify-center h-full px-6 text-center">
      <p className="text-[10px] text-amber-300/70 uppercase tracking-[0.4em] mb-4">L&apos;honneur de votre présence</p>
      <h2 className="text-xl text-white font-light tracking-wide leading-tight">{name1}</h2>
      {name2 && (
        <>
          <span className="text-amber-400 text-lg my-1">✦</span>
          <h2 className="text-xl text-white font-light tracking-wide leading-tight">{name2}</h2>
        </>
      )}
      <div className="w-16 h-px bg-gradient-to-r from-transparent via-amber-400/60 to-transparent my-4" />
      <p className="text-sm text-purple-200/80">{formatDate(date)}</p>
      {venue && <p className="text-xs text-purple-300/50 mt-2">{venue}</p>}
    </div>
    <p className="absolute bottom-2 left-0 right-0 text-center text-[10px] text-purple-400/40">Luxe Velvet</p>
  </div>
);

// ─── TEMPLATE 9: Romantique Blush ───────────────────────────────────────────

const RomantiqueBlushPreview: React.FC<TemplatePreviewProps> = ({
  name1,
  name2,
  date,
  venue,
}) => (
  <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-gradient-to-br from-rose-100 via-pink-50 to-rose-100 group">
    {/* Watercolor wash effects */}
    <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-rose-200/30 to-transparent" />
    <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-pink-200/30 to-transparent" />
    <div className="absolute top-1/4 right-0 w-1/2 h-1/2 bg-rose-200/20 rounded-full blur-2xl" />
    {/* Delicate heart */}
    <div className="absolute top-8 left-1/2 -translate-x-1/2 text-rose-300/60 text-2xl">♡</div>
    {/* Soft border */}
    <div className="absolute inset-6 border border-rose-200/50 rounded-2xl" />
    {/* Shimmer */}
    <div
      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
      style={{
        background: 'linear-gradient(90deg, transparent, rgba(255,192,203,0.2), transparent)',
        backgroundSize: '200% 100%',
        animation: 'nuptio-shimmer 2s infinite',
      }}
    />
    {/* Content */}
    <div className="relative flex flex-col items-center justify-center h-full px-6 text-center">
      <h2 className="text-xl text-rose-700 italic leading-tight">{name1}</h2>
      {name2 && (
        <>
          <p className="text-rose-400 text-sm italic my-2">et</p>
          <h2 className="text-xl text-rose-700 italic leading-tight">{name2}</h2>
        </>
      )}
      <div className="flex items-center gap-3 my-4">
        <div className="w-10 h-px bg-rose-300/60" />
        <div className="w-2 h-2 rounded-full border border-rose-300" />
        <div className="w-10 h-px bg-rose-300/60" />
      </div>
      <p className="text-sm text-rose-600/70">{formatDate(date)}</p>
      {venue && <p className="text-xs text-rose-500/50 mt-2 italic">{venue}</p>}
    </div>
    <p className="absolute bottom-2 left-0 right-0 text-center text-[10px] text-rose-300">Romantique Blush</p>
  </div>
);

// ─── TEMPLATE 10: Moderne Géo ────────────────────────────────────────────────

const ModerneGeoPreview: React.FC<TemplatePreviewProps> = ({
  name1,
  name2,
  date,
  venue,
}) => (
  <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-white group">
    {/* Geometric color blocks */}
    <div className="absolute top-0 left-0 w-1/3 h-full bg-indigo-600" />
    <div className="absolute top-0 right-0 w-8 h-1/2 bg-amber-400" />
    <div className="absolute bottom-0 right-0 w-1/4 h-8 bg-rose-500" />
    {/* Geometric shapes */}
    <div className="absolute top-8 right-12 w-8 h-8 border-2 border-indigo-300 rotate-45" />
    <div className="absolute bottom-16 left-1/3 w-6 h-6 bg-amber-400/30 rounded-full" />
    {/* Diagonal line */}
    <div className="absolute top-0 left-1/3 w-px h-full bg-gray-200 origin-top rotate-3" />
    {/* Shimmer */}
    <div
      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
      style={{
        background: 'linear-gradient(90deg, transparent, rgba(79,70,229,0.08), transparent)',
        backgroundSize: '200% 100%',
        animation: 'nuptio-shimmer 2s infinite',
      }}
    />
    {/* Content */}
    <div className="relative flex flex-col items-start justify-center h-full pl-[38%] pr-4 text-left">
      <p className="text-[9px] text-indigo-400 uppercase tracking-[0.3em] mb-3 font-medium">Save the date</p>
      <h2 className="text-lg font-bold text-gray-900 leading-tight">{name1}</h2>
      {name2 && (
        <>
          <div className="w-6 h-0.5 bg-amber-400 my-2" />
          <h2 className="text-lg font-bold text-gray-900 leading-tight">{name2}</h2>
        </>
      )}
      <div className="w-10 h-0.5 bg-indigo-600 my-4" />
      <p className="text-sm text-gray-600 font-medium">{formatDate(date)}</p>
      {venue && <p className="text-xs text-gray-400 mt-2">{venue}</p>}
    </div>
    <p className="absolute bottom-2 left-0 right-0 text-center text-[10px] text-gray-300">Moderne Géo</p>
  </div>
);

// ─── TEMPLATE 11: Vintage Sépia ─────────────────────────────────────────────

const VintageSepiaPreview: React.FC<TemplatePreviewProps> = ({
  name1,
  name2,
  date,
  venue,
}) => (
  <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-gradient-to-b from-amber-50 via-yellow-50 to-amber-100 group">
    {/* Art deco border */}
    <div className="absolute inset-3 border-2 border-amber-700/30 rounded-sm" />
    <div className="absolute inset-5 border border-amber-700/20 rounded-sm" />
    {/* Art deco corners */}
    <div className="absolute top-3 left-3 w-6 h-6">
      <div className="absolute top-0 left-0 w-full h-0.5 bg-amber-700/40" />
      <div className="absolute top-0 left-0 w-0.5 h-full bg-amber-700/40" />
      <div className="absolute top-1 left-1 w-2 h-2 border-t border-l border-amber-700/30" />
    </div>
    <div className="absolute top-3 right-3 w-6 h-6">
      <div className="absolute top-0 right-0 w-full h-0.5 bg-amber-700/40" />
      <div className="absolute top-0 right-0 w-0.5 h-full bg-amber-700/40" />
      <div className="absolute top-1 right-1 w-2 h-2 border-t border-r border-amber-700/30" />
    </div>
    {/* Fan deco motif */}
    <div className="absolute top-8 left-1/2 -translate-x-1/2">
      <div className="w-10 h-5 border-t-2 border-l-2 border-r-2 border-amber-600/40 rounded-t-full" />
    </div>
    {/* Sepia overlay */}
    <div className="absolute inset-0 bg-amber-900/5" />
    {/* Shimmer */}
    <div
      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
      style={{
        background: 'linear-gradient(90deg, transparent, rgba(180,140,60,0.1), transparent)',
        backgroundSize: '200% 100%',
        animation: 'nuptio-shimmer 2s infinite',
      }}
    />
    {/* Content */}
    <div className="relative flex flex-col items-center justify-center h-full px-8 text-center">
      <p className="text-[10px] text-amber-700/60 uppercase tracking-[0.3em] mb-3 font-medium">Invitation</p>
      <h2 className="text-lg font-serif text-amber-900 leading-tight">{name1}</h2>
      {name2 && (
        <>
          <span className="text-amber-600 text-sm my-1 font-serif italic">&amp;</span>
          <h2 className="text-lg font-serif text-amber-900 leading-tight">{name2}</h2>
        </>
      )}
      <div className="w-12 h-px bg-amber-600/40 my-4" />
      <p className="text-sm text-amber-800/70 font-serif">{formatDate(date)}</p>
      {venue && <p className="text-xs text-amber-700/50 mt-2 font-serif italic">{venue}</p>}
    </div>
    <p className="absolute bottom-2 left-0 right-0 text-center text-[10px] text-amber-600/40">Vintage Sépia</p>
  </div>
);

// ─── TEMPLATE 12: Tropical Paradise ─────────────────────────────────────────

const TropicalParadisePreview: React.FC<TemplatePreviewProps> = ({
  name1,
  name2,
  date,
  venue,
}) => (
  <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-gradient-to-b from-emerald-500 via-teal-400 to-cyan-400 group">
    {/* Palm leaf shapes */}
    <div className="absolute top-0 left-0 w-16 h-24 bg-green-700/30 rounded-br-full" />
    <div className="absolute top-0 right-0 w-12 h-20 bg-green-800/30 rounded-bl-full" />
    <div className="absolute bottom-0 left-0 w-20 h-16 bg-green-700/20 rounded-tr-full" />
    <div className="absolute bottom-0 right-0 w-14 h-12 bg-green-800/20 rounded-tl-full" />
    {/* Coral accents */}
    <div className="absolute top-12 right-8 w-4 h-4 rounded-full bg-coral-400 bg-orange-400/60" />
    <div className="absolute bottom-14 left-6 w-3 h-3 rounded-full bg-orange-400/60" />
    <div className="absolute top-20 left-10 w-2 h-2 rounded-full bg-pink-400/60" />
    {/* Shimmer */}
    <div
      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
      style={{
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
        backgroundSize: '200% 100%',
        animation: 'nuptio-shimmer 2s infinite',
      }}
    />
    {/* Content */}
    <div className="relative flex flex-col items-center justify-center h-full px-6 text-center">
      <p className="text-[10px] text-white/70 uppercase tracking-[0.3em] mb-3">Paradise awaits</p>
      <h2 className="text-xl font-bold text-white leading-tight drop-shadow-sm">{name1}</h2>
      {name2 && (
        <>
          <span className="text-yellow-200 text-sm my-1">&</span>
          <h2 className="text-xl font-bold text-white leading-tight drop-shadow-sm">{name2}</h2>
        </>
      )}
      <div className="flex items-center gap-2 my-3">
        <div className="w-2 h-2 rounded-full bg-orange-300/70" />
        <div className="w-8 h-px bg-white/50" />
        <div className="w-2 h-2 rounded-full bg-orange-300/70" />
      </div>
      <p className="text-sm text-white/90">{formatDate(date)}</p>
      {venue && <p className="text-xs text-white/60 mt-2">{venue}</p>}
    </div>
    <p className="absolute bottom-2 left-0 right-0 text-center text-[10px] text-white/40">Tropical Paradise</p>
  </div>
);

// ─── TEMPLATE 13: Anniversaire Festif ───────────────────────────────────────

const AnniversaireFestifPreview: React.FC<TemplatePreviewProps> = ({
  name1,
  date,
  venue,
  message,
}) => (
  <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 group">
    {/* Confetti dots */}
    <div className="absolute top-4 left-6 w-2 h-2 bg-yellow-300 rounded-full" style={{ animation: 'nuptio-confetti 3s infinite 0.2s' }} />
    <div className="absolute top-8 right-8 w-2 h-3 bg-cyan-300 rotate-45" style={{ animation: 'nuptio-confetti 3s infinite 0.5s' }} />
    <div className="absolute top-6 left-1/3 w-2 h-2 bg-green-300 rounded-sm rotate-12" style={{ animation: 'nuptio-confetti 3s infinite 0.8s' }} />
    <div className="absolute top-10 right-1/3 w-2 h-2 bg-orange-300 rounded-full" style={{ animation: 'nuptio-confetti 3s infinite 1.1s' }} />
    <div className="absolute top-3 left-1/2 w-1.5 h-3 bg-blue-300 rotate-[-20deg]" style={{ animation: 'nuptio-confetti 3s infinite 1.4s' }} />
    <div className="absolute top-12 left-8 w-2 h-2 bg-red-300 rotate-45" style={{ animation: 'nuptio-confetti 3s infinite 0.3s' }} />
    <div className="absolute top-5 right-12 w-1.5 h-1.5 bg-yellow-200 rounded-full" style={{ animation: 'nuptio-confetti 3s infinite 0.9s' }} />
    {/* Balloon strings */}
    <div className="absolute top-0 left-[20%] w-px h-12 bg-white/30" />
    <div className="absolute top-0 left-[45%] w-px h-8 bg-white/30" />
    <div className="absolute top-0 right-[25%] w-px h-14 bg-white/30" />
    {/* Shimmer */}
    <div
      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
      style={{
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
        backgroundSize: '200% 100%',
        animation: 'nuptio-shimmer 2s infinite',
      }}
    />
    {/* Content */}
    <div className="relative flex flex-col items-center justify-center h-full px-6 text-center">
      <p className="text-lg text-white/90 mb-1">🎉</p>
      <p className="text-[10px] text-white/80 uppercase tracking-[0.3em] mb-3 font-bold">Joyeux anniversaire</p>
      <h2 className="text-2xl font-bold text-white leading-tight drop-shadow-md">{name1}</h2>
      {message && <p className="text-xs text-white/70 mt-2 italic">{message}</p>}
      <div className="w-12 h-0.5 bg-white/40 my-4 rounded-full" />
      <p className="text-sm text-white/90 font-medium">{formatDate(date)}</p>
      {venue && <p className="text-xs text-white/60 mt-2">{venue}</p>}
    </div>
    <p className="absolute bottom-2 left-0 right-0 text-center text-[10px] text-white/40">Anniversaire Festif</p>
  </div>
);

// ─── TEMPLATE 14: Anniversaire Élégant ──────────────────────────────────────

const AnniversaireElegantPreview: React.FC<TemplatePreviewProps> = ({
  name1,
  date,
  venue,
  message,
}) => (
  <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 group">
    {/* Champagne gold accents */}
    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-300 to-transparent" />
    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-300 to-transparent" />
    {/* Gold sparkles */}
    <div className="absolute top-8 left-8 w-1 h-1 bg-amber-300 rounded-full" style={{ animation: 'nuptio-pulse 2s infinite 0.2s' }} />
    <div className="absolute top-12 right-10 w-1 h-1 bg-amber-300 rounded-full" style={{ animation: 'nuptio-pulse 2s infinite 0.7s' }} />
    <div className="absolute bottom-16 left-12 w-1 h-1 bg-amber-300 rounded-full" style={{ animation: 'nuptio-pulse 2s infinite 1.2s' }} />
    <div className="absolute top-20 left-1/2 w-1 h-1 bg-amber-300 rounded-full" style={{ animation: 'nuptio-pulse 2s infinite 0.5s' }} />
    {/* Elegant frame */}
    <div className="absolute inset-5 border border-amber-400/20 rounded-lg" />
    {/* Champagne glass motif */}
    <div className="absolute top-6 left-1/2 -translate-x-1/2 flex gap-0.5 text-amber-300/60 text-sm">✧ ✦ ✧</div>
    {/* Shimmer */}
    <div
      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
      style={{
        background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.1), transparent)',
        backgroundSize: '200% 100%',
        animation: 'nuptio-shimmer 2s infinite',
      }}
    />
    {/* Content */}
    <div className="relative flex flex-col items-center justify-center h-full px-6 text-center">
      <p className="text-[10px] text-amber-300/70 uppercase tracking-[0.4em] mb-4">Célébration</p>
      <h2 className="text-xl text-white font-light tracking-wider leading-tight">{name1}</h2>
      {message && <p className="text-xs text-amber-200/50 mt-2 italic">{message}</p>}
      <div className="w-16 h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent my-5" />
      <p className="text-sm text-amber-100/80">{formatDate(date)}</p>
      {venue && <p className="text-xs text-gray-400 mt-2">{venue}</p>}
    </div>
    <p className="absolute bottom-2 left-0 right-0 text-center text-[10px] text-amber-400/30">Anniversaire Élégant</p>
  </div>
);

// ─── TEMPLATE 15: Cérémonie Sacrée ──────────────────────────────────────────

const CeremonieSacreePreview: React.FC<TemplatePreviewProps> = ({
  name1,
  name2,
  date,
  venue,
}) => (
  <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-gradient-to-b from-stone-100 via-white to-stone-100 group">
    {/* Light rays effect */}
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full opacity-30">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-full bg-gradient-to-b from-amber-200 to-transparent" />
      <div className="absolute top-0 left-[40%] w-px h-3/4 bg-gradient-to-b from-amber-100 to-transparent rotate-6" />
      <div className="absolute top-0 right-[40%] w-px h-3/4 bg-gradient-to-b from-amber-100 to-transparent -rotate-6" />
    </div>
    {/* Subtle halo */}
    <div className="absolute top-6 left-1/2 -translate-x-1/2 w-16 h-16 bg-amber-100/50 rounded-full blur-xl" style={{ animation: 'nuptio-pulse 4s infinite' }} />
    {/* Dove/peace symbol */}
    <div className="absolute top-6 left-1/2 -translate-x-1/2 text-stone-400/60 text-xl">☽</div>
    {/* Subtle frame */}
    <div className="absolute inset-8 border border-stone-200/60 rounded-xl" />
    {/* Shimmer */}
    <div
      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
      style={{
        background: 'linear-gradient(90deg, transparent, rgba(200,180,100,0.1), transparent)',
        backgroundSize: '200% 100%',
        animation: 'nuptio-shimmer 2s infinite',
      }}
    />
    {/* Content */}
    <div className="relative flex flex-col items-center justify-center h-full px-6 text-center">
      <p className="text-[10px] text-stone-400 tracking-[0.3em] mb-4">CÉRÉMONIE</p>
      <h2 className="text-lg text-stone-700 font-light leading-tight">{name1}</h2>
      {name2 && (
        <>
          <span className="text-stone-400 text-xs my-2">•</span>
          <h2 className="text-lg text-stone-700 font-light leading-tight">{name2}</h2>
        </>
      )}
      <div className="flex items-center gap-3 my-4">
        <div className="w-8 h-px bg-stone-300" />
        <div className="w-1.5 h-1.5 rounded-full bg-stone-300" />
        <div className="w-8 h-px bg-stone-300" />
      </div>
      <p className="text-sm text-stone-500">{formatDate(date)}</p>
      {venue && <p className="text-xs text-stone-400 mt-2">{venue}</p>}
    </div>
    <p className="absolute bottom-2 left-0 right-0 text-center text-[10px] text-stone-300">Cérémonie Sacrée</p>
  </div>
);

// ─── TEMPLATES ARRAY ─────────────────────────────────────────────────────────

export const TEMPLATES: Template[] = [
  {
    id: 'classique_royal',
    name: 'Classique Royal',
    category: 'classique',
    eventTypes: ['wedding', 'engagement', 'other'],
    gradient: 'from-white via-amber-50 to-white',
    textColor: 'text-gray-800',
    accentColor: '#d4af37',
    font: 'serif',
    preview: ClassiqueRoyalPreview,
  },
  {
    id: 'boheme_terre',
    name: 'Bohème Terre',
    category: 'boheme',
    eventTypes: ['wedding', 'engagement', 'other'],
    gradient: 'from-amber-100 via-orange-50 to-rose-100',
    textColor: 'text-amber-900',
    accentColor: '#b8860b',
    font: 'italic',
    preview: BohemeTerrePreview,
  },
  {
    id: 'minimaliste_noir',
    name: 'Minimaliste Noir',
    category: 'minimaliste',
    eventTypes: ['wedding', 'engagement', 'anniversary', 'other'],
    gradient: 'from-black to-gray-900',
    textColor: 'text-white',
    accentColor: '#ffffff',
    font: 'sans-serif',
    preview: MinimalisteNoirPreview,
  },
  {
    id: 'floral_rose',
    name: 'Floral Rose',
    category: 'floral',
    eventTypes: ['wedding', 'engagement', 'baptism'],
    gradient: 'from-pink-50 via-white to-rose-50',
    textColor: 'text-rose-700',
    accentColor: '#e91e63',
    font: 'serif',
    preview: FloralRosePreview,
  },
  {
    id: 'oriental_gold',
    name: 'Oriental Gold',
    category: 'oriental',
    eventTypes: ['wedding', 'engagement', 'other'],
    gradient: 'from-amber-950 via-red-950 to-amber-950',
    textColor: 'text-amber-100',
    accentColor: '#d4af37',
    font: 'serif',
    preview: OrientalGoldPreview,
  },
  {
    id: 'africain_wax',
    name: 'Africain Wax',
    category: 'africain',
    eventTypes: ['wedding', 'engagement', 'baptism', 'anniversary', 'other'],
    gradient: 'from-amber-500 via-orange-500 to-red-600',
    textColor: 'text-white',
    accentColor: '#ffd700',
    font: 'bold',
    preview: AfricainWaxPreview,
  },
  {
    id: 'champetre_lavande',
    name: 'Champêtre Lavande',
    category: 'champetre',
    eventTypes: ['wedding', 'engagement', 'baptism', 'other'],
    gradient: 'from-purple-50 via-white to-green-50',
    textColor: 'text-purple-800',
    accentColor: '#9b59b6',
    font: 'italic',
    preview: ChampetreLavandePreview,
  },
  {
    id: 'luxe_velvet',
    name: 'Luxe Velvet',
    category: 'luxe',
    eventTypes: ['wedding', 'engagement', 'anniversary'],
    gradient: 'from-purple-950 via-violet-950 to-purple-950',
    textColor: 'text-white',
    accentColor: '#d4af37',
    font: 'light',
    preview: LuxeVelvetPreview,
  },
  {
    id: 'romantique_blush',
    name: 'Romantique Blush',
    category: 'romantique',
    eventTypes: ['wedding', 'engagement'],
    gradient: 'from-rose-100 via-pink-50 to-rose-100',
    textColor: 'text-rose-700',
    accentColor: '#ff6b9d',
    font: 'italic',
    preview: RomantiqueBlushPreview,
  },
  {
    id: 'moderne_geo',
    name: 'Moderne Géo',
    category: 'moderne',
    eventTypes: ['wedding', 'engagement', 'anniversary', 'other'],
    gradient: 'from-white to-gray-50',
    textColor: 'text-gray-900',
    accentColor: '#4f46e5',
    font: 'bold',
    preview: ModerneGeoPreview,
  },
  {
    id: 'vintage_sepia',
    name: 'Vintage Sépia',
    category: 'vintage',
    eventTypes: ['wedding', 'engagement', 'anniversary', 'other'],
    gradient: 'from-amber-50 via-yellow-50 to-amber-100',
    textColor: 'text-amber-900',
    accentColor: '#8b6914',
    font: 'serif',
    preview: VintageSepiaPreview,
  },
  {
    id: 'tropical_paradise',
    name: 'Tropical Paradise',
    category: 'tropical',
    eventTypes: ['wedding', 'engagement', 'anniversary', 'other'],
    gradient: 'from-emerald-500 via-teal-400 to-cyan-400',
    textColor: 'text-white',
    accentColor: '#ff7f50',
    font: 'bold',
    preview: TropicalParadisePreview,
  },
  {
    id: 'anniversaire_festif',
    name: 'Anniversaire Festif',
    category: 'moderne',
    eventTypes: ['anniversary'],
    gradient: 'from-violet-500 via-fuchsia-500 to-pink-500',
    textColor: 'text-white',
    accentColor: '#ffd700',
    font: 'bold',
    preview: AnniversaireFestifPreview,
  },
  {
    id: 'anniversaire_elegant',
    name: 'Anniversaire Élégant',
    category: 'luxe',
    eventTypes: ['anniversary'],
    gradient: 'from-gray-900 via-gray-800 to-gray-900',
    textColor: 'text-white',
    accentColor: '#d4af37',
    font: 'light',
    preview: AnniversaireElegantPreview,
  },
  {
    id: 'ceremonie_sacree',
    name: 'Cérémonie Sacrée',
    category: 'classique',
    eventTypes: ['baptism', 'wedding', 'other'],
    gradient: 'from-stone-100 via-white to-stone-100',
    textColor: 'text-stone-700',
    accentColor: '#a0845c',
    font: 'light',
    preview: CeremonieSacreePreview,
  },
];

// ─── CATEGORY LABELS ─────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
  all: 'Tous',
  classique: 'Classique',
  boheme: 'Bohème',
  minimaliste: 'Minimaliste',
  floral: 'Floral',
  oriental: 'Oriental',
  africain: 'Africain',
  champetre: 'Champêtre',
  luxe: 'Luxe',
  romantique: 'Romantique',
  moderne: 'Moderne',
  vintage: 'Vintage',
  tropical: 'Tropical',
};

// ─── TEMPLATE GRID COMPONENT ─────────────────────────────────────────────────

export function TemplateGrid({
  onSelect,
  selectedId,
  eventType,
  previewData,
}: {
  onSelect: (id: string) => void;
  selectedId?: string;
  eventType: string;
  previewData: TemplatePreviewProps;
}) {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Filter templates by event type
  const filteredByEvent = useMemo(
    () => TEMPLATES.filter((t) => t.eventTypes.includes(eventType)),
    [eventType]
  );

  // Get available categories from filtered templates
  const availableCategories = useMemo(() => {
    const cats = new Set(filteredByEvent.map((t) => t.category));
    return ['all', ...Array.from(cats)];
  }, [filteredByEvent]);

  // Filter by category
  const displayedTemplates = useMemo(
    () =>
      activeCategory === 'all'
        ? filteredByEvent
        : filteredByEvent.filter((t) => t.category === activeCategory),
    [filteredByEvent, activeCategory]
  );

  return (
    <div className="w-full">
      <ShimmerStyles />

      {/* Category filter tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {availableCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
              activeCategory === cat
                ? 'bg-gray-900 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {CATEGORY_LABELS[cat] || cat}
          </button>
        ))}
      </div>

      {/* Templates grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {displayedTemplates.map((template) => {
          const Preview = template.preview;
          const isSelected = selectedId === template.id;

          return (
            <button
              key={template.id}
              onClick={() => onSelect(template.id)}
              className={`relative rounded-xl transition-all duration-300 transform hover:scale-[1.02] focus:outline-none ${
                isSelected
                  ? 'ring-2 ring-offset-2 ring-gray-900 shadow-xl scale-[1.02]'
                  : 'hover:shadow-lg'
              }`}
            >
              <Preview {...previewData} />
              {isSelected && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-gray-900 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Empty state */}
      {displayedTemplates.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p className="text-lg">Aucun template disponible</p>
          <p className="text-sm mt-1">Essayez une autre catégorie</p>
        </div>
      )}
    </div>
  );
}

export default TemplateGrid;
