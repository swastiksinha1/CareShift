import { useEffect, useRef } from 'react';

export default function BottomSheet({ isOpen, onClose }) {
    const sheetRef = useRef(null);

    useEffect(() => {
        if (sheetRef.current) {
            if (isOpen) {
                sheetRef.current.style.bottom = '0';
            } else {
                sheetRef.current.style.bottom = '-100%';
            }
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div
            id="bottomSheetOverlay"
            style={{
                position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                background: 'rgba(0,0,0,0.3)', zIndex: 999, backdropFilter: 'blur(2px)'
            }}
            onClick={(e) => { if (e.target.id === 'bottomSheetOverlay') onClose(); }}
        >
            <div
                ref={sheetRef}
                style={{
                    position: 'absolute', bottom: '-100%', left: '50%', transform: 'translateX(-50%)',
                    width: '100%', maxWidth: '600px', background: 'var(--card-bg)',
                    borderRadius: '24px 24px 0 0', padding: '2rem',
                    boxShadow: '0 -10px 40px rgba(0,0,0,0.1)',
                    transition: 'bottom 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontFamily: "'Outfit',sans-serif", fontSize: '1.5rem', margin: 0, color: 'var(--text-color)' }}>Find a Free Clinic</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '2rem', cursor: 'pointer', color: '#64748b' }}>&times;</button>
                </div>
                <input
                    type="text"
                    placeholder="Search your city..."
                    style={{
                        width: '100%', padding: '1rem', border: '1px solid var(--border-color)',
                        borderRadius: '12px', outline: 'none', marginBottom: '1.5rem',
                        fontFamily: 'inherit', background: 'var(--card-bg)', color: 'var(--text-color)'
                    }}
                />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {['Delhi', 'Mumbai', 'Bengaluru', 'Chennai', 'Patna'].map(city => (
                        <a
                            key={city}
                            href="#"
                            className="rc-option"
                            style={{ textDecoration: 'none', display: 'flex', justifyContent: 'space-between' }}
                            onClick={(e) => e.preventDefault()}
                        >
                            {city} <span style={{ color: 'var(--accent-color)' }}>&rarr;</span>
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
}
