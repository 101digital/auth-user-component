import { defaultsDeep } from 'lodash';
import { StyleSheet } from 'react-native';
import { useThemeFonts } from 'react-native-theme-component';
import { LoginComponentStyles } from './types';

const useMergeStyles = (style?: LoginComponentStyles): LoginComponentStyles => {
  const fonts = useThemeFonts();
  const defaultStyles: LoginComponentStyles = StyleSheet.create({
    containerStyle: {
      flex: 1,
      padding: 24,
    },
    formTitleStyle: {
      fontFamily: fonts.semiBold,
      fontSize: 22,
      color: '#0C3F79',
      marginBottom: 32,
    },
    forgotPasswordLabelStyle: {
      fontFamily: fonts.regular,
      fontSize: 16,
      color: '#0C3F79',
      lineHeight: 20,
    },
    forgotPasswordContainerStyle: {
      alignSelf: 'flex-end',
      marginTop: 12,
    },
    noneAccountLabelStyle: {
      fontFamily: fonts.regular,
      fontSize: 16,
      color: 'grey',
      lineHeight: 20,
    },
    signUpContainerStyle: {
      flexDirection: 'row',
      marginVertical: 32,
    },
    signUpLabelStyle: {
      fontFamily: fonts.regular,
      fontSize: 16,
      color: '#0C3F79',
      lineHeight: 20,
      textDecorationLine: 'underline',
      marginHorizontal: 8,
    },
  });
  return defaultsDeep(style, defaultStyles);
};

export default useMergeStyles;
