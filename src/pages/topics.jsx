import { Helmet } from 'react-helmet-async';

import { UserView } from 'src/sections/user/view';

// ----------------------------------------------------------------------

export default function TopicsPage() {
  return (
    <>
      <Helmet>
        <title> Topics | Learnitor </title>
      </Helmet>

      <UserView />
    </>
  );
}
