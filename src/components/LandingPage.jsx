import React, { useState, useEffect } from 'react';

const S = {
  container: { minHeight: '100vh', background: 'linear-gradient(160deg,#0f2027 0%,#203a43 55%,#2c5364 100%)', color: '#fff', fontFamily: 'system-ui, -apple-system, sans-serif' },
  nav: { padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1100px', margin: '0 auto' },
  hero: { padding: '6rem 2rem', textAlign: 'center', maxWidth: '900px', margin: '0 auto' },
  badge: { background: 'rgba(79, 142, 247, 0.15)', color: '#4F8EF7', padding: '6px 16px', borderRadius: '30px', fontSize: '13px', fontWeight: 'bold', marginBottom: '20px', display: 'inline-block', border: '1px solid rgba(79, 142, 247, 0.3)' },
  title: { fontSize: 'clamp(2.5rem, 8vw, 4.5rem)', fontWeight: '900', letterSpacing: '-0.03em', lineHeight: '1.1', marginBottom: '1.5rem' },
  subtitle: { fontSize: '1.25rem', color: 'rgba(255,255,255,0.7)', lineHeight: '1.6', marginBottom: '2.5rem', maxWidth: '600px', margin: '0 auto 2.5rem' },
  btnPrimary: { background: '#4F8EF7', color: '#fff', padding: '14px 32px', borderRadius: '12px', fontWeight: 'bold', fontSize: '16px', border: 'none', cursor: 'pointer', boxShadow: '0 10px 20px rgba(0,0,0,0.2)', transition: 'all 0.2s' },
  btnSecondary: { background: 'rgba(255,255,255,0.08)', color: '#fff', padding: '14px 32px', borderRadius: '12px', fontWeight: 'bold', fontSize: '16px', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', marginLeft: '12px', textDecoration: 'none' },
  section: { padding: '5rem 2rem', maxWidth: '1100px', margin: '0 auto' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginTop: '3rem' },
  card: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '2rem', borderRadius: '20px', textAlign: 'left', backdropFilter: 'blur(10px)' },
  pricingCard: { background: 'rgba(15,32,39,0.8)', border: '1px solid rgba(79, 142, 247, 0.3)', padding: '3rem 2rem', borderRadius: '24px', textAlign: 'center', position: 'relative', overflow: 'hidden' },
  footer: { padding: '4rem 2rem', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: '14px' }
};

export default function LandingPage({ onLaunch }) {
  const buyLink = "https://voyager-manish.lemonsqueezy.com/checkout/buy/c69b2362-113d-44f5-93a2-d35fd1fca250";
  const repoUrl = "https://github.com/manishag1988/Voyager";
  
  const [downloads, setDownloads] = useState({
    win: `${repoUrl}/releases/latest`,
    mac: `${repoUrl}/releases/latest`,
    pwa: `${repoUrl}/releases/latest`
  });

  useEffect(() => {
    fetch('https://api.github.com/repos/manishag1988/Voyager/releases/latest')
      .then(res => res.json())
      .then(data => {
        if (data.assets) {
          const win = data.assets.find(a => a.name.endsWith('.msi'))?.browser_download_url;
          const mac = data.assets.find(a => a.name.endsWith('.dmg'))?.browser_download_url;
          const pwa = data.assets.find(a => a.name.includes('PWA'))?.browser_download_url;
          setDownloads({
            win: win || `${repoUrl}/releases/latest`,
            mac: mac || `${repoUrl}/releases/latest`,
            pwa: pwa || `${repoUrl}/releases/latest`
          });
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div style={S.container}>
      {/* Navigation */}
      <nav style={S.nav}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '22px', fontWeight: '800' }}>
          <span>🌍</span> Voyager
        </div>
        <div style={{ display: 'flex', gap: '20px', fontSize: '14px', fontWeight: '600', color: 'rgba(255,255,255,0.7)', alignItems: 'center' }}>
          <a href="#features" style={{ color: 'inherit', textDecoration: 'none' }}>Features</a>
          <a href="#pricing" style={{ color: 'inherit', textDecoration: 'none' }}>Pricing</a>
          <a href={repoUrl} target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <svg height="20" width="20" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path></svg>
            GitHub
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <header style={S.hero}>
        <div style={S.badge}>V1.0.12 NOW LIVE</div>
        <h1 style={S.title}>Plan your next <span style={{ color: '#4F8EF7' }}>adventure</span> with confidence.</h1>
        <p style={S.subtitle}>The offline-first travel companion for smart itineraries, budget tracking, and secure document storage. No cloud, no tracking, just you and the road.</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap' }}>
          <button onClick={onLaunch} style={S.btnPrimary}>Launch App (PWA)</button>
          <a href="#download" style={S.btnSecondary}>Download for Desktop</a>
        </div>
      </header>

      {/* Features Grid */}
      <section id="features" style={S.section}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '800' }}>Everything you need to roam.</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: '10px' }}>Built for travelers who value privacy and reliability.</p>
        </div>
        <div style={S.grid}>
          <div style={S.card}>
            <div style={{ fontSize: '32px', marginBottom: '15px' }}>📋</div>
            <h3 style={{ fontSize: '20px', marginBottom: '10px' }}>Smart Itinerary</h3>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '15px', lineHeight: '1.5' }}>Organize flights, hotels, and activities in a beautiful timeline. Attach notes and locations to every stop.</p>
          </div>
          <div style={S.card}>
            <div style={{ fontSize: '32px', marginBottom: '15px' }}>💰</div>
            <h3 style={{ fontSize: '20px', marginBottom: '10px' }}>Budget Mastery</h3>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '15px', lineHeight: '1.5' }}>Track expenses in any currency. Auto-conversion fallbacks ensure you know exactly what you're spending.</p>
          </div>
          <div style={S.card}>
            <div style={{ fontSize: '32px', marginBottom: '15px' }}>🗂️</div>
            <h3 style={{ fontSize: '20px', marginBottom: '10px' }}>Document Vault</h3>
            <h4 style={{ color: 'rgba(255,255,255,0.6)', fontSize: '15px', lineHeight: '1.5', fontWeight: '400' }}>Store passports, visas, and insurance details securely. Fully encrypted and available without internet.</h4>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" style={{ ...S.section, textAlign: 'center' }}>
        <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '3rem' }}>Simple, transparent pricing.</h2>
        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
          <div style={S.pricingCard}>
            <div style={{ position: 'absolute', top: '20px', right: '-35px', background: '#4F8EF7', color: '#fff', padding: '5px 40px', transform: 'rotate(45deg)', fontSize: '12px', fontWeight: 'bold' }}>BEST VALUE</div>
            <h3 style={{ fontSize: '24px', fontWeight: '800' }}>Voyager Premium</h3>
            <div style={{ fontSize: '48px', fontWeight: '900', margin: '1.5rem 0' }}>₹199<span style={{ fontSize: '16px', fontWeight: '400', color: 'rgba(255,255,255,0.5)' }}> / year</span></div>
            <ul style={{ listArray: 'none', padding: '0', textAlign: 'left', margin: '0 auto 2rem', maxWidth: '250px', color: 'rgba(255,255,255,0.8)', fontSize: '15px' }}>
              <li style={{ marginBottom: '12px' }}>✅ Full Feature Access</li>
              <li style={{ marginBottom: '12px' }}>✅ 7-Day Free Trial</li>
              <li style={{ marginBottom: '12px' }}>✅ Unlimited Trips</li>
              <li style={{ marginBottom: '12px' }}>✅ All Platforms (Win/Mac/PWA)</li>
              <li style={{ marginBottom: '12px' }}>✅ Privacy First (Offline)</li>
            </ul>
            <a href={buyLink} target="_blank" rel="noreferrer" style={{ ...S.btnPrimary, display: 'block', textDecoration: 'none' }}>Start Subscription</a>
          </div>
        </div>
      </section>

      {/* Download Section */}
      <section id="download" style={{ ...S.section, textAlign: 'center' }}>
        <h2 style={{ fontSize: '2.5rem', fontWeight: '800' }}>Take Voyager with you.</h2>
        <div style={S.grid}>
          <div style={S.card}>
            <h3 style={{ marginBottom: '15px' }}>Windows</h3>
            <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '20px' }}>Native .msi installer.</p>
            <a href={downloads.win} target="_blank" rel="noreferrer" style={{ ...S.btnSecondary, marginLeft: 0, display: 'block' }}>Download for Windows</a>
          </div>
          <div style={S.card}>
            <h3 style={{ marginBottom: '15px' }}>macOS</h3>
            <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '20px' }}>Universal Intel & Apple Silicon DMG.</p>
            <a href={downloads.mac} target="_blank" rel="noreferrer" style={{ ...S.btnSecondary, marginLeft: 0, display: 'block' }}>Download for Mac</a>
          </div>
          <div style={S.card}>
            <h3 style={{ marginBottom: '15px' }}>Mobile (PWA)</h3>
            <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '20px' }}>Install as a native app on iOS & Android.</p>
            <button onClick={onLaunch} style={{ ...S.btnPrimary, width: '100%' }}>Launch Web App</button>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section style={{ ...S.section, textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Have questions?</h2>
        <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: '10px', marginBottom: '20px' }}>We're here to help you plan your perfect journey.</p>
        <a href="mailto:support@voyager-app.io" style={{ color: '#4F8EF7', textDecoration: 'none', fontWeight: 'bold' }}>support@voyager-app.io</a>
      </section>

      <footer style={S.footer}>
        <p>© 2026 Voyager Travel Planner. Built with Tauri & React.</p>
        <p style={{ marginTop: '10px', fontSize: '12px' }}>Not seeing your purchase? Use the Settings tab in-app to activate.</p>
      </footer>
    </div>
  );
}
