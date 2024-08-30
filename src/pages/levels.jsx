import { Helmet } from 'react-helmet-async';

import { LevelsView } from 'src/sections/levels/view';

// ----------------------------------------------------------------------

export default function LevelsPage() {
  return (
    <>
      <Helmet>
        <title> Levels | Learnitor </title>
      </Helmet>

      <LevelsView />
    </>
  );
}
