import { useState, useRef } from 'react';

const pastelColors = ['#bae6fd', '#bbf7d0', '#e9d5ff', '#fef08a', '#fbcfe8'];

const storiesData = [
    { text: "I kept putting off my checkup because I felt fine. Turns out, catching my high blood pressure early saved me from a major stroke. The hardest part was just making the appointment.", name: "Marcus, 42" },
    { text: "I was terrified of finding out I had diabetes like my father. The anxiety of not knowing was actually worse than the diagnosis. Now, it's totally managed and I feel in control.", name: "Sarah, 35" },
    { text: "I thought taking time off work for tests was a luxury I couldn't afford. But investing that one afternoon gave me peace of mind for the whole year. Worth every second.", name: "David, 50" },
    { text: "As a young guy, I thought I was invincible. Getting a routine blood test felt like something only older people did. Finding out I had a severe vitamin deficiency explained my constant fatigue. I'm literally a new person now.", name: "Leo, 28" },
    { text: "I ignored the mild chest pains because I didn't want to be 'that dramatic person' at the ER. My wife finally forced me to go. It was early stage heart disease. Speaking up saved my life.", name: "James, 55" },
    { text: "I was so embarrassed about my weight that I avoided doctors for five years. When I finally went, the doctor didn't judge me at all—she just gave me a plan. The relief of just facing it was incredible.", name: "Elena, 39" }
];

export default function CommunityWallSlide({ goToSlide }) {
    const [stories, setStories] = useState(storiesData);
    const [inputValue, setInputValue] = useState('');
    const colorIdxRef = useRef(storiesData.length);
    const gridRef = useRef(null);

    const submitStory = () => {
        if (!inputValue.trim()) return;
        setStories(prev => [{ text: inputValue.trim(), name: 'Anonymous' }, ...prev]);
        colorIdxRef.current++;
        setInputValue('');
        if (gridRef.current) {
            gridRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <>
            <div className="slide-content" style={{ maxWidth: '900px', height: '80vh', display: 'flex', flexDirection: 'column', paddingTop: '4rem' }}>
                <h2 style={{ marginBottom: '0.5rem' }}>Community Wall</h2>
                <p style={{ marginBottom: '1.5rem' }}>Anonymous confessions from people exactly where you are.</p>

                <div className="masonry" ref={gridRef}>
                    {stories.map((story, i) => (
                        <div
                            className="masonry-card"
                            key={i}
                            style={{ borderLeftColor: pastelColors[i % pastelColors.length] }}
                        >
                            <p>"{story.text}"</p>
                            <div style={{ marginTop: '1rem', fontWeight: 600, opacity: 0.8, fontSize: '0.9rem' }}>— {story.name}</div>
                        </div>
                    ))}
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(0,0,0,0.05)', flexShrink: 0 }}>
                    <input
                        type="text"
                        placeholder="Add your story anonymously..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && submitStory()}
                        style={{ flex: 1, padding: '1rem 1.5rem', border: '1px solid var(--border-color)', borderRadius: '30px', outline: 'none', fontFamily: 'inherit', background: 'var(--card-bg)', color: 'var(--text-color)' }}
                    />
                    <button onClick={submitStory} className="btn-nav" style={{ borderRadius: '30px', whiteSpace: 'nowrap' }}>Share</button>
                </div>
            </div>
            <div className="slide-nav" style={{ position: 'absolute', bottom: '2rem', right: '5%' }}>
                <button onClick={() => goToSlide(8)} className="btn-nav">View Helplines &rarr;</button>
            </div>
        </>
    );
}
