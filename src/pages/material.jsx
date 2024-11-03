import { Helmet } from 'react-helmet-async';

import { MaterialsView } from 'src/sections/material/view';

// ----------------------------------------------------------------------

export default function MaterialsPage() {
  return (
    <>
      <Helmet>
        <title> Materials | Learnitor </title>
      </Helmet>

      <MaterialsView />
    </>
  );
}
