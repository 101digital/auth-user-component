import { colors, fonts } from '@/assets';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  successContainer: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  mainContainer: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 24,
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
  actionButton: {
    height: 60,
    borderRadius: 8,
    backgroundColor: 'white',
    shadowOffset: {
      width: 0,
      height: 1,
    },
  },
  inputContainer: {
    paddingTop: 20,
  },
  inputBottemContainer: {
    paddingVertical: 20,
  },
  labelTextStyle: {
    fontSize: 12,
    lineHeight: 21,
    fontFamily: fonts.medium,
    color: colors.primaryText,
    marginBottom: 3,
    marginTop: 20,
  },
  noteContainer: {
    borderRadius: 8,
    // backgroundColor: '#E7DBF5',
    // width: 327,
    padding: 15,
    paddingTop: 0,
    paddingHorizontal: 24,
  },
  noteText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: '#4E4B50',
    lineHeight: 24,
  },
  checkBoxWrapper: { marginBottom: 19 },
  checkBoxWrapperWithTooltip: {
    justifyContent: 'flex-start',
    flexDirection: 'row',
  },
  tooltip: { marginLeft: -5 },
  tooltipContent: { marginLeft: -1, borderRadius: 2 },
  tooltipArrow: { marginLeft: 4 },
  inputTitle: {
    marginBottom: 7,
  },
});
