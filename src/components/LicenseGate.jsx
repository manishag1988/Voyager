import React, { useState, useEffect } from "react";
import { isAppActivated, validateLicenseKey, saveLicenseLocally, startTrial, getTrialStatus } from "../lib/licensing";

export default function LicenseGate({ children }) {
    const [activated, setActivated] = useState(isAppActivated());
    const [licenseKey, setLicenseKey] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleActivate = async () => {
        if (!licenseKey.trim()) {
            setError("Please enter a valid license key");
            return;
        }

        setLoading(true);
        setError("");

        const response = await validateLicenseKey(licenseKey);

        if (response.valid) {
            saveLicenseLocally(licenseKey);
            setActivated(true);
        } else {
            setError(response.message || "Invalid license key");
        }

        setLoading(false);
    };

    const buyLink = "https://voyager-manish.lemonsqueezy.com/checkout/buy/c69b2362-113d-44f5-93a2-d35fd1fca250";

    if (activated) {
        return <>{children}</>;
    }

    const trial = getTrialStatus();

    const handleStartTrial = () => {
        startTrial();
        setActivated(true);
    };

    // Same styling style used across App.jsx
    const S = {
        input: { background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 10, padding: "12px 14px", color: "#fff", fontSize: 14, outline: "none", width: "100%", boxSizing: "border-box", textAlign: "center", letterSpacing: "1px" },
        btnPrimary: { background: "#4F8EF7", border: "none", borderRadius: 10, padding: "12px 18px", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", width: "100%", marginBottom: 10 },
        btnSecondary: { background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 10, padding: "10px 14px", color: "rgba(255,255,255,0.7)", cursor: "pointer", fontSize: 13, display: "block", width: "100%", textAlign: "center", textDecoration: "none" }
    };

    return (
        <div style={{ minHeight: "100vh", background: "linear-gradient(160deg,#0f2027 0%,#203a43 55%,#2c5364 100%)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
            <div style={{ background: "rgba(15,32,39,0.88)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: "2.5rem 2rem", maxWidth: 400, width: "100%", textAlign: "center", boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🌍</div>
                <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Welcome to Voyager</h1>
                
                {trial.hasStarted && trial.isExpired ? (
                    <p style={{ color: "#F39C12", fontSize: 14, marginBottom: 24, lineHeight: 1.5, fontWeight: 600 }}>
                        Your 7-day free trial has expired. Please enter a license key to continue using Voyager.
                    </p>
                ) : (
                    <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, marginBottom: 24, lineHeight: 1.5 }}>
                        Voyager is a premium travel tracking application. Start your free trial or enter your license key.
                    </p>
                )}

                <div style={{ marginBottom: 20 }}>
                    <input
                        type="text"
                        placeholder="XXXXX-XXXXX-XXXXX-XXXXX"
                        value={licenseKey}
                        onChange={(e) => setLicenseKey(e.target.value.toUpperCase())}
                        style={S.input}
                        disabled={loading}
                    />
                </div>

                {error && (
                    <div style={{ color: "#E74C3C", fontSize: 13, marginBottom: 16, background: "rgba(231,76,60,0.1)", padding: "8px", borderRadius: 6 }}>
                        {error}
                    </div>
                )}

                <button onClick={handleActivate} style={S.btnPrimary} disabled={loading}>
                    {loading ? "Validating..." : "Activate App"}
                </button>

                {!trial.hasStarted && (
                    <button onClick={handleStartTrial} style={{ ...S.btnPrimary, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)" }}>
                        Start 7-Day Free Trial
                    </button>
                )}

                <div style={{ marginTop: 24, paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                    <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, marginBottom: 12 }}>Don't have a license key yet?</div>
                    <a href={buyLink} target="_blank" rel="noreferrer" style={S.btnSecondary}>
                        Purchase Voyager ($19.99)
                    </a>
                </div>

                <div style={{ marginTop: 16, fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
                    Tip: You can use TEST-KEY-123 for local testing.
                </div>
            </div>
        </div>
    );
}
