# react-native-auth-component

<b>react-native-auth-component</b> is a reuseable component for authentication and authorization that can be used across all the apps developed by 101 Digital.

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
    grantType: 'client_credentials'  //optional, default is client_credentials,
    scope: 'PRODUCTION'  //optional, default is PRODUCTION
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

### `authServices`

Provide functions to make authentication

- `login`: Promise function using username/password or email/password to generate token. If successfully, `access_token` and `refresh_token` will be stored to local storage. Then it will return response data.

- `refreshToken`: Promise function to re-new token from old `refresh_token`. If successfully, `access_token` and `refresh_token` will be stored to local storage. Then it will return response data.

- `fetchOrgToken`: Promise function to get token from organization which linked to accounts. If successfully, `org_token` will be stored to local storage.

- `logout`: Promise function to clear current session

```javascript
import { authServices } from 'react-native-auth-component';
```

### `authComponentStore`

Provide functions to store and retrieve stored data in local storage (using `@react-native-community/async-storage`)

- `storeAccessToken`: store latest access token to local storage

- `getAccessToken`: retrieve latest access token from local storage

- `storeRefreshToken`: store latest refresh token to local storage

- `getRefreshToken`: retrieve latest refresh token from local storage

- `storeOrgToken`: store latest org token to local storage

- `getOrgToken`: retrieve latest org token from local storage

- `clearTokens`: clear current access_token, refresh_token, org_token

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
