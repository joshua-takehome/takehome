import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';

export const App = () => {
  return (
    <ChakraProvider>
      <p>Hello!</p>
    </ChakraProvider>
  )
}
