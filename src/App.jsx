import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import CinematicOverlays from './components/CinematicOverlays';
import useCustomCursor from './hooks/useCustomCursor';
import LandingPage from './pages/LandingPage';
import JourneyPage from './pages/JourneyPage';

function AppContent() {
    useCustomCursor();

    return (
        <>
            <CinematicOverlays />
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/journey" element={<JourneyPage />} />
            </Routes>
        </>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <ThemeProvider>
                <AppContent />
            </ThemeProvider>
        </BrowserRouter>
    );
}
