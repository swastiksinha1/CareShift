// theme.js - Handles global dark mode state
(function() {
    // Run immediately before page paint to prevent flash
    const savedTheme = localStorage.getItem('careshift-theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.documentElement.classList.add('dark-mode');
    }
})();

window.toggleTheme = function() {
    const root = document.documentElement;
    root.classList.toggle('dark-mode');
    
    const isDark = root.classList.contains('dark-mode');
    localStorage.setItem('careshift-theme', isDark ? 'dark' : 'light');

    // Fire a custom event so other scripts (like Three.js) can react instantly
    window.dispatchEvent(new CustomEvent('themeChanged', { detail: { isDark } }));
};
