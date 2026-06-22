import React from 'react';
import ReadingModule from '@/components/Reading/Reading';

type Props = { topicId: string };

// This ContentViewer wrapper delegates to the main Reading module (the /bacaan page)
// so the content and behavior are identical.
const Reading: React.FC<Props> = ({ topicId }) => {
  return <ReadingModule topicId={topicId} />;
};

export default Reading;
