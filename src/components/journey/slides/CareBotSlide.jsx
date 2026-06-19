import { useState, useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import { SendIcon } from '../../Icons';

const CRISIS_WORDS = ['suicide', 'kill myself', 'end my life', 'end it all', 'dont want to live', 'self harm', 'hurt myself'];
const CATEGORIES = [
    { id: 'crisis', words: CRISIS_WORDS },
    { id: 'fear', words: ['scared', 'afraid', 'fear', 'dont want to know', 'worried', 'what if', 'diagnosis', 'test result'] },
    { id: 'cost', words: ['afford', 'money', 'cost', 'expensive', 'bill', 'cant pay'] },
    { id: 'time', words: ['no time', 'busy', 'work', 'schedule'] }
];

const RESPONSES = {
    crisis: [`<b>I hear how heavy this is — and I want you talking to a real person right now.</b> Please call <b>Tele-MANAS at 14416</b>. If you're in danger, call <b>108</b>.`],
    fear: ["That hesitation makes sense. Fear of the answer is one of the most common reasons people wait. Want me to point you to a no-pressure first step?"],
    cost: ["Worrying about the bill is exhausting. Check Ayushman Bharat (PM-JAY) at 14555 before assuming you can't afford care."],
    time: ["This sounds like triage. A phone helpline call is 10 minutes, not a day off. Try National Health Helpline (104)."],
    fallback: ["Thank you for sharing that. It's the hardest part. If you had to name the one thing actually stopping you today, what would it be?"]
};

const quickPrompts = [
    "I think something's wrong but I'm scared to check",
    "I don't want anyone to know",
    "I can't afford a doctor right now",
    "I keep telling myself it's fine"
];

function classify(text) {
    const t = text.toLowerCase();
    for (const cat of CATEGORIES) {
        if (cat.words.some(w => t.includes(w))) return cat.id;
    }
    return 'fallback';
}

export default function CareBotSlide({ goToSlide, openBottomSheet }) {
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const chatBodyRef = useRef(null);
    const botReplyCountRef = useRef(0);
    const bridgeInjectedRef = useRef(false);
    const fallbackIdxRef = useRef(0);
    const initializedRef = useRef(false);

    // Initial bot message
    useEffect(() => {
        if (!initializedRef.current) {
            initializedRef.current = true;
            setMessages([{
                id: Date.now(),
                html: "Hi — I'm CareBot. You don't need to introduce a symptom or a diagnosis. Just tell me what's making this hard to act on, in your own words.",
                who: 'bot'
            }]);
        }
    }, []);

    // Auto-scroll chat
    useEffect(() => {
        if (chatBodyRef.current) {
            chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
        }
    }, [messages]);

    // Animate new messages
    useEffect(() => {
        if (chatBodyRef.current) {
            const lastMsg = chatBodyRef.current.lastElementChild;
            if (lastMsg) {
                gsap.fromTo(lastMsg,
                    { scale: 0.8, opacity: 0, y: 20 },
                    { scale: 1, opacity: 1, y: 0, duration: 0.6, ease: "back.out(1.5)" }
                );
            }
        }
    }, [messages]);

    const addBotReply = useCallback((userText) => {
        const cat = classify(userText);

        // Add typing indicator
        const typingId = Date.now() + 1;
        setMessages(prev => [...prev, { id: typingId, typing: true, who: 'bot' }]);

        setTimeout(() => {
            // Remove typing indicator
            setMessages(prev => prev.filter(m => m.id !== typingId));

            let replyHtml;
            if (cat === 'crisis') {
                replyHtml = RESPONSES.crisis[0];
            } else {
                const arr = RESPONSES[cat] || RESPONSES.fallback;
                replyHtml = cat === 'fallback' ? arr[(fallbackIdxRef.current++) % arr.length] : arr[Math.floor(Math.random() * arr.length)];
            }

            setMessages(prev => [...prev, {
                id: Date.now(),
                html: replyHtml,
                who: cat === 'crisis' ? 'bot crisis' : 'bot',
                customClass: cat === 'crisis' ? 'crisis' : ''
            }]);

            botReplyCountRef.current++;

            if (botReplyCountRef.current >= 3 && !bridgeInjectedRef.current) {
                bridgeInjectedRef.current = true;
                setTimeout(() => {
                    const bridgeHtml = `
                        <div style="text-align:center; padding:10px;">
                            <b style="color:var(--text-color); font-family:'Outfit',sans-serif; font-size:1.1rem; display:block; margin-bottom:8px;">Ready for a real next step?</b>
                            <span class="bridge-cta">Find a Free Clinic Near You →</span>
                        </div>
                    `;
                    setMessages(prev => [...prev, {
                        id: Date.now(),
                        html: bridgeHtml,
                        who: 'bot',
                        customClass: 'bridge-card',
                        hasBridgeCta: true
                    }]);
                }, 1000);
            }
        }, 800);
    }, []);

    const sendMessage = useCallback(() => {
        const val = inputValue.trim();
        if (!val) return;

        setMessages(prev => [...prev, {
            id: Date.now(),
            html: val.replace(/</g, '&lt;'),
            who: 'user'
        }]);
        setInputValue('');
        addBotReply(val);
    }, [inputValue, addBotReply]);

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') sendMessage();
    };

    const handleQuickReply = (q) => {
        setInputValue(q);
        // Use setTimeout to ensure state is updated before sending
        setTimeout(() => {
            setMessages(prev => [...prev, {
                id: Date.now(),
                html: q.replace(/</g, '&lt;'),
                who: 'user'
            }]);
            setInputValue('');
            addBotReply(q);
        }, 0);
    };

    const handleBridgeClick = (e) => {
        if (e.target.classList.contains('bridge-cta')) {
            openBottomSheet();
        }
    };

    return (
        <div className="chat-container">
            <div className="chat-header">
                <div className="status-indicator"></div>
                <div>
                    <h3 style={{ color: 'var(--text-color)', fontFamily: "'Outfit',sans-serif", fontWeight: 800, letterSpacing: '-0.5px', margin: 0 }}>CareBot</h3>
                    <span className="subtitle" style={{ color: '#64748b', fontSize: '0.8rem' }}>Anonymous &amp; Confidential</span>
                </div>
                <button onClick={() => goToSlide(4)} className="btn-nav" style={{ marginLeft: 'auto', padding: '0.5rem 1.5rem' }}>Take Reality Check &rarr;</button>
            </div>
            <div className="chat-body" id="chat-body" ref={chatBodyRef} onClick={handleBridgeClick}>
                {messages.map(msg => {
                    if (msg.typing) {
                        return (
                            <div key={msg.id} className="message bot-message">
                                <div className="avatar">C</div>
                                <div className="msg-content typing">
                                    <span></span><span></span><span></span>
                                </div>
                            </div>
                        );
                    }
                    const isUser = msg.who.includes('user');
                    const isCrisis = msg.who.includes('crisis');
                    return (
                        <div key={msg.id} className={`message ${isUser ? 'user-message' : 'bot-message'}`}>
                            <div className="avatar">{isUser ? 'U' : 'C'}</div>
                            <div className={`msg-content ${isCrisis ? 'crisis' : ''} ${msg.customClass || ''}`}>
                                <p dangerouslySetInnerHTML={{ __html: msg.html }}></p>
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="chat-input-area" style={{ flexDirection: 'column', gap: '0.5rem' }}>
                <div className="quick-replies">
                    {quickPrompts.map((q, i) => (
                        <button key={i} onClick={() => handleQuickReply(q)}>{q}</button>
                    ))}
                </div>
                <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
                    <input
                        type="text"
                        id="chat-input"
                        placeholder="Type what's on your mind..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        style={{ background: 'var(--bg-color)', color: 'var(--text-color)' }}
                    />
                    <button onClick={sendMessage} className="btn-send">
                        <SendIcon />
                    </button>
                </div>
            </div>
        </div>
    );
}
