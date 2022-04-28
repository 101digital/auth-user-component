import { defaultsDeep } from 'lodash';
import { useContext } from 'react';
import { StyleSheet } from 'react-native';
import { ThemeContext } from 'react-native-theme-component';
import { statusBarHeight } from 'react-native-theme-component/src/utils/device-utils';
import { ProfileComponentStyles } from '.';

const useMergeStyles = (style?: ProfileComponentStyles): ProfileComponentStyles => {
  const { colors, fonts } = useContext(ThemeContext);

  const defaultStyles: ProfileComponentStyles = StyleSheet.create({
    containerStyle: {
      backgroundColor: colors.primaryColor,
      height: 207 + statusBarHeight,
    },
    headerContainerStyle: {
      flexDirection: 'row',
      marginHorizontal: 25,
      justifyContent: 'space-between',
      marginTop: 24,
    },
    avatarContainerStyle: {
      height: 40,
      width: 40,
      borderRadius: 20,
      backgroundColor: '#FFB74C',
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarTextStyle: {
      fontFamily: fonts.bold,
      fontSize: 16,
      color: colors.primaryColor,
    },
    userNameTextStyle: {
      fontFamily: fonts.bold,
      fontSize: 24,
      lineHeight: 36,
      color: '#ffffff',
      paddingHorizontal: 25,
      marginTop: 17,
    },
  });

  return defaultsDeep(style, defaultStyles);
};

export default useMergeStyles;
