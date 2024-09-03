import { Helmet } from 'react-helmet-async';
// import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { ProductsView } from 'src/sections/products/view';

// ----------------------------------------------------------------------

export default function ProductsPage() {
  // const queryClient = new QueryClient();

  return (
    <>
      <Helmet>
        <title> Products | Learnitor </title>
      </Helmet>
    {/* <QueryClientProvider client={queryClient}> */}
       <ProductsView />
     {/* </QueryClientProvider> */}

    </>
  );
}
