import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { InvoiceStateProvider } from './InvoiceApiProvider';

export const App = () => {
  return (
    <ChakraProvider>
      <InvoiceStateProvider>
        <p>Hello!</p>
      </InvoiceStateProvider>
    </ChakraProvider>
  )
}
