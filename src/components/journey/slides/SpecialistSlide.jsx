import { useState } from 'react';
import gsap from 'gsap';

const specialities = [
    { symp: "Chest Pain", spec: "Cardiologist" },
    { symp: "Persistent Cough", spec: "Pulmonologist" },
    { symp: "Skin Rash", spec: "Dermatologist" },
    { symp: "Anxiety/Low Mood", spec: "Psychiatrist / Therapist" },
    { symp: "Joint Pain", spec: "Rheumatologist / Orthopedist" },
    { symp: "Digestive Issues", spec: "Gastroenterologist" },
    { symp: "Headaches", spec: "Neurologist" },
    { symp: "Vision Problems", spec: "Ophthalmologist" }
];

export default function SpecialistSlide({ goToSlide, openBottomSheet }) {
    const [specSelected, setSpecSelected] = useState(new Set());
    const [showResult, setShowResult] = useState(false);
    const [specText, setSpecText] = useState('');

    const toggleSpec = (symp) => {
        setSpecSelected(prev => {
            const next = new Set(prev);
            if (next.has(symp)) {
                next.delete(symp);
            } else {
                next.add(symp);
            }

            if (next.size > 0) {
                const firstSymp = Array.from(next)[0];
                const matched = specialities.find(x => x.symp === firstSymp).spec;
                let txt = matched;
                if (next.size > 1) txt += " or General Physician";
                setSpecText(txt);
                setShowResult(true);

                // Animate result
                setTimeout(() => {
                    const res = document.getElementById('specResult');
                    if (res) gsap.fromTo(res, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4 });
                }, 0);
            } else {
                setShowResult(false);
            }

            return next;
        });
    };

    return (
        <>
            <div className="slide-content" style={{ maxWidth: '800px' }}>
                <h2>Find Your Specialist</h2>
                <p>Select your symptoms below to find out exactly who you need to see.</p>

                <div className="chips" style={{ marginBottom: '2rem' }}>
                    {specialities.map(s => (
                        <div
                            key={s.symp}
                            className={`chip ${specSelected.has(s.symp) ? 'active' : ''}`}
                            onClick={() => toggleSpec(s.symp)}
                        >
                            {s.symp}
                        </div>
                    ))}
                </div>

                {showResult && (
                    <div id="specResult" className="res-card" style={{ textAlign: 'center', padding: '3rem' }}>
                        <h3 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: 'var(--text-color)' }}>
                            You should see a <span style={{ color: 'var(--accent-color)' }}>{specText}</span>
                        </h3>
                        <p style={{ color: '#64748b', marginBottom: '1.5rem', fontSize: '1.1rem' }}>
                            Estimated Consultation under PM-JAY: <b style={{ color: 'var(--text-color)' }}>₹0 - ₹500</b>
                        </p>
                        <button className="btn-nav" onClick={openBottomSheet}>Find Government Hospital</button>
                    </div>
                )}
            </div>
            <div className="slide-nav">
                <button onClick={() => goToSlide(7)} className="btn-nav">Read Community Wall &rarr;</button>
            </div>
        </>
    );
}
