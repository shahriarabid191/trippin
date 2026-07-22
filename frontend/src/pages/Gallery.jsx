import { useState, useEffect, useContext, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPublicGallery, toggleLike } from '../api/galleryAPI';
import { AuthContext } from '../context/AuthContext';
import './Gallery.css';

export default function Gallery() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [likeError, setLikeError] = useState(null);

  // Drag-to-pan state for the horizontal photo wall
  const scrollerRef = useRef(null);
  const dragRef = useRef({ down: false, startX: 0, startLeft: 0, moved: false });

  const loadPhotos = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPublicGallery();
      setPhotos(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPhotos();
  }, [loadPhotos]);

  const selectedPhoto = photos.find((p) => p.id === selectedId) || null;

  function onPointerDown(e) {
    const el = scrollerRef.current;
    if (!el) return;
    dragRef.current = { down: true, startX: e.clientX, startLeft: el.scrollLeft, moved: false };
    el.classList.add('grabbing');
  }

  function onPointerMove(e) {
    const el = scrollerRef.current;
    if (!el || !dragRef.current.down) return;
    const dx = e.clientX - dragRef.current.startX;
    if (Math.abs(dx) > 4) dragRef.current.moved = true;
    el.scrollLeft = dragRef.current.startLeft - dx;
  }

  function endDrag() {
    dragRef.current.down = false;
    scrollerRef.current?.classList.remove('grabbing');
  }

  function onTileClick(photo) {
    // Ignore the click that ends a drag-pan so panning doesn't open a photo.
    if (dragRef.current.moved) return;
    setSelectedId(photo.id);
    setLikeError(null);
  }

  function closeModal() {
    setSelectedId(null);
    setLikeError(null);
  }

  async function handleHeart() {
    if (!user) {
      setLikeError('Please log in to react to photos.');
      return;
    }
    if (!selectedPhoto) return;
    if (selectedPhoto.isMine) {
      setLikeError("You can't like your own photo.");
      return;
    }

    try {
      const { liked, likeCount } = await toggleLike(selectedPhoto.id);
      setPhotos((prev) =>
        prev.map((p) =>
          p.id === selectedPhoto.id ? { ...p, likedByMe: liked, likeCount } : p
        )
      );
    } catch (err) {
      setLikeError(err.message || 'Could not react. Try again.');
    }
  }

  return (
    <div className="page gallery-page">
      <div className="gallery-topbar">
        <div>
          <h2>Photo Gallery</h2>
          <p>Moments shared by fellow travelers — drag to explore, tap a photo for its story.</p>
        </div>
      </div>

      {loading ? (
        <div className="gallery-state">
          <div className="gallery-spinner" />
          <p>Loading the gallery...</p>
        </div>
      ) : photos.length === 0 ? (
        <div className="gallery-state gallery-empty">
          <span className="material-symbols-outlined">photo_library</span>
          <h3>No public photos yet</h3>
          <p>Be the first to share a memory from your travels.</p>
          <button className="gallery-add-cta" onClick={() => navigate('/my-gallery')}>
            Go to My Gallery
          </button>
        </div>
      ) : (
        <div
          className="photowall-viewport"
          ref={scrollerRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerLeave={endDrag}
        >
          <div className="photowall">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="photowall-tile"
                onClick={() => onTileClick(photo)}
              >
                <img src={photo.url} alt={photo.caption || 'Gallery photo'} draggable={false} />
                <div className="photowall-tile-overlay">
                  {photo.caption && <p className="photowall-tile-caption">{photo.caption}</p>}
                  <div className="photowall-tile-foot">
                    <span className="photowall-tile-user">@{photo.uploader}</span>
                    <span className="photowall-tile-likes">
                      <span
                        className="material-symbols-outlined"
                        style={{ fontVariationSettings: photo.likedByMe ? "'FILL' 1" : "'FILL' 0" }}
                      >
                        favorite
                      </span>
                      {photo.likeCount}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedPhoto && (
        <div className="gphoto-modal" onClick={closeModal}>
          <div className="gphoto-card" onClick={(e) => e.stopPropagation()}>
            <button className="gphoto-close" onClick={closeModal} aria-label="Close">
              <span className="material-symbols-outlined">close</span>
            </button>

            <div className="gphoto-image">
              <img src={selectedPhoto.url} alt={selectedPhoto.caption || 'Gallery photo'} />
            </div>

            <div className="gphoto-body">
              <p className="gphoto-caption">
                {selectedPhoto.caption || <span className="gphoto-nocaption">No caption</span>}
              </p>

              <div className="gphoto-meta">
                <span className="gphoto-uploader">
                  <span className="material-symbols-outlined">account_circle</span>
                  {selectedPhoto.uploader}
                </span>

                <div className="gphoto-like">
                  <span className="gphoto-like-count">{selectedPhoto.likeCount}</span>
                  <button
                    className={`gphoto-heart ${selectedPhoto.likedByMe ? 'liked' : ''}`}
                    onClick={handleHeart}
                    disabled={selectedPhoto.isMine}
                    aria-label={selectedPhoto.likedByMe ? 'Remove heart' : 'Heart this photo'}
                    title={selectedPhoto.isMine ? "You can't like your own photo" : user ? '' : 'Log in to react'}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ fontVariationSettings: selectedPhoto.likedByMe ? "'FILL' 1" : "'FILL' 0" }}
                    >
                      favorite
                    </span>
                  </button>
                </div>
              </div>

              {likeError && <p className="gphoto-error">{likeError}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
