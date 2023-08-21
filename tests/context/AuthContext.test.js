import React from 'react';
import { cleanup, render } from '@testing-library/react-native';
import { AuthContext, authDefaultValue } from '../../src/auth-context/context';
import { View, Text } from 'react-native';
import '@testing-library/jest-dom';

describe('AuthContext testing', () => {
  beforeEach(() => {
    contextValue = authDefaultValue;
  });

  afterEach(cleanup);

  it('should provide correct initial context values', () => {
    let contextConsumer = null;
    const ConsumerComponent = () => {
      contextConsumer = React.useContext(AuthContext);
      expect(contextConsumer.isSignedIn).toBeFalsy();
      expect(contextConsumer.errorSignIn).toBeUndefined();
      return null;
    };

    render(
      <AuthContext.Provider value={contextValue}>
        <ConsumerComponent />
      </AuthContext.Provider>
    );
  });

  it('should call correct function in context', () => {
    const mockRegisterDevice = jest.fn();
    const mockProfile = 'mock profile';

    const ConsumerComponent = () => {
      const { registerDevice, profile } = React.useContext(AuthContext);

      registerDevice();
      expect(registerDevice).toBeCalled();

      return (
        <View>
          <Text testID={'profile'}>{profile}</Text>
        </View>
      );
    };

    const consumerComponent = render(
      <AuthContext.Provider
        value={{
          registerDevice: mockRegisterDevice,
          profile: mockProfile,
        }}
      >
        <ConsumerComponent />
      </AuthContext.Provider>
    );

    expect(consumerComponent.getByTestId('profile').props.children).toBe(mockProfile);
  });
});
