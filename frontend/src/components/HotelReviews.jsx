import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const API_BASE = 'http://localhost:5050/api/reviews';

// Small presentational row of stars. `value` is filled stars (1-5).
export function StarRow({ value, size = 18 }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center' }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className="material-symbols-outlined"
          style={{ fontSize: size, color: n <= value ? '#ffb300' : '#3a4a5a' }}
        >
          star
        </span>
      ))}
    </span>
  );
}

// Interactive star picker for the form.
function StarPicker({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center' }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className="material-symbols-outlined"
          style={{
            fontSize: 28,
            cursor: 'pointer',
            color: n <= (hover || value) ? '#ffb300' : '#3a4a5a',
            transition: 'color 0.1s ease',
          }}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(n)}
          role="button"
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
        >
          star
        </span>
      ))}
    </span>
  );
}

const formatDate = (ts) => {
  try {
    return new Date(ts).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '';
  }
};

export default function HotelReviews({ hotelId }) {
  const { user } = useContext(AuthContext);

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`${API_BASE}/${hotelId}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to load reviews');
      const data = await res.json();
      setReviews(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading reviews:', err);
      setError('Could not load reviews.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hotelId === undefined || hotelId === null) return;
    setLoading(true);
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotelId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (rating < 1) {
      setError('Please pick a star rating.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          hotel_id: hotelId,
          user_email: user.email,
          rating,
          comment,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit review');

      // Optimistically prepend the new review.
      setReviews((prev) => [data, ...prev]);
      setRating(0);
      setComment('');
    } catch (err) {
      console.error('Error submitting review:', err);
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const avg =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + Number(r.rating), 0) / reviews.length).toFixed(1)
      : null;

  return (
    <section style={{ marginTop: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <h3 style={{ margin: 0, fontSize: '20px', color: '#0c2135' }}>Guest Reviews</h3>
        {avg && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#4f5c69', fontSize: '14px' }}>
            <StarRow value={Math.round(avg)} size={16} />
            {avg} · {reviews.length} review{reviews.length > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Submission form (logged-in users only) */}
      {user ? (
        <form
          onSubmit={handleSubmit}
          style={{
            background: '#0b1e30',
            border: '1px solid #4f5c69',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '20px',
          }}
        >
          <div style={{ marginBottom: '10px' }}>
            <StarPicker value={rating} onChange={setRating} />
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share a few words about your stay..."
            rows={3}
            style={{
              width: '100%',
              boxSizing: 'border-box',
              background: '#08151f',
              border: '1px solid #4f5c69',
              borderRadius: '8px',
              color: '#fff',
              padding: '10px',
              resize: 'vertical',
              fontFamily: 'inherit',
              fontSize: '14px',
            }}
          />
          {error && <p style={{ color: '#ffdad6', fontSize: '13px', margin: '8px 0 0' }}>{error}</p>}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
            <button
              type="submit"
              disabled={submitting}
              style={{
                background: '#fff',
                color: '#0b1e30',
                border: 'none',
                padding: '9px 18px',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.6 : 1,
              }}
            >
              {submitting ? 'Posting...' : 'Post Review'}
            </button>
          </div>
        </form>
      ) : (
        <p style={{ color: '#4f5c69', fontSize: '14px', marginBottom: '20px' }}>
          Log in to leave a review.
        </p>
      )}

      {/* Reviews list */}
      {loading ? (
        <p style={{ color: '#4f5c69' }}>Loading reviews...</p>
      ) : reviews.length === 0 ? (
        <p style={{ color: '#4f5c69' }}>No reviews yet. Be the first to share your experience!</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {reviews.map((r) => (
            <div
              key={r.id}
              style={{
                background: '#0b1e30',
                border: '1px solid #1b2f42',
                borderRadius: '10px',
                padding: '14px 16px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <StarRow value={Number(r.rating)} size={16} />
                <span style={{ color: '#8da2b5', fontSize: '12px' }}>{formatDate(r.created_at)}</span>
              </div>
              {r.comment && <p style={{ margin: '6px 0 8px', color: '#dfeaf3', fontSize: '14px', lineHeight: 1.5 }}>{r.comment}</p>}
              <span style={{ color: '#8da2b5', fontSize: '12px' }}>{r.user_email}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
