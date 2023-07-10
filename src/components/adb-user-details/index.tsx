import React, { useContext, useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Text, Platform, Keyboard, TouchableOpacity, Dimensions } from 'react-native';
import {
  ADBButton,
  ADBInputField,
  ADB_CURRENCY_CODE,
  ArrowDownIcon,
  ThemeContext,
  useADBCurrencyFormat,
  TextEditIcon,
  defaultColors,
} from 'react-native-theme-component';
import { Formik, FormikProps } from 'formik';
import { fonts } from '../../assets';
import { AuthContext } from '../../auth-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { UserDetailsData, UserDetailsSchema, personalDetailsSchema } from './model';
import remoteConfig from '@react-native-firebase/remote-config';
import { AccountOriginationService } from 'account-origination-component/src/service/onboarding-service';
import { InputTypeEnum } from 'react-native-theme-component/src/adb-input-field';
import { colors } from 'account-origination-component/src/assets';
import ADBBottomSheet, { BSOption }  from 'account-origination-component/src/components/bottomSheet';

type ADBUserDetailsScreenComponentProps = {
  onSuccess: () => void;
  onFailed: () => void;
};

const { height } = Dimensions.get('screen');

const onboardingService = AccountOriginationService.instance();

const ADBUserDetailsScreenComponent = ({
  onSuccess,
  onFailed,
}: ADBUserDetailsScreenComponentProps) => {
  const { i18n } = useContext(ThemeContext);
  const { profile, isUpdatingProfile, updateProfile } = useContext(AuthContext);
  const [isLoadingValues, setIsLoadingValues] = useState<boolean>(false);
  const [isShowBottomSheet, setIsShowBottomSheet] = useState<boolean>(false);
  const [selectedBSValue, setSelectedBSValue] = useState<BSOption>();
  const formikRef = useRef<FormikProps<UserDetailsData>>(null);
  const [searchText, setSearchText] = useState<string>();
  const [bsData, setBSData] = useState<any>();
  const [listCity, setListCity] = useState<any>([]);
  const [selectedBSSubValue, setSelectedBSSubValue] = useState<BSOption>();
  const [listState, setListState] = useState<any>([]);
  const [isUnEmployed, setIsUnEmployed] = useState<boolean>(
    profile?.employmentDetails?.[0]?.employmentType === 'Unemployed'
  );
  const [isOutsideLabourForce, setIsOutsizeLabourForce] =
    useState<boolean>(profile?.employmentDetails?.[0]?.employmentType === "Outside Labour Force");
  const [keyboardHeight, setKeyboardHeight] = useState<number>(0);
  const [checkEdit, setCheckEdit] = useState<string>('');

  const getOccupationList = async () => {
    setIsLoadingValues(true);
    setIsShowBottomSheet(true);
    try {
      const response = await onboardingService.getOccupationList();
      if (response.data) {
        const listBSData = response.data.map((c: any) => ({
          id: c.id,
          value: c.name,
          type: 'String',
        }));
        setBSData({
          items: listBSData,
          title: 'Occupation',
          isHaveSearchBox: true,
          name: 'occupation',
          searchBoxPlaceholder: 'Search',
          type: 'OptionsList',
        });
      }
    } catch {
    } finally {
      setIsLoadingValues(false);
    }
  };

  const getMetaData = (name: string) => {
    setIsLoadingValues(true);
    remoteConfig()
      .fetchAndActivate()
      .then((value) => {
        const metadata: any = remoteConfig().getValue('OnboardingDataFields');
        if (metadata && metadata._value) {
          const jsonData = JSON.parse(metadata._value);
          const indexReligion = jsonData.fields.findIndex((d: any) => d.name === name);
          const selectedData = jsonData.fields[indexReligion];
          setBSData(selectedData);
        }
        setIsLoadingValues(false);
      })
      .catch((e) => {
        setIsLoadingValues(false);
      });
    setIsShowBottomSheet(true);
  };

  const onPressOccupation = () => {
    getOccupationList();
  };

  const onBackBtnPress = () => {
    setSearchText('');
  };

  const onBackdropPress = () => {
    setIsShowBottomSheet(false);
    setSearchText('');
  };

  const onPressReligionInput = () => {
    getMetaData('religion');
  };

  const onPressMaritialStatus = () => {
    getMetaData('maritalStatus');
  };

  const onSelectCity = (value: string) => {
    const selectedCity = listCity.find((c: any) => c.locationName === value);
    if (selectedCity) {
      getStateList(selectedCity.parentLocationId);
    }
  };

  const onPressCity = (postCode: string) => {
    getCityList(postCode);
  };

  const getCityList = async (postCode: string) => {
    setIsLoadingValues(true);
    try {
      const bsData = {
        items: [],
        title: 'City',
        isHaveSearchBox: true,
        name: 'city',
        searchBoxPlaceholder: 'Search',
        type: 'OptionsList',
      };

      const response = await onboardingService.getCities(postCode);

      if (response.data && formikRef.current) {
        if (response.data.length === 1) {
          formikRef.current.setFieldValue('city', response.data[0].locationName);
          getStateList(response.data[0].parentLocationId);
        } else if (response.data.length > 1) {
          setIsShowBottomSheet(true);
          bsData.items = response.data.map((c: any) => ({
            id: c.id,
            value: c.locationName,
            key: c.countryId,
            type: 'String',
          }));
        } else {
          formikRef.current.setFieldError('postcode', 'Invalid post code');
        }
        setListCity(response.data);
        setBSData(bsData);
      }
    } catch {
    } finally {
      setIsLoadingValues(false);
    }
  };

  const getStateList = async (id: string) => {
    if (id && formikRef.current) {
      try {
        const response = await onboardingService.getStates();
        if (response.data) {
          const statesBaseOnCity = response.data.filter((s: any) => s.id === id);
          if (statesBaseOnCity.length === 1) {
            formikRef.current.setFieldValue('state', statesBaseOnCity[0].locationName);
          }
          setListState(statesBaseOnCity);
        }
      } catch {}
    }
  };

  const onPressImploymentType = () => {
    getMetaData('employmentType');
  };

  const onPressImploymentSector = () => {
    getMetaData('employmentSector');
  };

  const displayData = bsData
    ? searchText && searchText.length > 0 && bsData.items?.length > 0
      ? bsData.items.filter((i: BSOption) => i.value.includes(searchText))
      : bsData.items.filter((i: BSOption) => i.value !== 'Not Applicable')
    : [];

    useEffect(() => {
      const keyboardDidShowListener = Keyboard.addListener(
        "keyboardDidShow",
        (e) => {
          const height =
            e.endCoordinates.height - (Platform.OS === "android" ? 50 : 0);
          setKeyboardHeight(height);
        }
      );
  
      const keyboardDidHideListener = Keyboard.addListener(
        "keyboardDidHide",
        () => {
          setKeyboardHeight(0);
        }
      );
      return () => {
        keyboardDidHideListener.remove();
        keyboardDidShowListener.remove();
      };
    }, []);

    const handleBlur = (value: string) => {
      onPressCity(value);
      setCheckEdit('');
    }

  return (
    <View style={styles.container}>
      <Formik
        innerRef={formikRef}
        validationSchema={personalDetailsSchema(isUnEmployed, isOutsideLabourForce, i18n)}
        initialValues={UserDetailsData.empty(profile)}
        onSubmit={async (values) => {
          const inputedValue = {
            nickName: values.nickName,
            religion: values.religion,
            maritalStatus: values.maritalStatus,
            addresses: [
              {
                addressType: 'Mailing Address',
                line1: values.line1,
                line2: values.line2,
                postcode: values.postcode,
                city: values.city,
                state: values.state,
                country: 'Malaysia',
              },
            ],
            employmentDetails: [
              {
                ...profile?.employmentDetails?.[0],
                employmentType: values.employmentType,
                sector: isUnEmployed ? 'Not Application' : values.employmentSector,
                companyName: isUnEmployed ? '' : values.employerName,
                occupation: isUnEmployed ? '' : values.occupation,
              },
            ],
            creditDetails: [
              {
                annualIncome: values.annualIncome,
              },
            ],
          };
          const isSuccess = await updateProfile(profile?.userId, inputedValue);
          if (isSuccess) {
            onSuccess();
          } else {
            onFailed();
          }
        }}
      >
        {({ submitForm, dirty, errors, isValid, values, setFieldValue, touched }) => {
          if (`${values.annualIncome}`.length > 0) {
            const { currencyFormated } = useADBCurrencyFormat(`${values.annualIncome}`);
            if (
              currencyFormated &&
              `${values.annualIncome}`.length > 0 &&
              currencyFormated !== `${values.annualIncome}`
            ) {
              setFieldValue("annualIncome", currencyFormated === '0.00'? '' :currencyFormated);
            } else if (values.annualIncome[0] === '.') {
              setFieldValue('annualIncome', '0.');
            }
          }
          
          return (
            <>
              <KeyboardAwareScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                keyboardOpeningTime={Number.MAX_SAFE_INTEGER}
                extraScrollHeight={50}
                enableResetScrollToCoords={false}
              >
                <Text style={styles.mainheading}>
                  {i18n.t('user_details.personal_details_section_title')}
                </Text>
                <View style={styles.verticalSpacing} />
                <ADBInputField
                  name={'nickName'}
                  hideUnderLine={true}
                  placeholder={i18n.t('user_details.preferred_name')}
                  type='custom'
                  inputType={InputTypeEnum.MATERIAL}
                  editable={checkEdit === 'nickName'}
                  value={values.nickName}
                  onBlur={() => {
                    setCheckEdit('');
                  }}
                  suffixIcon={
                    checkEdit !== 'nickName' && (
                      <TouchableOpacity 
                        onPress={() => setCheckEdit('nickName')}
                      >
                        <TextEditIcon size={21} />
                      </TouchableOpacity>
                    )  
                  }
                  errors={errors}
                  touched={touched}
                />
                <View style={styles.verticalSpacing} />
                <ADBInputField
                  name={'religion'}
                  hideUnderLine={true}
                  placeholder={i18n.t('user_details.religion')}
                  editable={false}
                  suffixIcon={<ArrowDownIcon color={colors.primary} width={21} height={21} />}
                  onClickSuffixIcon={onPressReligionInput}
                  onPressIn={onPressReligionInput}
                  type='custom'
                  inputType={InputTypeEnum.MATERIAL}
                  errors={errors}
                  touched={touched}
                />
                <View style={styles.verticalSpacing} />
                <ADBInputField
                  name={'maritalStatus'}
                  hideUnderLine={true}
                  placeholder={i18n.t('user_details.marital_status')}
                  editable={false}
                  suffixIcon={<ArrowDownIcon color={colors.primary} width={21} height={21} />}
                  onClickSuffixIcon={onPressMaritialStatus}
                  onPressIn={onPressMaritialStatus}
                  type='custom'
                  inputType={InputTypeEnum.MATERIAL}
                  errors={errors}
                  touched={touched}
                />
                <View style={styles.underline} />
                <Text style={styles.mainheading}>{i18n.t('user_details.mailing_address')}</Text>
                <View style={styles.verticalSpacing} />
                <ADBInputField
                  name={'line1'}
                  hideUnderLine={true}
                  placeholder={i18n.t('user_details.line1')}
                  type='custom'
                  inputType={InputTypeEnum.MATERIAL}
                  editable={checkEdit === 'line1'}
                  value={values.line1}
                  onBlur={() => {
                    setCheckEdit('');
                  }}
                  suffixIcon={
                    checkEdit !== 'line1' && (
                      <TouchableOpacity 
                        onPress={() => setCheckEdit('line1')}
                      >
                        <TextEditIcon size={21} />
                      </TouchableOpacity>
                    )  
                  }
                  errors={errors}
                  touched={touched}
                />
                <View style={styles.verticalSpacing} />
                <ADBInputField
                  name={'line2'}
                  hideUnderLine={true}
                  placeholder={i18n.t('user_details.line2')}
                  type='custom'
                  inputType={InputTypeEnum.MATERIAL}
                  editable={checkEdit === 'line2'}
                  value={values.line2}
                  onBlur={() => {
                    setCheckEdit('');
                  }}
                  suffixIcon={
                    checkEdit !== 'line2' && (
                      <TouchableOpacity 
                        onPress={() => setCheckEdit('line2')}
                      >
                        <TextEditIcon size={21} />
                      </TouchableOpacity>
                    )  
                  }
                  errors={errors}
                  touched={touched}
                />
                <View style={styles.verticalSpacing} />
                <ADBInputField
                  name={'postcode'}
                  hideUnderLine={true}
                  maxLength={5}
                  placeholder={i18n.t('user_details.postcode')}
                  onBlur={() => handleBlur(values.postcode)}
                  onFocus={() => {
                    setListCity([]);
                    setListState([]);
                  }}
                  type='custom'
                  inputType={InputTypeEnum.MATERIAL}
                  editable={checkEdit === 'postcode'}
                  value={values.postcode}
                  suffixIcon={
                    checkEdit !== 'postcode' && (
                      <TouchableOpacity 
                        onPress={() => setCheckEdit('postcode')}
                      >
                        <TextEditIcon size={21} />
                      </TouchableOpacity>
                    )  
                  }
                  autoComplete={"off"}
                  keyboardType={"numeric"}
                  returnKeyType="done"
                  errors={errors}
                  touched={touched}
                />
                <View style={styles.verticalSpacing} />
                <ADBInputField
                  name={'city'}
                  hideUnderLine={true}
                  placeholder={i18n.t('user_details.city')}
                  editable={false}
                  suffixIcon={<ArrowDownIcon color={colors.primary} width={21} height={21} />}
                  onClickSuffixIcon={() => getCityList(values.postcode)}
                  onPressIn={() => getCityList(values.postcode)}
                  type='custom'
                  inputType={InputTypeEnum.MATERIAL}
                  errors={errors}
                  touched={touched}
                />
                <View style={styles.verticalSpacing} />
                <ADBInputField
                  name={'state'}
                  hideUnderLine={true}
                  placeholder={i18n.t('user_details.state')}
                  editable={false}
                  suffixIcon={<ArrowDownIcon color={colors.primary} width={21} height={21} />}
                  type='custom'
                  inputType={InputTypeEnum.MATERIAL}
                  errors={errors}
                  touched={touched}
                />

                <View style={styles.underline} />
                <Text style={styles.mainheading}>{i18n.t('user_details.employment_details')}</Text>

                <View style={styles.verticalSpacing} />
                <ADBInputField
                  name={'employmentType'}
                  hideUnderLine={true}
                  placeholder={i18n.t('user_details.employment_type')}
                  editable={false}
                  suffixIcon={<ArrowDownIcon color={colors.primary} width={21} height={21} />}
                  onPressIn={onPressImploymentType}
                  onClickSuffixIcon={onPressImploymentType}
                  type='custom'
                  inputType={InputTypeEnum.MATERIAL}
                  errors={errors}
                  touched={touched}
                />

                {isUnEmployed || isOutsideLabourForce ? (
                  <View style={styles.rowInfoFixed}>
                    <Text style={styles.rowInfoName}>{i18n.t('user_details.employment_sector')}</Text>
                    <Text style={styles.rowInfoValue}>{i18n.t('user_details.not_applicable')}</Text>
                  </View>
                ) : (
                  <>
                    <View style={styles.verticalSpacing} />

                    <ADBInputField
                      name={'employmentSector'}
                      hideUnderLine={true}
                      placeholder={i18n.t('user_details.employment_sector')}
                      editable={false}
                      onPressIn={onPressImploymentSector}
                      onClickSuffixIcon={onPressImploymentSector}
                      multiline={values.employmentSector.length > 50}
                      style={{
                        inputContainerStyle:
                          values.employmentSector.length > 50
                            ? {
                                height: "auto",
                              }
                            : {},
                      }}
                      suffixIcon={<ArrowDownIcon color={colors.primary} width={21} height={21} />}
                      type='custom'
                      inputType={InputTypeEnum.MATERIAL}
                      errors={errors}
                      touched={touched}
                    />
                  </>
                )}

                {isUnEmployed ? (
                  <View />
                ) : (
                  <View>
                    {
                      !isOutsideLabourForce && (
                        <>
                         <View style={styles.verticalSpacing} />
                          <ADBInputField
                            name={'employerName'}
                            hideUnderLine={true}
                            placeholder={i18n.t('user_details.employer_name')}
                            type='custom'
                            inputType={InputTypeEnum.MATERIAL}
                            editable={checkEdit === 'employerName'}
                            value={values.employerName}
                            onBlur={() => {
                              setCheckEdit('');
                            }}
                            suffixIcon={
                              checkEdit !== 'employerName' && (
                                <TouchableOpacity 
                                  onPress={() => setCheckEdit('employerName')}
                                >
                                  <TextEditIcon size={21} />
                                </TouchableOpacity>
                              )  
                            }
                            errors={errors}
                            touched={touched}
                          />    
                        </>
                      )
                    }
                    
                    <View style={styles.verticalSpacing} />
                    <ADBInputField
                      name={'occupation'}
                      hideUnderLine={true}
                      placeholder={i18n.t('user_details.occupation')}
                      editable={false}
                      onPressIn={onPressOccupation}
                      onClickSuffixIcon={onPressOccupation}
                      suffixIcon={<ArrowDownIcon color={colors.primary} width={21} height={21} />}
                      type='custom'
                      inputType={InputTypeEnum.MATERIAL}
                      multiline={values.employmentSector.length > 50}
                      style={{
                        inputContainerStyle:
                          values.employmentSector.length > 50
                            ? {
                                height: "auto",
                              }
                            : {},
                      }}
                      errors={errors}
                      touched={touched}
                    />
                  </View>
                )}

                <View style={styles.verticalSpacing} />
                <ADBInputField
                  name={'annualIncome'}
                  hideUnderLine={true}
                  prefixText={values.annualIncome.length > 0 ? i18n?.t(
                        "account_origination.employment_details.currency"
                      )+ ' ' ?? "RM " : i18n?.t(
                        "account_origination.employment_details.currency"
                      )+' 0.00' ?? "RM"+' 0.00'}
                  placeholder={i18n.t('user_details.annualIncome')}
                  type='custom'
                  inputType={InputTypeEnum.MATERIAL}
                  editable={checkEdit === 'annualIncome'}
                  onBlur={() => {
                    if (values.annualIncome) {
                      const { currencyFormated } = useADBCurrencyFormat(
                        values.annualIncome,
                        'blur'
                      );
                      setFieldValue("annualIncome", currencyFormated === '0.00'? '' :currencyFormated);
                    }
                    setCheckEdit('');
                  }}
                  suffixIcon={
                    checkEdit !== 'annualIncome' && (
                      <TouchableOpacity 
                        onPress={() => setCheckEdit('annualIncome')}
                      >
                        <TextEditIcon size={21} />
                      </TouchableOpacity>
                    )  
                  }
                  autoComplete={"off"}
                  keyboardType={"numeric"}
                  returnKeyType="done"
                  errors={errors}
                  touched={touched}
                />
                <View style={styles.verticalSpacing} />
                <View style={styles.verticalSpacing} />
                <ADBButton
                  label={'Save'}
                  onPress={submitForm}
                  disabled={!isValid}
                  isLoading={isUpdatingProfile}
                />
                <View style={styles.verticalSpacing} />
              </KeyboardAwareScrollView>

              {bsData && (
                <ADBBottomSheet
                  items={displayData}
                  title={bsData.title}
                  type={bsData.type}
                  searchBoxPlaceholder={bsData.searchBoxPlaceholder}
                  isHaveSearchBox={bsData.isHaveSearchBox}
                  onBackBtnPress={onBackBtnPress}
                  onBackdropPress={onBackdropPress}
                  isShowBottomSheet={isShowBottomSheet}
                  isLoadingValues={isLoadingValues}
                  bsContainerStyle={{
                    minHeight: bsData.name === "employmentSector" || bsData.name === "occupation" ? height / 1.1: bsData.name === "employmentType"? height / 1.5 : 450,
                    backgroundColor: defaultColors.mainBackgroundColor,
                  }}
                  onChangeValue={setSelectedBSValue}
                  onSearch={(t) => setSearchText(t)}
                  onSelectValue={(value) => {
                    setFieldValue(bsData.name, value);
                    setSearchText('');
                    setIsShowBottomSheet(false);
                    if (bsData.name === 'city') {
                      onSelectCity(value);
                    }
                    if (bsData.name === 'employmentType') {
                      if (value === 'Unemployed') {
                        setIsUnEmployed(true);
                        setIsOutsizeLabourForce(false);
                        setFieldValue('occupation', '');
                      } else if (value === 'Outside Labour Force') {
                        setIsUnEmployed(false);
                        setIsOutsizeLabourForce(true);
                        setFieldValue('occupation',  profile?.employmentDetails?.[0]?.employmentType === value ? profile?.employmentDetails?.[0]?.occupation :'');
                      } else {
                        setIsUnEmployed(false);
                        setIsOutsizeLabourForce(false);
                        setFieldValue('employmentSector', '');
                        setFieldValue('occupation', profile?.employmentDetails?.[0]?.employmentType === value ? profile?.employmentDetails?.[0]?.occupation :'');
                      }
                    }
                    setTimeout(() => {
                        formikRef.current?.validateForm();
                    }, 500)
                  }}
                  selectedValue={selectedBSValue}
                  selectedBSSubValue={selectedBSSubValue}
                  onChangeSubValue={setSelectedBSSubValue}
                />
              )}
            </>
          );
        }}
      </Formik>
    </View>
  );
};

const styles = StyleSheet.create({
  errorSection: {
    marginTop: 10,
  },
  container: {
    flex: 1,
    paddingHorizontal: 22,
    marginTop: 20,
  },
  header: {
    paddingVertical: 10,
    paddingHorizontal: 5,
    marginTop: 30,
  },
  validContainer: {
    marginTop: 10,
  },
  validationLabel: {
    marginLeft: 6,
  },
  rowItemValid: {
    marginVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    marginRight: 10,
  },
  remainingLabel: {
    textAlign: 'right',
  },
  verticalSpacing: {
    height: 15,
  },
  bottomSection: {
    marginBottom: 15,
  },
  flex: {
    flex: 1,
  },
  rowSpaceBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  buttonAction: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 15,
  },
  content: {
    flex: 1,
    marginLeft: 4,
  },
  title: {
    fontSize: 24,
    color: colors.primaryBlack,
    fontFamily: fonts.semiBold,
  },
  subtitle: {
    color: colors.primaryBlack,
    marginTop: 10,
  },
  subTitle: {
    fontSize: 14,
    color: colors.primaryBlack,
    fontFamily: fonts.regular,
    marginTop: 14,
  },
  cameraDisableContainer: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 24,
  },
  gap16: {
    height: 16,
  },
  gap40: {
    height: 40,
  },
  gap8: {
    height: 8,
  },
  modalsubTitle: {
    fontSize: 14,
    color: colors.primaryBlack,
    fontFamily: fonts.regular,
    marginTop: 8,
  },
  loginTitle: {
    fontSize: 24,
    color: colors.primaryBlack,
    fontFamily: fonts.semiBold,
  },
  mainheading: {
    fontFamily: fonts.OutfitSemiBold,
    fontSize: 16,
    color: colors.blackColor,
    lineHeight: 20,
    fontWeight: '600',
  },
  subheading: {
    marginTop: 12,
  },
  underline: {
    borderBottomColor: colors.underline,
    marginVertical: 16,
  },
  rowInfoFixed: {
    paddingVertical: 8,
    marginVertical: 5,
    backgroundColor: defaultColors.neutral,
    paddingHorizontal: 16,
    borderRadius: 12
  },
  rowInfoTitle: {
    color: '#1B1B1B',
    fontSize: 16,
    fontFamily: fonts.medium,
  },
  rowInfoName: {
    color: defaultColors.black500,
    fontSize: 12,
    lineHeight: 20,
    fontWeight: '400',
    fontFamily: fonts.OutfitRegular,
  },
  rowInfoValue: {
    color: defaultColors.black500,
    fontSize: 14,
    fontFamily: fonts.OutfitRegular,
    lineHeight: 20,
    fontWeight: '400',
    marginTop: 4,
  },
});

export default ADBUserDetailsScreenComponent;
