import { useState, useEffect, useContext, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Stack from '../components/Stack';
import { AuthContext } from '../context/AuthContext';
import {
  getMyGallery,
  uploadPhoto,
  deletePhoto,
  setPhotoVisibility
} from '../api/galleryAPI';
import './MyGallery.css';

const CAPTION_LIMIT = 100;

export default function MyGallery() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useContext(AuthContext);

  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  // Upload dialog state
  const [showUpload, setShowUpload] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [caption, setCaption] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const fileInputRef = useRef(null);

  const loadPhotos = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMyGallery();
      setPhotos(data);
    } catch (err) {
      setError(err.message || 'Failed to load your gallery');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (user) loadPhotos();
    else setLoading(false);
  }, [user, authLoading, loadPhotos]);

  // Stack assigns each card an id of (index + 1) in the same order as the
  // photos array, so the front card maps straight back to a photo.
  // Key the cards only on the set of photos (id + url), so flipping a
  // photo's visibility doesn't rebuild the deck and reshuffle it — that
  // reshuffle is what made the public/private toggle look broken.
  const photoSignature = photos.map((p) => `${p.id}:${p.url}`).join('|');
  const cards = useMemo(
    () =>
      photos.map((p) => (
        <img key={p.id} src={p.url} alt={p.caption || 'photo'} className="card-image" />
      )),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [photoSignature]
  );

  const activePhoto = activeId ? photos[activeId - 1] : null;

  const handleActiveCardChange = useCallback((id) => {
    setActiveId(id);
  }, []);

  function resetUploadForm() {
    setFile(null);
    setPreview(null);
    setCaption('');
    setIsPublic(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function onPickFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  async function handleUpload() {
    if (!file || busy) return;
    setBusy(true);
    setError(null);
    try {
      await uploadPhoto({ file, caption: caption.slice(0, CAPTION_LIMIT), isPublic });
      setShowUpload(false);
      resetUploadForm();
      await loadPhotos();
    } catch (err) {
      setError(err.message || 'Upload failed');
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!activePhoto || busy) return;
    if (!window.confirm('Delete this photo? This cannot be undone.')) return;
    setBusy(true);
    setError(null);
    try {
      await deletePhoto(activePhoto.id);
      await loadPhotos();
    } catch (err) {
      setError(err.message || 'Failed to delete');
    } finally {
      setBusy(false);
    }
  }

  async function handleToggleVisibility() {
    if (!activePhoto || busy) return;
    const next = !activePhoto.isPublic;
    setBusy(true);
    setError(null);
    try {
      await setPhotoVisibility(activePhoto.id, next);
      setPhotos((prev) =>
        prev.map((p) => (p.id === activePhoto.id ? { ...p, isPublic: next } : p))
      );
    } catch (err) {
      setError(err.message || 'Failed to update visibility');
    } finally {
      setBusy(false);
    }
  }

  // Not logged in
  if (!authLoading && !user) {
    return (
      <div className="page">
        <main className="subpage-content mygallery-page">
          <h2>My Gallery</h2>
          <div className="mygallery-login-prompt">
            <span className="material-symbols-outlined">lock</span>
            <p>Log in to build your personal photo gallery.</p>
            <button className="mygallery-login-btn" onClick={() => navigate('/login')}>
              Log In
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="page">
      <main className="subpage-content mygallery-page">
        <h2>My Gallery</h2>
        <p className="subpage-subtitle">
          Your personal photo stack. Add memories, delete them, and choose which ones the world can see.
        </p>

        {loading ? (
          <div className="mygallery-loading">
            <div className="gallery-spinner" />
            <p>Loading your photos...</p>
          </div>
        ) : (
          <div className="mygallery-studio">
            <div className="mygallery-stage">
              {photos.length === 0 ? (
                <div className="mygallery-empty-card">
                  <span className="material-symbols-outlined">add_photo_alternate</span>
                  <p>No photos yet</p>
                  <small>Tap the + to add your first memory</small>
                </div>
              ) : (
                <div className="mygallery-stack-box">
                  <Stack
                    cards={cards}
                    randomRotation
                    sensitivity={180}
                    sendToBackOnClick
                    animationConfig={{ stiffness: 260, damping: 20 }}
                    onActiveCardChange={handleActiveCardChange}
                  />
                </div>
              )}

              {/* Three round control bubbles */}
              <div className="mygallery-bubbles">
                <button
                  className="mygallery-bubble add"
                  onClick={() => setShowUpload(true)}
                  title="Add a photo"
                  disabled={busy}
                >
                  <span className="material-symbols-outlined">add</span>
                </button>

                <button
                  className="mygallery-bubble delete"
                  onClick={handleDelete}
                  title="Delete the top photo"
                  disabled={busy || !activePhoto}
                >
                  <span className="material-symbols-outlined">delete</span>
                </button>

                <button
                  className={`mygallery-bubble visibility ${activePhoto?.isPublic ? 'is-public' : 'is-private'}`}
                  onClick={handleToggleVisibility}
                  title={activePhoto?.isPublic ? 'Public — click to make private' : 'Private — click to make public'}
                  disabled={busy || !activePhoto}
                >
                  <span className="material-symbols-outlined">
                    {activePhoto?.isPublic ? 'public' : 'lock'}
                  </span>
                </button>
              </div>
            </div>

            {/* Active photo details */}
            {activePhoto && (
              <div className="mygallery-active-info">
                <p className="mygallery-active-caption">
                  {activePhoto.caption || <span className="mygallery-nocaption">No caption</span>}
                </p>
                <div className="mygallery-active-badges">
                  <span className={`mygallery-visibility-badge ${activePhoto.isPublic ? 'public' : 'private'}`}>
                    <span className="material-symbols-outlined">
                      {activePhoto.isPublic ? 'public' : 'lock'}
                    </span>
                    {activePhoto.isPublic ? 'Public' : 'Private'}
                  </span>
                  <span className="mygallery-like-badge">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                    {activePhoto.likeCount}
                  </span>
                </div>
                <p className="mygallery-hint">Drag or click the stack to bring another photo to the front.</p>
              </div>
            )}
          </div>
        )}

        {error && <p className="mygallery-error">{error}</p>}
      </main>

      {/* Upload dialog */}
      {showUpload && (
        <div className="mygallery-modal" onClick={() => !busy && setShowUpload(false)}>
          <div className="mygallery-upload-card" onClick={(e) => e.stopPropagation()}>
            <div className="mygallery-upload-head">
              <h3>Add a Photo</h3>
              <button
                className="mygallery-upload-close"
                onClick={() => !busy && setShowUpload(false)}
                aria-label="Close"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <label className="mygallery-dropzone">
              {preview ? (
                <img src={preview} alt="Preview" />
              ) : (
                <div className="mygallery-dropzone-empty">
                  <span className="material-symbols-outlined">image</span>
                  <span>Choose an image</span>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={onPickFile}
                hidden
              />
            </label>

            <div className="mygallery-field">
              <textarea
                placeholder="Add a caption..."
                value={caption}
                maxLength={CAPTION_LIMIT}
                onChange={(e) => setCaption(e.target.value)}
                rows={2}
              />
              <span className="mygallery-counter">
                {caption.length}/{CAPTION_LIMIT}
              </span>
            </div>

            <div className="mygallery-visibility-toggle">
              <span className="mygallery-toggle-label">Visibility</span>
              <div className="mygallery-switch" onClick={() => setIsPublic((v) => !v)}>
                <button className={`mygallery-switch-opt ${!isPublic ? 'active' : ''}`} type="button">
                  <span className="material-symbols-outlined">lock</span> Private
                </button>
                <button className={`mygallery-switch-opt ${isPublic ? 'active' : ''}`} type="button">
                  <span className="material-symbols-outlined">public</span> Public
                </button>
              </div>
            </div>

            <button
              className="mygallery-upload-submit"
              onClick={handleUpload}
              disabled={!file || busy}
            >
              {busy ? 'Uploading...' : 'Add to Gallery'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
