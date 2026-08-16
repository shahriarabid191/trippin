import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  getComments,
  addComment,
  deleteComment,
  toggleCommentLike
} from '../api/galleryAPI';
import './CommentThread.css';

const BODY_LIMIT = 500;

// "3h ago" style stamps — short enough to sit next to the author name.
function timeAgo(iso) {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

/**
 * The comment thread for one photo — used both in the public Gallery modal
 * and in the My Gallery floating bubble.
 *
 * photoId       which photo's comments to show
 * canPost       whether the viewer is signed in (guests read only)
 * canModerate   true on your own photos, so you can remove any comment
 * onCountChange called with the new total whenever a comment is added/removed
 */
export default function CommentThread({ photoId, canPost, canModerate, onCountChange }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [draft, setDraft] = useState('');
  const [replyTo, setReplyTo] = useState(null); // { id, author }
  const [sending, setSending] = useState(false);

  const inputRef = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setComments(await getComments(photoId));
    } catch (err) {
      setError(err.message || 'Could not load comments');
    } finally {
      setLoading(false);
    }
  }, [photoId]);

  useEffect(() => {
    load();
    // Switching photos abandons whatever reply was half-written.
    setDraft('');
    setReplyTo(null);
  }, [load]);

  // Flat rows -> top-level comments each carrying their replies, oldest first.
  const threads = useMemo(() => {
    const roots = comments.filter((c) => !c.parentId);
    return roots.map((root) => ({
      ...root,
      replies: comments.filter((c) => c.parentId === root.id)
    }));
  }, [comments]);

  function startReply(comment) {
    setReplyTo({ id: comment.id, author: comment.author });
    // Tag the person being answered so the reply reads "@user1 ..." —
    // keep anything already typed after the tag.
    const tag = `@${comment.author} `;
    setDraft((prev) => (prev.startsWith('@') ? tag + prev.replace(/^@\S+\s*/, '') : tag + prev));
    setError(null);
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  function cancelReply() {
    setReplyTo(null);
    setDraft((prev) => prev.replace(/^@\S+\s*/, ''));
  }

  async function handleSend() {
    const body = draft.trim();
    if (!body || sending) return;
    setSending(true);
    setError(null);
    try {
      const created = await addComment(photoId, body.slice(0, BODY_LIMIT), replyTo?.id ?? null);
      setComments((prev) => {
        const next = [...prev, created];
        onCountChange?.(next.length);
        return next;
      });
      setDraft('');
      setReplyTo(null);
    } catch (err) {
      setError(err.message || 'Could not post your comment');
    } finally {
      setSending(false);
    }
  }

  async function handleLike(comment) {
    if (!canPost) {
      setError('Please log in to react to comments.');
      return;
    }
    if (comment.isMine) {
      setError("You can't like your own comment.");
      return;
    }
    try {
      const { liked, likeCount } = await toggleCommentLike(comment.id);
      setComments((prev) =>
        prev.map((c) => (c.id === comment.id ? { ...c, likedByMe: liked, likeCount } : c))
      );
    } catch (err) {
      setError(err.message || 'Could not react. Try again.');
    }
  }

  async function handleDelete(comment) {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await deleteComment(comment.id);
      setComments((prev) => {
        // Deleting a top-level comment cascades to its replies server-side.
        const next = prev.filter((c) => c.id !== comment.id && c.parentId !== comment.id);
        onCountChange?.(next.length);
        return next;
      });
    } catch (err) {
      setError(err.message || 'Could not delete that comment');
    }
  }

  function onKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const renderComment = (comment, isReply) => (
    <div key={comment.id} className={`ct-comment ${isReply ? 'is-reply' : ''}`}>
      <div className="ct-comment-head">
        <span className="ct-author">@{comment.author}</span>
        <span className="ct-time">{timeAgo(comment.createdAt)}</span>
      </div>

      <p className="ct-body">{comment.body}</p>

      <div className="ct-actions">
        {canPost && (
          <button className="ct-reply-btn" onClick={() => startReply(comment)}>
            <span className="material-symbols-outlined">reply</span>
            Reply
          </button>
        )}

        {(comment.isMine || canModerate) && (
          <button
            className="ct-delete-btn"
            onClick={() => handleDelete(comment)}
            title="Delete this comment"
          >
            <span className="material-symbols-outlined">delete</span>
          </button>
        )}

        <div className="ct-like">
          <button
            className={`ct-like-btn ${comment.likedByMe ? 'liked' : ''}`}
            onClick={() => handleLike(comment)}
            disabled={comment.isMine}
            title={comment.isMine ? "You can't like your own comment" : 'Like this comment'}
            aria-label={comment.likedByMe ? 'Remove like' : 'Like this comment'}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontVariationSettings: comment.likedByMe ? "'FILL' 1" : "'FILL' 0" }}
            >
              favorite
            </span>
          </button>
          <span className="ct-like-count">{comment.likeCount}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="ct-root">
      <div className="ct-list">
        {loading ? (
          <div className="ct-state">
            <div className="gallery-spinner" />
          </div>
        ) : threads.length === 0 ? (
          <div className="ct-state ct-empty">
            <span className="material-symbols-outlined">chat_bubble</span>
            <p>No comments yet</p>
            <small>{canPost ? 'Be the first to say something.' : 'Log in to join the conversation.'}</small>
          </div>
        ) : (
          threads.map((thread) => (
            <div key={thread.id} className="ct-thread">
              {renderComment(thread, false)}
              {thread.replies.map((reply) => renderComment(reply, true))}
            </div>
          ))
        )}
      </div>

      {error && <p className="ct-error">{error}</p>}

      {canPost ? (
        <div className="ct-composer">
          {replyTo && (
            <div className="ct-replying">
              <span>
                Replying to <strong>@{replyTo.author}</strong>
              </span>
              <button onClick={cancelReply} aria-label="Cancel reply">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
          )}

          <div className="ct-input-row">
            <textarea
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onKeyDown}
              maxLength={BODY_LIMIT}
              placeholder={replyTo ? 'Write your reply...' : 'Add a comment...'}
              rows={1}
            />
            <button
              className="ct-send"
              onClick={handleSend}
              disabled={!draft.trim() || sending}
              aria-label="Post comment"
            >
              <span className="material-symbols-outlined">send</span>
            </button>
          </div>
        </div>
      ) : (
        <p className="ct-guest">Log in to comment on this photo.</p>
      )}
    </div>
  );
}
