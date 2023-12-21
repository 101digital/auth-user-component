
import remoteConfig from '@react-native-firebase/remote-config';

export const PASSWORD_LOCKED_OUT = 'PASSWORD_LOCKED_OUT';
export const OTP_REQUIRED = 'OTP_REQUIRED';
export const FAILED = 'FAILED';
export const DEFAULT_ERROR_MESSAGE_NEW_PASSWORD_DID_NOT_SATISFY_PASSWORD_POLICY =
  'New password did not satisfy password policy requirements';
export const DEFAULT_ERROR_MESSAGE_INVALID_PROVIDED_PASSWORD =
  'The current password provided for the user is invalid';
export const SINGLE_FACTOR_SCOPE = 'profilepsf';
export const SINGLE_FACTOR_ACR_VALUE = 'Single_Factor';
export const SINGLE_FACTOR_COMPLETED = 'COMPLETED';

export const getEnterpriseData = async (keys: string[]) => {
  await remoteConfig().fetchAndActivate();
  const data: any[] | PromiseLike<any[]> = [];
  keys.forEach((s) => {
    const values = remoteConfig().getValue(s);
    if (values) {
      data.push(JSON.parse(values.asString()));
    }
  });
  return data;
};