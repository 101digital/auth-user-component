import { defaultsDeep } from 'lodash';
import { useContext } from 'react';
import { StyleSheet } from 'react-native';
import { ThemeContext } from 'react-native-theme-component';
import { AlertModalStyles } from '.';

const useMergeStyles = (style?: AlertModalStyles): AlertModalStyles => {
  const { colors, fonts } = useContext(ThemeContext);

  const defaultStyles: AlertModalStyles = StyleSheet.create({
    modalStyle: {
      justifyContent: 'center',
      alignItems: 'center',
      margin: 0,
    },
    containerStyle: {
      width: '82%',
      borderRadius: 5,
      backgroundColor: 'white',
      paddingHorizontal: 24,
      paddingVertical: 40,
    },
    titleTextStyle: {
      color: colors.primaryColor,
      fontFamily: fonts.bold,
      fontSize: 16,
      lineHeight: 24,
      textAlign: 'center',
    },
    messageTextStyle: {
      fontFamily: fonts.medium,
      fontSize: 14,
      lineHeight: 24,
      color: '#000000',
      textAlign: 'center',
      marginBottom: 32,
      marginTop: 12,
    },
    headerStyle: {
      alignItems: 'center',
      marginBottom: 28,
    },
  });

  return defaultsDeep(style, defaultStyles);
};

export default useMergeStyles;
