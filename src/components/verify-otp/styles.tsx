import { defaultsDeep } from 'lodash';
import { useContext } from 'react';
import { StyleSheet } from 'react-native';
import { VerifyOTPComponentStyles } from './types';
import { ThemeContext } from 'react-native-theme-component';

const useMergeStyles = (
  style?: VerifyOTPComponentStyles
): VerifyOTPComponentStyles => {
  const { fonts, colors } = useContext(ThemeContext);

  const defaultStyles = StyleSheet.create({
    safeArea: {
      flex: 1,
    },
    container: {
      paddingHorizontal: 25,
      flex: 1,
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
      flex: 1,
      marginTop: 20,
    },
    infoView: {
      marginTop: 25,
    },
    rowCenter: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 8,
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
      flex: 1,
      alignItems: 'flex-end',
      marginBottom: 32
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
      flexDirection: 'row'
    },
    errorText: {
      color: colors.errorColor,
      marginLeft: 4,
      fontWeight: '400',
      fontSize: 12,
      fontFamily: fonts.regular,
    },
    buttonWrapper: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      alignItems: 'center',
    },
    buttonTextContainer: { fontFamily: fonts.OutfitSemiBold, color: colors.secondaryColor, fontSize: 16 },
    buttonContainer: {
      height: 64,
      width: 64,
      marginHorizontal: 16,
      marginVertical: 8,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 100,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      // paddingHorizontal: 60,
    },
    pinInputWrapper: {
      justifyContent: 'center',
      alignItems: 'center',
      // paddingTop:20,
      paddingTop: '7.5%',
    },
    dot: {
      height: 16,
      width: 16,
      borderRadius: 20,
      marginHorizontal: 12,
      borderWidth: 1,
    },
    extraDataRow: {
      marginVertical: 4,
      paddingHorizontal: 24,
      flexDirection: 'row',
      alignItems: 'center',
    },
    inputContainer: {
      borderWidth: 1,
      position: 'absolute',
      width: '100%',
      opacity: 0,
      marginTop: 50,
    },
    bodyContainerStyle: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    contentWrapper: {
      flex: 1,
      alignItems: 'flex-end',
      justifyContent: 'flex-end',
      maxWidth: 300,
      // backgroundColor:'red'
    },
  });
  return defaultsDeep(style, defaultStyles);
};

export default useMergeStyles;
