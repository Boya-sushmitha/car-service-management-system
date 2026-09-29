import React from 'react';

const STEPS = [
  {
    key: 'pending',
    label: 'Submitted',
    sublabel: 'Awaiting admin review',
    color: '#f59e0b',
  },
  {
    key: 'accepted',
    label: 'Accepted',
    sublabel: 'Admin approved request',
    color: '#10b981',
  },
  {
    key: 'in_progress',
    label: 'In Progress',
    sublabel: 'Mechanic working on car',
    color: '#3b82f6',
  },
  {
    key: 'completed',
    label: 'Completed',
    sublabel: 'Ready for pickup',
    color: '#8b5cf6',
  },
];

// Unique SVG icon per step — filled when done, ghost outline when inactive
const StepIcon = ({ stepKey, color, done }) => {
  const opacity = done ? 1 : 0.25;
  const fill = done ? color : 'none';
  const stroke = done ? color : 'rgba(255,255,255,0.35)';

  const icons = {
    pending: (
      // Clipboard / Document icon
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="5" y="3" width="14" height="18" rx="2" stroke={stroke} strokeWidth="1.8" fill={done ? `${color}22` : 'none'} />
        <path d="M9 3h6v2H9z" fill={stroke} />
        <line x1="8" y1="10" x2="16" y2="10" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
        <line x1="8" y1="14" x2="14" y2="14" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
        {done && <circle cx="18" cy="18" r="5" fill={color} />}
        {done && <path d="M15.5 18l1.5 1.5 2.5-2.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />}
      </svg>
    ),
    accepted: (
      // Shield with tick
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L4 5v6c0 5.25 3.5 10.1 8 11.5 4.5-1.4 8-6.25 8-11.5V5L12 2z"
          stroke={stroke} strokeWidth="1.8" fill={done ? `${color}22` : 'none'} strokeLinejoin="round" />
        <path d="M9 12l2 2 4-4" stroke={done ? color : stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    in_progress: (
      // Gear / Cog icon
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="3" stroke={stroke} strokeWidth="1.8" fill={done ? `${color}33` : 'none'} />
        <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
          stroke={stroke} strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="12" cy="12" r="6" stroke={stroke} strokeWidth="1.4" strokeDasharray="2 2" />
      </svg>
    ),
    completed: (
      // Trophy / Flag icon
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M6 3h12l-2 7H8L6 3z" stroke={stroke} strokeWidth="1.8" fill={done ? `${color}22` : 'none'} strokeLinejoin="round" />
        <path d="M4 3h2M18 3h2" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" />
        <path d="M5 3C5 3 3 6 3 8s2 3 5 3M19 3c0 0 2 3 2 5s-2 3-5 3" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
        <line x1="12" y1="11" x2="12" y2="21" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" />
        <line x1="9" y1="21" x2="15" y2="21" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  };

  return (
    <div
      className="step-svg-icon"
      style={{
        width: 40,
        height: 40,
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: done ? `${color}18` : 'rgba(255,255,255,0.04)',
        border: `1.5px solid ${done ? `${color}60` : 'rgba(255,255,255,0.1)'}`,
        transition: 'all 0.4s ease',
        boxShadow: done ? `0 0 14px ${color}40, inset 0 1px 0 rgba(255,255,255,0.15)` : 'none',
      }}
    >
      {icons[stepKey]}
    </div>
  );
};

// Active step: animated car
const StepCar = ({ color, isDriving }) => (
  <div className={`step-car-wrapper ${isDriving ? 'driving-active' : ''}`}>
    <svg width="52" height="26" viewBox="0 0 100 50" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Headlight cone */}
      <path d="M90 24 L110 16 L110 34 Z" fill="#fbbf24" opacity="0.55" />
      {/* Car body */}
      <path d="M8 34 L18 20 C24 10 40 8 62 8 L80 18 L94 22 C97 23 99 27 97 32 L92 34 Z" fill={color} />
      {/* Roof highlight */}
      <path d="M28 18 C32 12 44 10 60 10 C70 10 78 14 82 18" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeLinecap="round" />
      {/* Glass */}
      <path d="M26 18 C30 11 44 9 60 9 L74 18 Z" fill="#0f172a" opacity="0.85" />
      <path d="M50 11 L50 18 L70 18 Z" fill="rgba(255,255,255,0.35)" />
      {/* Headlight */}
      <circle cx="93" cy="25" r="2.5" fill="#fef08a" />
      {/* Front wheel */}
      <g className={`car-wheel ${isDriving ? 'spinning-wheel' : ''}`} style={{ transformOrigin: '26px 34px' }}>
        <circle cx="26" cy="34" r="8" fill="#090d16" stroke="#475569" strokeWidth="2" />
        <circle cx="26" cy="34" r="3" fill="#cbd5e1" />
        <line x1="26" y1="29" x2="26" y2="39" stroke="#94a3b8" strokeWidth="1" />
        <line x1="21" y1="34" x2="31" y2="34" stroke="#94a3b8" strokeWidth="1" />
      </g>
      {/* Rear wheel */}
      <g className={`car-wheel ${isDriving ? 'spinning-wheel' : ''}`} style={{ transformOrigin: '76px 34px' }}>
        <circle cx="76" cy="34" r="8" fill="#090d16" stroke="#475569" strokeWidth="2" />
        <circle cx="76" cy="34" r="3" fill="#cbd5e1" />
        <line x1="76" y1="29" x2="76" y2="39" stroke="#94a3b8" strokeWidth="1" />
        <line x1="71" y1="34" x2="81" y2="34" stroke="#94a3b8" strokeWidth="1" />
      </g>
    </svg>
  </div>
);

export default function ServiceProgressTracker({ status }) {
  let curIdx = STEPS.findIndex(s => s.key === status);
  if (curIdx === -1) curIdx = 0;

  const currentStep = STEPS[curIdx];
  const progressPercent = (curIdx / (STEPS.length - 1)) * 100;
  const isDriving = status === 'in_progress';

  return (
    <div className="spt-clean-container">
      <div className="spt-clean-header">
        SERVICE PROGRESS
      </div>

      <div className="spt-track-area">
        {/* Progress Line */}
        <div className="spt-line-bg">
          <div className="spt-line-dashes" />
          <div
            className="spt-line-fill"
            style={{
              width: `${progressPercent}%`,
              background: `linear-gradient(90deg, ${currentStep.color}99, ${currentStep.color})`,
              boxShadow: `0 0 12px ${currentStep.color}80`,
            }}
          />
        </div>

        {/* Step Nodes Row */}
        <div className="spt-nodes-row">
          {STEPS.map((step, idx) => {
            const isDone    = idx <= curIdx;
            const isCurrent = idx === curIdx;

            return (
              <div key={step.key} className="spt-node-col">
                <div className="spt-node-slot">
                  {isCurrent ? (
                    <StepCar color={step.color} isDriving={isDriving} />
                  ) : (
                    <StepIcon stepKey={step.key} color={step.color} done={isDone} />
                  )}
                </div>

                <div className="spt-text-group">
                  <span
                    className="spt-step-label"
                    style={{
                      color: isDone ? step.color : 'rgba(255,255,255,0.35)',
                      fontWeight: isCurrent ? 700 : 500,
                    }}
                  >
                    {step.label}
                  </span>
                  {isCurrent && (
                    <span className="spt-step-sublabel" style={{ color: step.color }}>
                      ● {step.sublabel}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        .spt-clean-container {
          width: 100%;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 14px;
          padding: 20px 24px 24px;
          box-sizing: border-box;
        }

        .spt-clean-header {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1.5px;
          color: rgba(255, 255, 255, 0.4);
          margin-bottom: 28px;
        }

        .spt-track-area {
          position: relative;
          width: 100%;
        }

        /* ── Road Track ── */
        .spt-line-bg {
          position: absolute;
          top: 19px;
          left: 28px;
          right: 28px;
          height: 3px;
          background: rgba(255,255,255,0.05);
          border-radius: 4px;
          overflow: hidden;
          z-index: 1;
        }

        .spt-line-dashes {
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(
            90deg,
            transparent,
            transparent 8px,
            rgba(255,255,255,0.07) 8px,
            rgba(255,255,255,0.07) 16px
          );
        }

        .spt-line-fill {
          position: absolute;
          top: 0;
          bottom: 0;
          left: 0;
          border-radius: 4px;
          transition: width 0.9s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* ── Step Nodes ── */
        .spt-nodes-row {
          position: relative;
          z-index: 2;
          display: flex;
          justify-content: space-between;
          width: 100%;
          padding-top: 0;
        }

        .spt-node-col {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          width: 110px;
        }

        .spt-node-slot {
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .step-svg-icon {
          transition: all 0.4s ease;
        }

        .step-svg-icon:hover {
          transform: translateY(-2px) scale(1.08);
        }

        /* ── Active Car ── */
        .step-car-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          filter: drop-shadow(0 4px 10px rgba(0,0,0,0.7));
          animation: carBounce 0.8s ease-in-out infinite alternate;
        }

        .driving-active {
          animation: carDriveVibe 0.18s ease-in-out infinite alternate !important;
        }

        @keyframes carBounce {
          0%   { transform: translateY(0); }
          100% { transform: translateY(-3px); }
        }

        @keyframes carDriveVibe {
          0%   { transform: translateY(0) rotate(0deg); }
          100% { transform: translateY(-1.5px) rotate(0.5deg); }
        }

        .spinning-wheel {
          animation: spinWheel 0.3s linear infinite;
        }

        @keyframes spinWheel {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }

        /* ── Text ── */
        .spt-text-group {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3px;
          text-align: center;
        }

        .spt-step-label {
          font-size: 11.5px;
          white-space: nowrap;
          transition: color 0.3s ease;
        }

        .spt-step-sublabel {
          font-size: 9.5px;
          font-weight: 600;
          white-space: nowrap;
          opacity: 0.85;
        }
      `}</style>
    </div>
  );
}
