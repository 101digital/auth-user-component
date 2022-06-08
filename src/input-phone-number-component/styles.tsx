import { defaultsDeep } from 'lodash';
import { StyleSheet } from 'react-native';
import { useThemeFonts } from 'react-native-theme-component';
import { InputPhoneNumberComponentStyles } from './types';
import { ThemeContext } from 'react-native-theme-component';
import { useContext } from 'react';

const useMergeStyles = (
  style?: InputPhoneNumberComponentStyles
): InputPhoneNumberComponentStyles => {
  const fonts = useThemeFonts();
  const { colors } = useContext(ThemeContext);

  const defaultStyles: InputPhoneNumberComponentStyles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 24,
    },
    content: {
      flex: 1,
    },
    formTitleStyle: {
      fontFamily: fonts.semiBold,
      fontSize: 22,
      color: colors.primaryColor,
      marginBottom: 32,
    },
    backButtonContainerStyle: {
      marginBottom: 23,
      width: 100,
    },
    subTitle: {
      marginBottom: 7,
    },
    loginButtonStyle: {
      primaryContainerStyle: {
        marginTop: 32,
      },
    },
  });
  return defaultsDeep(style, defaultStyles);
};

export default useMergeStyles;
