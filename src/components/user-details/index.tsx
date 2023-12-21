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
  ASButton,
  ASInputField,
  ArrowDownIcon,
  ThemeContext,
  useASCurrencyFormat,
  TextEditIcon,
  defaultColors,
  useThemeColors,
} from 'react-native-theme-component';
import RadioGroupComponent, { RadioData } from 'react-native-theme-component/src/radio-group';
import { Formik, FormikProps } from 'formik';
import { fonts } from 'react-native-auth-component/src/assets';
import { AddCircleIcon, TrashIcon } from 'account-origination-component/src/assets/icons';
import { AuthContext } from 'react-native-auth-component/src/auth-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import {
  UserDetailsData,
  UserDetailsSchema,
  personalDetailsSchema,
} from 'react-native-auth-component/src/components/user-details/model';
import remoteConfig from '@react-native-firebase/remote-config';
import { AccountOriginationService } from 'account-origination-component/src/service/onboarding-service';
import { InputTypeEnum } from 'react-native-theme-component/src/input-field';
import { colors } from 'account-origination-component/src/assets';
import ASBottomSheet, { BSOption } from 'account-origination-component/src/components/bottomSheet';
import { amountFormat } from '@/helpers/amount-input';
import { uniqBy } from 'lodash';
import { getEnterpriseData } from '@/helpers/screen-utils.ts';
import { AppContext } from '@/context/AppContext';

type UserDetailsScreenComponentProps = {
  onSuccess: () => void;
  onFailed: () => void;
  onCompletedLoadingInitialState: () => void;
};

const { height } = Dimensions.get('screen');

const onboardingService = AccountOriginationService.instance();

const personalDetailsMetaDataKeys = [
  'EntData_religion',
  'EntData_maritalStatus',
  'EntData_employmentType',
  'EntData_employmentSector',
  'EntData_taxReason',
  'EntData_occupation',
  'EntData_country',
];

export type Taxes = {
  id: string | null;
  taxCountry?: string;
  taxCountryCode?: string;
  haveTaxNumberHandy?: boolean;
  taxNumber?: string;
  reason?: string;
  reasonDetails?: string;
};

const UserDetailsScreenComponent = ({
  onSuccess,
  onFailed,
  onCompletedLoadingInitialState,
}: UserDetailsScreenComponentProps) => {
  const { i18n } = useContext(ThemeContext);
  const [listTaxes, setListTaxes] = useState<Taxes[]>([]);
  const { profile, isUpdatingProfile, updateProfile, userPreferences } = useContext(AuthContext);
  const [isLoadingValues, setIsLoadingValues] = useState<boolean>(false);
  const [isShowBottomSheet, setIsShowBottomSheet] = useState<boolean>(false);
  const [selectedBSValue, setSelectedBSValue] = useState<BSOption>();
  const formikRef = useRef<FormikProps<UserDetailsData>>(null);
  const [searchText, setSearchText] = useState<string>();
  const [bsData, setBSData] = useState<any>();
  const [listCity, setListCity] = useState<any>([]);
  const [selectedBSSubValue, setSelectedBSSubValue] = useState<BSOption>();
  const [listState, setListState] = useState<any>([]);
  const [listCountry, setListCountry] = useState<any>();
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
  const [metadata, setMetadata] = useState<any>();
  const [isViewingCountry, setIsViewingCountry] = useState<boolean>(false);
  const [isViewingReasonBS, setIsViewingReasonBS] = useState<boolean>(false);
  const [selectedReasonViewingIndex, setSelectedReasonViewingIndex] = useState<number>(0);
  const [accountPurposePlaceholderVisible, setAccountPurposePlaceholderVisible] =
    useState<boolean>(false);
  const [isSelectedOtherCountry, setIsSelectedOtherCountry] = useState<boolean>(false);
  const themeColors = useThemeColors();

  const haveTaxNumberHandyOptions = [
    {
      id: '01',
      label: 'Yes',
    },
    {
      id: '02',
      label: 'No',
    },
  ];

  const inputStyles = {
    containerStyle: styles.input,
    contentContainerStyle: { paddingRight: 16 },
  };

  const inputTaxStyles = {
    containerStyle: styles.input,
    contentContainerStyle: { marginRight: 36 },
  };

  const getInitEnterpriseData = async () => {
    const enterpriseData = await getEnterpriseData(personalDetailsMetaDataKeys);
    if (enterpriseData) {
      console.log(
        'profile?.maritalStatus',
        profile?.maritalStatus,
        enterpriseData.find((d) => d.groupCode === 'maritalStatus')
      );
      const selectedMaritalStatus = enterpriseData
        .find((d) => d.groupCode === 'maritalStatus')
        .dataItems.find((itm) => itm.key === profile?.maritalStatus)?.value;
      const selectedReligion = enterpriseData
        .find((d) => d.groupCode === 'religion')
        .dataItems.find((itm) => itm.key === profile?.religion)?.value;
      const selectedEmploymentType = enterpriseData
        .find((d) => d.groupCode === 'employmentType')
        .dataItems.find(
          (itm) => itm.key === profile?.employmentDetails?.[0]?.employmentType
        )?.value;
      const selectedEmploymentSector = enterpriseData
        .find((d) => d.groupCode === 'employmentSector')
        .dataItems.find((itm) => itm.key === profile?.employmentDetails?.[0]?.sector)?.value;
      const selectedOccupation = enterpriseData
        .find((d) => d.groupCode === 'occupation')
        .dataItems.find((itm) => itm.key === profile?.employmentDetails?.[0]?.occupation)?.value;

      if (selectedMaritalStatus) {
        formikRef.current?.setFieldValue('maritalStatus', selectedMaritalStatus);
      }
      if (selectedReligion) {
        formikRef.current?.setFieldValue('religion', selectedReligion);
      }
      if (selectedEmploymentType) {
        formikRef.current?.setFieldValue('employmentType', selectedEmploymentType);
      }
      if (selectedEmploymentSector) {
        formikRef.current?.setFieldValue('employmentSector', selectedEmploymentSector);
      }
      if (selectedOccupation) {
        formikRef.current?.setFieldValue('occupation', selectedOccupation);
      }
      const profileAddress =
        profile?.addresses &&
        profile?.addresses.length > 0 &&
        profile.addresses.find((a: any) => a.addressType === 'Mailing Address');

      const newAnnualIncome =
        profile && profile.creditDetails && profile.creditDetails.length > 0
          ? useASCurrencyFormat(
              `${profile.creditDetails[0].annualIncome}`,
              'blur',
              userPreferences?.currencyFormat
            )
          : '';
      formikRef.current?.setFieldValue(
        'employerName',
        profile?.employmentDetails?.[0]?.companyName ?? ''
      );
      formikRef.current?.setFieldValue('nickName', profile?.nickName ?? '');
      formikRef.current?.setFieldValue('line1', profileAddress?.line1 ?? '');
      formikRef.current?.setFieldValue('line2', profileAddress?.line2 ?? '');
      formikRef.current?.setFieldValue('postcode', profileAddress?.postcode ?? '');
      formikRef.current?.setFieldValue('city', profileAddress?.city ?? '');
      formikRef.current?.setFieldValue('state', profileAddress?.state ?? '');
      formikRef.current?.setFieldValue('annualIncome', newAnnualIncome?.currencyFormated ?? '');
    }

    if (profile?.taxDetails && profile.taxDetails.length > 0) {
      console.log('');
      const countryEDS = enterpriseData.find((d) => d.groupCode === 'country');
      const taxReasonEDS = enterpriseData.find((d) => d.groupCode === 'taxReason');

      const cloneTaxDetails = profile?.taxDetails.map((t) => {
        const mappedCountry = countryEDS.dataItems.find((d) => d.key === t.taxCountry);
        const mappedTaxReasonEDS = taxReasonEDS.dataItems.find((d) => d.key === t.reason);
        return {
          ...t,
          taxCountry: mappedCountry ? mappedCountry.value : t.taxCountry,
          reason: mappedTaxReasonEDS ? mappedTaxReasonEDS.value : t.reason,
        };
      });
      formikRef.current?.setFieldValue('taxDetails', cloneTaxDetails);
      formikRef.current?.setFieldValue(
        'listSelectedTaxCountry',
        cloneTaxDetails.map((t) => t.taxCountry).join(', ')
      );
    }

    setMetadata(enterpriseData);
    onCompletedLoadingInitialState();
  };

  useEffect(() => {
    if (profile) {
      getInitEnterpriseData();
    }
  }, [profile]);

  const getMetaData = (name: string, key?: string, isHaveSearchBox = false) => {
    setIsLoadingValues(true);
    const indexReligion = metadata?.findIndex((d) => d.groupCode === name);
    const selectedData = metadata[indexReligion];
    if (selectedData) {
      setBSData({
        items: selectedData.dataItems,
        title: selectedData.groupName,
        name: key ? key : selectedData.groupCode,
        searchBoxPlaceholder: 'Search',
        type: 'OptionsList',
        isHaveSearchBox: isHaveSearchBox,
      });
    }
    setIsLoadingValues(false);
    setIsShowBottomSheet(true);
  };

  const getEDSKeyByValue = (name: string, value: string) => {
    const indexReligion = metadata?.findIndex((d) => d.groupCode === name);
    const selectedData = metadata[indexReligion].dataItems.find((i) => i.value === value);
    if (selectedData) {
      return selectedData.key;
    }
    return '';
  };

  const onPressOccupation = () => {
    getMetaData('occupation', undefined, true);
    setViewingBSField('occupation');
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
    setViewingBSField('religion');
  };

  const onPressMaritialStatus = () => {
    getMetaData('maritalStatus');
    setViewingBSField('maritalStatus');
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
        title: 'City',
        isHaveSearchBox: true,
        name: 'city',
        searchBoxPlaceholder: 'Search',
        type: 'OptionsList',
      };

      bsData.items = uniqBy(listCity, 'id').map((c) => ({
        id: c.id,
        value: c.locationName,
        type: 'String',
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
        title: 'State',
        isHaveSearchBox: true,
        name: 'state',
        searchBoxPlaceholder: 'Search',
        type: 'OptionsList',
      };

      bsData.items = uniqBy(listStates, 'id').map((c) => ({
        id: c.id,
        value: c.locationName,
        type: 'String',
      }));

      setBSData(bsData);
      setIsShowBottomSheet(true);
    }
  };

  const onPressCity = () => {
    showBSCityList(listCity);
    setViewingBSField('city');
  };

  const onPressState = () => {
    showBSStateList(listState);
    setViewingBSField('state');
  };

  useEffect(() => {
    if (profile?.taxDetails) {
      const listTaxes: Taxes[] = [];
      for (let i = 0; i < profile.taxDetails.length; i++) {
        const newObj: Taxes = {
          id: profile.taxDetails[i].id ?? '',
          reason: profile.taxDetails[i].reason,
          taxCountry: profile.taxDetails[i].taxCountry,
          taxNumber: profile.taxDetails[i].taxNumber,
          haveTaxNumberHandy: profile.taxDetails[i].reason ? false : true,
          reasonDetails: profile.taxDetails[i].reasonDetails,
        };
        listTaxes.push(newObj);
      }
      setListTaxes(listTaxes);
    }
  }, [profile]);

  const onPressCountry = async (id: number) => {
    console.log('onPressCountry -> id', id);
    setIsViewingCountry(true);
    setIsLoadingValues(true);
    setIsShowBottomSheet(true);
    try {
      const response = await onboardingService.getCountryList();
      const countryData = metadata.find((d) => d.groupCode === 'country');
      if (response.data && countryData.dataItems && countryData.dataItems.length > 0) {
        console.log('1');
        const listBSData = response.data.map((country) => {
          const mappingEDSData = countryData.dataItems.find((d) => d.key === country.name);

          return {
            id: country.id,
            value: mappingEDSData ? mappingEDSData.value : country.name,
            code: country.code2,
            type: 'String',
          };
        });
        const listItems = isSelectedOtherCountry
          ? listBSData.filter((country) => country.value !== 'Singapore')
          : listBSData;
        const listBSDataExcludedUS = listItems.filter(
          (country) => country.value !== 'United States'
        );
        const listSelectedCountry = [];
        for (let i = 0; i < listTaxes.length; i++) {
          if (formikRef.current?.values.taxDetails[i].taxCountry && i !== id) {
            listSelectedCountry.push(formikRef.current?.values.taxDetails[i].taxCountry);
          }
        }
        setListCountry(response.data);
        setBSData({
          items: listBSDataExcludedUS.filter(
            (i) => !listSelectedCountry.some((c) => c === i.value)
          ),
          title: countryData.groupName,
          isHaveSearchBox: true,
          name: `taxDetails[${id}].taxCountry`,
          searchBoxPlaceholder: 'Search',
          type: 'OptionsList',
        });
      }
    } catch {
      setIsShowBottomSheet(false);
    } finally {
      setIsLoadingValues(false);
    }
  };

  const onPressReason = async (key: string, index: number) => {
    getMetaData('taxReason', key);
    setIsViewingReasonBS(true);
    setSelectedReasonViewingIndex(index);
    setViewingBSField(key);
  };

  const onSelectTaxNumberHandy = (value: RadioData, id: string) => {
    const newListTax = [...listTaxes];
    const idxSelected = listTaxes.findIndex((t) => t.id === id);
    newListTax[idxSelected].haveTaxNumberHandy = value.label === 'Yes';
    setListTaxes(newListTax);
  };

  const onAddMoreTaxes = (setFieldValue?: any) => {
    setListTaxes([
      ...listTaxes,
      {
        id: null,
        haveTaxNumberHandy: true,
        taxCountry: '',
        taxNumber: '',
        reason: '',
        reasonDetails: '',
      },
    ]);
    setFieldValue &&
      setFieldValue('taxDetails', [
        ...listTaxes,
        {
          id: null,
          haveTaxNumberHandy: true,
          taxCountry: '',
          taxNumber: '',
          reason: '',
          reasonDetails: '',
        },
      ]);
  };

  const onRemoveTaxes = (index: number, setFieldValue: any, taxId?: string) => {
    if (index !== -1) {
      const curTaxList = listTaxes;
      curTaxList.splice(index, 1);
      setListTaxes(curTaxList);
      setFieldValue('taxDetails', curTaxList);
    }
  };

  const getStateList = async (parentLocationId: string | string[]) => {
    if (isSkipFetchState) {
      return;
    }
    if (parentLocationId && formikRef.current) {
      try {
        const response = await onboardingService.getStates();
        if (response.data) {
          let statesBaseOnCity = [];
          if (typeof parentLocationId === 'string') {
            statesBaseOnCity = response.data.filter((s: any) => s.id === parentLocationId);
            formikRef.current.setFieldValue('state', statesBaseOnCity[0].locationName);
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
    setViewingBSField('employmentType');
  };

  const onPressImploymentSector = () => {
    getMetaData('employmentSector', undefined, true);
    setViewingBSField('employmentSector');
  };

  const displayData = bsData
    ? searchText && searchText.length > 0 && bsData.items?.length > 0
      ? bsData.items.filter((i: BSOption) => i.value.includes(searchText))
      : bsData.items.filter((i: BSOption) => i.value !== 'Not Applicable')
    : [];

  useEffect(() => {
    formikRef.current?.setFieldTouched('nickName', true);
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
        title: 'City',
        isHaveSearchBox: true,
        name: 'city',
        searchBoxPlaceholder: 'Search',
        type: 'OptionsList',
      };

      const response = await onboardingService.getCities(postCode);
      if (response.data && formikRef.current) {
        let parentLocationIds = [];
        if (response.data.length >= 1) {
          parentLocationIds = response.data.map((d) => d.parentLocationId);
          const filteredData = uniqBy(response.data, 'locationName');

          bsData.items = filteredData.map((c) => ({
            id: c.id,
            value: c.locationName,
            key: c.countryId,
            type: 'String',
          }));

          if (bsData.items.length > 1) {
            setBSData(bsData);
            setIsShowBottomSheet(true);
            setListCity(filteredData);
          } else {
            formikRef.current.setFieldValue('city', bsData.items[0].value);
            getStateList(parentLocationIds.length > 1 ? parentLocationIds : parentLocationIds[0]);
            setListCity(filteredData);
            setBSData(bsData);
          }
        } else {
          formikRef.current.setFieldError('postcode', 'Invalid post code');
        }
      }
    } catch {
      setIsShowBottomSheet(false);
    } finally {
      setIsLoadingValues(false);
    }
  };

  console.log('userPreferences.currencyCode', userPreferences);
  return (
    <View style={styles.container}>
      <Formik
        innerRef={formikRef}
        validationSchema={personalDetailsSchema(isUnEmployed, isOutsideLabourForce, i18n)}
        initialValues={UserDetailsData.empty(profile)}
        onSubmit={async (values) => {
          const religionSelectedKey = getEDSKeyByValue('religion', values.religion);
          const marialStatusSelectedKey = getEDSKeyByValue('maritalStatus', values.maritalStatus);
          const employmentTypeSelectedKey = getEDSKeyByValue(
            'employmentType',
            values.employmentType
          );
          const employmentSectorSelectedKey = getEDSKeyByValue(
            'employmentSector',
            values.employmentSector
          );
          const occupationSelectedKey = getEDSKeyByValue('occupation', values.occupation);

          const inputedValue = {
            nickName: values.nickName,
            religion: religionSelectedKey,
            maritalStatus: marialStatusSelectedKey,
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
                employmentType: employmentTypeSelectedKey,
                sector: isUnEmployed ? 'Not Applicable' : employmentSectorSelectedKey,
                companyName: isUnEmployed ? '' : values.employerName,
                occupation: isUnEmployed
                  ? i18n.t('saving_account_detail_screen.other_outside_labour_force')
                  : occupationSelectedKey,
              },
            ],
            taxDetails: values.taxDetails.map((item) => {
              const countrySelectedKey = getEDSKeyByValue('country', item.taxCountry);
              const reasonSelectedKey = getEDSKeyByValue('taxReason', item.reason);

              const { haveTaxNumberHandy, ...rest } = item;
              return {
                ...rest,
                taxCountry: countrySelectedKey,
                reason: reasonSelectedKey,
              };
            }),
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
        {({ submitForm, dirty, errors, isValid, values, setFieldValue, touched, handleChange }) => {
          if (`${values.annualIncome}`.length > 0) {
            amountFormat(
              values?.annualIncome,
              (num: string) => {
                setFieldValue('annualIncome', num);
              },
              userPreferences?.currencyFormat
            );
          }

          const renderSelectedValue = selectedBSValue
            ? selectedBSValue
            : selectedReasonViewingIndex >= 0
            ? {
                id: viewingBSField,
                value: values.taxDetails[selectedReasonViewingIndex]?.reason,
              }
            : {
                id: viewingBSField,
                value: values[`${viewingBSField}`],
              };

          if (
            renderSelectedValue.id !== undefined &&
            (renderSelectedValue.value === undefined || renderSelectedValue.value === '')
          ) {
            renderSelectedValue.value = values[renderSelectedValue.id];
          }

          return (
            <>
              <KeyboardAwareScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                keyboardOpeningTime={Number.MAX_SAFE_INTEGER}
                keyboardDismissMode="interactive"
                extraScrollHeight={50}
                enableResetScrollToCoords={false}
              >
                <Text style={styles.mainheading}>
                  {i18n.t('user_details.personal_details_section_title')}
                </Text>
                <View style={styles.verticalSpacing} />
                <ASInputField
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
                    setFieldValue('nickName', values.nickName.trim());
                  }}
                  onChangeText={(e) =>
                    e[0] !== ' ' && handleChange('nickName')(e.replace(/\s+/g, ' '))
                  }
                  suffixIcon={checkEdit !== 'nickName' && <TextEditIcon size={21} />}
                  onClickSuffixIcon={() => setCheckEdit('nickName')}
                  onInputPress={() => setCheckEdit('nickName')}
                  errors={errors}
                  touched={touched}
                  maxLength={22}
                  style={{
                    errorContainerStyle: {
                      width: '95%',
                    },
                  }}
                />
                <View style={styles.verticalSpacing} />
                <ASInputField
                  name={'religion'}
                  hideUnderLine={true}
                  placeholder={i18n.t('user_details.religion')}
                  editable={false}
                  suffixIcon={<ArrowDownIcon width={21} height={21} />}
                  onClickSuffixIcon={onPressReligionInput}
                  onInputPress={onPressReligionInput}
                  type="custom"
                  inputType={InputTypeEnum.MATERIAL}
                  errors={errors}
                  touched={touched}
                />
                <View style={styles.verticalSpacing} />
                <ASInputField
                  name={'maritalStatus'}
                  hideUnderLine={true}
                  placeholder={i18n.t('user_details.marital_status')}
                  editable={false}
                  suffixIcon={<ArrowDownIcon width={21} height={21} />}
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
                <ASInputField
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
                  suffixIcon={checkEdit !== 'line1' && <TextEditIcon size={21} />}
                  onClickSuffixIcon={() => setCheckEdit('line1')}
                  onInputPress={() => setCheckEdit('line1')}
                  errors={errors}
                  touched={touched}
                />
                <View style={styles.verticalSpacing} />
                <ASInputField
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
                  suffixIcon={checkEdit !== 'line2' && <TextEditIcon size={21} />}
                  onClickSuffixIcon={() => setCheckEdit('line2')}
                  onInputPress={() => setCheckEdit('line2')}
                  errors={errors}
                  touched={touched}
                />
                <View style={styles.verticalSpacing} />
                <ASInputField
                  name={'postcode'}
                  hideUnderLine={true}
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
                    formikRef.current?.setFieldValue('city', '');
                    formikRef.current?.setFieldValue('state', '');
                  }}
                  type="custom"
                  inputType={InputTypeEnum.MATERIAL}
                  editable={checkEdit === 'postcode'}
                  value={values.postcode}
                  suffixIcon={checkEdit !== 'postcode' && <TextEditIcon size={21} />}
                  onClickSuffixIcon={() => setCheckEdit('postcode')}
                  onInputPress={() => setCheckEdit('postcode')}
                  autoComplete={'off'}
                  keyboardType={'numeric'}
                  returnKeyType="done"
                  errors={errors}
                  touched={touched}
                />
                <View style={styles.verticalSpacing} />
                <ASInputField
                  name={'city'}
                  hideUnderLine={true}
                  placeholder={i18n.t('user_details.city')}
                  editable={false}
                  suffixIcon={<ArrowDownIcon width={21} height={21} />}
                  onClickSuffixIcon={onPressCity}
                  onInputPress={onPressCity}
                  type="custom"
                  inputType={InputTypeEnum.MATERIAL}
                  errors={errors}
                  touched={touched}
                />
                <View style={styles.verticalSpacing} />
                <ASInputField
                  name={'state'}
                  hideUnderLine={true}
                  placeholder={i18n.t('user_details.state')}
                  onClickSuffixIcon={onPressState}
                  onInputPress={onPressState}
                  editable={false}
                  suffixIcon={<ArrowDownIcon width={21} height={21} />}
                  type="custom"
                  inputType={InputTypeEnum.MATERIAL}
                  errors={errors}
                  touched={touched}
                />

                <View style={styles.underline} />
                <Text style={styles.mainheading}>{i18n.t('user_details.employment_details')}</Text>

                <View style={styles.verticalSpacing} />
                <ASInputField
                  name={'employmentType'}
                  hideUnderLine={true}
                  placeholder={i18n.t('user_details.employment_type')}
                  editable={false}
                  suffixIcon={<ArrowDownIcon width={21} height={21} />}
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

                    <ASInputField
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
                      suffixIcon={<ArrowDownIcon width={21} height={21} />}
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
                        <ASInputField
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
                    <ASInputField
                      name={'occupation'}
                      hideUnderLine={true}
                      placeholder={i18n.t('user_details.occupation')}
                      editable={false}
                      onInputPress={onPressOccupation}
                      onClickSuffixIcon={onPressOccupation}
                      suffixIcon={<ArrowDownIcon width={21} height={21} />}
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
                <ASInputField
                  name={'annualIncome'}
                  hideUnderLine={true}
                  prefixText={
                    userPreferences
                      ? userPreferences.currencyCode
                      : i18n?.t('account_origination.employment_details.currency')
                  }
                  placeholder={i18n.t('user_details.annualIncome')}
                  type="custom"
                  inputType={InputTypeEnum.MATERIAL}
                  editable={checkEdit === 'annualIncome'}
                  onBlur={() => {
                    if (values.annualIncome) {
                      const { currencyFormated } = useASCurrencyFormat(
                        values.annualIncome,
                        'blur',
                        userPreferences?.currencyFormat
                      );
                      setFieldValue('annualIncome', currencyFormated);
                    }

                    if (checkEdit === 'annualIncome') {
                      setCheckEdit('');
                    }
                  }}
                  suffixIcon={checkEdit !== 'annualIncome' && <TextEditIcon size={21} />}
                  onClickSuffixIcon={() => setCheckEdit('annualIncome')}
                  onInputPress={() => setCheckEdit('annualIncome')}
                  autoComplete={'off'}
                  keyboardType={'numeric'}
                  returnKeyType="done"
                  errors={errors}
                  touched={touched}
                />
                <View style={styles.content}>
                  <View style={styles.underline} />
                  <Text style={styles.mainheading}>
                    {i18n.t('review_personal_details.tax_details_section_title')}
                  </Text>
                  <View style={styles.verticalSpacing} />
                  {!isSelectedOtherCountry && (
                    <ASInputField
                      name={'listSelectedTaxCountry'}
                      hideUnderLine={true}
                      placeholder={i18n.t('review_personal_details.country_tax_residence_title')}
                      type="custom"
                      inputType={InputTypeEnum.MATERIAL}
                      suffixIcon={<TextEditIcon size={21} />}
                      editable={true}
                      onClickSuffixIcon={() => setIsSelectedOtherCountry(true)}
                      onInputPress={() => setIsSelectedOtherCountry(true)}
                    />
                  )}
                  {isSelectedOtherCountry && (
                    <View style={styles.taxInfomationsContainer}>
                      {listTaxes.map((t, index) => {
                        console.log(
                          'haveTaxNumberHandyOptions',
                          haveTaxNumberHandyOptions[t.haveTaxNumberHandy ? 0 : 1]
                        );
                        return (
                          <View style={styles.taxSectionContainer} key={`${t.id} - ${index}`}>
                            <View style={styles.innerRow}>
                              <View style={styles.flex}>
                                <ASInputField
                                  type={'custom'}
                                  style={inputStyles}
                                  name={`taxDetails[${index}].taxCountry`}
                                  placeholder={i18n
                                    ?.t('purpose_account_opening.country')
                                    .concat(index + 1)}
                                  editable={false}
                                  suffixIcon={<ArrowDownIcon width={20} height={15} />}
                                  onClickSuffixIcon={() => onPressCountry(index)}
                                  inputType={InputTypeEnum.MATERIAL}
                                  hideUnderLine
                                  onPressIn={() => onPressCountry(index)}
                                  errors={errors}
                                  touched={touched}
                                />
                              </View>
                              {listTaxes.length > 1 && (
                                <TouchableOpacity
                                  style={styles.deleteIconContainer}
                                  onPress={() => onRemoveTaxes(index, setFieldValue, t?.id)}
                                >
                                  <TrashIcon
                                    width={24}
                                    height={24}
                                    color={themeColors.primaryColor}
                                  />
                                </TouchableOpacity>
                              )}
                            </View>
                            <Text style={styles.question}>
                              {i18n?.t('purpose_account_opening.tax_handy_text')}
                            </Text>
                            <RadioGroupComponent
                              useTraditionalType
                              alignTitle={'right'}
                              showSeparatedLine={false}
                              data={haveTaxNumberHandyOptions}
                              value={haveTaxNumberHandyOptions[t.haveTaxNumberHandy ? 0 : 1]}
                              onChangeValue={(value) => {
                                onSelectTaxNumberHandy(value, t.id);
                                if (value.label === 'Yes') {
                                  setFieldValue(`taxDetails[${index}].haveTaxNumberHandy`, true);
                                  setFieldValue(`taxDetails[${index}].reason`, '');
                                  setFieldValue(`taxDetails[${index}].reasonDetails`, '');
                                  const newTax = [...listTaxes];
                                  newTax[index].haveTaxNumberHandy = true;
                                  newTax[index].reason = '';
                                  newTax[index].reasonDetails = '';
                                  setListTaxes(newTax);
                                } else {
                                  setFieldValue(`taxDetails[${index}].haveTaxNumberHandy`, false);
                                  setFieldValue(`taxDetails[${index}].taxNumber`, '');
                                  const newTax = [...listTaxes];
                                  newTax[index].haveTaxNumberHandy = false;
                                  newTax[index].taxNumber = '';
                                  setListTaxes(newTax);
                                }
                              }}
                              style={{
                                titleTextStyle: styles.titleTextStyle,
                                titleSelectedTextStyle: styles.titleSelectedTextStyle,
                                containerStyle: styles.containerStyle,
                                itemContainerStyle: [styles.itemContainerStyle],
                                activeOutlineStyle: [
                                  styles.ActiveRadioInnerStyle,
                                  { backgroundColor: themeColors.primaryColor },
                                ],
                                outlineContainerStyle: styles.radioInnerStyle,
                              }}
                            />
                            {!t.haveTaxNumberHandy ? (
                              <View style={styles.flex}>
                                <ASInputField
                                  type={'custom'}
                                  style={inputStyles}
                                  name={`taxDetails[${index}].reason`}
                                  placeholder={i18n.t('purpose_account_opening.reason')}
                                  editable={false}
                                  returnKeyType={'done'}
                                  onClickSuffixIcon={() =>
                                    onPressReason(`taxDetails[${index}].reason`, index)
                                  }
                                  onPressIn={() =>
                                    onPressReason(`taxDetails[${index}].reason`, index)
                                  }
                                  isUsingSelectionAtStart
                                  inputType={InputTypeEnum.MATERIAL}
                                  hideUnderLine
                                  suffixIcon={<ArrowDownIcon width={20} height={15} />}
                                  errors={errors}
                                  touched={touched}
                                />
                                {values.taxDetails[`${index}`].reason ===
                                  'The account holder is unable to obtain a TIN' && (
                                  <ASInputField
                                    type={'custom'}
                                    style={inputStyles}
                                    returnKeyType={'done'}
                                    name={`taxDetails[${index}].reasonDetails`}
                                    placeholder={i18n?.t('purpose_account_opening.reason_details')}
                                    editable={true}
                                    inputType={InputTypeEnum.MATERIAL}
                                    hideUnderLine
                                    onChange={(e) => {
                                      const newTax = [...listTaxes];
                                      newTax[index].reasonDetails = e.nativeEvent.text;
                                      setListTaxes(newTax);
                                    }}
                                    errors={errors}
                                    touched={touched}
                                  />
                                )}
                              </View>
                            ) : (
                              <ASInputField
                                type={'custom'}
                                style={inputTaxStyles}
                                returnKeyType={'done'}
                                name={`taxDetails[${index}].taxNumber`}
                                placeholder={i18n?.t('purpose_account_opening.tax_number')}
                                placeholderHint={i18n?.t(
                                  'purpose_account_opening.tax_number_placeholder'
                                )}
                                onChange={(e) => {
                                  const newTax = [...listTaxes];
                                  newTax[index].taxNumber = e.nativeEvent.text;
                                  setListTaxes(newTax);
                                }}
                                placeholderTextColor={defaultColors.black500}
                                placeHolderHintTextColor={defaultColors.gray400}
                                inputType={InputTypeEnum.MATERIAL}
                                hideUnderLine
                                editable={true}
                                errors={errors}
                                touched={touched}
                              />
                            )}
                          </View>
                        );
                      })}
                      {listTaxes.length < 3 && (
                        <TouchableOpacity
                          style={styles.addMoreContainer}
                          onPress={() => onAddMoreTaxes(setFieldValue)}
                        >
                          <AddCircleIcon size={25} />
                          <Text style={styles.addMore}>
                            {i18n?.t('purpose_account_opening.add_more')}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                </View>
                <View style={styles.verticalSpacing} />
                <View style={styles.verticalSpacing} />
                <ASButton
                  label={'Save'}
                  onPress={submitForm}
                  disabled={!isValid || values.nickName.length === 0}
                  isLoading={isUpdatingProfile}
                />
                <View style={styles.verticalSpacing} />
              </KeyboardAwareScrollView>

              {bsData && (
                <ASBottomSheet
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
  question: {
    fontSize: 12,
    color: defaultColors.black500,
    fontFamily: fonts.OutfitRegular,
    lineHeight: 16,
    marginTop: 15,
    marginBottom: 4,
  },
  addMore: {
    fontSize: 14,
    color: '#1B1B1B',
    fontFamily: fonts.OutfitRegular,
    marginLeft: 10,
  },
  addMoreContainer: {
    marginVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  taxInfomationsContainer: {},
  titleTextStyle: {
    marginLeft: 12,
    fontSize: 14,
    fontFamily: fonts.OutfitRegular,
    lineHeight: 20,
    color: defaultColors.black900,
  },
  titleSelectedTextStyle: {
    marginLeft: 12,
    fontSize: 14,
    fontFamily: fonts.OutfitRegular,
    lineHeight: 20,
    color: defaultColors.black900,
  },
  containerStyle: {
    marginVertical: 0,
    marginBottom: 16,
  },
  itemContainerStyle: {
    flexDirection: 'row',
    paddingVertical: 4,
    paddingHorizontal: 0,
  },
  ActiveRadioInnerStyle: {
    borderRadius: 10,
    margin: 4,
    width: 10,
    height: 10,
  },
  radioInnerStyle: {
    borderWidth: 1,
    borderRadius: 10,
    width: 20,
    height: 20,
  },
  deleteIconContainer: {
    width: 36,
    alignItems: 'center',
    flexDirection: 'row',
    alignSelf: 'center',
    justifyContent: 'space-around',
    paddingLeft: 12,
  },
  input: {
    marginTop: 5,
  },
  container: {
    flex: 1,
    paddingHorizontal: 22,
  },
  taxSectionContainer: {
    marginTop: 10,
  },
  header: {
    paddingVertical: 10,
    paddingHorizontal: 5,
    marginTop: 30,
  },
  validContainer: {
    marginTop: 10,
  },
  innerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 2,
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

export default UserDetailsScreenComponent;
