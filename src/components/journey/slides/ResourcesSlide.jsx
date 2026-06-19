import { Link } from 'react-router-dom';

export default function ResourcesSlide({ goToSlide }) {
    return (
        <>
            <div className="slide-content" style={{ maxWidth: '1000px' }}>
                <h2>Your Action Plan</h2>
                <p>Free, verified national helplines. Make the call today.</p>

                <div className="res-groups">
                    <div className="res-card">
                        <div className="cat">Mental Health Support</div>
                        <div className="res-row">
                            <div><span className="name">Tele-MANAS</span><span className="desc">24/7 govt line, 20+ languages</span></div>
                            <a className="num" href="tel:14416">14416</a>
                        </div>
                        <div className="res-row">
                            <div><span className="name">KIRAN</span><span className="desc">Mental health rehab, anonymous</span></div>
                            <a className="num" href="tel:18005990019">1800-599-0019</a>
                        </div>
                    </div>

                    <div className="res-card">
                        <div className="cat">Cost &amp; Coverage Verification</div>
                        <div className="res-row">
                            <div><span className="name">PM-JAY</span><span className="desc">Check free treatment eligibility</span></div>
                            <a className="num" href="tel:14555">14555</a>
                        </div>
                        <div className="res-row">
                            <div><span className="name">PM-JAY Toll Free</span><span className="desc">Alternative line</span></div>
                            <a className="num" href="tel:18001115651">1800-111-565</a>
                        </div>
                    </div>

                    <div className="res-card">
                        <div className="cat">General Medical Triage</div>
                        <div className="res-row">
                            <div><span className="name">National Health Line</span><span className="desc">Medical advice over the phone</span></div>
                            <a className="num" href="tel:104">104</a>
                        </div>
                        <div className="res-row">
                            <div><span className="name">Emergency</span><span className="desc">Ambulance</span></div>
                            <a className="num" href="tel:108">108</a>
                        </div>
                    </div>
                </div>
            </div>
            <div className="slide-nav">
                <button onClick={() => goToSlide(7)} className="btn-nav ghost">&larr; Back</button>
                <Link to="/" className="btn-nav" style={{ textDecoration: 'none' }}>Finish Journey</Link>
            </div>
        </>
    );
}
