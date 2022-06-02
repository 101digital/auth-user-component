import { defaultsDeep } from 'lodash';
import { StyleSheet } from 'react-native';
import { useThemeFonts } from 'react-native-theme-component';
import { RecoveryPasswordComponentStyles } from './types';
import { ThemeContext } from 'react-native-theme-component';
import { useContext } from 'react';

const useMergeStyles = (
  style?: RecoveryPasswordComponentStyles
): RecoveryPasswordComponentStyles => {
  const fonts = useThemeFonts();
  const { colors } = useContext(ThemeContext);

  const defaultStyles: RecoveryPasswordComponentStyles = StyleSheet.create({
    containerStyle: {
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
    loginButtonStyle: {
      primaryContainerStyle: {
        marginTop: 32,
      },
    },
  });
  return defaultsDeep(style, defaultStyles);
};

export default useMergeStyles;
