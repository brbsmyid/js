/**
 * ==========================================
 * PROPERTI LORD - LICENSE & UPDATE SYSTEM
 * ==========================================
 * File: link.js
 * Version: 2.0.0 (Multi-Domain + Update)
 */
(function() {
    "use strict";

    // ──────────────────────────────────────
    // LICENSE CONFIGURATION (Base64 Encoded)
    // ──────────────────────────────────────
    const _cfg = {
        // Encode: btoa(JSON.stringify(['domain1.com','domain2.com']))
        domains: "WyJoZC1kcml2ZS5ibG9nc3BvdC5jbyJd",
        validKey: "UFJPUC1MT1JELTIwMjYtVjMtMUQ1NjZCOEQ=",
        storageKey: "cGxfbGljZW5zZV92ZXJpZmllZA==",
        version: "MS4wLjE=",
        // Update endpoint (Base64)
        updateEndpoint: "aHR0cHM6Ly9yYXdjZG4uZ2l0aGFjay5jb20vYnJic215aWQvanMvcmVmcy9oZWFkcy9tYXN0ZXIvdXBkYXRldmVyc2lvbi5qc29u"
    };

    // ──────────────────────────────────────
    // HELPER FUNCTIONS
    // ──────────────────────────────────────
    const _dec = (s) => { try { return atob(s); } catch(e) { return null; } };
    
    const _hash = (str) => {
        let h = 0;
        for(let i = 0; i < str.length; i++) {
            h = Math.imul(31, h) + str.charCodeAt(i) | 0;
        }
        return Math.abs(h).toString(16).substring(0, 8).toUpperCase();
    };

    // ──────────────────────────────────────
    // VERIFY DOMAIN (Multi-Domain Support)
    // ──────────────────────────────────────
    const _verifyDomain = () => {
        try {
            const domains = JSON.parse(_dec(_cfg.domains));
            const host = window.location.hostname.replace(/^www\./, '');
            return domains.some(d => d.replace(/^www\./, '') === host || d === window.location.hostname);
        } catch(e) { return false; }
    };

    // ──────────────────────────────────────
    // VERIFY LICENSE KEY
    // ──────────────────────────────────────
    const _verifyKey = (key) => {
        const expected = _dec(_cfg.validKey);
        if(!key || !expected) return false;
        const pattern = /^PROP-LORD-\d{4}-V\d+-[A-F0-9]{8}$/i;
        if(!pattern.test(key.trim())) return false;
        const keyParts = key.trim().split('-');
        const providedHash = keyParts.pop();
        const baseString = keyParts.join('-') + _dec(_cfg.domains);
        const expectedHash = _hash(baseString).toUpperCase();
        return providedHash.toUpperCase() === expectedHash;
    };

    // ──────────────────────────────────────
    // SHOW LICENSE WARNING
    // ──────────────────────────────────────
    const _showLicenseWarning = (reason) => {
        if(document.getElementById('license-warning-overlay')) return;
        
        const overlay = document.createElement('div');
        overlay.id = 'license-warning-overlay';
        overlay.style.cssText = `
            position:fixed;top:0;left:0;width:100%;height:100%;
            background:rgba(10,10,20,0.98);z-index:9999999;
            display:flex;align-items:center;justify-content:center;
            padding:20px;font-family:system-ui,sans-serif;
        `;
        overlay.innerHTML = `
            <div style="
                background:linear-gradient(145deg,#1e1e2e,#252538);
                color:#fff;padding:30px;border-radius:20px;
                max-width:520px;text-align:center;
                border:2px solid #ffd700;
                box-shadow:0 20px 60px rgba(255,215,0,0.2);
            ">
                <div style="font-size:56px;margin-bottom:15px;">🔐</div>
                <h3 style="margin:0 0 10px;color:#ffd700;font-size:22px;font-weight:800;">
                    License Verification Failed
                </h3>
                <p style="margin:0 0 20px;color:#aaa;font-size:14px;line-height:1.6;">
                    ${reason === 'domain' ? 'Domain tidak terdaftar dalam lisensi multi-domain.' : 
                      reason === 'key' ? 'License key tidak valid atau telah kedaluwarsa.' : 
                      'Verifikasi lisensi gagal.'}
                </p>
                <div style="
                    background:#16213e;padding:15px;border-radius:12px;
                    margin-bottom:20px;font-size:12px;color:#888;
                    text-align:left;
                ">
                    <div style="margin-bottom:8px;">
                        🌐 Domain: <strong style="color:#fff;">${window.location.hostname}</strong>
                    </div>
                    <div>
                        🔑 Status: <strong style="color:#c62828;">INVALID</strong>
                    </div>
                </div>
                <a href="https://instagram.com/punyakiply_" target="_blank" style="
                    display:inline-block;background:linear-gradient(135deg,#ffd700,#ffc107);
                    color:#000;padding:14px 32px;border-radius:12px;
                    text-decoration:none;font-weight:700;font-size:14px;
                    transition:0.3s;
                ">Aktifkan Lisensi</a>
                <p style="margin:20px 0 0;font-size:11px;color:#555;">
                    Template: Properti Lord v${_dec(_cfg.version)}
                </p>
            </div>
        `;
        document.body.appendChild(overlay);
        document.body.style.overflow = 'hidden';
        console.log(`[License] Verification failed [${reason}] for: ${window.location.hostname}`);
    };

    // ──────────────────────────────────────
    // CHECK TEMPLATE UPDATE
    // ──────────────────────────────────────
    const _checkUpdate = () => {
        const currentVersion = _dec(_cfg.version);
        const storageKey = 'template_update_dismissed_v';
        const dismissedVersion = localStorage.getItem(storageKey);
        
        if(dismissedVersion === currentVersion) return;
        
        fetch(_dec(_cfg.updateEndpoint), { cache: "no-store" })
            .then(res => res.json())
            .then(data => {
                if(data.version && _compareVersions(data.version, currentVersion) > 0) {
                    _showUpdateNotice(data, currentVersion, storageKey);
                }
            })
            .catch(() => {});
    };

    const _compareVersions = (v1, v2) => {
        const p1 = v1.split('.').map(Number), p2 = v2.split('.').map(Number);
        for(let i = 0; i < Math.max(p1.length, p2.length); i++) {
            const x = p1[i]||0, y = p2[i]||0;
            if(x > y) return 1; if(x < y) return -1;
        }
        return 0;
    };

    const _showUpdateNotice = (data, currentVer, storageKey) => {
        const notice = document.getElementById('templateUpdateNotice');
        if(!notice) return;
        
        const msgEl = document.getElementById('updateNoticeMessage');
        const linkEl = document.getElementById('updateNoticeLink');
        
        if(msgEl) msgEl.textContent = data.message || `Versi ${data.version} tersedia. Perbarui untuk fitur terbaru.`;
        if(linkEl && data.url) linkEl.href = data.url;
        
        const dismiss = () => {
            notice.classList.remove('show');
            localStorage.setItem(storageKey, currentVer);
        };
        
        notice.querySelector('.close-update-notice')?.addEventListener('click', dismiss);
        notice.querySelector('.btn-update-later')?.addEventListener('click', dismiss);
        
        setTimeout(() => notice.classList.add('show'), 1000);
    };

    // ──────────────────────────────────────
    // MAIN VERIFICATION
    // ──────────────────────────────────────
    const _init = () => {
        const storageKey = _dec(_cfg.storageKey);
        const sessionData = sessionStorage.getItem(storageKey);
        
        // Skip if already verified in session
        if(sessionData) {
            try {
                const parsed = JSON.parse(sessionData);
                if(parsed.verified && parsed.key === _dec(_cfg.validKey)) {
                    _checkUpdate(); // Check update after license verified
                    return;
                }
            } catch(e) {}
        }
        
        // Verify domain
        if(!_verifyDomain()) { _showLicenseWarning('domain'); return; }
        
        // Get license key
        const metaKey = document.querySelector('meta[name="license-key"]')?.content;
        const storedKey = localStorage.getItem('pl_license_key');
        const licenseKey = metaKey || storedKey;
        
        // Verify license key
        if(licenseKey && !_verifyKey(licenseKey)) { _showLicenseWarning('key'); return; }
        
        // Mark as verified
        sessionStorage.setItem(storageKey, JSON.stringify({
            verified: true, key: _dec(_cfg.validKey),
            domain: window.location.hostname, timestamp: Date.now()
        }));
        
        console.log(`[License] ✅ Verified for: ${window.location.hostname}`);
        
        // Check for template updates
        _checkUpdate();
    };

    // ──────────────────────────────────────
    // EXECUTE
    // ──────────────────────────────────────
    if(document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', _init);
    } else { _init(); }

})();
