import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useTheme } from '../context/ThemeContext';

const servicesList = [
  { name: 'Car Inspection & Checks', img: '/images/svc_inspection_1786285074403.png' },
  { name: 'Car Electronic Services', img: '/images/svc_electronic_1786285089211.png' },
  { name: 'Air Conditioning Service', img: '/images/svc_ac_1786285103481.png' },
  { name: 'Car Engine Service', img: '/images/svc_engine_1786285115672.png' },
  { name: 'Car Brake Service', img: '/images/svc_brake_1786285129310.png' },
  { name: 'Headlight & Bulb Check', img: '/images/svc_headlight_1786285143954.png' },
  { name: 'General Repair Service', img: 'https://images.unsplash.com/photo-1632733711679-529326f6db12?w=500&q=80' },
  { name: 'Car Tyre Service', img: 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?w=500&q=80' }
];

// Clean Luxury Ambient Glow & Bokeh Particle System
function CleanAmbientGlowCanvas({ theme }) {
  const canvasRef = useRef(null);
  const isLight = theme === 'light';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    // Mouse tracking for soft lighting tilt
    let mouseX = width / 2;
    let mouseY = height / 2;
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Floating Bokeh Orbs
    const orbCount = 28;
    const colors = isLight
      ? ['rgba(79, 70, 229, 0.25)', 'rgba(249, 115, 22, 0.25)', 'rgba(37, 99, 235, 0.2)']
      : ['rgba(6, 182, 212, 0.35)', 'rgba(249, 115, 22, 0.3)', 'rgba(59, 130, 246, 0.25)'];

    const orbs = Array.from({ length: orbCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 40 + 20,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: Math.random() * 0.5 + 0.2,
    }));

    let time = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      time += 0.01;

      const lightX = width * 0.5 + (mouseX - width * 0.5) * 0.08;
      const lightY = height * 0.4 + (mouseY - height * 0.5) * 0.08;

      // ── 1. Soft Dynamic Spotlight Radial Glow ──
      const grad = ctx.createRadialGradient(lightX, lightY, 50, lightX, lightY, width * 0.6);
      if (isLight) {
        grad.addColorStop(0, 'rgba(79, 70, 229, 0.08)');
        grad.addColorStop(0.5, 'rgba(249, 115, 22, 0.04)');
        grad.addColorStop(1, 'rgba(248, 250, 252, 0)');
      } else {
        grad.addColorStop(0, 'rgba(6, 182, 212, 0.12)');
        grad.addColorStop(0.5, 'rgba(249, 115, 22, 0.06)');
        grad.addColorStop(1, 'rgba(5, 7, 18, 0)');
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // ── 2. Floating Ambient Bokeh Orbs ──
      orbs.forEach((orb) => {
        orb.x += orb.vx;
        orb.y += orb.vy;

        if (orb.x < -50) orb.x = width + 50;
        if (orb.x > width + 50) orb.x = -50;
        if (orb.y < -50) orb.y = height + 50;
        if (orb.y > height + 50) orb.y = -50;

        const pulseR = orb.r + Math.sin(time + orb.x) * 6;

        const orbGrad = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, pulseR);
        orbGrad.addColorStop(0, orb.color);
        orbGrad.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.fillStyle = orbGrad;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, pulseR, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isLight]);

  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }} />;
}

export default function Home() {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const [activeIdx, setActiveIdx] = useState(0);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, scale: 1 });

  // Auto-rotate service image
  useEffect(() => {
    const t = setInterval(() => setActiveIdx(i => (i + 1) % servicesList.length), 3000);
    return () => clearInterval(t);
  }, []);

  const handleCardMouseMove = (e) => {
    const card = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - card.left;
    const y = e.clientY - card.top;
    const centerX = card.width / 2;
    const centerY = card.height / 2;
    const rx = ((y - centerY) / centerY) * -12; // rotate X
    const ry = ((x - centerX) / centerX) * 12;  // rotate Y
    setTilt({ rx, ry, scale: 1.04 });
  };

  const handleCardMouseLeave = () => {
    setTilt({ rx: 0, ry: 0, scale: 1 });
  };

  return (
    <>
      <Navbar />

      <style>{`
        .shimmer-text {
          background: ${isLight 
            ? 'linear-gradient(90deg, #0f172a 25%, #4f46e5 50%, #f97316 75%, #0f172a 100%)'
            : 'linear-gradient(90deg, #ffffff 25%, #06b6d4 50%, #f97316 75%, #ffffff 100%)'};
          background-size: 250% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 3.5s linear infinite;
        }
        @keyframes shimmer {
          0%   { background-position: -250% center; }
          100% { background-position: 250% center; }
        }
        @keyframes roadMove {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .hero-left  { animation: slideInLeft  0.9s cubic-bezier(0.16,1,0.3,1) both; }
        .hero-right { animation: slideInRight 0.9s cubic-bezier(0.16,1,0.3,1) 0.15s both; }
        .feature-item { animation: fadeInUp 0.7s ease both; }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-50px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(50px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        
        .bg-video-wrapper {
          position: absolute;
          inset: 0;
          overflow: hidden;
          z-index: 0;
        }
        .bg-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: ${isLight ? 0.08 : 0.16};
        }
        .bg-overlay {
          position: absolute;
          inset: 0;
          background: ${isLight 
            ? 'radial-gradient(ellipse at 50% 50%, rgba(248,250,252,0.75) 0%, rgba(248,250,252,0.96) 100%)' 
            : 'radial-gradient(ellipse at 50% 50%, rgba(5,7,18,0.7) 0%, rgba(5,7,18,0.96) 100%)'};
        }
        
        .slideshow-card {
          width: 100%;
          aspect-ratio: 4/3;
          border-radius: 24px;
          overflow: hidden;
          position: relative;
          box-shadow: ${isLight 
            ? '0 20px 50px rgba(79,70,229,0.18), 0 0 30px rgba(0,0,0,0.06)' 
            : '0 25px 60px rgba(0,0,0,0.7), 0 0 35px rgba(6,182,212,0.25)'};
          border: 1px solid ${isLight ? 'rgba(79,70,229,0.25)' : 'rgba(6,182,212,0.3)'};
          transform-style: preserve-3d;
          transition: transform 0.15s ease-out, box-shadow 0.3s ease;
          cursor: pointer;
        }
        .slideshow-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: opacity 0.8s ease-in-out;
        }
        .slideshow-title {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 36px 24px 24px;
          background: ${isLight 
            ? 'linear-gradient(to top, rgba(255,255,255,0.95), transparent)' 
            : 'linear-gradient(to top, rgba(5,7,18,0.95), transparent)'};
          color: ${isLight ? '#0f172a' : '#ffffff'};
          font-weight: 700;
          font-size: 22px;
          text-align: center;
          transform: translateZ(30px);
        }
        .hud-badge {
          position: absolute;
          top: 20px;
          right: 20px;
          background: ${isLight ? 'rgba(255,255,255,0.9)' : 'rgba(9,13,22,0.85)'};
          backdrop-filter: blur(8px);
          border: 1px solid ${isLight ? 'rgba(79,70,229,0.4)' : 'rgba(6,182,212,0.5)'};
          color: ${isLight ? '#4f46e5' : '#06b6d4'};
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
          transform: translateZ(40px);
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
      `}</style>

      <div style={{
        minHeight: '100vh',
        paddingTop: 'var(--navbar-height)',
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        position: 'relative',
        overflow: 'hidden',
        transition: 'background-color 0.4s ease, color 0.4s ease',
      }}>
        
        {/* Background Video Layer */}
        <div className="bg-video-wrapper">
          <video className="bg-video" autoPlay loop muted playsInline>
            <source src="https://assets.mixkit.co/videos/preview/mixkit-mechanic-repairing-a-car-engine-48995-large.mp4" type="video/mp4" />
          </video>
          <div className="bg-overlay" />
        </div>

        {/* ── Clean Ambient Spotlight & Bokeh Canvas ── */}
        <CleanAmbientGlowCanvas theme={theme} />

        {/* ── Hero Section ── */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: 48, maxWidth: 1300, margin: '0 auto',
          padding: '60px 48px 40px', position: 'relative', zIndex: 1,
        }}>

          {/* Left Text */}
          <div className="hero-left" style={{ maxWidth: 540 }}>

            <h1 style={{ fontSize: 'clamp(38px, 5vw, 66px)', fontWeight: 800, lineHeight: 1.08, letterSpacing: '-2px', margin: '0 0 24px', color: 'var(--text-primary)' }}>
              Your Car Deserves<br />
              <span className="shimmer-text">Expert Care_</span>
            </h1>
            <p style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.75, margin: '0 0 36px', maxWidth: 440 }}>
              From quick washes to full diagnostics, we bring precision, care, and
              convenience together. Register your vehicle and track every service in real-time.
            </p>

            {/* Feature Pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 36 }}>
              {[
                { icon: '⚡', text: 'Real-time tracking' },
                { icon: '🔧', text: 'Expert mechanics' },
                { icon: '📅', text: 'Easy booking' },
                { icon: '🛡️', text: 'Secure records' },
              ].map((f, i) => (
                <div key={f.text} className="feature-item" style={{ animationDelay: `${0.2 + i * 0.1}s` }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    background: isLight ? 'rgba(79,70,229,0.08)' : 'rgba(6,182,212,0.1)',
                    border: `1px solid ${isLight ? 'rgba(79,70,229,0.2)' : 'rgba(6,182,212,0.25)'}`,
                    borderRadius: 20, padding: '6px 14px', fontSize: 13,
                    color: 'var(--text-primary)', fontWeight: 500,
                  }}>{f.icon} {f.text}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <Link to="/register" style={{
                padding: '14px 30px', fontSize: 15, fontWeight: 700, borderRadius: 10,
                background: 'linear-gradient(135deg, #f97316, #ef4444)',
                color: 'white', textDecoration: 'none',
                boxShadow: '0 8px 25px rgba(249,115,22,0.45)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                display: 'inline-flex', alignItems: 'center', gap: 8,
              }}
                onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 14px 35px rgba(249,115,22,0.6)'; }}
                onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(249,115,22,0.45)'; }}
              >
                🚀 Book A Service
              </Link>
              <Link to="/login" style={{
                padding: '14px 30px', fontSize: 15, fontWeight: 600, borderRadius: 10,
                background: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.07)',
                color: 'var(--text-primary)', textDecoration: 'none',
                border: `1px solid ${isLight ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.2)'}`,
                transition: 'all 0.2s', display: 'inline-flex', alignItems: 'center', gap: 8,
              }}
                onMouseOver={e => { e.currentTarget.style.background = isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.12)'; }}
                onMouseOut={e => { e.currentTarget.style.background = isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.07)'; }}
              >
                🔑 Sign In
              </Link>
            </div>
          </div>

          {/* Right — 3D Interactive Card Showcase */}
          <div className="hero-right" style={{ flex: '0 0 auto', width: 'min(500px, 100%)', perspective: 1000 }}>
            <div 
              className="slideshow-card"
              onMouseMove={handleCardMouseMove}
              onMouseLeave={handleCardMouseLeave}
              style={{
                transform: `perspective(1000px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) scale3d(${tilt.scale}, ${tilt.scale}, ${tilt.scale})`,
              }}
            >
               <div className="hud-badge">
                 🚗 Premium Care
               </div>
               {servicesList.map((svc, idx) => (
                 <img 
                   key={idx} 
                   src={svc.img} 
                   alt={svc.name} 
                   className="slideshow-img" 
                   style={{ opacity: activeIdx === idx ? 1 : 0 }} 
                 />
               ))}
               <div className="slideshow-title">
                  {servicesList[activeIdx].name}
               </div>
            </div>

            {/* Pagination Dots */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
              {servicesList.map((_, idx) => (
                <div key={idx} style={{
                  width: activeIdx === idx ? 24 : 8,
                  height: 8,
                  borderRadius: 4,
                  background: activeIdx === idx ? (isLight ? '#4f46e5' : '#06b6d4') : (isLight ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.2)'),
                  transition: 'all 0.4s ease'
                }} />
              ))}
            </div>
          </div>
        </div>

        {/* ── Moving Road / Stats Bar ── */}
        <div style={{
          background: isLight ? 'rgba(255,255,255,0.85)' : 'rgba(5, 7, 18, 0.75)',
          borderTop: `1px solid ${isLight ? 'rgba(0,0,0,0.08)' : 'rgba(6,182,212,0.15)'}`,
          borderBottom: `1px solid ${isLight ? 'rgba(0,0,0,0.08)' : 'rgba(6,182,212,0.15)'}`,
          padding: '18px 0', overflow: 'hidden', position: 'relative', zIndex: 1, marginTop: 8,
          backdropFilter: 'blur(10px)', transition: 'all 0.4s ease'
        }}>
          <div style={{ display: 'flex', gap: 64, width: 'max-content', animation: 'roadMove 22s linear infinite' }}>
            {[...Array(2)].flatMap(() => [
              { icon: '🚘', label: '500+ Vehicles Managed' },
              { icon: '🔧', label: '1,200+ Services Done' },
              { icon: '⭐', label: '4.9 / 5 Rating' },
              { icon: '👨‍🔧', label: '50+ Expert Mechanics' },
              { icon: '📅', label: '10,000+ Bookings' },
              { icon: '🛡️', label: '100% Secure Data' },
            ]).map((s, i) => (
              <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--text-secondary)', whiteSpace: 'nowrap', fontWeight: 500 }}>
                {s.icon} {s.label}
              </span>
            ))}
          </div>
        </div>

        {/* ── Feature Cards Row ── */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
          gap: 20, maxWidth: 1300, margin: '48px auto 60px', padding: '0 48px', zIndex: 1, position: 'relative',
        }}>
          {[
            { icon: '🚘', title: 'Vehicle Tracking', desc: 'Monitor your car status from pending check to repair in real time.' },
            { icon: '⚙️', title: 'Full Diagnostics', desc: 'Engine, electronics, brakes & AC comprehensive health reports.' },
            { icon: '📅', title: 'Instant Service Booking', desc: 'Schedule appointments with certified mechanics in just a few clicks.' },
            { icon: '🛡️', title: 'Verified Repair Records', desc: 'Maintain complete digital service history for max resale value.' },
          ].map((c) => (
            <div key={c.title} style={{
              background: isLight ? '#ffffff' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)'}`,
              borderRadius: 16, padding: '24px 20px', cursor: 'default',
              boxShadow: isLight ? '0 4px 20px rgba(0,0,0,0.04)' : 'none',
            }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>{c.icon}</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 8px', color: 'var(--text-primary)' }}>{c.title}</h3>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
