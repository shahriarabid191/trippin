import { useState, useEffect, useRef, useContext, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getMessages, sendMessage, toggleReaction } from '../api/buddyChatAPI';
import './BuddyChat.css';

const REACTIONS = ['👍', '❤️', '😂', '😮', '😢'];
const POLL_INTERVAL = 3000;


function formatTime(ts) {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDateLabel(ts) {
    const d     = new Date(ts);
    const today = new Date();
    const diff  = today.setHours(0, 0, 0, 0) - d.setHours(0, 0, 0, 0);
    if (diff === 0) return 'Today';
    if (diff === 86400000) return 'Yesterday';
    return new Date(ts).toLocaleDateString();
}

/**
 * Build a map: { emoji: { count, mine } }
 * Since it's now one reaction per user, counts reflect how many users picked each emoji.
 */
function aggregateReactions(rawReactions, myId) {
    const map = {};
    for (const r of rawReactions) {
        if (!map[r.emoji]) map[r.emoji] = { count: 0, mine: false };
        map[r.emoji].count += 1;
        if (r.user_id === myId) map[r.emoji].mine = true;
    }
    return map;
}


export default function BuddyChat({ buddy, onClose }) {

    const { user }                = useContext(AuthContext);
    const [messages, setMessages] = useState([]);
    const [input,    setInput]    = useState('');
    const [sending,  setSending]  = useState(false);
    const [error,    setError]    = useState(null);
    const scrollRef               = useRef(null);
    const pollRef                 = useRef(null);
    const textareaRef             = useRef(null);


    /* ── Hide AI chatbot FAB while buddy chat is open ─────────── */
    useEffect(() => {
        document.body.classList.add('buddy-chat-open');
        return () => document.body.classList.remove('buddy-chat-open');
    }, []);


    /* ── Fetch messages ───────────────────────────────────────── */
    const fetchMsgs = useCallback(async () => {
        try {
            const msgs = await getMessages(buddy.buddy_id);
            setMessages(msgs);
        } catch (e) {
            console.error('Poll error:', e);
        }
    }, [buddy.buddy_id]);


    /* ── Initial load + polling ───────────────────────────────── */
    useEffect(() => {
        fetchMsgs();
        pollRef.current = setInterval(fetchMsgs, POLL_INTERVAL);
        return () => clearInterval(pollRef.current);
    }, [fetchMsgs]);


    /* ── Scroll to bottom when messages change ────────────────── */
    useEffect(() => {
        if (scrollRef.current)
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages]);


    /* ── Auto-resize textarea ─────────────────────────────────── */
    useEffect(() => {
        const el = textareaRef.current;
        if (!el) return;
        el.style.height = 'auto';
        el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
    }, [input]);


    /* ── Send ─────────────────────────────────────────────────── */
    async function handleSend(e) {
        e.preventDefault();
        const body = input.trim();
        if (!body || sending) return;
        setSending(true);
        setError(null);
        try {
            const msg = await sendMessage(buddy.buddy_id, body);
            setMessages(prev => [...prev, { ...msg, reactions: [] }]);
            setInput('');
        } catch (err) {
            setError(err.message || 'Failed to send message');
        } finally {
            setSending(false);
        }
    }

    function handleKeyDown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend(e);
        }
    }


    /* ── React / unreact / swap ───────────────────────────────── */
    async function handleReact(messageId, emoji) {
        try {
            await toggleReaction(messageId, emoji);
            const msgs = await getMessages(buddy.buddy_id);
            setMessages(msgs);
        } catch (err) {
            console.error('Reaction error:', err);
        }
    }


    /* ── Render a single message ──────────────────────────────── */
    function renderMessage(msg) {

        const isMe      = msg.sender_id === user?.id;
        const reactions = aggregateReactions(msg.reactions || [], user?.id);
        const hasAny    = Object.keys(reactions).length > 0;
        // Find which emoji (if any) this user reacted with
        const myEmoji   = Object.entries(reactions).find(([, v]) => v.mine)?.[0] ?? null;

        return (
            <div
                key={msg.id}
                className={`buddy-chat-msg-row ${isMe ? 'mine' : 'theirs'}`}
            >
                {/* Bubble + overlay badge wrapper */}
                <div className="buddy-chat-bubble-wrap">

                    <div className="buddy-chat-bubble">{msg.body}</div>

                    {/* ─── Reaction badge: always visible when there are reactions ─── */}
                    {hasAny && (
                        <div className="buddy-chat-badge">
                            {Object.entries(reactions).map(([emoji, info]) => (
                                <button
                                    key={emoji}
                                    className={`buddy-chat-badge-btn${info.mine ? ' badge-mine' : ''}`}
                                    onClick={() => handleReact(msg.id, emoji)}
                                    title={info.mine ? 'Remove reaction' : `React with ${emoji}`}
                                >
                                    {emoji}
                                    {info.count > 1 && (
                                        <span className="buddy-chat-badge-count">{info.count}</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* ─── Hover picker: 5 emojis, only on hover ─── */}
                    <div className="buddy-chat-picker">
                        {REACTIONS.map(emoji => (
                            <button
                                key={emoji}
                                className={`buddy-chat-pick-btn${myEmoji === emoji ? ' pick-active' : ''}`}
                                onClick={() => handleReact(msg.id, emoji)}
                                title={myEmoji === emoji ? 'Remove' : emoji}
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>

                </div>

                <div className="buddy-chat-time">{formatTime(msg.created_at)}</div>
            </div>
        );
    }


    /* ── Render all messages ──────────────────────────────────── */
    function renderMessages() {

        if (messages.length === 0) {
            return (
                <div className="buddy-chat-empty">
                    <div className="buddy-chat-empty-icon">💬</div>
                    <p>No messages yet.<br />Say hello to <strong>{buddy.username}</strong>!</p>
                </div>
            );
        }

        const items   = [];
        let lastDate  = null;

        for (const msg of messages) {
            const label = formatDateLabel(msg.created_at);
            if (label !== lastDate) {
                lastDate = label;
                items.push(
                    <div key={`sep-${msg.id}`} className="buddy-chat-date-sep">{label}</div>
                );
            }
            items.push(renderMessage(msg));
        }

        return items;
    }


    return (
        <div className="buddy-chat-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="buddy-chat-panel">

                {/* Header */}
                <div className="buddy-chat-header">
                    <div className="buddy-chat-avatar">
                        {buddy.username?.[0]?.toUpperCase() ?? '?'}
                    </div>
                    <div className="buddy-chat-header-info">
                        <div className="buddy-chat-header-name">{buddy.username}</div>
                        <div className="buddy-chat-header-status">Travel Buddy</div>
                    </div>
                    <button className="buddy-chat-close-btn" onClick={onClose} aria-label="Close chat">✕</button>
                </div>

                {/* Messages */}
                <div className="buddy-chat-messages" ref={scrollRef}>
                    {renderMessages()}
                </div>

                {error && <div className="buddy-chat-error">{error}</div>}

                {/* Input */}
                <div className="buddy-chat-input-area">
                    <form className="buddy-chat-form" onSubmit={handleSend}>
                        <textarea
                            ref={textareaRef}
                            className="buddy-chat-input"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={`Message ${buddy.username}…`}
                            rows={1}
                            disabled={sending}
                        />
                        <button
                            type="submit"
                            className="buddy-chat-send-btn"
                            disabled={!input.trim() || sending}
                            aria-label="Send"
                        >
                            ➤
                        </button>
                    </form>
                </div>

            </div>
        </div>
    );
}
