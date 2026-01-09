import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { audioEngine } from './audio/audioEngine';
import { Home } from './pages/Home';
import { Category } from './pages/Category';
import { Exercise } from './pages/Exercise';

// Import exercises to register them
import './exercises';

// Import global styles
import './styles/global.css';

function App() {
  useEffect(() => {
    // Initialize audio engine on first user interaction
    const initAudio = async () => {
      try {
        await audioEngine.initialize();
        document.removeEventListener('click', initAudio);
        document.removeEventListener('keydown', initAudio);
      } catch (error) {
        console.error('Failed to initialize audio:', error);
      }
    };

    document.addEventListener('click', initAudio, { once: true });
    document.addEventListener('keydown', initAudio, { once: true });

    return () => {
      document.removeEventListener('click', initAudio);
      document.removeEventListener('keydown', initAudio);
    };
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/category/:categoryId" element={<Category />} />
        <Route path="/exercise/:exerciseId" element={<Exercise />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
