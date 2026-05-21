import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from '@/context/AppContext';
import SplashScreen from '@/components/SplashScreen';
import GreetingScreen from '@/components/GreetingScreen';
import ClassSelector from '@/components/ClassSelector';
import SubjectMenu from '@/components/SubjectMenu';
import TopicMenu from '@/components/TopicMenu';
import ContentSelector from '@/components/ContentSelector';
import './App.css';

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<SplashScreen />} />
          <Route path="/greeting" element={<GreetingScreen />} />
          <Route path="/class-selector" element={<ClassSelector />} />
          <Route path="/subjects" element={<SubjectMenu />} />
          <Route path="/topics/:subjectId" element={<TopicMenu />} />
          <Route path="/content-selector/:topicId" element={<ContentSelector />} />
          <Route path="/content/:contentId/:topicId" element={<div>Content Viewer (Coming Soon)</div>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
