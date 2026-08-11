import { useContext, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { translateImage } from '../api/translateAPI';
import './Translate.css';

export default function Translate() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useContext(AuthContext);
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  function onPickFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
    setError(null);
  }

  function reset() {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handleTranslate() {
    if (!file || loading) return;
    setLoading(true);
    setError(null);
    try {
      const data = await translateImage(file);
      setResult(data);
    } catch (err) {
      setError(err.message || 'Could not translate this image. Try again.');
    } finally {
      setLoading(false);
    }
  }

  const footer = (
    <footer className="footer" style={{ marginTop: '0', minHeight: 'auto', padding: '60px 48px 24px' }}>
      <div className="footer-overlay" />
      <div className="footer-bottom" style={{ marginTop: '0', borderTop: 'none', paddingTop: '0' }}>
        <strong style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>◉ TRIPPIN</strong>
        <div className="footer-links">
          <a href="/booking" onClick={(e) => { e.preventDefault(); navigate('/booking'); }}>Booking</a>
          <a href="/itinerary" onClick={(e) => { e.preventDefault(); navigate('/itinerary'); }}>Itinerary</a>
          <a href="/vault" onClick={(e) => { e.preventDefault(); navigate('/vault'); }}>Vault</a>
          <a href="/gallery" onClick={(e) => { e.preventDefault(); navigate('/gallery'); }}>Gallery</a>
        </div>
        <div style={{ width: 80 }} />
      </div>
    </footer>
  );

  if (!authLoading && !user) {
    return (
      <div className="page translate-page">
        <main className="subpage-content translate-content">
          <h2>Image Translation</h2>
          <p className="subpage-subtitle">
            Snap a photo of a sign, menu, or label in another language and get it translated to English.
          </p>
          <div className="translate-login-prompt">
            <span className="material-symbols-outlined">lock</span>
            <p>Sign in to use image translation.</p>
            <button className="translate-login-btn" onClick={() => navigate('/login')}>
              Sign In
            </button>
          </div>
        </main>
        {footer}
      </div>
    );
  }

  return (
    <div className="page translate-page">
      <main className="subpage-content translate-content">
        <h2>Image Translation</h2>
        <p className="subpage-subtitle">
          Snap a photo of a sign, menu, or label in another language and get it translated to English.
        </p>

        <div className="translate-layout">
          <div className="translate-dropzone-card">
            <label className={`translate-dropzone${loading ? ' translate-dropzone-disabled' : ''}`}>
              {preview ? (
                <img src={preview} alt="Selected" />
              ) : (
                <div className="translate-dropzone-empty">
                  <span className="material-symbols-outlined">add_photo_alternate</span>
                  <span>Choose an image</span>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={onPickFile}
                disabled={loading}
                hidden
              />
            </label>

            <div className="translate-actions">
              <button
                className="translate-btn"
                onClick={handleTranslate}
                disabled={!file || loading}
              >
                {loading ? 'Translating...' : 'Translate'}
              </button>
              {(file || result) && (
                <button className="translate-btn-secondary" onClick={reset} disabled={loading}>
                  Start over
                </button>
              )}
            </div>

            {error && <p className="translate-error">{error}</p>}
          </div>

          {loading && (
            <div className="translate-loading-card">
              <div className="translate-spinner" />
              <p>Translating your image...</p>
              <small>This can take a few seconds — please don't leave this page.</small>
            </div>
          )}

          {!loading && result && (
            <div className="translate-result-card">
              <span className="translate-result-lang">{result.detectedLanguage}</span>

              <div className="translate-result-columns">
                <div className="translate-result-block">
                  <span className="translate-result-label">Original text</span>
                  <p>{result.originalText || 'No legible text found.'}</p>
                </div>

                <div className="translate-result-block translate-result-english">
                  <span className="translate-result-label">English translation</span>
                  <p>{result.translatedText || '—'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {footer}
    </div>
  );
}
