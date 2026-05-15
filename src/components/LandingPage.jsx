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
  
  const [currentPage, setCurrentPage] = useState('home'); // 'home', 'features', 'about'
  const [latestVersion, setLatestVersion] = useState('v1.0.25');
  const [downloads, setDownloads] = useState({
    win: `${repoUrl}/releases/latest`,
    mac: `${repoUrl}/releases/latest`,
    pwa: `${repoUrl}/releases/latest`
  });

  useEffect(() => {
    fetch('https://api.github.com/repos/manishag1988/Voyager/releases/latest')
      .then(res => res.json())
      .then(data => {
        if (data.tag_name) setLatestVersion(data.tag_name);
        if (data.assets) {
          const win = data.assets.find(a => 
            a.name.toLowerCase().endsWith('.msi') || 
            a.name.toLowerCase().endsWith('.exe')
          )?.browser_download_url;
          
          const mac = data.assets.find(a => 
            a.name.toLowerCase().endsWith('.dmg') || 
            (a.name.toLowerCase().includes('macos') && a.name.endsWith('.gz'))
          )?.browser_download_url;
          
          const pwa = data.assets.find(a => 
            a.name.toLowerCase().includes('pwa')
          )?.browser_download_url;
          
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
        <div 
          style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '22px', fontWeight: '800', cursor: 'pointer' }}
          onClick={() => setCurrentPage('home')}
        >
          <span>🌍</span> Voyager
        </div>
        <div style={{ display: 'flex', gap: '20px', fontSize: '14px', fontWeight: '600', color: 'rgba(255,255,255,0.7)', alignItems: 'center' }}>
          <button 
            onClick={() => setCurrentPage('features')} 
            style={{ background: 'none', border: 'none', color: currentPage === 'features' ? '#fff' : 'inherit', cursor: 'pointer', fontWeight: '600', fontFamily: 'inherit' }}
          >
            Features
          </button>
          <button 
            onClick={() => setCurrentPage('about')} 
            style={{ background: 'none', border: 'none', color: currentPage === 'about' ? '#fff' : 'inherit', cursor: 'pointer', fontWeight: '600', fontFamily: 'inherit' }}
          >
            About
          </button>
          <a href={repoUrl} target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <svg height="20" width="20" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path></svg>
            GitHub
          </a>
        </div>
      </nav>

      {currentPage === 'home' && (
        <>
          {/* Hero Section */}
          <header style={S.hero}>
            <div style={S.badge}>{latestVersion.toUpperCase()} NOW LIVE</div>
            <h1 style={S.title}>Plan your next <span style={{ color: '#4F8EF7' }}>adventure</span> with confidence.</h1>
            <p style={S.subtitle}>The offline-first travel companion for smart itineraries, budget tracking, and secure document storage. No cloud, no tracking, just you and the road.</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap' }}>
              <button onClick={onLaunch} style={S.btnPrimary}>Launch App (PWA)</button>
              <a href="#download" style={{ ...S.btnSecondary, textDecoration: 'none' }}>Download for Desktop</a>
            </div>
          </header>

          {/* Features Preview */}
          <section id="features" style={{ padding: '100px 20px', maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{ textAlign: 'center', fontSize: '40px', marginBottom: '60px' }}>Everything you need to roam.</h2>
            <div style={S.grid}>
              <div style={S.card}>
                <div style={{ fontSize: '40px', marginBottom: '20px' }}>🗺️</div>
                <h3>Smart Itineraries</h3>
                <p style={{ color: 'rgba(255,255,255,0.6)' }}>Organize your days, flights, and stays in one beautiful, offline-ready timeline.</p>
              </div>
              <div style={S.card}>
                <div style={{ fontSize: '40px', marginBottom: '20px' }}>💰</div>
                <h3>Budget Tracking</h3>
                <p style={{ color: 'rgba(255,255,255,0.6)' }}>Keep an eye on expenses with multi-currency support and categorical breakdowns.</p>
              </div>
              <div style={S.card}>
                <div style={{ fontSize: '40px', marginBottom: '20px' }}>🔐</div>
                <h3>Vault Security</h3>
                <p style={{ color: 'rgba(255,255,255,0.6)' }}>Store your passport copies and bookings locally on your device. No cloud leaks.</p>
              </div>
            </div>
            <div style={{ textAlign: 'center', marginTop: '40px' }}>
              <button onClick={() => setCurrentPage('features')} style={{ ...S.btnSecondary, border: 'none', background: 'rgba(255,255,255,0.1)' }}>View All Features →</button>
            </div>
          </section>

          {/* Pricing Section */}
          <section id="pricing" style={{ padding: '100px 20px', background: 'rgba(0,0,0,0.2)' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
              <h2 style={{ fontSize: '40px', marginBottom: '60px' }}>One price. Unlimited travel.</h2>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
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
            </div>
          </section>

          {/* Download Section */}
          <section id="download" style={{ padding: '100px 20px', maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontSize: '40px', marginBottom: '60px' }}>Take Voyager with you.</h2>
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
                <button onClick={onLaunch} style={{ ...S.btnPrimary, width: '100%', marginLeft: 0 }}>Launch Web App</button>
              </div>
            </div>
          </section>
        </>
      )}

      {currentPage === 'features' && <FeaturesView />}
      {currentPage === 'about' && <AboutView />}

      {/* Footer */}
      <footer style={{ padding: '60px 20px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>
        <p>© 2026 Voyager Travel App. Built for explorers.</p>
        <p style={{ marginTop: '10px' }}>Support: manishag1988@gmail.com</p>
      </footer>
    </div>
  );
}

function FeaturesView() {
  const features = [
    { title: "Offline First", icon: "📡", desc: "No internet? No problem. All your maps, itineraries, and bookings are stored locally on your device for instant access in remote locations." },
    { title: "Smart Itinerary", icon: "📅", desc: "Drag and drop events to organize your days. Automatically calculates travel times and keeps your schedule organized." },
    { title: "Expense Manager", icon: "💰", desc: "Track spending in any currency. Auto-convert based on local rates and see exactly where your budget is going." },
    { title: "Document Vault", icon: "🔐", desc: "Securely store encrypted copies of your passport, visas, and insurance. Access them instantly without an internet connection." },
    { title: "Packing Lists", icon: "🎒", desc: "Intelligent packing lists that remember what you need for different types of trips (Beach vs. Mountain)." },
    { title: "Platform Sync", icon: "🔄", desc: "Available on Windows, macOS, and as a PWA for your mobile device. Your data stays with you across all your hardware." },
  ];

  return (
    <div style={{ padding: '120px 20px', maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '48px', fontWeight: '800', textAlign: 'center', marginBottom: '20px' }}>Powerful features for <br/><span style={{ color: '#4F8EF7' }}>smart travellers.</span></h1>
      <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', fontSize: '18px', marginBottom: '80px' }}>Everything you need to plan, track, and enjoy your journey.</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
        {features.map(f => (
          <div key={f.title} style={{ ...S.card, textAlign: 'left', padding: '40px' }}>
            <div style={{ fontSize: '40px', marginBottom: '20px' }}>{f.icon}</div>
            <h3 style={{ fontSize: '22px', marginBottom: '15px' }}>{f.title}</h3>
            <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: '1.6' }}>{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function AboutView() {
  return (
    <div style={{ padding: '120px 20px', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
      <h1 style={{ fontSize: '48px', fontWeight: '800', marginBottom: '40px' }}>About Voyager</h1>
      <div style={{ ...S.card, padding: '60px', textAlign: 'left', lineHeight: '1.8', fontSize: '18px', color: 'rgba(255,255,255,0.8)' }}>
        <p style={{ marginBottom: '20px' }}>
          Voyager was born out of a simple frustration: travel apps that stop working the moment you lose signal in a foreign country. 
        </p>
        <p style={{ marginBottom: '20px' }}>
          We believe that your travel data should belong to you. That's why Voyager is designed from the ground up as an <strong>offline-first, privacy-centric</strong> application. We don't store your trips on our servers, and we don't track your movements.
        </p>
        <p style={{ marginBottom: '20px' }}>
          Whether you're backpacking through Southeast Asia or planning a business trip to London, Voyager is your reliable companion that stays with you, even when the internet doesn't.
        </p>
        <div style={{ marginTop: '40px', paddingTop: '40px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <h3 style={{ color: '#fff', marginBottom: '10px' }}>Our Mission</h3>
          <p>To empower travelers with secure, reliable, and beautiful tools that work anywhere on Earth.</p>
        </div>
      </div>
    </div>
  );
}
