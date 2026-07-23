import { useState, useRef, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import SplitText from '../components/SplitText';
import OptionCards from '../components/OptionCards';
import itineraryQuestions from '../data/itineraryQuestions';
import itineraryPlaces from '../data/itineraryPlaces';
import { generateItinerary, getDraftItinerary, discardDraftItinerary } from '../api/itineraryAPI';
import { AuthContext } from '../context/AuthContext';
import './Itinerary.css';

const DRAFT_STORAGE_KEY = 'trippin_itinerary_draft';

const PLACE_KEY_BY_NAME = {
  Dhaka: 'dhaka',
  Sylhet: 'sylhet',
  "Cox's Bazar": 'coxsbazar',
  Bandarban: 'bandarban',
  'Sajek Valley': 'sajek',
  Sundarbans: 'sundarbans',
  Rangamati: 'rangamati',
  Comilla: 'comilla'
};

export default function Itinerary() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useContext(AuthContext);

  // 'checking' | 'intro' | 'quiz' | 'loading' | 'result'
  const [viewState, setViewState] = useState('checking');
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const hasChecked = useRef(false);
  const sheetRef = useRef(null);

  // On first load: logged-in users get their saved draft from the DB,
  // guests get whatever survived in this tab's sessionStorage.
  useEffect(() => {
    if (authLoading || hasChecked.current) return;
    hasChecked.current = true;

    (async () => {
      if (user) {
        try {
          const data = await getDraftItinerary();
          if (data?.draft) {
            setResult(data.draft);
            setViewState('result');
            return;
          }
        } catch (err) {
          console.error(err);
        }
      } else {
        const stored = sessionStorage.getItem(DRAFT_STORAGE_KEY);
        if (stored) {
          try {
            setResult(JSON.parse(stored));
            setViewState('result');
            return;
          } catch (err) {
            sessionStorage.removeItem(DRAFT_STORAGE_KEY);
          }
        }
      }
      setViewState('intro');
    })();
  }, [user, authLoading]);

  const currentQuestion = itineraryQuestions[step];
  const selectedIndex = currentQuestion ? currentQuestion.options.indexOf(answers[currentQuestion.key]) : -1;
  const isLastStep = step === itineraryQuestions.length - 1;

  function handleSelectOption(index) {
    setAnswers(prev => ({ ...prev, [currentQuestion.key]: currentQuestion.options[index] }));
  }

  function handleBack() {
    setError(null);
    setStep(s => Math.max(0, s - 1));
  }

  async function handleNext() {
    if (!answers[currentQuestion.key]) return;

    if (!isLastStep) {
      setStep(s => s + 1);
      return;
    }

    setViewState('loading');
    setError(null);

    try {
      const data = await generateItinerary(answers);
      setResult(data);
      if (!user) {
        sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(data));
      }
      setViewState('result');
    } catch (err) {
      setError(err.message || 'Something went wrong building your itinerary. Please try again.');
      setViewState('quiz');
    }
  }

  async function resetToIntro() {
    if (user) {
      try {
        await discardDraftItinerary();
      } catch (err) {
        console.error(err);
      }
    } else {
      sessionStorage.removeItem(DRAFT_STORAGE_KEY);
    }

    setResult(null);
    setAnswers({});
    setStep(0);
    setError(null);
    setViewState('intro');
  }

  async function handleSavePdf() {
    if (!sheetRef.current || saving) return;

    setSaving(true);

    try {
      const canvas = await html2canvas(sheetRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save('trippin-itinerary.pdf');
      await resetToIntro();
    } catch (err) {
      console.error(err);
      setError('Could not save the PDF. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="page">
      <main className="subpage-content itinerary-builder">
        {viewState === 'checking' && <div className="itinerary-checking" />}

        {viewState === 'intro' && (
          <div className="itinerary-intro">
            <SplitText
              tag="h1"
              text="Build Your Itinerary Here"
              className="itinerary-hero-text"
              splitType="chars"
              delay={25}
              duration={0.7}
              ease="power3.out"
              from={{ opacity: 0, y: 40 }}
              to={{ opacity: 1, y: 0 }}
              textAlign="center"
            />
            <p className="itinerary-hero-subtitle">
              Answer five quick questions and let Trippin's AI craft a personalized journey across Dhaka, Sylhet, and Cox's Bazar.
            </p>
            <button className="itinerary-cta-btn" onClick={() => setViewState('quiz')}>
              Start Building
            </button>
          </div>
        )}

        {viewState === 'quiz' && currentQuestion && (
          <div className="itinerary-quiz">
            <div className="quiz-progress">
              <div className="quiz-progress-bar">
                <div
                  className="quiz-progress-fill"
                  style={{ width: `${((step + 1) / itineraryQuestions.length) * 100}%` }}
                />
              </div>
              <span className="quiz-step-label">
                Step {step + 1} of {itineraryQuestions.length}
              </span>
            </div>

            <h2 className="quiz-question">{currentQuestion.question}</h2>

            <OptionCards
              options={currentQuestion.options}
              selectedIndex={selectedIndex}
              onSelect={handleSelectOption}
            />

            {error && <p className="quiz-error">{error}</p>}

            <div className="quiz-nav">
              {step > 0 && (
                <button className="quiz-back-btn" onClick={handleBack}>
                  Back
                </button>
              )}
              <button
                className="quiz-next-btn"
                disabled={selectedIndex === -1}
                onClick={handleNext}
              >
                {isLastStep ? 'Build My Itinerary' : 'Next'}
              </button>
            </div>
          </div>
        )}

        {viewState === 'loading' && (
          <div className="itinerary-loading">
            <div className="itinerary-loading-spinner" />
            <p>Crafting your Bangladesh itinerary...</p>
          </div>
        )}

        {viewState === 'result' && result && (
          <div className="itinerary-result">
            <div className="itinerary-a4-sheet" ref={sheetRef}>
              <div className="a4-header">
                <span className="a4-eyebrow">Travel</span>
                <h1>Itinerary</h1>
              </div>

              <div className="a4-fields">
                <div className="a4-field">
                  <span>Destination</span>
                  <strong>Bangladesh</strong>
                </div>
                <div className="a4-field">
                  <span>Duration</span>
                  <strong>{result.content.durationLabel}</strong>
                </div>
                <div className="a4-field">
                  <span>Date</span>
                  <strong>{today}</strong>
                </div>
                <div className="a4-field">
                  <span>Departure</span>
                  <strong>Your Home City</strong>
                </div>
              </div>

              {result.content.legs.map((leg) => {
                const place = itineraryPlaces[PLACE_KEY_BY_NAME[leg.place]];
                if (!place) return null;

                return (
                  <div className="a4-day-block" key={leg.place}>
                    <div className="a4-day-image">
                      <img src={place.image} alt={place.name} crossOrigin="anonymous" />
                    </div>
                    <div className="a4-day-content">
                      <h3>
                        {leg.dayRange} &mdash; {place.name.toUpperCase()}
                      </h3>
                      <p className="a4-day-summary">{leg.summary}</p>

                      <div className="a4-slot">
                        <div className="a4-slot-label">
                          <span className="a4-dot" />
                          MORNING
                          <small>({leg.morning.time})</small>
                        </div>
                        <ul>
                          {leg.morning.items.map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="a4-slot">
                        <div className="a4-slot-label">
                          <span className="a4-dot" />
                          AFTERNOON
                          <small>({leg.afternoon.time})</small>
                        </div>
                        <ul>
                          {leg.afternoon.items.map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {error && <p className="quiz-error">{error}</p>}

            <div className="itinerary-result-actions">
              <button className="itinerary-discard-btn" onClick={resetToIntro} disabled={saving}>
                Discard
              </button>
              <button className="itinerary-save-btn" onClick={handleSavePdf} disabled={saving}>
                {saving ? 'Saving...' : 'Save as PDF'}
              </button>
            </div>
          </div>
        )}
      </main>

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
    </div>
  );
}
