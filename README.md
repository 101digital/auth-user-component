# react-native-auth-component

**react-native-auth-component** is a reusable component for authentication and authorization that can be used across all the apps developed by 101 Digital.

## Features

- Provide login function and keep the current session
- Auto-refresh token once the token is expired
- Include manage organization token
- Support login with OAuth2

## Installation

To add this component to React Native app, run this command:

```sh
yarn add git+ssh://git@github.com/101digital/react-native-auth-component.git
```

Make sure you have permission to access this repository

Because **react-native-auth-component** depends on some libraries, so make sure you installed all dependencies into your project.

- [react-native-theme-component](https://github.com/101digital/react-native-theme-component.git)
- [react-native-app-auth](https://github.com/FormidableLabs/react-native-app-auth). **Note** You need to see [Stetup](https://github.com/FormidableLabs/react-native-app-auth#setup) only. Other functions have been implemented.

## Quick Start

Before using this component, you must configure environment variables. That should be configure early in top of your `app.ts`

```javascript
import { AuthComponent } from 'react-native-auth-component';

AuthComponent.instance()
  .configure({
    clientId: string;
    clientSecret: string;
    ternantDomain: string;
    tokenBaseUrl: string;
    membershipBaseUrl: string;
    appGrantType?: string; // using for get app token
    appScope?: string; // using for get app token
    authGrantType?: string; // using for login
    authScope?: string; // using for login,
    redirectUrl?: string; // required for oauth2
    authorizationBaseUrl?: string; // required for oauth2
    revocationBaseUrl?: string; // required for oauth2
    endSessionBaseUrl?: string; // required for oauth2
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
  return (
    <View>
      <AuthProvider>/* YOUR COMPONENTS */</AuthProvider>
    </View>
  );
};
export default App;
```

**react-native-auth-component** also provides `AuthContext` using Context API to maintain authentication state. If you want to use `AuthContext` you **HAVE TO** wrap your components with `AuthProvider`. This is required if you use `LoginComponent`.

## API reference

### `createAppTokenApiClient`

Create client to excute API request that only required basic token.

- `baseURL`: base url of services

```javascript
import { createAppTokenApiClient } from 'react-native-auth-component';

const identityApiClient = createAppTokenApiClient(env.api.baseUrl.identity);
```

### `createAuthorizedApiClient`

Create client to excute API requests that required Authentication

- `baseURL`: base url of services
- `withOrgToken`: this is OPTIONAL for request need `org-token` for Authentication

```javascript
import { createAuthorizedApiClient } from 'react-native-auth-component';

const authApiClient = createAuthorizedApiClient(env.api.baseUrl.identity);
```

### `AuthContext`

Maintain authentication state using Context API. To retrieve Context data and function, you can use `useContext` inside a React Component.

```javascript
import React, { useContext } from 'react';
import { AuthContext } from 'react-native-auth-component';

const ReactComponentExample = () => {
  const { login, profile } = useContext(AuthContext);

  /* YOUR COMPONENT */
};
```

- Functions and state

```javascript
export interface AuthContextData {
  profile?: Profile; // Current user profile. Return `undefined` if not authenticated
  profilePicture?: string; // Get current profile picture
  isSignedIn: boolean; // Authentication state. Return `true` if authenticated, or else return `false`
  isSigning: boolean; // Return `true` if excuting login action
  errorSignIn?: Error; // Return error value if any failures while excuting login
  login: (username: string, password: string) => Promise<Profile | undefined>; // Execute login action
  loginOAuth2: () => Promise<Profile | undefined>; // Execute login OAuth2
  logout: () => void; // Excute logout action
  clearSignInError: () => void; // Clear current failed login state
  updateProfile: (
    userId: string,
    firstName: string,
    lastName: string,
    profilePicture?: string
  ) => Promise<boolean>; // Update current profile information
  isUpdatingProfile?: boolean; // Updating profile state
  errorUpdateProfile?: Error; // Error while update profile
  clearUpdateProfileError: () => void;
}
```

### `AuthServices`

Provide functions to make authentication

- Functions

| Name                | Type                          | Description                                                                                                                                                                                                                                                               |
| :------------------ | :---------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| login               | Function (username, password) | Promise function using username/password or email/password to generate token. If successfully, `access_token` and `refresh_token` will be stored to local storage. Then it will return response data.                                                                     |
| loginOAuth2         | Function                      | Promise function using OAuth2. The application will be redirect to [Authorization Code Flow](https://oauth.net/2/grant-types/authorization-code/) . If successfully, `accessToken` and `refreshToken` will be stored to local storage. Then it will return response data. |
| refreshToken        | Function (refresh_token)      | Promise function to re-new token from old `refresh_token`. If successfully, `access_token` and `refresh_token` will be stored to local storage. Then it will return response data.                                                                                        |
| fetchOrgToken       | Function                      | Promise function to get token from organization which linked to accounts. If successfully, `org_token` will be stored to local storage.                                                                                                                                   |
| logout              | Function                      | Promise function to clear current session                                                                                                                                                                                                                                 |
| fetchAppAccessToken | Function                      | Promise function return app access token base on basic token                                                                                                                                                                                                              |

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

**Important**: If you use LoginComponent, you **HAVE TO** wrap your `App` with `AuthProvider`

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

More about styles of each, you can reference here: <https://github.com/101digital/react-native-theme-component.git>

- `component`

| Name         | Type                 | Description                   |
| :----------- | :------------------- | :---------------------------- |
| passwordIcon | ReactNode (Optional) | Prefix icon of password field |
| usernameIcon | ReactNode (Optional) | Prefix icon of username field |

### Add component to the config.json file manually

1. Make sure you synced latest local data in `auth-component.json` into [auth-component.json](https://github.com/101digital/components-data/blob/main/data/auth-component.json). They should be synced once you update

2. Add the auth-component to `components` tags and replate `[data]` with your values. The auth-component have `componentId` is "72520fc5-6be5-4ee5-b986-0e688ab4adff" and it can't be changed.

```
{
...
 "components": [
    {
      "componentId": "72520fc5-6be5-4ee5-b986-0e688ab4adff",
      "name": "AuthComponent",
      "isRequired": true,
      "config": {
        "clientId": "[data]",
        "clientSecret": "[data]",
        "ternantDomain": "[data]",
        "tokenBaseUrl": "[data]",
        "membershipBaseUrl": "[data]"
      }
    }
  ]
...
}
```

3. Check required dependencies of auth-component inside tag `dependencies` in `config.json`. Make sure tag `dependencies` must have enough below data

```
{
...
 "dependencies": [
    { "name": "https://github.com/101digital/react-native-theme-component.git" },
  ]
...
}
```

If have any item is not existing in `dependencies` of `config.json` file, please find missing one from `src/component.json` and put it to `dependencies`.

4. Place `LoginComponent` with one template to the Screen

| TemplateID                           | Template name                    |
| :----------------------------------- | :------------------------------- |
| 7c795b14-8ae4-47e0-9a94-162ff71bdf77 | Login with email template        |
| f7244753-8d95-4f91-a1fa-88df174dc064 | Login with phone number template |

- Example, if you want to place `LoginComponent` with email template to `LoginScreen`, then if user trigger `onPressForgotPassword` button, and you wanna navigate to `ForgotPasswordScreen`

Note that: `templateId` is one of template defined in `src/component.json`. `ForgotPasswordScreen` is existing with `route` name is `forgot-password-screen`

```
{
  ...
  "screens": [
    {
      "screenName": "LoginScreen",
      "route": "login-screen",
      "stack": "auth-navigator",
      "screenParams": [],
      "components": [
        {
          "templateId": "7c795b14-8ae4-47e0-9a94-162ff71bdf77",
          "componentName": "LoginComponent",
          "functions": [
            {
              "id": "c23dc9e4-5a70-41e7-bc30-83e9fdad3cac",
              "name": "onPressForgotPassword",
              "action": {
                "type": "openScreen",
                "route": "forgot-password-screen"
              }
            },
            {
              "id": "01c73fba-7060-49ec-acd2-2afbf3e7fda2",
              "name": "onPressRegister",
              "action": {
                "type": "openScreen",
                "route": "register-screen"
              }
            }
          ]
        }
      ]
    }
  ]
  ...
}
```
