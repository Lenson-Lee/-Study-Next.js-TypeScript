import { useRef } from 'react';
import { Hydrate, QueryClientProvider, QueryClient } from 'react-query';
import '../styles/globals.css';
import type { AppProps /*, AppContext */ } from 'next/app';
import { ChakraProvider } from '@chakra-ui/react';
import { AuthUserProvider } from '@/contexts/auth_user.context';

const MyApp = function ({ Component, pageProps }: AppProps) {
  const queryClientRef = useRef<QueryClient>();
  if (!queryClientRef.current) {
    queryClientRef.current = new QueryClient();
  }
  /* eslint-disable react/jsx-props-no-spreading */
  return (
    <QueryClientProvider client={queryClientRef.current}>
      <Hydrate state={pageProps.dehydratedProps}>
        <ChakraProvider>
          <AuthUserProvider>
            <Component {...pageProps} />
          </AuthUserProvider>
        </ChakraProvider>
      </Hydrate>
    </QueryClientProvider>
  );
};

export default MyApp;
