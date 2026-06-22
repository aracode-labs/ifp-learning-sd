import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from '@/context/AppContext';
import SplashScreen from '@/components/SplashScreen';
import SubjectGrid from '@/components/SubjectGrid';
import TopicMenu from '@/components/TopicMenu';
import TopicIntro from '@/components/TopicIntro';
import ContentSelector from '@/components/ContentSelector';
import ContentViewer from '@/components/ContentViewer/ContentViewer';
import CharacterAnimator from '@/components/CharacterAnimator/CharacterAnimator';
import useKarakterFrames from '@/hooks/useKarakterFrames';
import './App.css';

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<SplashScreen />} />
          <Route path="/subjects" element={<SubjectGrid />} />
          <Route path="/topics/:subjectId" element={<TopicMenu />} />
          <Route path="/topic-intro/:topicId" element={<TopicIntro />} />
          <Route path="/content-selector/:topicId" element={<ContentSelector />} />
          <Route path="/content/:contentId/:topicId" element={<ContentViewer />} />
          <Route
            path="/anim"
            element={
              <div style={{ padding: 20 }}>
                {
                  (() => {
                    const karakterFrames = useKarakterFrames();
                    return (
                      <CharacterAnimator
                        frames={karakterFrames}
                        fps={12}
                        autoplay={true}
                        autoSize={true}
                        scale={'80%'}
                      />
                    );
                  })()
                }
              </div>
            }
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
