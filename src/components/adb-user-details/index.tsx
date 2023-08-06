import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Platform,
  Keyboard,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
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
import ADBBottomSheet, { BSOption } from 'account-origination-component/src/components/bottomSheet';
import {amountFormat} from "@/helpers/amount-input";
import { uniqBy } from 'lodash';

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
  const [isOutsideLabourForce, setIsOutsizeLabourForce] = useState<boolean>(
    profile?.employmentDetails?.[0]?.employmentType === 'Outside Labour Force'
  );
  const [keyboardHeight, setKeyboardHeight] = useState<number>(0);
  const [checkEdit, setCheckEdit] = useState<string>('');
  const [viewingBSField, setViewingBSField] = useState<any>();
  const [isSkipFetchState, setIsSkipFetchState] = useState<boolean>(false);

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
  
  const showBSCityList = (listCity: any[]) => {
    if (listCity.length > 0) {
      setIsShowBottomSheet(true);

      const bsData = {
        items: [],
        title: "City",
        isHaveSearchBox: true,
        name: "city",
        searchBoxPlaceholder: "Search",
        type: "OptionsList",
      };

      bsData.items = uniqBy(listCity, "id").map((c) => ({
        id: c.id,
        value: c.locationName,
        type: "String",
      }));

      setBSData(bsData);
      setIsShowBottomSheet(true);
    }
  };

  const showBSStateList = (listStates: any[]) => {
    if (listStates.length > 0) {
      setIsShowBottomSheet(true);

      const bsData = {
        items: [],
        title: "State",
        isHaveSearchBox: true,
        name: "state",
        searchBoxPlaceholder: "Search",
        type: "OptionsList",
      };

      bsData.items = uniqBy(listStates, "id").map((c) => ({
        id: c.id,
        value: c.locationName,
        type: "String",
      }));

      setBSData(bsData);
      setIsShowBottomSheet(true);
    }
  };

  const onPressCity = () => {
    showBSCityList(listCity);
    setViewingBSField('city')
  };

  const onPressState = () => {
    showBSStateList(listState);
    setViewingBSField('state')
  };

  const getStateList = async (parentLocationId: string | string[]) => {
    if(isSkipFetchState) { 
      return;
    }
    if (parentLocationId && formikRef.current) {
      try {
        const response = await onboardingService.getStates();
        if (response.data) {
          let statesBaseOnCity = [];
          if (typeof parentLocationId === "string") {
            statesBaseOnCity = response.data.filter(
              (s: any) => s.id === parentLocationId
            );
            formikRef.current.setFieldValue(
              "state",
              statesBaseOnCity[0].locationName
            );
            setListState(statesBaseOnCity);
          } else {
            statesBaseOnCity = response.data.filter((s: any) =>
              parentLocationId.some((id) => id === s.id)
            );
            setIsSkipFetchState(true);
            setListState(statesBaseOnCity);
            showBSStateList(statesBaseOnCity);
          }
        }
      } catch {
        setIsShowBottomSheet(false);
      }
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
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (e) => {
      const height = e.endCoordinates.height - (Platform.OS === 'android' ? 50 : 0);
      setKeyboardHeight(height);
    });

    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
      setCheckEdit('');
    });
    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);


  const getCityList = async (postCode: string) => {
    setIsLoadingValues(true);
    try {
      const bsData = {
        items: [],
        title: "City",
        isHaveSearchBox: true,
        name: "city",
        searchBoxPlaceholder: "Search",
        type: "OptionsList",
      };

      const response = await onboardingService.getCities(postCode);
      if (response.data && formikRef.current) {
        let parentLocationIds = [];
        if (response.data.length >= 1) {
          parentLocationIds = response.data.map((d) => d.parentLocationId);
          const filteredData = uniqBy(response.data, "locationName");
          
          bsData.items = filteredData.map((c) => ({
            id: c.id,
            value: c.locationName,
            key: c.countryId,
            type: "String",
          }));

          if (bsData.items.length > 1) {
            setBSData(bsData);
            setIsShowBottomSheet(true);
            setListCity(filteredData);
          } else {
            formikRef.current.setFieldValue("city", bsData.items[0].value);
            getStateList(
              parentLocationIds.length > 1
                ? parentLocationIds
                : parentLocationIds[0]
            );
            setListCity(filteredData);
            setBSData(bsData);
          }
        } else {
          formikRef.current.setFieldError("postcode", "Invalid post code");
        }
      }
    } catch {
      setIsShowBottomSheet(false);
    } finally {
      setIsLoadingValues(false);
    }
  };

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
                sector: isUnEmployed ? 'Not Applicable' : values.employmentSector,
                companyName: isUnEmployed ? '' : values.employerName,
                occupation: isUnEmployed
                  ? i18n.t('saving_account_detail_screen.other_outside_labour_force')
                  : values.occupation,
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
            amountFormat(values?.annualIncome, (num:string) => {
              setFieldValue('annualIncome', num);
            })
          }
          const renderSelectedValue = selectedBSValue ? selectedBSValue : {
            id: viewingBSField,
            value: values[`${viewingBSField}`]
          }


          return (
            <>
              <KeyboardAwareScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                keyboardOpeningTime={Number.MAX_SAFE_INTEGER}
                keyboardDismissMode='interactive'
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
                  placeholder={i18n.t('user_name.preferredName')}
                  type="custom"
                  inputType={InputTypeEnum.MATERIAL}
                  editable={checkEdit === 'nickName'}
                  value={values.nickName}
                  onBlur={() => {
                    if (checkEdit === 'nickName') {
                      setCheckEdit('');
                    }
                  }}
                  suffixIcon={
                    checkEdit !== "nickName" && (
                      <TextEditIcon size={21} />
                    )
                  }
                  onClickSuffixIcon={() => setCheckEdit("nickName")}
                  onInputPress={() => setCheckEdit("nickName")}                  
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
                  onInputPress={onPressReligionInput}
                  type="custom"
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
                  onInputPress={onPressMaritialStatus}
                  type="custom"
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
                  type="custom"
                  inputType={InputTypeEnum.MATERIAL}
                  editable={checkEdit === 'line1'}
                  value={values.line1}
                  onBlur={() => {
                    if (checkEdit === 'line1') {
                      setCheckEdit('');
                    }
                  }}
                  suffixIcon={
                    checkEdit !== "line1" && (
                      <TextEditIcon size={21} />
                    )
                  }
                  onClickSuffixIcon={() => setCheckEdit("line1")}
                  onInputPress={() => setCheckEdit("line1")}           
                  errors={errors}
                  touched={touched}
                />
                <View style={styles.verticalSpacing} />
                <ADBInputField
                  name={'line2'}
                  hideUnderLine={true}
                  placeholder={i18n.t('user_details.line2')}
                  type="custom"
                  inputType={InputTypeEnum.MATERIAL}
                  editable={checkEdit === 'line2'}
                  value={values.line2}
                  onBlur={() => {
                    if (checkEdit === 'line2') {
                      setCheckEdit('');
                    }
                  }}
                  suffixIcon={
                    checkEdit !== "line2" && (
                      <TextEditIcon size={21} />
                    )
                  }
                  onClickSuffixIcon={() => setCheckEdit("line2")}
                  onInputPress={() => setCheckEdit("line2")}
                  errors={errors}
                  touched={touched}
                />
                <View style={styles.verticalSpacing} />
                <ADBInputField
                  name={'postcode'}
                  hideUnderLine={true}
                  maxLength={5}
                  placeholder={i18n.t('user_details.postcode')}
                  onBlur={() => {
                    getCityList(values.postcode);
                    if (checkEdit === 'postcode') {
                      setCheckEdit('');
                    }
                  }}
                  onFocus={() => {
                    setIsSkipFetchState(false);
                    setListCity([]);
                    setListState([]);
                    formikRef.current?.setFieldValue("city", "");
                    formikRef.current?.setFieldValue("state", "");
                  }}
                  type="custom"
                  inputType={InputTypeEnum.MATERIAL}
                  editable={checkEdit === 'postcode'}
                  value={values.postcode}
                  suffixIcon={
                    checkEdit !== "postcode" && (
                      <TextEditIcon size={21} />
                    )
                  }
                  onClickSuffixIcon={() => setCheckEdit("postcode")}
                  onInputPress={() => setCheckEdit("postcode")}
                  autoComplete={'off'}
                  keyboardType={'numeric'}
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
                  onClickSuffixIcon={onPressCity}
                  onInputPress={onPressCity}
                  type="custom"
                  inputType={InputTypeEnum.MATERIAL}
                  errors={errors}
                  touched={touched}
                />
                <View style={styles.verticalSpacing} />
                <ADBInputField
                  name={'state'}
                  hideUnderLine={true}
                  placeholder={i18n.t('user_details.state')}
                  onClickSuffixIcon={onPressState}
                  onInputPress={onPressState}
                  editable={false}
                  suffixIcon={<ArrowDownIcon color={colors.primary} width={21} height={21} />}
                  type="custom"
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
                  onInputPress={onPressImploymentType}
                  onClickSuffixIcon={onPressImploymentType}
                  type="custom"
                  inputType={InputTypeEnum.MATERIAL}
                  errors={errors}
                  touched={touched}
                />

                {isUnEmployed || isOutsideLabourForce ? (
                  <View style={styles.rowInfoFixed}>
                    <Text style={styles.rowInfoName}>
                      {i18n.t('user_details.employment_sector')}
                    </Text>
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
                      onInputPress={onPressImploymentSector}
                      onClickSuffixIcon={onPressImploymentSector}
                      multiline={values.employmentSector.length > 50}
                      style={{
                        inputContainerStyle:
                          values.employmentSector.length > 50
                            ? {
                                height: 'auto',
                              }
                            : {},
                      }}
                      suffixIcon={<ArrowDownIcon color={colors.primary} width={21} height={21} />}
                      type="custom"
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
                    {!isOutsideLabourForce && (
                      <>
                        <View style={styles.verticalSpacing} />
                        <ADBInputField
                          name={'employerName'}
                          hideUnderLine={true}
                          placeholder={i18n.t('user_details.employer_name')}
                          type="custom"
                          inputType={InputTypeEnum.MATERIAL}
                          editable={checkEdit === 'employerName'}
                          value={values.employerName}
                          onBlur={() => {
                            if (checkEdit === 'employerName') {
                              setCheckEdit('');
                            }
                          }}
                          suffixIcon={
                            checkEdit !== 'employerName' && (
                              <TouchableOpacity onPress={() => setCheckEdit('employerName')}>
                                <TextEditIcon size={21} />
                              </TouchableOpacity>
                            )
                          }
                          errors={errors}
                          touched={touched}
                        />
                      </>
                    )}

                    <View style={styles.verticalSpacing} />
                    <ADBInputField
                      name={'occupation'}
                      hideUnderLine={true}
                      placeholder={i18n.t('user_details.occupation')}
                      editable={false}
                      onInputPress={onPressOccupation}
                      onClickSuffixIcon={onPressOccupation}
                      suffixIcon={<ArrowDownIcon color={colors.primary} width={21} height={21} />}
                      type="custom"
                      inputType={InputTypeEnum.MATERIAL}
                      multiline={values.employmentSector.length > 50}
                      style={{
                        inputContainerStyle:
                          values.employmentSector.length > 50
                            ? {
                                height: 'auto',
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
                  prefixText={
                    i18n?.t('account_origination.employment_details.currency') + ' ' ?? 'RM '
                  }
                  placeholder={i18n.t('user_details.annualIncome')}
                  type="custom"
                  inputType={InputTypeEnum.MATERIAL}
                  editable={checkEdit === 'annualIncome'}
                  onBlur={() => {
                    if (values.annualIncome) {
                      const { currencyFormated } = useADBCurrencyFormat(
                        values.annualIncome,
                        'blur'
                      );
                      setFieldValue('annualIncome', currencyFormated);
                    }

                    if (checkEdit === 'annualIncome') {
                      setCheckEdit('');
                    }
                  }}
                  suffixIcon={
                    checkEdit !== "annualIncome" && (
                      <TextEditIcon size={21} />
                    )
                  }
                  onClickSuffixIcon={() => setCheckEdit("annualIncome")}
                  onInputPress={() => setCheckEdit("annualIncome")}
                  autoComplete={'off'}
                  keyboardType={'numeric'}
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
                    minHeight:
                      bsData.name === 'employmentSector' || bsData.name === 'occupation'
                        ? height / 1.1
                        : bsData.name === 'employmentType'
                        ? height / 1.5
                        : 450,
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
                        setFieldValue(
                          'occupation',
                          profile?.employmentDetails?.[0]?.employmentType === value
                            ? profile?.employmentDetails?.[0]?.occupation
                            : ''
                        );
                      } else {
                        setIsUnEmployed(false);
                        setIsOutsizeLabourForce(false);
                        setFieldValue('employmentSector', '');
                        setFieldValue(
                          'occupation',
                          profile?.employmentDetails?.[0]?.employmentType === value
                            ? profile?.employmentDetails?.[0]?.occupation
                            : ''
                        );
                      }
                    }
                    setSelectedBSValue(undefined);
                    setTimeout(() => {
                      formikRef.current?.validateForm();
                    }, 500);
                  }}
                  isCompareByValue={true}
                  selectedValue={renderSelectedValue}
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
    borderRadius: 12,
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
