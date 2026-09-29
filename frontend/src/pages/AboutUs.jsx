import React from 'react';
import Navbar from '../components/Navbar';
import { Link, useNavigate } from 'react-router-dom';

export default function AboutUs() {
  const navigate = useNavigate();
  return (
    <>
      <Navbar />
      
      <style>{`
        .about-hero {
          position: relative;
          padding: 80px 48px;
          background: linear-gradient(135deg, rgba(99,102,241,0.1), rgba(16,185,129,0.05));
          border-bottom: 1px solid var(--glass-border);
          text-align: center;
          overflow: hidden;
        }
        .about-hero-title {
          font-size: clamp(32px, 5vw, 48px);
          font-weight: 800;
          margin-bottom: 24px;
          background: var(--accent-gradient);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .about-hero-desc {
          font-size: 18px;
          color: var(--text-secondary);
          max-width: 700px;
          margin: 0 auto;
          line-height: 1.6;
        }
        .content-section {
          max-width: 1100px;
          margin: 0 auto;
          padding: 60px 48px;
        }
        .intro-text {
          font-size: 16px;
          line-height: 1.8;
          color: var(--text-primary);
          text-align: center;
          max-width: 800px;
          margin: 0 auto 60px;
        }
        .pillars-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 24px;
          margin-bottom: 60px;
        }
        .pillar-card {
          background: var(--bg-card);
          border: 1px solid var(--glass-border);
          border-radius: 16px;
          padding: 32px 24px;
          text-align: center;
          transition: transform 0.3s, border-color 0.3s;
        }
        .pillar-card:hover {
          transform: translateY(-5px);
          border-color: var(--accent-primary);
        }
        .pillar-icon {
          font-size: 40px;
          margin-bottom: 20px;
        }
        .services-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px;
        }
        .service-card {
          position: relative;
          border-radius: 16px;
          overflow: hidden;
          aspect-ratio: 4/3;
          border: 1px solid var(--glass-border);
          transition: transform 0.3s, box-shadow 0.3s;
          cursor: pointer;
        }
        .service-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 12px 30px rgba(0,0,0,0.4);
          border-color: rgba(255,255,255,0.2);
        }
        .service-card img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s;
        }
        .service-card:hover img {
          transform: scale(1.05);
        }
        .service-card-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.3) 50%, transparent 100%);
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 24px;
        }
        .service-card-title {
          font-size: 20px;
          font-weight: 700;
          color: #ffffff;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .section-title {
          font-size: 28px;
          font-weight: 700;
          text-align: center;
          margin-bottom: 40px;
          color: var(--text-primary);
        }
      `}</style>

      <div style={{ minHeight: '100vh', paddingTop: 'var(--navbar-height)', background: 'var(--bg-primary)' }}>
        
        <div className="about-hero">
          <h1 className="about-hero-title">About Us</h1>
          <p className="about-hero-desc">
            Our trained technicians can service any car. We drive on the know-how and technology of our vast network to offer you excellent performance at a fair price.
          </p>
        </div>

        <div className="content-section">
          <div className="intro-text">
            <p style={{ marginBottom: '16px' }}>
              We are one of the world's largest independent workshop chains. Our international service network encompasses more than 13,000 authorized workshops in 100 countries.
            </p>
            <p>
              With our wide range of expert services, we can offer everything you could possibly need for your car and car service - from inspection, periodic maintenance, accidental repairs, replacement of genuine auto parts, and value added services that put an extra smile on your face.
            </p>
          </div>

          <h2 className="section-title">Pillars of Our Service</h2>
          <div className="pillars-grid">
            <div className="pillar-card">
              <div className="pillar-icon">🏛️</div>
              <h3 style={{ fontSize: '20px', marginBottom: '12px' }}>Legacy of 100 Years</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Since 1921, we have grown to become one of the largest workshop networks in the world.</p>
            </div>
            <div className="pillar-card">
              <div className="pillar-icon">⭐</div>
              <h3 style={{ fontSize: '20px', marginBottom: '12px' }}>Quality Management</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>We are committed to providing you with high-quality customer service and expert technical support.</p>
            </div>
            <div className="pillar-card">
              <div className="pillar-icon">🤝</div>
              <h3 style={{ fontSize: '20px', marginBottom: '12px' }}>Service Promises</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Our unique service promises demonstrate our commitment to always delivering the best service to you.</p>
            </div>
          </div>

          <h2 className="section-title" style={{ marginTop: '80px' }}>Services in our Showroom</h2>
          <div className="services-grid">
            <div className="service-card" onClick={() => navigate('/services')}>
              <img src="/images/svc_inspection_1786285074403.png" alt="Car Inspection" />
              <div className="service-card-overlay">
                <div className="service-card-title"><span>📋</span> Car Inspection & Checks</div>
              </div>
            </div>
            <div className="service-card" onClick={() => navigate('/services')}>
              <img src="/images/svc_electronic_1786285089211.png" alt="Car Electronic Services" />
              <div className="service-card-overlay">
                <div className="service-card-title"><span>⚡</span> Car Electronic Services</div>
              </div>
            </div>
            <div className="service-card" onClick={() => navigate('/services')}>
              <img src="/images/svc_ac_1786285103481.png" alt="Air Conditioning Service" />
              <div className="service-card-overlay">
                <div className="service-card-title"><span>❄️</span> Air Conditioning Service</div>
              </div>
            </div>
            <div className="service-card" onClick={() => navigate('/services')}>
              <img src="/images/svc_engine_1786285115672.png" alt="Car Engine Service" />
              <div className="service-card-overlay">
                <div className="service-card-title"><span>⚙️</span> Car Engine Service</div>
              </div>
            </div>
            <div className="service-card" onClick={() => navigate('/services')}>
              <img src="/images/svc_brake_1786285129310.png" alt="Car Brake Service" />
              <div className="service-card-overlay">
                <div className="service-card-title"><span>🛑</span> Car Brake Service</div>
              </div>
            </div>
            <div className="service-card" onClick={() => navigate('/services')}>
              <img src="/images/svc_headlight_1786285143954.png" alt="Headlight & Bulb Check" />
              <div className="service-card-overlay">
                <div className="service-card-title"><span>💡</span> Headlight & Bulb Check</div>
              </div>
            </div>
            <div className="service-card" onClick={() => navigate('/services')}>
              <img src="https://images.unsplash.com/photo-1632733711679-529326f6db12?w=500&q=80" alt="General Repair Service" />
              <div className="service-card-overlay">
                <div className="service-card-title"><span>🔧</span> General Repair Service</div>
              </div>
            </div>
            <div className="service-card" onClick={() => navigate('/services')}>
              <img src="https://images.unsplash.com/photo-1578844251758-2f71da64c96f?w=500&q=80" alt="Car Tyre Service" />
              <div className="service-card-overlay">
                <div className="service-card-title"><span>🛞</span> Car Tyre Service</div>
              </div>
            </div>
          </div>
          
          <div style={{ textAlign: 'center', marginTop: '60px' }}>
             <Link to="/register" className="btn btn-primary" style={{ padding: '14px 32px', fontSize: '16px' }}>Book a Service Today</Link>
          </div>
        </div>

      </div>
    </>
  );
}
