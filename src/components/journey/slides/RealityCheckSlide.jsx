import { useState, useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';

const rcQuestions = [
    { q: "How long has this symptom or concern been bothering you?", opts: ["Just started", "A few weeks", "Months", "Years"] },
    { q: "How frequently does it occupy your thoughts?", opts: ["Rarely", "A few times a week", "Every single day"] },
    { q: "Is it actively stopping you from doing things you normally do?", opts: ["No", "Sometimes", "Yes, significantly"] },
    { q: "Have you Googled your symptoms multiple times?", opts: ["No", "Once or twice", "Yes, it's a rabbit hole"] },
    { q: "Has someone close to you noticed or asked about it?", opts: ["No", "They've hinted at it", "Yes, they asked directly"] }
];

export default function RealityCheckSlide({ goToSlide }) {
    const [visibleQuestions, setVisibleQuestions] = useState([0]);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [showResult, setShowResult] = useState(false);
    const meterFillRef = useRef(null);
    const meterTextRef = useRef(null);
    const questionRefs = useRef([]);
    const resultRef = useRef(null);
    const containerRef = useRef(null);

    const scrollToElement = useCallback((el) => {
        if (!el) return;
        // Find the parent .slide which is the scrollable container
        const slideEl = el.closest('.slide');
        if (slideEl) {
            const elRect = el.getBoundingClientRect();
            const slideRect = slideEl.getBoundingClientRect();
            const scrollTop = slideEl.scrollTop + (elRect.top - slideRect.top) - 80;
            slideEl.scrollTo({ top: scrollTop, behavior: 'smooth' });
        }
    }, []);

    const handleOptionClick = (questionIndex, opt) => {
        setSelectedAnswers(prev => ({ ...prev, [questionIndex]: opt }));

        if (questionIndex + 1 < rcQuestions.length) {
            setTimeout(() => {
                setVisibleQuestions(prev => {
                    if (!prev.includes(questionIndex + 1)) {
                        return [...prev, questionIndex + 1];
                    }
                    return prev;
                });
                // Scroll to next question after it appears
                setTimeout(() => {
                    scrollToElement(questionRefs.current[questionIndex + 1]);
                }, 50);
            }, 300);
        } else {
            setTimeout(() => {
                setShowResult(true);
                // Scroll to result after it appears
                setTimeout(() => {
                    scrollToElement(resultRef.current);
                }, 50);
            }, 500);
        }
    };

    useEffect(() => {
        if (showResult) {
            const fillElem = meterFillRef.current;
            const textElem = meterTextRef.current;
            if (fillElem && textElem) {
                void fillElem.offsetWidth;
                fillElem.style.strokeDashoffset = 377 - (0.92 * 377);
                textElem.style.opacity = '1';
            }
        }
    }, [showResult]);

    return (
        <div className="slide-content" ref={containerRef} style={{ maxWidth: '600px', paddingBottom: '6rem' }}>
            <h2>Reality Check</h2>
            <p>A 5-question micro-assessment. No data is stored.</p>

            {/* Progress indicator */}
            <div style={{
                display: 'flex', gap: '6px', justifyContent: 'center', marginBottom: '2rem'
            }}>
                {rcQuestions.map((_, i) => (
                    <div key={i} style={{
                        width: '40px', height: '4px', borderRadius: '2px',
                        background: selectedAnswers[i] !== undefined ? 'var(--accent-color)' : 'var(--border-color)',
                        transition: 'background 0.4s ease'
                    }} />
                ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {rcQuestions.map((item, index) => (
                    <div
                        key={index}
                        ref={el => questionRefs.current[index] = el}
                        className={`rc-question ${visibleQuestions.includes(index) ? 'visible' : ''}`}
                        style={selectedAnswers[index] !== undefined && visibleQuestions.includes(index + 1) ? { opacity: 0.6, transform: 'scale(0.98)', transition: 'opacity 0.4s, transform 0.4s' } : {}}
                    >
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{
                                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
                                background: selectedAnswers[index] !== undefined ? 'var(--accent-color)' : 'var(--border-color)',
                                color: selectedAnswers[index] !== undefined ? 'white' : 'var(--text-color)',
                                fontSize: '0.8rem', fontWeight: 700, transition: 'all 0.3s ease'
                            }}>
                                {selectedAnswers[index] !== undefined ? '✓' : index + 1}
                            </span>
                            {item.q}
                        </h3>
                        <div className="rc-options">
                            {item.opts.map((opt, optIdx) => (
                                <div
                                    key={optIdx}
                                    className={`rc-option ${selectedAnswers[index] === opt ? 'selected' : ''}`}
                                    onClick={() => {
                                        const el = document.querySelector(`[data-rc="${index}-${optIdx}"]`);
                                        if (el) gsap.fromTo(el, { scale: 0.95 }, { scale: 1, duration: 0.4, ease: "elastic.out(1, 0.4)" });
                                        handleOptionClick(index, opt);
                                    }}
                                    data-rc={`${index}-${optIdx}`}
                                >
                                    {opt}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {showResult && (
                <div ref={resultRef} style={{ textAlign: 'center', padding: '2.5rem 2rem', marginTop: '1.5rem', background: 'var(--card-bg)', borderRadius: '20px', border: '1px solid var(--border-color)', boxShadow: '0 15px 40px rgba(0,0,0,0.06)' }}>
                    <div className="svg-meter">
                        <svg width="140" height="140" viewBox="0 0 140 140">
                            <circle cx="70" cy="70" r="60" fill="none" stroke="var(--border-color)" strokeWidth="12" />
                            <circle className="meter-fill" ref={meterFillRef} cx="70" cy="70" r="60" fill="none" stroke="var(--accent-color)" strokeWidth="12" strokeLinecap="round" />
                        </svg>
                        <div className="meter-text" ref={meterTextRef}>94%</div>
                    </div>
                    <h3 style={{ marginTop: '1.5rem', fontFamily: "'Outfit',sans-serif", fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-color)', lineHeight: 1.2 }}>Your concern is medically valid</h3>
                    <p style={{ marginTop: '0.5rem', color: '#475569' }}>Most people with these patterns were advised to consult a doctor. The safest next step is to speak with a professional.</p>
                    <button onClick={() => goToSlide(5)} className="btn-nav" style={{ marginTop: '1rem', width: '100%' }}>See Cost of Waiting</button>
                </div>
            )}
        </div>
    );
}
