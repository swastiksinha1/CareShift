import { useState } from 'react';

const barriers = [
    { id: 'fear', label: 'Fear of diagnosis', title: 'The fear is doing its job — just not for you', ack: "Not knowing can feel safer than knowing.", step: 'Tiny next step: try a 5-minute anonymous symptom check.', res: 'Free teleconsults via eSanjeevani.' },
    { id: 'stigma', label: 'Social stigma', title: 'Stigma lives in your neighbourhood, not in your blood test', ack: "What people might say isn't really about your health.", step: 'Tiny next step: look for a remote-first consult.', res: 'Tele-MANAS (14416) never requires walking in.' },
    { id: 'masculinity', label: 'Masculinity norms', title: '"I\'ll be fine" was never proof of strength', ack: "Somewhere along the way, brushing it off became the answer.", step: "Tiny next step: tell one person you trust.", res: "7 in 10 callers to KIRAN helpline are men." },
    { id: 'cost', label: 'Cost concerns', title: "Worrying about the bill before the diagnosis is exhausting", ack: "That worry is completely rational.", step: 'Tiny next step: check if you qualify for free treatment.', res: 'Ayushman Bharat (PM-JAY), 14555.' },
    { id: 'time', label: 'Lack of time', title: "This isn't denial. It's triage, and health lost today's round", ack: "You're juggling twelve things.", step: 'Tiny next step: block 10 minutes.', res: 'National Health Helpline, 104.' },
    { id: 'denial', label: 'Denial & uncertainty', title: '"Probably nothing" is doing a lot of heavy lifting', ack: "Maybe it is nothing. The only way to stop wondering is to check.", step: "Tiny next step: set a 48-hour rule.", res: 'A 2-day deadline turns an open-ended worry into a closed one.' }
];

export default function BarriersSlide({ goToSlide }) {
    const [selected, setSelected] = useState(new Set());

    const toggleBarrier = (id) => {
        setSelected(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const selectedBarriers = barriers.filter(b => selected.has(b.id));

    return (
        <>
            <div className="slide-content" style={{ maxWidth: '900px' }}>
                <h2>What's stopping you today?</h2>
                <p>Pick whatever is true right now. There's no wrong answer, and nothing here gets saved.</p>

                <div className="chips">
                    {barriers.map(b => (
                        <div
                            key={b.id}
                            className={`chip ${selected.has(b.id) ? 'active' : ''}`}
                            onClick={() => toggleBarrier(b.id)}
                        >
                            {b.label}
                        </div>
                    ))}
                </div>
                <div style={{ fontFamily: "'Inter',monospace", fontSize: '12px', fontWeight: 600, color: '#94a3b8', marginBottom: '20px' }}>↑ tap as many as apply</div>

                <div className="pathways">
                    {selectedBarriers.length === 0 ? (
                        <div className="empty-state">Pick at least one above — most people end up picking three. Your personal pathway will appear right here.</div>
                    ) : (
                        selectedBarriers.map(b => (
                            <div className="path-card" key={b.id}>
                                <h3>{b.title}</h3>
                                <p>{b.ack}</p>
                                <div className="path-step">{b.step}</div>
                                <div className="path-res">{b.res}</div>
                            </div>
                        ))
                    )}
                </div>
            </div>
            <div className="slide-nav">
                <button onClick={() => goToSlide(2)} className="btn-nav">Continue to Stories &rarr;</button>
            </div>
        </>
    );
}
