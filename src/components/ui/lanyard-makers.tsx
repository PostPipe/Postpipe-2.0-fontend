"use client";

import React, { Component, ErrorInfo, ReactNode, useState, useEffect, useRef } from "react";
import Lanyard from "./lanyard";
import { useInView } from "framer-motion";

const makers = [
  { name: "Sourodip", role: "Founder", username: "sourodip-1", color: "#10b981" },
  { name: "Pinaki", role: "Core Dev", username: "PINaKey", color: "#3b82f6" },
  { name: "Soyam", role: "Developer", username: "yo-soyam", color: "#f59e0b" },
  { name: "Souvik", role: "Developer", username: "souvikvos", color: "#8b5cf6" },
];

const encodeBase64 = (str: string) => {
  if (typeof window !== 'undefined') {
    return btoa(unescape(encodeURIComponent(str)));
  }
  return Buffer.from(str, 'utf8').toString('base64');
};

const lanyardSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="150" height="30" viewBox="0 0 150 30" fill="none">
  <rect width="150" height="30" fill="#18181b"/>
  <svg x="15" y="5" width="20" height="20" viewBox="0 0 500 500">
    <path fill-rule="evenodd" d="m105 9l338.9 57.7c-292.3 108.5-331 394.6-331.6 429.2z" fill="#ffffff"/>
  </svg>
  <text x="45" y="20" font-family="'Space Grotesk', sans-serif" font-size="15" font-weight="900" letter-spacing="-0.5" fill="white">postpipe</text>
</svg>`;
const customLanyardBase64 = `data:image/svg+xml;base64,${encodeBase64(lanyardSvg)}`;

const photoMap: Record<string, string> = {
  'Sourodip': '/Sourodip.png',
  'Pinaki': '/pinaki.jpeg',
  'Soyam': '/soyam.png',
  'Souvik': '/souvik.jpeg'
};

function checkWebGLSupport(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return false;
    return typeof (gl as WebGLRenderingContext).getExtension === 'function';
  } catch {
    return false;
  }
}

interface WebGLErrorBoundaryProps {
  fallback: ReactNode;
  children: ReactNode;
}

interface WebGLErrorBoundaryState {
  hasError: boolean;
}

class WebGLErrorBoundary extends Component<WebGLErrorBoundaryProps, WebGLErrorBoundaryState> {
  constructor(props: WebGLErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): WebGLErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn("Three.js/WebGL render failed; switching to 2D Makers showcase:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

export function LanyardMakers() {
  const containerRef = useRef<HTMLElement>(null);
  const isInView = useInView(containerRef, { margin: "400px 0px" });

  const [mounted, setMounted] = useState(false);
  const [webglSupported, setWebglSupported] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setMounted(true);
    const mobile = window.innerWidth < 768;
    setIsMobile(mobile);
    
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);

    if (!mobile && checkWebGLSupport()) {
      setWebglSupported(true);
    } else {
      setWebglSupported(false);
    }

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const show3D = mounted && webglSupported && !isMobile;

  return (
    <section 
      ref={containerRef} 
      id="makers" 
      className="relative w-full overflow-hidden bg-zinc-950 md:h-[100vh] md:min-h-[800px] min-h-[700px] py-16 md:py-0 flex flex-col justify-between"
    >
      {/* Background Text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-0 px-4 pointer-events-none opacity-30 select-none">
        <h2 className="font-headline text-5xl md:text-8xl font-black mb-6 text-white tracking-tighter text-center">
          Meet the Makers
        </h2>
        <p className="text-zinc-400 text-lg md:text-2xl max-w-2xl mx-auto text-center font-medium">
          Built by developers, for developers. We are passionate about open source and creating tools that empower the community.
        </p>
      </div>

      {/* 3D Lanyards Container with Error Boundary */}
      {show3D ? (
        <WebGLErrorBoundary fallback={<MakersShowcaseCards />}>
          <div className="absolute inset-0 pointer-events-auto z-10 cursor-grab active:cursor-grabbing touch-none">
            <Lanyard
              isInView={isInView}
              position={[0, 0, 22]}
              gravity={[0, -40, 0]}
              items={makers.map((maker, idx) => {
                const initial = maker.name.charAt(0);
                const backLabel = maker.name === 'Sourodip' ? '&lt;/founder&gt;' : '&lt;/dev&gt;';

                const frontSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="600" viewBox="0 0 400 600" fill="none">
                  <rect width="400" height="600" rx="40" fill="#18181b"/>
                  <rect x="20" y="20" width="360" height="560" rx="20" stroke="#27272a" stroke-width="4"/>
                  
                  <!-- Blank area for WebGL photo injection, or default avatar for others -->
                  ${!!photoMap[maker.name]
                    ? `<rect x="100" y="80" width="200" height="200" rx="100" fill="#18181b"/>`
                    : `<rect x="100" y="80" width="200" height="200" rx="100" fill="${maker.color}15"/>
                      <circle cx="200" cy="180" r="100" stroke="${maker.color}40" stroke-width="2"/>
                      <text x="200" y="210" font-family="sans-serif" font-size="90" font-weight="900" fill="${maker.color}" text-anchor="middle">${initial}</text>`
                  }

                  <text x="200" y="380" font-family="monospace" font-size="46" font-weight="bold" fill="white" text-anchor="middle">${maker.name}</text>
                  <text x="200" y="430" font-family="monospace" font-size="24" fill="#a1a1aa" text-anchor="middle">${maker.role}</text>
                  <text x="200" y="520" font-family="monospace" font-size="20" fill="#52525b" text-anchor="middle">github.com/${maker.username}</text>
                </svg>`;

                const backSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="600" viewBox="0 0 400 600" fill="none">
                  <rect width="400" height="600" rx="40" fill="#000000"/>
                  <svg x="125" y="170" width="150" height="150" viewBox="0 0 500 500">
                    <path fill-rule="evenodd" d="m105 9l338.9 57.7c-292.3 108.5-331 394.6-331.6 429.2z" fill="#ffffff"/>
                  </svg>
                  <text x="200" y="420" font-family="monospace" font-size="32" font-weight="bold" fill="white" text-anchor="middle">postpipe.in</text>
                  <text x="200" y="470" font-family="monospace" font-size="24" fill="#a1a1aa" text-anchor="middle">${backLabel}</text>
                </svg>`;

                const frontBase64 = `data:image/svg+xml;base64,${encodeBase64(frontSvg)}`;
                const backBase64 = `data:image/svg+xml;base64,${encodeBase64(backSvg)}`;

                const anchorX = isMobile ? (idx - 1.5) * 1.5 : (idx - 1.5) * 3.2;
                const anchorZ = isMobile && (idx === 0 || idx === 3) ? -1.5 : 0;
                const anchorY = 5;

                const isLong = idx === 0 || idx === 3;
                const ropeLength = isLong ? 1.3 : 1;
                const logoRepeats = isLong ? 3 : 2;

                return {
                  frontImage: frontBase64,
                  backImage: backBase64,
                  lanyardImage: customLanyardBase64,
                  photoImage: photoMap[maker.name] || null,
                  anchorX: anchorX,
                  anchorY: anchorY,
                  anchorZ: anchorZ,
                  ropeLength: ropeLength,
                  logoRepeats: logoRepeats,
                  username: maker.username
                };
              })}
            />
          </div>

          {/* Drop Zone UI (rendered behind canvas, z-0) */}
          <div className="absolute inset-0 pointer-events-none z-0 flex items-end justify-center pb-8">
            <DropZone />
          </div>
        </WebGLErrorBoundary>
      ) : (
        /* Complete 2D Lanyard Cards Showcase (Fallback for non-WebGL / Mobile) */
        <MakersShowcaseCards />
      )}
    </section>
  );
}

function MakersShowcaseCards() {
  return (
    <div className="relative z-10 w-full max-w-6xl mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[600px]">
      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full justify-items-center mb-10">
        {makers.map((maker, idx) => {
          const initial = maker.name.charAt(0);
          const backLabel = maker.name === 'Sourodip' ? '</founder>' : '</dev>';
          const isLong = idx === 0 || idx === 3;
          const photo = photoMap[maker.name];

          return (
            <div 
              key={maker.name}
              className={`flex flex-col items-center transition-all duration-300 w-full max-w-[260px] ${
                isLong ? 'lg:translate-y-4' : 'lg:translate-y-0'
              }`}
            >
              {/* Lanyard Strap & Clip Visual */}
              <div className="flex flex-col items-center">
                <div className="w-9 h-12 bg-zinc-900 border-x border-zinc-700/80 relative overflow-hidden flex items-center justify-center">
                  <div className="w-1.5 h-full bg-white/10" />
                  <span className="absolute text-[8px] font-mono tracking-widest text-zinc-500 uppercase -rotate-90 select-none">
                    postpipe
                  </span>
                </div>
                {/* Silver Clip */}
                <div className="w-7 h-3.5 bg-gradient-to-b from-zinc-300 via-zinc-400 to-zinc-600 rounded-sm shadow-sm -mt-0.5 z-10" />
                <div className="w-3 h-2 bg-zinc-700 rounded-b-sm -mt-0.5" />
              </div>

              {/* ID Badge Card */}
              <a
                href={`https://github.com/${maker.username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative w-full rounded-2xl border border-zinc-800/90 bg-zinc-900/90 backdrop-blur-xl p-5 shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:border-zinc-500 hover:shadow-[0_16px_36px_rgba(0,0,0,0.6)] flex flex-col items-center text-center cursor-pointer"
                style={{
                  boxShadow: `0 8px 30px -10px ${maker.color}25`
                }}
              >
                {/* Badge Header */}
                <div className="w-full flex items-center justify-between pb-3 mb-3 border-b border-zinc-800/80 text-[10px] font-mono text-zinc-500">
                  <div className="flex items-center gap-1.5">
                    <svg width="14" height="14" viewBox="0 0 500 500">
                      <path fillRule="evenodd" d="m105 9l338.9 57.7c-292.3 108.5-331 394.6-331.6 429.2z" fill="#ffffff"/>
                    </svg>
                    <span className="font-semibold text-zinc-400">postpipe.in</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded bg-zinc-800/90 text-[9px] uppercase tracking-wider text-zinc-400 font-bold">
                    Identity
                  </span>
                </div>

                {/* Avatar Photo */}
                <div 
                  className="relative w-24 h-24 my-2 rounded-full p-1 border-2 transition-transform duration-300 group-hover:scale-105" 
                  style={{ borderColor: maker.color }}
                >
                  <div className="w-full h-full rounded-full overflow-hidden bg-zinc-950 flex items-center justify-center">
                    {photo ? (
                      <img 
                        src={photo} 
                        alt={maker.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl font-bold font-mono" style={{ color: maker.color }}>
                        {initial}
                      </span>
                    )}
                  </div>
                  <div 
                    className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-zinc-900"
                    style={{ backgroundColor: maker.color }}
                  />
                </div>

                {/* Maker Name */}
                <h3 className="text-xl font-bold font-mono text-white mt-2 tracking-tight group-hover:text-primary transition-colors">
                  {maker.name}
                </h3>

                {/* Maker Role */}
                <p className="text-xs text-zinc-400 font-mono mt-0.5">
                  {maker.role}
                </p>

                {/* Role Pill */}
                <div 
                  className="mt-2.5 px-2.5 py-0.5 rounded-full border border-zinc-700/60 bg-zinc-800/80 text-[11px] font-mono font-medium" 
                  style={{ color: maker.color }}
                >
                  {backLabel}
                </div>

                {/* GitHub link */}
                <div className="mt-4 w-full pt-3 border-t border-zinc-800/80 flex items-center justify-center gap-1.5 text-xs font-mono text-zinc-400 group-hover:text-white transition-colors">
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                  <span>github.com/{maker.username}</span>
                </div>
              </a>
            </div>
          );
        })}
      </div>

      {/* Identity Scanner / DropZone */}
      <div className="hidden md:flex justify-center">
        <DropZone />
      </div>
    </div>
  );
}

function DropZone() {
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const handleHover = (e: any) => setIsHovered(e.detail);
    window.addEventListener('scan-zone-hover', handleHover);
    return () => window.removeEventListener('scan-zone-hover', handleHover);
  }, []);

  return (
    <div 
      className={`w-72 h-24 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all duration-300 ${
        isHovered 
          ? 'border-zinc-300 bg-zinc-800/50 scale-105 shadow-[0_0_30px_rgba(255,255,255,0.12)] backdrop-blur-md' 
          : 'border-zinc-700/80 bg-zinc-950/40 backdrop-blur-sm'
      }`}
    >
      <svg className={`w-6 h-6 mb-2 transition-colors duration-300 ${isHovered ? 'text-white' : 'text-zinc-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
      </svg>
      <span className={`font-bold tracking-widest uppercase text-xs transition-colors duration-300 ${isHovered ? 'text-white' : 'text-zinc-400'}`}>
        Scan Identity
      </span>
      <span className={`text-[10px] mt-1 font-medium transition-colors duration-300 ${isHovered ? 'text-zinc-300' : 'text-zinc-600'}`}>
        Click any ID card above to view GitHub profile
      </span>
    </div>
  );
}
