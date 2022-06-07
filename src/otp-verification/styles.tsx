import { defaultsDeep } from 'lodash';
import { StyleSheet } from 'react-native';
import { OtpVerificationComponentStyles } from './types';
import { colors, fonts } from '../assets';

const useMergeStyles = (style?: OtpVerificationComponentStyles): OtpVerificationComponentStyles => {
  const defaultStyles: OtpVerificationComponentStyles = StyleSheet.create({
    countdownContainerStyle: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'center',
      paddingTop: 40,
    },
    sendAnotherTextStyle: {
      fontFamily: fonts.medium,
      fontSize: 12,
      lineHeight: 21,
      textDecorationLine: 'none',
      color: colors.button,
    },
    durationTextStyle: {
      fontFamily: fonts.medium,
      fontStyle: 'italic',
      fontSize: 12,
      lineHeight: 21,
      color: 'grey',
    },
    notReceivedCodeTextStyle: {
      fontFamily: fonts.medium,
      fontStyle: 'italic',
      fontSize: 12,
      lineHeight: 21,
      color: colors.black,
    },
    errorCodeTextStyle: {
      fontFamily: fonts.medium,
      fontStyle: 'italic',
      fontSize: 12,
      lineHeight: 21,
      alignSelf: 'center',
      marginTop: 10,
      // backgroundColor: 'red',
      color: colors.error,
    },
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    mainContainer: {
      flex: 1,
      backgroundColor: colors.background,
      paddingHorizontal: 24,
    },
    mainErrorContainer: {
      flex: 1,
      backgroundColor: colors.background,
      paddingHorizontal: 24,
      alignSelf: 'center',
    },
    title: {
      fontFamily: fonts.bold,
      fontSize: 24,
      lineHeight: 36,
      color: colors.primary,
      paddingHorizontal: 24,
      marginBottom: 32,
    },
    backButtonContainerStyle: {
      padding: 15,
      marginLeft: 12,
      marginBottom: 8,
      width: 100,
    },
    noteContainer: {
      borderRadius: 8,
      padding: 15,
      paddingTop: 0,
      paddingHorizontal: 24,
    },
    noteText: {
      fontFamily: fonts.regular,
      fontSize: 14,
      color: colors.secondaryText,
      lineHeight: 24,
    },
    successContainer: {
      flex: 1,
      backgroundColor: colors.primary,
    },
    otpErrorFieldStyle: {
      focusCellContainerStyle: {
        borderBottomColor: '#D32F2F',
      },
    },
  });

  return defaultsDeep(style, defaultStyles);
};

export default useMergeStyles;
