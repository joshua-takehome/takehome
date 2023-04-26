import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { InvoiceStateProvider } from './InvoiceApiProvider';
import { InvoiceTableForm } from './InvoiceTableForm';

export const App = () => {
  return (
    <ChakraProvider>
      <InvoiceStateProvider>
        <InvoiceTableForm />
      </InvoiceStateProvider>
    </ChakraProvider>
  )
}
