import React from 'react';

export const GlowBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#0B0B09]">
      {/* Subtle Warm Brass Ambient Highlight at Top Right */}
      <div 
        className="absolute -top-[20%] -right-[10%] w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] rounded-full blur-[140px] pointer-events-none opacity-40"
        style={{
          background: 'radial-gradient(circle, rgba(198, 154, 91, 0.08) 0%, rgba(11, 11, 9, 0) 70%)',
        }}
      />

      {/* Deep Warm Bottom Left Subtle Shadow Accent */}
      <div 
        className="absolute -bottom-[20%] -left-[10%] w-[50vw] h-[50vw] max-w-[700px] max-h-[700px] rounded-full blur-[160px] pointer-events-none opacity-30"
        style={{
          background: 'radial-gradient(circle, rgba(198, 154, 91, 0.04) 0%, rgba(11, 11, 9, 0) 70%)',
        }}
      />

      {/* Fine Subtle Architectural Grid / Grain Texture */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(241, 238, 231, 0.8) 1px, transparent 0)`,
          backgroundSize: '32px 32px',
        }}
      />

      {/* Subtle Dark Edge Vignette */}
      <div className="absolute inset-0 bg-radial from-transparent via-[#0B0B09]/40 to-[#0B0B09] opacity-80" />
    </div>
  );
};


