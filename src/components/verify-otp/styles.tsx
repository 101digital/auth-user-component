import { defaultsDeep } from 'lodash';
import { useContext } from 'react';
import { StyleSheet } from 'react-native';
import { VerifyOTPComponentStyles } from './types';
import { ThemeContext } from 'react-native-theme-component';

const useMergeStyles = (style?: VerifyOTPComponentStyles): VerifyOTPComponentStyles => {
  const { fonts, colors } = useContext(ThemeContext);

  const defaultStyles = StyleSheet.create({
    safeArea: {
      flex: 1,
    },
    container: {
      paddingHorizontal: 25,
      flex: 1,
      backgroundColor: '#FFFFFF',
    },
    pageTitle: {
      fontSize: 24,
      fontFamily: fonts.semiBold,
      color: '#020000',
    },
    actionWrapper: {
      marginTop: 40,
      marginBottom: 20,
      paddingHorizontal: 25,
    },
    pageSubTitleView: {
      marginTop: 20,
      maxWidth: '90%',
    },
    pageSubTitle: {
      fontSize: 14,
      fontFamily: fonts.medium,
      color: '#4E4B50',
    },
    content: {
      marginTop: 20,
    },
    infoView: {
      marginTop: 25,
    },
    rowCenter: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-around',
      marginTop: 30,
    },
    receiveOTPOptionBtn: {},
    receiveOTPOptionLabel: {
      color: colors.primaryButtonColor,
      textDecorationLine: 'underline',
      fontFamily: fonts.medium,
      fontSize: 14,
      lineHeight: 16,
    },
    noteView: {
      padding: 20,
      marginTop: 20,
      borderRadius: 8,
      backgroundColor: '#DDD9E4',
    },
    noteLabel: {
      color: '#1D1C1D',
      fontFamily: fonts.regular,
      fontSize: 10,
    },
    btnBackToDashboard: {
      borderColor: colors.primaryButtonColor,
      borderWidth: 1,
      marginTop: 10,
    },
    labelBackToDashboard: { color: colors.primaryButtonColor },
    countdownWrapper: {
      flexDirection: 'row',
      justifyContent: 'center',
      paddingTop: 40,
    },
    notReceivedCodeLabel: {
      fontFamily: fonts.regular,
      fontSize: 14,
      lineHeight: 24,
      color: '#020000',
    },
    sendAnotherLabel: {
      fontFamily: fonts.medium,
      fontSize: 14,
      lineHeight: 24,
      textDecorationLine: 'underline',
      color: '#1B1B1B',
    },
    durationLabel: {
      fontFamily: fonts.medium,
      fontSize: 16,
      lineHeight: 24,
      color: '#1B1B1B',
    },
    errorWrapper: {
      alignItems: 'center',
      marginTop: 15,
    },
    errorText: {
      color: '#3F3F3F',
      marginLeft: 7,
      fontWeight: '400',
      fontSize: 12,
      fontFamily: fonts.regular,
    },
  });
  return defaultsDeep(style, defaultStyles);
};

export default useMergeStyles;
