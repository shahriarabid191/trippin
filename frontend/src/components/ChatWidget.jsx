import { useState, useRef, useEffect } from 'react';
import { sendChatMessage } from '../api/chatAPI';
import './ChatWidget.css';

const GREETING = {
  role: 'model',
  text: "Hi! I'm the Trippin assistant. Ask me about itineraries, bookings, the travel vault, or any other feature on the site."
};

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([GREETING]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open, loading]);

  const handleSend = async (e) => {
    e.preventDefault();

    const text = input.trim();
    if (!text || loading) return;

    const history = messages
      .filter(m => m !== GREETING)
      .map(m => ({ role: m.role, text: m.text }));

    const nextMessages = [...messages, { role: 'user', text }];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const { reply } = await sendChatMessage(text, history);
      setMessages(prev => [...prev, { role: 'model', text: reply }]);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-widget">
      {open && (
        <div className="chat-panel">
          <div className="chat-panel-header">
            <div className="chat-panel-title">
              <span className="material-symbols-outlined">smart_toy</span>
              Trippin Assistant
            </div>
            <button
              className="chat-icon-btn"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className="chat-panel-body" ref={scrollRef}>
            {messages.map((m, i) => (
              <div key={i} className={`chat-bubble chat-bubble-${m.role}`}>
                {m.text}
              </div>
            ))}
            {loading && (
              <div className="chat-bubble chat-bubble-model chat-bubble-typing">
                <span></span><span></span><span></span>
              </div>
            )}
            {error && <div className="chat-error">{error}</div>}
          </div>

          <form className="chat-panel-input" onSubmit={handleSend}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about Trippin..."
              disabled={loading}
            />
            <button type="submit" className="chat-icon-btn chat-send-btn" disabled={loading || !input.trim()} aria-label="Send message">
              <span className="material-symbols-outlined">send</span>
            </button>
          </form>
        </div>
      )}

      <button
        className="chat-fab"
        onClick={() => setOpen(o => !o)}
        aria-label={open ? 'Close chat' : 'Open chat'}
      >
        <span className="material-symbols-outlined">{open ? 'close' : 'chat'}</span>
      </button>
    </div>
  );
}
