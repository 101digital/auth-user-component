import React from 'react';
import { render } from '@testing-library/react-native';
import { AuthContext } from '../../src/auth-context/context';
import AuthProvider from '../../src/auth-context/provider';

describe('Authentication Provider test', () => {
  it('should return provider', () => {
    const ConsumerComponent = () => {
      contextConsumer = React.useContext(AuthContext);
      expect(contextConsumer.profile).toBeUndefined();
      return null;
    };

    render(
      <AuthProvider>
        <ConsumerComponent />
      </AuthProvider>
    );
  });
});
