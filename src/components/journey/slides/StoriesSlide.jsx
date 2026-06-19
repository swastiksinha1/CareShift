export default function StoriesSlide({ goToSlide }) {
    const stories = [
        { quote: "I kept putting off my checkup because I felt fine. Turns out, catching my high blood pressure early saved me from a major stroke. The hardest part was just making the appointment.", author: "Marcus, 42", delay: "0.1s" },
        { quote: "I was terrified of finding out I had diabetes like my father. The anxiety of not knowing was actually worse than the diagnosis. Now, it's totally managed and I feel in control.", author: "Sarah, 35", delay: "0.2s" },
        { quote: "I thought taking time off work for tests was a luxury I couldn't afford. But investing that one afternoon gave me peace of mind for the whole year. Worth every second.", author: "David, 50", delay: "0.3s" },
        { quote: "As a young guy, I thought I was invincible. Getting a routine blood test felt like something only older people did. Finding out I had a severe vitamin deficiency explained my constant fatigue. I'm literally a new person now.", author: "Leo, 28", delay: "0.4s" },
        { quote: "I ignored the mild chest pains because I didn't want to be 'that dramatic person' at the ER. My wife finally forced me to go. It was early stage heart disease. Speaking up saved my life.", author: "James, 55", delay: "0.5s" },
        { quote: "I was so embarrassed about my weight that I avoided doctors for five years. When I finally went, the doctor didn't judge me at all—she just gave me a plan. The relief of just facing it was incredible.", author: "Elena, 39", delay: "0.6s" }
    ];

    return (
        <>
            <div className="slide-content">
                <h2>You are not the first.</h2>
                <p>Real stories from people who were exactly where you are right now.</p>

                <div className="stories-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', textAlign: 'left', marginTop: '2rem', maxWidth: '1000px' }}>
                    {stories.map((s, i) => (
                        <div className="story-card" key={i} style={{ animationDelay: s.delay }}>
                            <p className="quote" style={{ fontSize: '1.05rem', lineHeight: 1.6 }}>"{s.quote}"</p>
                            <div className="author" style={{ marginTop: '1rem', fontWeight: 700, color: 'var(--accent-dark)' }}>&mdash; {s.author}</div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="slide-nav">
                <button onClick={() => goToSlide(1)} className="btn-nav ghost">&larr; Back</button>
                <button onClick={() => goToSlide(3)} className="btn-nav">Talk to CareBot &rarr;</button>
            </div>
        </>
    );
}
