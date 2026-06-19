import { useState, useRef } from 'react';
import gsap from 'gsap';

export default function CostImpactSlide({ goToSlide }) {
    const [months, setMonths] = useState(1);
    const [earlyCost, setEarlyCost] = useState(510);
    const [lateCost, setLateCost] = useState(5250);
    const [moto, setMoto] = useState("You're in the best window. Act now.");
    const earlyCostRef = useRef(null);
    const lateCostRef = useRef(null);

    const updateCostSlider = (val) => {
        const v = parseInt(val);
        setMonths(v);

        const early = 500 + (v * 10);
        const late = 5000 * Math.pow(1.05, v);

        // Animate costs
        const earlyObj = { val: earlyCost };
        const lateObj = { val: lateCost };

        gsap.to(earlyObj, {
            val: Math.round(early),
            duration: 0.3,
            onUpdate: () => setEarlyCost(Math.round(earlyObj.val))
        });

        gsap.to(lateObj, {
            val: Math.round(late),
            duration: 0.3,
            onUpdate: () => setLateCost(Math.round(lateObj.val))
        });

        if (v <= 3) setMoto("You're in the best window. Act now.");
        else if (v <= 12) setMoto("Waiting is starting to compound costs. Don't delay.");
        else setMoto("Costs can be significantly higher at this stage. Intercept it now.");
    };

    return (
        <div className="slide-content" style={{ maxWidth: '800px' }}>
            <h2>Cost of Waiting</h2>
            <p>See how delaying consultation impacts treatment costs.</p>

            <div style={{ margin: '2rem 0', textAlign: 'left' }}>
                <label style={{ fontWeight: 600, color: '#475569' }}>
                    How long have you been ignoring this? (<span>{months}</span> months)
                </label>
                <input
                    type="range"
                    min="1"
                    max="36"
                    value={months}
                    style={{ width: '100%', marginTop: '1rem', cursor: 'pointer' }}
                    onChange={(e) => updateCostSlider(e.target.value)}
                />
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                <div className="res-card" style={{ flex: 1, minWidth: '250px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#10b981', textTransform: 'uppercase' }}>Early Detection Cost</div>
                    <div ref={earlyCostRef} style={{ fontSize: '3rem', fontFamily: "'Outfit',sans-serif", fontWeight: 900, color: 'var(--text-color)' }}>
                        ₹{earlyCost.toLocaleString()}
                    </div>
                </div>
                <div className="res-card" style={{ flex: 1, minWidth: '250px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ef4444', textTransform: 'uppercase' }}>Late Detection Cost</div>
                    <div ref={lateCostRef} style={{ fontSize: '3rem', fontFamily: "'Outfit',sans-serif", fontWeight: 900, color: 'var(--text-color)' }}>
                        ₹{lateCost.toLocaleString()}
                    </div>
                </div>
            </div>
            <div style={{ marginTop: '2rem', fontSize: '1.2rem', fontWeight: 600, textAlign: 'center', color: 'var(--accent-dark)', background: 'rgba(14,165,233,0.1)', padding: '1rem', borderRadius: '12px' }}>
                {moto}
            </div>
            <button onClick={() => goToSlide(6)} className="btn-nav" style={{ marginTop: '2rem' }}>Find a Specialist &rarr;</button>
        </div>
    );
}
