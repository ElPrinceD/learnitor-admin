import { Helmet } from 'react-helmet-async';

import { UserView } from 'src/sections/user/view';

// ----------------------------------------------------------------------

export default function TopicsPage() {
  return (
    <>
      <Helmet>
        <title> User | Learnitor </title>
      </Helmet>

      <UserView />
    </>
  );
}