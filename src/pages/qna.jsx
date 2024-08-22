import { Helmet } from 'react-helmet-async';

import { QuestionsAnswersView } from 'src/sections/qna/view';

// ----------------------------------------------------------------------

export default function QuestionsPage() {
  return (
    <>
      <Helmet>
        <title> Q&A | Learnitor </title>
      </Helmet>

      <QuestionsAnswersView />
    </>
  );
}
