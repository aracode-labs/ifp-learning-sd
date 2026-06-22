import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Reading from './Reading';
import Video from './Video';
import Quiz from './Quiz';
import Interactive from './Interactive';
import ThreeD from './ThreeD';
import Evaluation from './Evaluation';

const ContentViewer: React.FC = () => {
  const { contentId, topicId } = useParams<{ contentId: string; topicId: string }>();
  const navigate = useNavigate();

  if (!contentId) return <div>Invalid content</div>;

  switch (contentId) {
    case 'reading':
      return <Reading topicId={topicId || ''} />;
    case 'video':
      return <Video topicId={topicId} />;
    case 'quiz':
      return <Quiz topicId={topicId} />;
    case 'interactive':
      return <Interactive topicId={topicId} />;
    case '3d':
      return <ThreeD topicId={topicId} />;
    case 'evaluation':
      return <Evaluation topicId={topicId} />;
    default:
      return (
        <div style={{ padding: 20 }}>
          <button onClick={() => navigate(-1)}>← Kembali</button>
          <h2>Konten belum tersedia</h2>
          <p>Jenis konten "{contentId}" belum diimplementasikan.</p>
        </div>
      );
  }
};

export default ContentViewer;
