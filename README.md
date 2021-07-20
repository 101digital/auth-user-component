# react-native-auth-component

<b>react-native-auth-component</b> is a reusable component for authentication and authorization that can be used across all the apps developed by 101 Digital.

## Features

- Provide login function and keep the current session
- Auto-refresh token once the token is expired
- Include manage organization token

## Installation

To add this component to React Native app, run this command:

```
yarn add git+ssh://git@github.com/101digital/react-native-auth-component.git
```

Make sure you have permission to access this repository

Because <b>react-native-auth-component</b> depends on some libraries, so make sure you installed all dependencies into your project.

- Lodash: https://github.com/lodash/lodash
- Formik: https://github.com/formium/formik
- Masked Text: https://github.com/benhurott/react-native-masked-text
- React Native Modal: https://github.com/react-native-modal/react-native-modal
- Async storage: https://github.com/react-native-async-storage/async-storage
- Svg display: https://github.com/react-native-svg/react-native-svg
- Theme component: https://github.com/101digital/react-native-theme-component.git

## Quick Start

Before using this component, you must configure environment variables. That should be configure early in top of your `app.ts`

```javascript
import env from '@/env';
import { AuthComponent } from 'react-native-auth-component';

AuthComponent.instance()
  .configure({
    clientId: env.api.clientId,  //required
    clientSecret: env.api.clientSecret,  //required
    ternantDomain: env.api.tenantDomain,  //required
    tokenBaseUrl: env.api.baseUrl.token,  //required
    membershipBaseUrl: env.api.baseUrl.membership,  //required
    grantType: 'client_credentials'  //optional, default is 'client_credentials',
    scope: 'PRODUCTION'  //optional, default is 'PRODUCTION'
  })
  .then(() => {
    // init other component, such as Banking Component
    // Ex:
    // BankingService.getInstance().initClients({
    //   walletClient: createAuthorizedApiClient(wallet),
    //   openBankAispClient: createAuthorizedApiClient(openBankingAisp),
    //   openBankAuthClient: createAuthorizedApiClient(openBankingAuth),
    });
  });

const App = () => {
    /* YOUR COMPONENTS */
}

export default App;
```

<b>react-native-auth-component</b> also provides `AuthContext` using Context API to maintain authentication state. If you want to use `AuthContext` you <b>HAVE TO</b> wrap your components with `AuthProvider`. This is required if you use `LoginComponent`.

```javascript
import { AuthComponent, AuthProvider } from 'react-native-auth-component';

// init AuthComponent

const App = () => {
  <AuthProvider>/* YOUR COMPONENTS */</AuthProvider>;
};

export default App;
```

## API reference

### `createAppTokenApiClient`

Create client to excute API request that only required basic token.

- `baseURL`: base url of services

```javascript
import { createAppTokenApiClient } from 'react-native-auth-component';
```

### `createAuthorizedApiClient`

Create client to excute API requests that required Authentication

- `baseURL`: base url of services
- `withOrgToken`: this is OPTIONAL for request need `org-token` for Authentication

```javascript
import { createAuthorizedApiClient } from 'react-native-auth-component';
```

### `AuthContext`

Maintain authentication state using Context API. To retrieve Context data and function, you can use `useContext` inside a React Component.

```javascript
import React, { useContext } from 'react';
import { AuthContext } from 'react-native-auth-component';

const ReactComponentEx = () => {
  const { login, profile } = useContext(AuthContext);

  /* YOUR COMPONENT */
};
```

- Functions and state data

| Name             | Type                                          | Description                                                                  |
| :--------------- | :-------------------------------------------- | :--------------------------------------------------------------------------- |
| profile          | Profile                                       | Current user profile. Return `undefined` if not authenticated                |
| profilePicture   | string                                        | Get current profile picture                                                  |
| isSignedIn       | bool                                          | Authentication state. Return `true` if authenticated, or else return `false` |
| isSigning        | bool                                          | Return `true` if excuting login action                                       |
| errorSignIn      | Error                                         | Return error value if any failures while excuting login                      |
| login            | Function (username, password)                 | Excute login action                                                          |
| clearSignInError | Funtion                                       | Clear current failed login state                                             |
| updateProfile    | Funtion (userId, firstName, lastName, avatar) | Update current profile information                                           |

### `AuthServices`

Provide functions to make authentication

- Functions

| Name                | Type                          | Description                                                                                                                                                                                           |
| :------------------ | :---------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| login               | Function (username, password) | Promise function using username/password or email/password to generate token. If successfully, `access_token` and `refresh_token` will be stored to local storage. Then it will return response data. |
| refreshToken        | Function (refresh_token)      | Promise function to re-new token from old `refresh_token`. If successfully, `access_token` and `refresh_token` will be stored to local storage. Then it will return response data.                    |
| fetchOrgToken       | Function                      | Promise function to get token from organization which linked to accounts. If successfully, `org_token` will be stored to local storage.                                                               |
| logout              | Function                      | Promise function to clear current session                                                                                                                                                             |
| fetchAppAccessToken | Function                      | Promise function return app access token base on basic token                                                                                                                                          |

```javascript
import { AuthServices } from 'react-native-auth-component';

// your logic
const resp = await AuthServices.instance().login('username', 'password');
```

### `authComponentStore`

Provide functions to store and retrieve stored data in local storage

- Functions

| Name              | Type                     | Description                                                        |
| :---------------- | :----------------------- | :----------------------------------------------------------------- |
| storeAccessToken  | Function (access_token)  | Store latest access token to local storage                         |
| getAccessToken    | Function                 | Retrieve latest access token from local storage                    |
| storeRefreshToken | Function (refresh_token) | Store latest refresh token to local storage                        |
| getRefreshToken   | Function                 | Retrieve latest refresh token from local storage                   |
| storeOrgToken     | Function (org_token)     | Store latest org token to local storage                            |
| getOrgToken       | Function                 | Retrieve latest org token from local storage                       |
| storeProfile      | Function (profile)       | Store current profile data to local storage                        |
| getProfile        | Function                 | Retrieve current profile data from local storage                   |
| clearAuths        | Function                 | Clear current access_token, refresh_token, org_token, profile data |

```javascript
import { authComponentStore } from 'react-native-auth-component';
```

### Listen session expired

If refresh token is failed (token full exipred), a callback function will be fired. You can listen that in your screen

```javascript
import { AuthComponent } from 'react-native-auth-component';

useEffect(() => {
  AuthComponent.instance().addSessionListener(handleSessionExpired);
  return () => {
    AuthComponent.instance().removeSessionListener(handleSessionExpired);
  };
}, []);

const handleSessionExpired = () => {
  // Call your logout function
};
```

### `LoginComponent`

Provide a simple login form (that is optional, you can use your login form), support type `email` and `phonenumber`. You can listen login succeed or failed response then handle your business logic.

<b>Important</b>: If you use LoginComponent, you <b>HAVE TO</b> wrap your `App` with `AuthProvider`

```javascript
import { LoginComponent, LoginComponentRef } from 'react-native-auth-component';

const LoginScreen = () => {
  const loginRefs = useRef<LoginComponentRef>(); // use to update country code

  const setCountryCode = (code: string) => {
    loginRefs?.current?.updateCountryCode(code);
  }

  return (
    <View>
    /* YOUR COMPONENTS */
      <LoginComponent
        ref={loginRefs}
        Root={{
            props: {
              onLoginSuccess: (userData) => {
                // handle login success with profile data
              },
              onLoginFailed: (error) => {
                // handle login failed with error
              },
              onPressForgotPassword: () => {
                // handle click to forgot password
              },
              onPressRegister: () => {
                // handle click to register
              },
              formatError: getErrorMessage, // format in-line error message, ex translate error to language
            }
          }}
      />
    /* YOUR COMPONENTS */
    </View>
  );
}
```

#### Root

- `props`

| Name                  | Type                | Description                                                    |
| :-------------------- | :------------------ | :------------------------------------------------------------- |
| onLoginSuccess        | Function (Required) | Return user profile data if login successfully                 |
| onLoginFailed         | Function (Required) | Return login error                                             |
| onPressForgotPassword | Function (Required) | Handle actions when forgot password button clicked             |
| onPressRegister       | Function (Required) | Handle actions when sign up now button clicked                 |
| formatError           | Function (Optional) | Format in-line error message, example translate error message  |
| formTitle             | string (Optional)   | Label of login form (default is `Sign In`)                     |
| loginButtonLabel      | string (Optional)   | Label of login button (default is `Login`)                     |
| notAccountLabel       | string (Optional)   | Label of no account message (default is `Not a user yet?`)     |
| signUpLabel           | string (Optional)   | Label of register button (default is `Sign up here`)           |
| forgotPasswordLabel   | string (Optional)   | Label of forgot password button (default is `Forgot password`) |

- `style`

Type of `LoginComponentStyles`

| Name                         | Type      | Description                     |
| :--------------------------- | :-------- | :------------------------------ |
| containerStyle               | ViewStyle | Wrapper styles of component     |
| formTitleStyle               | TextStyle | Style of login form title       |
| forgotPasswordContainerStyle | ViewStyle | Style of forgot password button |
| forgotPasswordLabelStyle     | TextStyle | Style of forgot password label  |
| noneAccountLabelStyle        | TextStyle | Style of no account label       |
| signUpLabelStyle             | TextStyle | Style of register label         |
| signUpContainerStyle         | ViewStyle | Style of register button        |

- `components`

| Name                       | Type                          | Description                             |
| :------------------------- | :---------------------------- | :-------------------------------------- |
| header                     | ReactNode (Optional)          | Header of component                     |
| footer                     | ReactNode (Optional)          | Footer of component                     |
| renderForgotPasswordButton | Function return React Element | Override default forgot password button |
| renderRegisterButton       | Function return React Element | Override default register button        |

#### InputForm

- `props`

| Name              | Type                                | Description                                                           |
| :---------------- | :---------------------------------- | :-------------------------------------------------------------------- |
| initialSignInData | SignInData (Optional)               | Initial sign in data, default is empty `username` and `password`      |
| type              | `email` or `phonenumber` (Optional) | Type of login form, default is `phonenumber`                          |
| validationSchema  | Yup scheme (Optional)               | Validation for `username` and `password`, base on your business logic |
| usernameHint      | string (Optional)                   | Username placeholder text                                             |
| passwordHint      | string (Optional)                   | Password placeholder text                                             |
| onPressDialCode   | Function (Optional)                 | Handle actions when click dial code label                             |

- `style`

Type of `InputFormStyles`

| Name                    | Type                              | Description                    |
| :---------------------- | :-------------------------------- | :----------------------------- |
| userNameInputFieldStyle | InputPhoneNumberStyles (Optional) | Styles of username input field |
| passwordInputFieldStyle | InputFieldStyles (Optional)       | Styles of password input field |

More about styles of each, you can reference here: https://github.com/101digital/react-native-theme-component.git

- `component`

| Name         | Type                 | Description                   |
| :----------- | :------------------- | :---------------------------- |
| passwordIcon | ReactNode (Optional) | Prefix icon of password field |
| usernameIcon | ReactNode (Optional) | Prefix icon of username field |
