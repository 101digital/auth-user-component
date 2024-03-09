import { amountFormat } from '@/helpers/amount-input';
import { colors } from 'account-origination-component/src/assets';
import { ASMinusIcon, AddCircleIcon, PlusIcon, TrashIcon } from 'account-origination-component/src/assets/icons';
import ASCustomerEDDModal from 'account-origination-component/src/components/customer-edd/customer-edd-modal';
import SelectInputField from 'account-origination-component/src/components/sub-components/input-field/select';
import { AccountOriginationService } from 'account-origination-component/src/service/onboarding-service';
import { GET_COUNTRY_LIST_WITHOUT } from 'account-origination-component/src/utils';
import { Formik, FormikProps } from 'formik';
import { uniqBy } from 'lodash';
import moment from 'moment';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Keyboard,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { UpdateProfilePayload } from 'react-native-auth-component/src/types';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import {
  ASBottomSheet,
  ASButton,
  ASInputField,
  ArrowDownIcon,
  BSOption,
  RadioButtonGroup,
  ThemeContext,
  defaultColors,
  useASCurrencyFormat,
} from 'react-native-theme-component';
import { CircularCheckBox } from 'react-native-theme-component/index';
import { InputTypeEnum } from 'react-native-theme-component/src/input-field';
import { CheckBoxStyles } from 'react-native-theme-component/src/checkbox';
import { fonts } from '../../assets';
import { AuthContext } from '../../auth-context';
import { UserDetailsData, personalDetailsSchema } from './model';
import { getEnterpriseData, getEDSKeyByValue } from '@/helpers/screen-utils';

type ASUserDetailsScreenComponentProps = {
  onSubmit: (userId: string, updateProfilePayload: UpdateProfilePayload) => void;
  onCompletedLoadingInitialState: () => void;
  oddReviewCycle?: boolean;
};

const { height } = Dimensions.get('screen');
const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;

const onboardingService = AccountOriginationService.instance();

// export const eddMetadata.other.otherOptionText = 'Others';

export interface IEddMetadata {
  other: {
    maxOtherTextLength: number;
    otherOptionText: string;
  };
  sourceOfWealthOptions: string[];
  sourceOfFundOptions: string[];
  accountOpeningPurposes: string[];
  sourceOfWealthOptionsKeys: string[];
  sourceOfFundOptionsKeys: string[];
}

export type Taxes = {
  id: string | null;
  taxCountry?: string;
  taxCountryCode?: string;
  haveTaxNumberHandy?: boolean;
  taxNumber?: string;
  reason?: string;
  reasonDetails?: string;
};

const FALLBACK_REMOTE_CONFIG: IEddMetadata = {
  sourceOfFundOptions: [
    'Employment income',
    'Inheritance',
    'Gift',
    'Financing/ loan',
    'Pension',
    'Allowance',
    'Interest payments from financing/ loan arrangement',
    'Ownership/ sale of share or other securities',
    'Company profits/ dividends',
    'Capital injection/ new funding',
    'Government grant and subsidies',
    'Contribution and donation',
  ],
  sourceOfWealthOptions: [
    'Accumulated Wealth',
    'Inheritance',
    'Gift',
    'Pension',
    'Sale of asset',
    'Sale of share or other',
    'Investment',
    'Company sale',
    'Legal settlements/ claims/ insurance payouts',
    'Maturity/ surrender of life policy',
    'Retaining profit',
    'Sinking fund',
  ],
  accountOpeningPurposes: ['Daily spending', 'Education', 'Financing', 'Investment', 'Salary'],
  other: {
    maxOtherTextLength: 40,
    otherOptionText: 'Others',
  },
  sourceOfFundOptionsKeys: [
    'Employment income',
    'Inheritance',
    'Gift',
    'Financing/ loan',
    'Pension',
    'Allowance',
    'Interest payments from financing/ loan arrangement',
    'Ownership/ sale of share or other securities',
    'Company profits/ dividends',
    'Capital injection/ new funding',
    'Government grant and subsidies',
    'Contribution and donation',
  ],
  sourceOfWealthOptionsKeys: [
    'Accumulated Wealth',
    'Inheritance',
    'Gift',
    'Pension',
    'Sale of asset',
    'Sale of share or other',
    'Investment',
    'Company sale',
    'Legal settlements/ claims/ insurance payouts',
    'Maturity/ surrender of life policy',
    'Retaining profit',
    'Sinking fund',
  ],
};

const addOtherOptionToMetadata = (option: string[], otherOptionText: string) => {
  return option.push(otherOptionText);
};

const personalDetailsMetaDataKeys = [
  'EntData_religion',
  'EntData_maritalStatus',
  'EntData_employmentType',
  'EntData_employmentSector',
  'EntData_occupation',
  'EntData_taxReason',
  'EntData_city',
  'EntData_state',
  'EntData_sourceOfFund',
  'EntData_sourceOfWealth',
  'EntData_country',
  'EntData_accountOpeningPurpose',
  "EntData_highestEducation",
];

const ASUserDetailsScreenComponent = ({
  onSubmit,
  oddReviewCycle,
  onCompletedLoadingInitialState,
  isEditMode
}: ASUserDetailsScreenComponentProps) => {
  const checkboxStyle: CheckBoxStyles = useMemo(() => {
    return {
      containerStyle: {
        paddingHorizontal: 24,
        paddingBottom: 15,
      },
      titleStyle: {
        fontSize: 14,
        fontFamily: fonts.OutfitRegular,
        fontWeight: '400',
        lineHeight: 20,
      },
    };
  }, []);

  const { i18n, colors: themeColors, countries, getCurrentCountries } = useContext(ThemeContext);
  const {
    profile,
    isUpdatingProfile,
    setIsUpdatingProfile,
    updateODDReviewCycle,
    getFramlODDApplicationStatus,
    // getEnterpriseData,
    // getEDSKeyByValue
  } = useContext(AuthContext);
  const [isLoadingValues, setIsLoadingValues] = useState<boolean>(true);
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
  const [showPurposeOfAccountOpen, setShowPurposeOfAccountOpen] = useState<boolean>(false);
  const [eddMetadata, setEddMetadata] = useState<IEddMetadata>(FALLBACK_REMOTE_CONFIG);
  const [accountPurposePlaceholderVisible, setAccountPurposePlaceholderVisible] =
    useState<boolean>(false);
  const [showSourceOfFunds, setShowSourceOfFunds] = useState<boolean>(false);
  const [sourceOfFundsPlaceholderVisible, setSourceOfFundsPlaceholderVisible] =
    useState<boolean>(false);
  const [showSourceOfWealth, setShowSourceOfWealth] = useState<boolean>(false);
  const [sourceOfWealthPlaceholderVisible, setSourceOfWealthPlaceholderVisible] =
    useState<boolean>(false);
  const [isEdited, setIsEdited] = useState<boolean>(false);
  const [listTaxes, setListTaxes] = useState<Taxes[]>([]);
  const [listCountry, setListCountry] = useState<any>();
  const [isViewingReasonBS, setIsViewingReasonBS] = useState<boolean>(false);
  const [isViewingCountry, setIsViewingCountry] = useState<boolean>(false);
  const [selectedReasonViewingIndex, setSelectedReasonViewingIndex] = useState<number>(-1);
  const [isSelectedOtherCountry, setIsSelectedOtherCountry] = useState<boolean>(false);
  const [metadata, setMetadata] = useState<any>();
  const [isCollapsedPersonalDetailsSection, setIsCollapsedPersonalDetailsSection] = useState<boolean>(false);
  const [isCollapsedContactDetailsSection, setIsCollapsedContactDetailsSection] = useState<boolean>(false);
  const [isCollapsedMailingAddressSection, setIsCollapsedMailingAddressSection] = useState<boolean>(false);
  const [isCollapsedEmploymentDetailsSection, setIsCollapsedEmploymentDetailsSection] = useState<boolean>(false);
  const [isCollapsedTaxDetailsSection, setIsCollapsedTaxDetailsSection] = useState<boolean>(false);
  const [isCollapsedAccountOpenningPurposeSection, setIsCollapsedAccountOpenningPurposeSection] = useState<boolean>(false);
  const [isCalledEDS, setIsCalledEDS] = useState<boolean>(false);
    //1672
  const onToggelIsCollapsedPersonalDetailsSection = () => {
    setIsCollapsedPersonalDetailsSection(!isCollapsedPersonalDetailsSection);
  };
  
  const onToggelIsCollapsedContactDetailsSection = () => {
    setIsCollapsedContactDetailsSection(!isCollapsedContactDetailsSection);
  };

  const onToggelIsCollapsedMailingAddressSection = () => {
    setIsCollapsedMailingAddressSection(!isCollapsedMailingAddressSection);
  };

  const onToggelIsCollapsedEmploymentDetailsSection = () => {
    setIsCollapsedEmploymentDetailsSection(!isCollapsedEmploymentDetailsSection);
  };

  const onToggelIsCollapsedTaxDetailsSection = () => {
    setIsCollapsedTaxDetailsSection(!isCollapsedTaxDetailsSection);
  };

  const onToggelIsCollapsedAccountOpenningPurposeSection = () => {
    setIsCollapsedAccountOpenningPurposeSection(!isCollapsedAccountOpenningPurposeSection);
  };

  useEffect(() => {
    if(countries.length === 0) {
      getCurrentCountries();
    }
  }, []);

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

  useEffect(() => {
    if(checkEdit.length > 0) {
      setIsEdited(true);
    }
  }, [checkEdit]);

  const getInitEnterpriseData = async () => {
    const enterpriseData = await getEnterpriseData(personalDetailsMetaDataKeys);
    if (enterpriseData) {
      const profileAddress =
        profile?.addresses &&
        profile?.addresses.length > 0 &&
        profile.addresses.find((a: any) => a.addressType === 'Mailing Address');

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
      const selectedHighestEducation = enterpriseData
          .find((d) => d.groupCode === "highestEducation")
          .dataItems.find(
            (itm) => itm.key === profile?.highestEducation
          )?.value;
      const selectedCity = enterpriseData
        .find((d) => d.groupCode === 'city')
        .dataItems.find((itm) => itm.key === profileAddress?.city)?.value;
      const selectedState = enterpriseData
        .find((d) => d.groupCode === 'state')
        .dataItems.find((itm) => itm.key === profileAddress?.state)?.value;
      const indexSourceOfFundOptions = enterpriseData.findIndex(
        (d) => d.groupCode === 'sourceOfFund'
      );

      const sourceOfFundOptions = enterpriseData[indexSourceOfFundOptions];
      const indexSourceOfWealthOptions = enterpriseData.findIndex(
        (d) => d.groupCode === 'sourceOfWealth'
      );
      const sourceOfWealthOptions = enterpriseData[indexSourceOfWealthOptions];
      const otherValue = sourceOfFundOptions.dataItems.find((d) => d.key === 'Others');
      const accountOpenningPurpose = enterpriseData.find(
        (d) => d.groupCode === 'accountOpeningPurpose'
      );

      const accountPurposes = profile?.creditDetails?.find((item) =>
        item.hasOwnProperty('accountPurpose')
      )?.accountPurpose;

      if (accountPurposes && accountPurposes.length > 0) {
        const selectedAccountPurposeList = accountPurposes?.split(', ') || [];
        // const selectedAccountPurposeList = ['Daily spending', 'Salary', 'Investment'];
        if (selectedAccountPurposeList?.length > 0) {
          const accountPurposesObject: { [key: string]: boolean } = {};
          selectedAccountPurposeList.map((p: string) => {
            const selectedPurpose = accountOpenningPurpose.dataItems.find((edsP) => edsP.key === p);
            if (selectedPurpose && selectedPurpose.value) {
              accountPurposesObject[selectedPurpose.value] = true;
            }
          });

          formikRef.current?.setFieldValue('accountOpeningPurpose', accountPurposesObject);
        }
      }

      const newEddMetaData = {
        sourceOfFundOptions: sourceOfFundOptions.dataItems.map((d) => d.value),
        sourceOfWealthOptions: sourceOfWealthOptions.dataItems.map((d) => d.value),
        accountOpeningPurposes:
          accountOpenningPurpose && accountOpenningPurpose.dataItems
            ? accountOpenningPurpose.dataItems.map((d) => d.value)
            : [
                i18n.t('account_origination.as_account_openning.daily_spending'),
                i18n.t('account_origination.as_account_openning.education'),
                i18n.t('account_origination.as_account_openning.financing'),
                i18n.t('account_origination.as_account_openning.investment'),
                i18n.t('account_origination.as_account_openning.salary'),
              ],
        sourceOfWealthOptionsKeys: sourceOfWealthOptions.dataItems.map((d) => d.key),
        sourceOfFundOptionsKeys: sourceOfFundOptions.dataItems.map((d) => d.key),
        other: {
          maxOtherTextLength: 40,
          otherOptionText: otherValue.value,
        },
      };

      setEddMetadata(newEddMetaData);

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
      if (selectedHighestEducation) {
        formikRef.current?.setFieldValue(
          "highestEducation",
          selectedHighestEducation
        );
      }
      if (selectedCity) {
        formikRef.current?.setFieldValue('city', selectedCity);
      }
      if (selectedState) {
        formikRef.current?.setFieldValue('state', selectedState);
      }

      const newAnnualIncome =
        profile && profile.creditDetails && profile.creditDetails.length > 0
          ? useASCurrencyFormat(`${profile.creditDetails[0].annualIncome}`, 'blur')
          : '';
      formikRef.current?.setFieldValue(
        'employerName',
        profile?.employmentDetails?.[0]?.companyName ?? ''
      );
      formikRef.current?.setFieldValue('nickName', profile?.nickName ?? '');
      formikRef.current?.setFieldValue('line1', profileAddress?.line1 ?? '');
      formikRef.current?.setFieldValue('line2', profileAddress?.line2 ?? '');
      formikRef.current?.setFieldValue('postcode', profileAddress?.postcode ?? '');
      formikRef.current?.setFieldValue('annualIncome', newAnnualIncome?.currencyFormated ?? '');
    }

    // const selectedAccountPurpose = useMemo(() => {
    //   const accountPurposes = profile?.creditDetails?.find((item) =>
    //     item.hasOwnProperty('accountPurpose')
    //   )?.accountPurpose;
    //   const accountPurposesList = accountPurposes ? accountPurposes?.split(', ') : [];
    //   const filteredAccountPurposes = accountPurposesList?.filter((purpose) =>
    //     eddMetadata?.accountOpeningPurposes.includes(purpose)
    //   );
    //   const otherAccountPurposesList = accountPurposesList?.filter(
    //     (purpose) => !eddMetadata?.accountOpeningPurposes.includes(purpose)
    //   );

    //   const accountPurposesObject: { [key: string]: boolean } = {};
    //   filteredAccountPurposes?.forEach((purpose) => {
    //     accountPurposesObject[purpose.trim()] = true;
    //   });
    //   if (otherAccountPurposesList && otherAccountPurposesList?.length > 0) {
    //     accountPurposesObject[eddMetadata.other.otherOptionText] = true;
    //   }
    //   const otherAccountPurposes = otherAccountPurposesList
    //     ? otherAccountPurposesList?.join(', ')
    //     : '';
    //   return { accountPurposesObject, otherAccountPurposes };
    // }, [eddMetadata]);

    if (profile?.taxDetails && profile.taxDetails.length > 0) {
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
    setIsLoadingValues(false);
    setMetadata(enterpriseData);
    onCompletedLoadingInitialState();
  };

  useEffect(() => {
    if (profile && !isCalledEDS) {
      console.log('hihuhuhuhuhuhuhhu');
      setIsCalledEDS(true);
      getInitEnterpriseData();
    }
  }, [profile]);

  // const getInitEnterpriseData = async () => {
  //   const enterpriseData = await getEnterpriseData(
  //     'religion,ethnicity,maritalStatus,employmentType,employmentSector'
  //   );
  //   setMetadata(enterpriseData.data);
  // };

  // useEffect(() => {
  //   getInitEnterpriseData();
  // }, []);

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

  const onPressOccupation = () => {
    getMetaData('occupation', undefined, true);
    setViewingBSField('occupation');
  };

  const onPressHighestEducation = () => {
    getMetaData("highestEducation");
    setViewingBSField("highestEducation");
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
    const selectedCity = listCity.find((city: any) => city.locationName === value);
    if (selectedCity) {
      getStateList(selectedCity.parentLocationId);
    }
  };

  const showBSCityList = (listCity: any[]) => {
    if (listCity.length > 0) {
      const listCityEDS = metadata.find((d) => d.groupCode === 'city');

      const bsData = {
        items: [],
        title: listCityEDS.groupName,
        isHaveSearchBox: true,
        name: 'city',
        searchBoxPlaceholder: 'Search',
        type: 'OptionsList',
      };

      bsData.items = uniqBy(listCity, 'id').map((city) => ({
        id: city.id,
        value: city.locationName,
        type: 'String',
      }));

      setBSData(bsData);
      setIsShowBottomSheet(true);
    }
  };

  const showBSStateList = (listStates: any[]) => {
    if (listStates.length > 0) {
      setIsShowBottomSheet(true);
      const listStateEDS = metadata.find((d) => d.groupCode === 'state');

      const bsData = {
        items: [],
        title: listStateEDS.groupName,
        isHaveSearchBox: true,
        name: 'state',
        searchBoxPlaceholder: 'Search',
        type: 'OptionsList',
      };

      bsData.items = uniqBy(listStates, 'id').map((state) => ({
        id: state.id,
        value: state.locationName,
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

  const getStateList = async (parentLocationId: string | string[]) => {
    if (isSkipFetchState) {
      return;
    }
    if (parentLocationId && formikRef.current) {
      try {
        const response = await onboardingService.getStates();
        const listStateEDS = metadata.find((d) => d.groupCode === 'state');

        if (response.data) {
          let statesBaseOnCity = [];
          if (typeof parentLocationId === 'string') {
            statesBaseOnCity = response.data.filter((s: any) => s.id === parentLocationId);
            const mappingFirstEDSData = listStateEDS.dataItems.find(
              (d) => d.key === statesBaseOnCity[0].locationName
            ).value;
            formikRef.current.setFieldValue('state', mappingFirstEDSData);

            setListState(
              statesBaseOnCity.map((s) => {
                const selectedValue = listStateEDS.dataItems.find((d) => d.key === s.locationName);
                return selectedValue
                  ? {
                      id: s.id,
                      locationName: selectedValue.value,
                    }
                  : {};
              })
            );
          } else {
            statesBaseOnCity = response.data.filter((s: any) =>
              parentLocationId.some((id) => id === s.id)
            );
            const mappedData = statesBaseOnCity.map((s) => {
              const mappingEDSData = listStateEDS.dataItems.find(
                (d) => d.key === s.locationName
              ).value;
              return {
                id: s.id,
                locationName: mappingEDSData,
              };
            });
            setIsSkipFetchState(true);
            setListState(mappedData);
            showBSStateList(mappedData);
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

  const getCityList = async (postCode: string) => {
    setIsLoadingValues(true);
    try {
      const listCityEDS = metadata.find((d) => d.groupCode === 'city');
      const bsData = {
        items: [],
        title: listCityEDS.groupName,
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
          const filteredData = uniqBy(response.data, 'locationName').map((c) => {
            const mappingEDSData = listCityEDS.dataItems.find((d) => d.key === c.locationName);
            return {
              ...c,
              locationName: mappingEDSData.value,
            };
          });

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
          formikRef.current.setFieldValue('city', '');
          formikRef.current.setFieldValue('state', '');
        }
      }
    } catch {
      setIsShowBottomSheet(false);
    } finally {
      setIsLoadingValues(false);
      formikRef.current?.validateForm();
    }
  };

  const selectedSourceOfFunds = useMemo(() => {
    const sourceOfFunds = profile?.creditDetails?.find((item) =>
      item.hasOwnProperty('sourceOfFund')
    )?.sourceOfFund;
    const sourceOfFundList = sourceOfFunds ? sourceOfFunds?.split(', ') : [];

    const filteredSourceOfFundList = sourceOfFundList?.filter((source) =>
      eddMetadata?.sourceOfFundOptionsKeys.includes(source)
    );
    const otherSourceOfFundList = sourceOfFundList?.filter(
      (source) => !eddMetadata?.sourceOfFundOptionsKeys.includes(source)
    );

    const sourceOfFundObject: { [key: string]: boolean } = {};
    filteredSourceOfFundList?.forEach((source) => {
      const selectedIndex = eddMetadata?.sourceOfFundOptionsKeys.findIndex((k) => k === source);
      const selectedValueByKey = eddMetadata?.sourceOfFundOptions[selectedIndex];
      sourceOfFundObject[selectedValueByKey.trim()] = true;
    });

    if (otherSourceOfFundList && otherSourceOfFundList?.length > 0) {
      sourceOfFundObject[eddMetadata.other.otherOptionText] = true;
    }
    const otherSourceOfFunds = otherSourceOfFundList ? otherSourceOfFundList?.join(', ') : '';
    if (formikRef?.current) {
      formikRef.current.setFieldValue('accountSourceOfFunds', sourceOfFundObject);
      formikRef.current.setFieldValue('otherSourceOfFunds', otherSourceOfFunds);
    }
    return { sourceOfFundObject, otherSourceOfFunds };
  }, [eddMetadata]);

  const selectedSourceOfWealth = useMemo(() => {
    const sourceOfWealth = profile?.creditDetails?.find((item) =>
      item.hasOwnProperty('sourceOfWealth')
    )?.sourceOfWealth;
    const sourceOfWealthList = sourceOfWealth ? sourceOfWealth?.split(', ') : [];
    const filteredSourceOfWealthList = sourceOfWealthList?.filter((source) =>
      eddMetadata?.sourceOfWealthOptionsKeys.includes(source)
    );
    const otherSourceOfWealthList = sourceOfWealthList?.filter(
      (source) => !eddMetadata?.sourceOfWealthOptionsKeys.includes(source)
    );

    const sourceOfWealthObject: { [key: string]: boolean } = {};
    filteredSourceOfWealthList?.forEach((source) => {
      const selectedIndex = eddMetadata.sourceOfWealthOptionsKeys.findIndex((k) => k === source);
      const selectedValueByKey = eddMetadata?.sourceOfWealthOptions[selectedIndex];
      sourceOfWealthObject[selectedValueByKey.trim()] = true;
    });
    if (otherSourceOfWealthList && otherSourceOfWealthList?.length > 0) {
      sourceOfWealthObject[eddMetadata.other.otherOptionText] = true;
    }
    const otherSourceOfWealth = otherSourceOfWealthList ? otherSourceOfWealthList?.join(', ') : '';
    if (formikRef?.current) {
      formikRef.current.setFieldValue('accountSourceOfWealth', sourceOfWealthObject);
      formikRef.current.setFieldValue('otherSourceOfWealth', otherSourceOfWealth);
    }
    return { sourceOfWealthObject, otherSourceOfWealth };
  }, [eddMetadata]);

  const selectedAccountPurpose = useMemo(() => {
    const accountPurposes = profile?.creditDetails?.find((item) =>
      item.hasOwnProperty('accountPurpose')
    )?.accountPurpose;
    const accountPurposesList = accountPurposes ? accountPurposes?.split(', ') : [];
    const filteredAccountPurposes = accountPurposesList?.filter((purpose) =>
      eddMetadata?.accountOpeningPurposes.includes(purpose)
    );
    const otherAccountPurposesList = accountPurposesList?.filter(
      (purpose) => !eddMetadata?.accountOpeningPurposes.includes(purpose)
    );

    const accountPurposesObject: { [key: string]: boolean } = {};
    filteredAccountPurposes?.forEach((purpose) => {
      accountPurposesObject[purpose.trim()] = true;
    });
    if (otherAccountPurposesList && otherAccountPurposesList?.length > 0) {
      accountPurposesObject[eddMetadata.other.otherOptionText] = true;
    }
    const otherAccountPurposes = otherAccountPurposesList
      ? otherAccountPurposesList?.join(', ')
      : '';
    return { accountPurposesObject, otherAccountPurposes };
  }, [eddMetadata]);

  const toString = (
    object: Record<string, boolean>,
    paddingOtherText: string,
    type: 'fund' | 'wealth' | 'other'
  ) => {
    const stringArr: string[] = [];
    Object.keys(object).forEach((k) => {
      if (k !== eddMetadata.other.otherOptionText) {
        const selectedValueIndex =
          type === 'fund'
            ? eddMetadata.sourceOfFundOptions.findIndex((v) => v === k)
            : type === 'wealth'
            ? eddMetadata.sourceOfWealthOptions.findIndex((v) => v === k)
            : eddMetadata.accountOpeningPurposes.findIndex((v) => v === k);
        const selectedKey =
          type === 'fund'
            ? eddMetadata.sourceOfFundOptionsKeys[selectedValueIndex]
            : type === 'wealth'
            ? eddMetadata.sourceOfWealthOptionsKeys[selectedValueIndex]
            : eddMetadata.accountOpeningPurposes[selectedValueIndex];
        stringArr.push(selectedKey);
      }
      if (k === eddMetadata.other.otherOptionText) {
        stringArr.push(paddingOtherText);
      }
    });
    if (stringArr.length > 0) {
      return stringArr.join(', ');
    }
    return stringArr.join('');
  };

  const onPressCountry = async (id: number) => {
    setIsViewingCountry(true);
    setIsLoadingValues(true);
    setIsShowBottomSheet(true);
    try {
      if(countries.length > 0) {
        const listBSData = countries.map((c) => ({
          id: c.id,
          value: c.name,
          type: 'String',
          prefixIconUrl: `https://static.101digital.io/${c.attributes.flagUrlRect}_92.png`

        }));
        setBSData({
          items: listBSData,
          title: 'Country',
          isHaveSearchBox: true,
          name: `taxDetails[${id}].taxCountry`,
          searchBoxPlaceholder: 'Search',
          type: 'OptionsList',
        });
      }
      // const response = await onboardingService.getCountryList();
      // const countryData = metadata.find((d) => d.groupCode === 'country');
      // if (response.data && countryData.dataItems && countryData.dataItems.length > 0) {
      //   const listBSData = response.data.map((country) => {
      //     const mappingEDSData = countryData.dataItems.find((d) => d.key === country.name);

      //     return {
      //       id: country.id,
      //       value: mappingEDSData ? mappingEDSData.value : country.name,
      //       code: country.code2,
      //       type: 'String',
      //     };
      //   });
        
      //   const listItems = isSelectedOtherCountry
      //     ? listBSData.filter((country) => country.value !== GET_COUNTRY_LIST_WITHOUT)
      //     : listBSData;

      //   const listSelectedCountry = [];
      //   for (let i = 0; i < listTaxes.length; i++) {
      //     if (formikRef.current?.values.taxDetails[i].taxCountry && i !== id) {
      //       listSelectedCountry.push(formikRef.current?.values.taxDetails[i].taxCountry);
      //     }
      //   }
      //   setListCountry(response.data);
      //   setBSData({
      //     items: listItems.filter(
      //       (i) => !listSelectedCountry.some((c) => c === i.value)
      //     ),
      //     title: countryData.groupName,
      //     isHaveSearchBox: true,
      //     name: `taxDetails[${id}].taxCountry`,
      //     searchBoxPlaceholder: 'Search',
      //     type: 'OptionsList',
      //   });
      // }
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

  const extractIndexFromPropertyPath = (propertyPath: string): number | null => {
    const regex = /\[(\d+)\]/; // Matches "[number]"
    const match = propertyPath.match(regex);

    if (match && match[1]) {
      const index = parseInt(match[1], 10);
      return index;
    } else {
      return null;
    }
  };

  return (
    <>

    {isLoadingValues && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size={"large"} color={"white"} />
        </View>
      )}

    <View style={styles.container}>
      <Formik
        innerRef={formikRef}
        validationSchema={personalDetailsSchema(
          isUnEmployed,
          isOutsideLabourForce,
          i18n,
          oddReviewCycle
        )}
        initialValues={UserDetailsData.empty(
          profile,
          selectedSourceOfFunds,
          selectedSourceOfWealth,
          selectedAccountPurpose
        )}
        onSubmit={async (values) => {
          const religionSelectedKey = getEDSKeyByValue(metadata, 'religion', values.religion);
          const marialStatusSelectedKey = getEDSKeyByValue(
            metadata,
            'maritalStatus',
            values.maritalStatus
          );
          const employmentTypeSelectedKey = getEDSKeyByValue(
            metadata,
            'employmentType',
            values.employmentType
          );
          const employmentSectorSelectedKey = getEDSKeyByValue(
            metadata,
            'employmentSector',
            values.employmentSector
          );
          const occupationSelectedKey = getEDSKeyByValue(metadata, 'occupation', values.occupation);
          const citySelectedKey = getEDSKeyByValue(metadata, 'city', values?.city);
          const stateSelectedKey = getEDSKeyByValue(metadata, 'state', values?.state);

          const inputedValue: UpdateProfilePayload = {
            nickName: values.nickName,
            religion: religionSelectedKey,
            maritalStatus: marialStatusSelectedKey,
            addresses: [
              {
                addressType: 'Mailing Address',
                line1: values.line1,
                line2: values.line2,
                postcode: values.postcode,
                city: citySelectedKey,
                state: stateSelectedKey,
                country: 'Singapore',
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
              const countrySelectedKey = getEDSKeyByValue(metadata, 'country', item.taxCountry);
              const reasonSelectedKey = getEDSKeyByValue(metadata, 'taxReason', item.reason);

              const { haveTaxNumberHandy, ...rest } = item;
              return {
                ...rest,
                taxCountry: countrySelectedKey,
                reason: reasonSelectedKey,
              };
            }),
            creditDetails: [
              {
                annualIncome: Number(values.annualIncome.replace(/[,]/g, '')),
              },
            ],
          };

          if (oddReviewCycle) {
            const excludingStatuses = 'Completed,Rejected,Cancelled,Expired,Withdrawn';
            const application = await getFramlODDApplicationStatus(
              profile?.userId,
              excludingStatuses
            );
            const ODDObject = {
              submitType: 'Submit',
              credit: {
                applicant: {
                  individual: {
                    sourceOfFund: `${toString(
                      values.accountSourceOfFunds,
                      values.otherSourceOfFunds,
                      'fund'
                    )}`,
                    sourceOfWealth: `${toString(
                      values.accountSourceOfWealth,
                      values.otherSourceOfWealth,
                      'wealth'
                    )}`,
                    accountPurpose: `${toString(
                      values.accountOpeningPurpose,
                      values.otherAccountOpeningPurpose,
                      'other'
                    )}`,
                  },
                },
              },
              customFields: [
                {
                  customKey: 'EDD_LAST_SUBMITTED',
                  customValue: moment().utc(),
                },
              ],
            };
            if (application) {
              const res = await updateODDReviewCycle(application.applicationId, ODDObject);
              if (!res) {
                return;
              }
            }
          }
          setIsUpdatingProfile(true);
          onSubmit(profile?.userId || '', inputedValue);
        }}
      >
        {({ submitForm, dirty, errors, isValid, values, setFieldValue, touched, handleChange, validateForm }) => {
       
          // if (`${values.annualIncome}`.length > 0) {
          //   amountFormat(values?.annualIncome, (num: string) => {
          //     setFieldValue('annualIncome', num);
          //   });
          // }

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

          if (values.accountOpeningPurpose) {
            if (Object.keys(values.accountOpeningPurpose).length === 0) {
              setAccountPurposePlaceholderVisible(false);
            } else {
              setAccountPurposePlaceholderVisible(true);
            }
          }
          if (values.accountSourceOfFunds) {
            if (Object.keys(values.accountSourceOfFunds).length === 0) {
              setSourceOfFundsPlaceholderVisible(false);
            } else {
              setSourceOfFundsPlaceholderVisible(true);
            }
          }
          if (values.accountSourceOfWealth) {
            if (Object.keys(values.accountSourceOfWealth).length === 0) {
              setSourceOfWealthPlaceholderVisible(false);
            } else {
              setSourceOfWealthPlaceholderVisible(true);
            }
          }

          const checkSpaceSoF =
            values.accountSourceOfFunds?.[eddMetadata.other.otherOptionText] &&
            values.otherSourceOfFunds.trim() === '';
          const checkSpaceSoW =
            values.accountSourceOfWealth?.[eddMetadata.other.otherOptionText] &&
            values.otherSourceOfWealth.trim() === '';
            
          const isDisableSubmit = !isEdited ||
          !dirty ||
          !isValid ||
          values.nickName.length === 0 ||
          (oddReviewCycle && (checkSpaceSoF || checkSpaceSoW))

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
              <View style={styles.rowSpaceBetween}>
                <Text style={styles.mainheading}>
                  {i18n.t('user_details.personal_details_section_title')}
                </Text>
                <TouchableOpacity
                  onPress={onToggelIsCollapsedPersonalDetailsSection}
                >
                  {!isCollapsedPersonalDetailsSection ? (
                    <ASMinusIcon size={22} />
                  ) : (
                    <PlusIcon size={22} />
                  )}
                </TouchableOpacity>
              </View>
              {!isCollapsedPersonalDetailsSection && <>
                <View style={styles.verticalSpacing} />
                {oddReviewCycle && (
                  <>
                    {/* <View style={styles.rowInfoFixed}>
                      <Text style={styles.rowInfoName}>{i18n.t('user_details.full_name')}</Text>
                      <Text style={styles.rowInfoValue}>{values.fullName}</Text>
                    </View> */}
                    <View style={{marginTop: 15}}>
                      <View style={styles.inputValue}>
                        <Text style={styles.disabledValue}>{values.fullName}</Text>
                      </View>
                      <View style={styles.placeholder}>
                        <Text style={styles.rowInfoName}>
                          {i18n?.t("user_details.full_name")} 
                        </Text>
                        </View>
                    </View>
                    <View style={{marginTop: 15}}>
                      <View style={styles.inputValue}>
                        <Text style={styles.disabledValue}>{values.idNumber}</Text>
                      </View>
                      <View style={styles.placeholder}>
                        <Text style={styles.rowInfoName}>
                          {i18n?.t("user_details.id_number")} 
                        </Text>
                        </View>
                    </View>
                    <View style={{marginTop: 15}}>
                      <View style={styles.inputValue}>
                        <Text style={styles.disabledValue}>{values.mobileNumber}</Text>
                      </View>
                      <View style={styles.placeholder}>
                        <Text style={styles.rowInfoName}>
                          {i18n?.t("user_details.mobile_number")} 
                        </Text>
                        </View>
                    </View>
                    <View style={{marginTop: 15}}>
                      <View style={styles.inputValue}>
                        <Text style={styles.disabledValue}>{values.email}</Text>
                      </View>
                      <View style={styles.placeholder}>
                        <Text style={styles.rowInfoName}>
                          {i18n?.t("user_details.email")} 
                        </Text>
                        </View>
                    </View>
                    <View style={{marginTop: 15}}>
                      <View style={styles.inputValue}>
                        <Text style={styles.disabledValue}>{values.residentialAddress}</Text>
                      </View>
                      <View style={styles.placeholder}>
                        <Text style={styles.rowInfoName}>
                          {i18n?.t("user_details.residential_address")} 
                        </Text>
                        </View>
                    </View>
                    <View style={styles.verticalSpacing} />
                  </>
                )}
                <ASInputField
                  name={'nickName'}
                  hideUnderLine={true}
                  placeholder={i18n.t('user_name.preferredName')}
                  type="custom"
                  inputType={InputTypeEnum.MATERIAL}
                  value={values.nickName}
                  onChangeText={(e) => {
                    e[0] !== ' ' && handleChange('nickName')(e.replace(/\s+/g, ' '));
                    setIsEdited(true);
                   }
                  }
                  editable={isEditMode}
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
                  suffixIcon={<ArrowDownIcon width={21} height={21} color={isEditMode ? themeColors.primaryColor: themeColors.gray400} />}
                  onClickSuffixIcon={isEditMode && onPressReligionInput}
                  onInputPress={isEditMode && onPressReligionInput}
                  showDisableValueColor={!isEditMode}
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
                  suffixIcon={<ArrowDownIcon width={21} height={21} color={isEditMode ? themeColors.primaryColor: themeColors.gray400} />}
                  onClickSuffixIcon={isEditMode && onPressMaritialStatus}
                  onInputPress={isEditMode && onPressMaritialStatus}
                  showDisableValueColor={!isEditMode}
                  type="custom"
                  inputType={InputTypeEnum.MATERIAL}
                  errors={errors}
                  touched={touched}
                />
                <View style={styles.verticalSpacing} />
                <ASInputField
                  name={'highestEducation'}
                  hideUnderLine={true}
                  placeholder={i18n.t('personal_details.highest_education')}
                  editable={false}
                  suffixIcon={<ArrowDownIcon width={21} height={21} color={isEditMode ? themeColors.primaryColor: themeColors.gray400} />}
                  onClickSuffixIcon={isEditMode && onPressHighestEducation}
                  onInputPress={isEditMode && onPressHighestEducation}
                  showDisableValueColor={!isEditMode}
                  type="custom"
                  inputType={InputTypeEnum.MATERIAL}
                  errors={errors}
                  touched={touched}
                />
                <View style={styles.verticalSpacing} />
                
                {!oddReviewCycle && <ASInputField
                  name={'idNumber'}
                  hideUnderLine={true}
                  placeholder={i18n.t('user_name.id_number')}
                  editable={false}
                  type="custom"
                  inputType={InputTypeEnum.MATERIAL}
                  errors={errors}
                  touched={touched}
                  nonEditableColor={'red'}
                />}
              </>}
                <View style={styles.underline} />
                <View style={styles.rowSpaceBetween}>
                  <Text style={styles.mainheading}>
                    {i18n.t('user_details.contact_details')}
                  </Text>
                  <TouchableOpacity
                    onPress={onToggelIsCollapsedContactDetailsSection}
                  >
                    {!isCollapsedContactDetailsSection ? (
                      <ASMinusIcon size={22} />
                    ) : (
                      <PlusIcon size={22} />
                    )}
                  </TouchableOpacity>
                </View>
                {!isCollapsedContactDetailsSection && <>
                <View style={styles.verticalSpacing} />
                  <ASInputField
                    name={'email'}
                    hideUnderLine={true}
                    placeholder={i18n.t('user_details.email')}
                    type="custom"
                    inputType={InputTypeEnum.MATERIAL}
                    value={values.email}
                    editable={false}
                    errors={errors}
                    touched={touched}
                  />
                  <View style={styles.verticalSpacing} />
                  <ASInputField
                    name={'mobileNumber'}
                    hideUnderLine={true}
                    placeholder={i18n.t('user_details.mobile_number')}
                    type="custom"
                    inputType={InputTypeEnum.MATERIAL}
                    value={values.mobileNumber}
                    editable={false}
                    errors={errors}
                    touched={touched}
                  />
                </>}

                <View style={styles.underline} />
                <View style={styles.rowSpaceBetween}>
                  <Text style={styles.mainheading}>
                    {i18n.t('user_details.mailing_address')}
                  </Text>
                  <TouchableOpacity
                    onPress={onToggelIsCollapsedMailingAddressSection}
                  >
                    {!isCollapsedMailingAddressSection ? (
                      <ASMinusIcon size={22} />
                    ) : (
                      <PlusIcon size={22} />
                    )}
                  </TouchableOpacity>
                </View>
                {
                  !isCollapsedMailingAddressSection && <>
                <View style={styles.verticalSpacing} />
                <ASInputField
                  name={'line1'}
                  hideUnderLine={true}
                  placeholder={i18n.t('user_details.line1')}
                  type="custom"
                  onChangeText={(e) => {
                    e[0] !== ' ' && handleChange('line1')(e.replace(/\s+/g, ' '));
                    setIsEdited(true);
                   }
                  }
                  inputType={InputTypeEnum.MATERIAL}
                  value={values.line1}
                  editable={isEditMode}
                  errors={errors}
                  touched={touched}
                />
                <View style={styles.verticalSpacing} />
                <ASInputField
                  name={'line2'}
                  hideUnderLine={true}
                  placeholder={i18n.t('user_details.line2')}
                  type="custom"
                  onChangeText={(e) => {
                    e[0] !== ' ' && handleChange('line2')(e.replace(/\s+/g, ' '));
                    setIsEdited(true);
                   }
                  }
                  inputType={InputTypeEnum.MATERIAL}
                  editable={isEditMode}
                  value={values.line2}
                  errors={errors}
                  touched={touched}
                />
                <View style={styles.verticalSpacing} />
                <ASInputField
                  name={'postcode'}
                  hideUnderLine={true}
                  maxLength={6}
                  placeholder={i18n.t('user_details.postcode')}
                  onKeyPress={() => {
                    if(values.postcode.length > 3) {
                      setTimeout(() => {
                        setIsEdited(true);
                        getCityList(formikRef.current?.values['postcode']);
                      }, 500);
                    }
                  }}
                  onFocus={() => {
                    setIsSkipFetchState(false);
                  }}
                  type="custom"
                  inputType={InputTypeEnum.MATERIAL}
                  editable={isEditMode}
                  value={values.postcode}
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
                  suffixIcon={<ArrowDownIcon width={21} height={21} color={isEditMode ? themeColors.primaryColor: themeColors.gray400} />}
                  onClickSuffixIcon={isEditMode && onPressState}
                  onInputPress={isEditMode && onPressState}
                  editable={false}
                  type="custom"
                  inputType={InputTypeEnum.MATERIAL}
                  showDisableValueColor={!isEditMode}
                  errors={errors}
                  touched={touched}
                />
                <View style={styles.verticalSpacing} />
                <ASInputField
                  name={'state'}
                  hideUnderLine={true}
                  placeholder={i18n.t('user_details.state')}
                  onClickSuffixIcon={isEditMode && onPressState}
                  onInputPress={isEditMode && onPressState}
                  editable={false}
                  suffixIcon={<ArrowDownIcon width={21} height={21} color={isEditMode ? themeColors.primaryColor: themeColors.gray400} />}
                  type="custom"
                  inputType={InputTypeEnum.MATERIAL}
                  showDisableValueColor={!isEditMode}
                  errors={errors}
                  touched={touched}
                />
                  
                  </>
                }

                <View style={styles.underline} />
                <View style={styles.rowSpaceBetween}>
                  <Text style={styles.mainheading}>
                    {i18n.t('user_details.employment_details')}
                  </Text>
                  <TouchableOpacity
                    onPress={onToggelIsCollapsedEmploymentDetailsSection}
                  >
                    {!isCollapsedEmploymentDetailsSection ? (
                      <ASMinusIcon size={22} />
                    ) : (
                      <PlusIcon size={22} />
                    )}
                  </TouchableOpacity>
                </View>

                {!isCollapsedEmploymentDetailsSection && <>
                  <View style={styles.verticalSpacing} />
                <ASInputField
                  name={'employmentType'}
                  hideUnderLine={true}
                  placeholder={i18n.t('user_details.employment_type')}
                  editable={false}
                  suffixIcon={<ArrowDownIcon width={21} height={21} color={isEditMode ? themeColors.primaryColor: themeColors.gray400} />}
                  showDisableValueColor={!isEditMode}
                  onInputPress={isEditMode && onPressImploymentType}
                  onClickSuffixIcon={isEditMode && onPressImploymentType}
                  type="custom"
                  inputType={InputTypeEnum.MATERIAL}
                  errors={errors}
                  touched={touched}
                />

                {isUnEmployed || isOutsideLabourForce ? (
                  <View style={{marginTop: 15}}>
                  <View style={styles.inputValue}>
                    <Text style={styles.disabledValue}>{i18n?.t("account_origination.employment_details.not_applicable")}</Text>
                  </View>
                  <View style={styles.placeholder}>
                    <Text style={styles.rowInfoName}>
                      {i18n?.t(
                        "account_origination.employment_details.employee_sector"
                      )}
                    </Text>
                    </View>
                </View>
                ) : (
                  <>
                    <View style={styles.verticalSpacing} />

                    <ASInputField
                      name={'employmentSector'}
                      hideUnderLine={true}
                      placeholder={i18n.t('user_details.employment_sector')}
                      editable={false}
                      onInputPress={isEditMode && onPressImploymentSector}
                      onClickSuffixIcon={isEditMode && onPressImploymentSector}
                      multiline={values.employmentSector.length > 50}
                      style={{
                        inputContainerStyle:
                          values.employmentSector.length > 50
                            ? {
                                height: 'auto',
                              }
                            : {},
                      }}
                      suffixIcon={<ArrowDownIcon width={21} height={21} color={isEditMode ? themeColors.primaryColor: themeColors.gray400} />}
                      showDisableValueColor={!isEditMode}
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
                          onChangeText={(e) => {
                            e[0] !== ' ' && handleChange('employerName')(e.replace(/\s+/g, ' '));
                            setIsEdited(true);
                           }
                          }
                          placeholder={i18n.t('user_details.employer_name')}
                          type="custom"
                          inputType={InputTypeEnum.MATERIAL}
                          editable={isEditMode}
                          value={values.employerName}
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
                      onInputPress={isEditMode && onPressOccupation}
                      onClickSuffixIcon={isEditMode && onPressOccupation}
                      suffixIcon={<ArrowDownIcon width={21} height={21} color={isEditMode ? themeColors.primaryColor: themeColors.gray400} />}
                      showDisableValueColor={!isEditMode}
                      type="custom"
                      inputType={InputTypeEnum.MATERIAL}
                      multiline={values.occupation.length > 50}
                      style={{
                        inputContainerStyle:
                          values.occupation.length > 50
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
                  editable={isEditMode}
                  prefixText={
                    i18n?.t('account_origination.employment_details.currency') + ' ' ?? 'RM '
                  }
                  placeholder={i18n.t('user_details.annualIncome')}
                  type="custom"
                  inputType={InputTypeEnum.MATERIAL}
                  onBlur={() => {
                    if (values.annualIncome) {
                      const { currencyFormated } = useASCurrencyFormat(values.annualIncome, 'blur');
                      setFieldValue('annualIncome', currencyFormated);
                    }
                  }}
                  onChangeText={(e) => {
                    e[0] !== ' ' && handleChange('annualIncome')(e.replace(/\s+/g, ' '));
                    setIsEdited(true);
                   }
                  }
                  autoComplete={'off'}
                  keyboardType={'numeric'}
                  returnKeyType="done"
                  errors={errors}
                  touched={touched}
                />
                
                </>}
                {oddReviewCycle && (
                  <>
                    <View style={styles.underline} />
                    <View style={styles.rowSpaceBetween}>
                      <Text style={styles.mainheading}>
                        {i18n.t('user_details.account_opening_purpose')}
                      </Text>
                      <TouchableOpacity
                        onPress={onToggelIsCollapsedAccountOpenningPurposeSection}
                      >
                        {!isCollapsedAccountOpenningPurposeSection ? (
                          <ASMinusIcon size={22} />
                        ) : (
                          <PlusIcon size={22} />
                        )}
                      </TouchableOpacity>
                    </View>
                    {
                      !isCollapsedAccountOpenningPurposeSection && <>
                        <View style={styles.verticalSpacing} />
                        <SelectInputField
                          placeholder={i18n.t('user_details.purpose_acount_opening')}
                          placeholderTextColor={defaultColors.gray400}
                          editable={false}
                          onPressInAndroid={() => isEditMode && setShowPurposeOfAccountOpen(true)}
                          onPressIn={() => isEditMode && setShowPurposeOfAccountOpen(true)}
                          suffixIcon={<ArrowDownIcon width={21} height={21} color={isEditMode ? themeColors.primaryColor: themeColors.gray400} />}
                          onRemove={(item) => {
                            setFieldValue(`accountOpeningPurpose[${item}]`, undefined);
                          }}
                          validPlaceHolder={accountPurposePlaceholderVisible}
                          name={'accountOpeningPurpose'}
                          values={values.accountOpeningPurpose}
                        />
                        {values.accountOpeningPurpose?.[eddMetadata?.other.otherOptionText] && (
                          <>
                            <ASInputField
                              maxLength={eddMetadata.other.maxOtherTextLength}
                              name={'otherAccountOpeningPurpose'}
                              placeholder={i18n.t('user_details.other_purpose') ?? 'Other purpose'}
                              placeholderTextColor={defaultColors.gray400}
                              type={'custom'}
                              inputType={InputTypeEnum.MATERIAL}
                              showCharCounter={true}
                              returnKeyType="done"
                              hideUnderLine={true}
                              maxCharCounter={eddMetadata.other.maxOtherTextLength}
                              style={{ counterStyle: { color: colors.black500 } }}
                            />
                          </>
                        )}
                        <SelectInputField
                          placeholder={i18n.t('user_details.source_of_funds')}
                          placeholderTextColor={defaultColors.gray400}
                          editable={false}
                          onPressInAndroid={() => isEditMode && setShowSourceOfFunds(true)}
                          onPressIn={() => isEditMode && setShowSourceOfFunds(true)}
                          suffixIcon={<ArrowDownIcon width={21} height={21} color={isEditMode ? themeColors.primaryColor: themeColors.gray400} />}
                          onRemove={(item) => {
                            setFieldValue(`accountSourceOfFunds[${item}]`, undefined);
                          }}
                          validPlaceHolder={sourceOfFundsPlaceholderVisible}
                          name={'accountSourceOfFunds'}
                          values={values.accountSourceOfFunds}
                        />
                        {values.accountSourceOfFunds?.[eddMetadata?.other.otherOptionText] && (
                          <>
                            <ASInputField
                              maxLength={eddMetadata.other.maxOtherTextLength}
                              name={'otherSourceOfFunds'}
                              placeholder={
                                i18n.t('user_details.other_source_of_funds') ?? 'Other source of funds'
                              }
                              placeholderTextColor={defaultColors.gray400}
                              type={'custom'}
                              inputType={InputTypeEnum.MATERIAL}
                              showCharCounter={true}
                              returnKeyType="done"
                              maxCharCounter={eddMetadata.other.maxOtherTextLength}
                              style={{ counterStyle: { color: colors.black500 } }}
                            />
                          </>
                        )}
                        <SelectInputField
                          placeholder={i18n.t('user_details.source_of_wealth')}
                          placeholderTextColor={defaultColors.gray400}
                          editable={false}
                          onPressInAndroid={() => isEditMode && setShowSourceOfWealth(true)}
                          onPressIn={() => isEditMode && setShowSourceOfWealth(true)}
                          suffixIcon={<ArrowDownIcon width={21} height={21} color={isEditMode ? themeColors.primaryColor: themeColors.gray400} />}
                          onRemove={(item) => {
                            setFieldValue(`accountSourceOfWealth[${item}]`, undefined);
                          }}
                          validPlaceHolder={sourceOfWealthPlaceholderVisible}
                          name={'accountSourceOfWealth'}
                          values={values.accountSourceOfWealth}
                        />
                        {values.accountSourceOfWealth?.[eddMetadata?.other.otherOptionText] && (
                          <>
                            <View style={styles.verticalSpacing} />
                            <ASInputField
                              maxLength={eddMetadata.other.maxOtherTextLength}
                              name={'otherSourceOfWealth'}
                              placeholder={
                                i18n.t('user_details.other_source_of_wealth') ??
                                'Other source of wealth'
                              }
                              placeholderTextColor={defaultColors.gray400}
                              type={'custom'}
                              inputType={InputTypeEnum.MATERIAL}
                              showCharCounter={true}
                              returnKeyType="done"
                              maxCharCounter={eddMetadata.other.maxOtherTextLength}
                              style={{ counterStyle: { color: colors.black500 } }}
                            />
                          </>
                        )}
                      </>
                    }
                  </>
                )}
                <View style={styles.content}>
                  <View style={styles.underline} />
                  <View style={styles.rowSpaceBetween}>
                      <Text style={styles.mainheading}>
                        {i18n.t('review_personal_details.tax_details_section_title')}
                      </Text>
                      <TouchableOpacity
                        onPress={onToggelIsCollapsedTaxDetailsSection}
                      >
                        {!isCollapsedTaxDetailsSection ? (
                          <ASMinusIcon size={22} />
                        ) : (
                          <PlusIcon size={22} />
                        )}
                      </TouchableOpacity>
                    </View>
                  {!isCollapsedTaxDetailsSection && <>
                  
                    <View style={{height: 10}} />
                  {!isSelectedOtherCountry && (
                    <ASInputField
                      name={'listSelectedTaxCountry'}
                      hideUnderLine={true}
                      placeholder={i18n.t('review_personal_details.country_tax_residence_title')}
                      type="custom"
                      inputType={InputTypeEnum.MATERIAL}
                      editable={isEditMode}
                      onInputPress={() => isEditMode && setIsSelectedOtherCountry(true)}
                    />
                  )}
                  {isSelectedOtherCountry && (
                    <View style={styles.taxInfomationsContainer}>
                      {listTaxes.map((t, index) => {
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
                                  suffixIcon={
                                    <ArrowDownIcon width={21} height={21} color={isEditMode ? themeColors.primaryColor: themeColors.gray400} />
                                  }
                                  onClickSuffixIcon={() => isEditMode && onPressCountry(index)}
                                  inputType={InputTypeEnum.MATERIAL}
                                  hideUnderLine
                                  onPressIn={() => isEditMode && onPressCountry(index)}
                                  errors={errors}
                                  touched={touched}
                                />
                              </View>
                              {listTaxes.length > 1 && (
                                <TouchableOpacity
                                  style={styles.deleteIconContainer}
                                  onPress={() => onRemoveTaxes(index, setFieldValue, t?.id)}
                                >
                                  <TrashIcon width={24} height={24} color={themeColors.primaryColor} />
                                </TouchableOpacity>
                              )}
                            </View>
                            <Text style={styles.question}>
                              {i18n?.t('purpose_account_opening.tax_handy_text')}
                            </Text>
                            <RadioButtonGroup
                              useTraditionalType
                              isCustomed={true}
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
                                itemContainerStyle: styles.itemContainerStyle,
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
                                    isEditMode && onPressReason(`taxDetails[${index}].reason`, index)
                                  }
                                  onPressIn={() =>
                                    isEditMode && onPressReason(`taxDetails[${index}].reason`, index)
                                  }
                                  isUsingSelectionAtStart
                                  inputType={InputTypeEnum.MATERIAL}
                                  hideUnderLine
                                  suffixIcon={
                                    <ArrowDownIcon width={21} height={21} color={isEditMode ? themeColors.primaryColor: themeColors.gray400} />
                                  }
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
                        <>
                        {/* {listTaxes.length > 0 && <View style={{height: 1, width: '100%', backgroundColor: '#E0E0D3'}}/>} */}
                        <TouchableOpacity
                          style={styles.addMoreContainer}
                          onPress={() => onAddMoreTaxes(setFieldValue)}
                        >
                          <AddCircleIcon size={25} />
                          <Text style={styles.addMore}>
                            {i18n?.t('purpose_account_opening.add_more')}
                          </Text>
                        </TouchableOpacity>
                        </>
                      )}
                    </View>
                  )}
                  </>}
                </View>
                {oddReviewCycle && (
                  <View>
                    <View style={{padding: 12, borderRadius: 8, marginVertical: 24, backgroundColor: '#FAF9F5'}}>
                      {/* <Text style={styles.dot}>{'\u2022'}</Text> */}
                      <Text style={styles.rowTitle}>
                        {i18n.t('user_details.review_profile_disclaimer4')}{' '}
                        <Text style={[styles.clickable, {color: themeColors.primaryText, textDecorationLine: 'underline'}]} onPress={() => {}}>
                          {i18n.t('user_details.review_profile_disclaimer_clickable')}
                        </Text>{' '}
                        <Text>{`${i18n.t('user_details.review_profile_disclaimer5')}: `}</Text>
                      </Text>
                      <View style={{flexDirection: 'row', paddingHorizontal: 12, marginTop: 3}}>
                        <Text style={styles.dot}>{'\u2022'}</Text>
                        <Text style={styles.rowTitle}>
                          Full name.
                        </Text>
                      </View>
                      <View style={{flexDirection: 'row', paddingHorizontal: 12, marginTop: 3}}>
                        <Text style={styles.dot}>{'\u2022'}</Text>
                        <Text style={styles.rowTitle}>
                          Contact details (mobile number or email).
                        </Text>
                      </View>
                      <View style={{flexDirection: 'row', paddingHorizontal: 12, marginTop: 3}}>
                        <Text style={styles.dot}>{'\u2022'}</Text>
                        <Text style={styles.rowTitle}>
                          ID document.
                        </Text>
                      </View>
                      <View style={{flexDirection: 'row', paddingHorizontal: 12, marginTop: 3}}>
                        <Text style={styles.dot}>{'\u2022'}</Text>
                        <Text style={styles.rowTitle}>
                          Nationality.
                        </Text>
                      </View>
                      <View style={{flexDirection: 'row', paddingHorizontal: 12, marginTop: 3}}>
                        <Text style={styles.dot}>{'\u2022'}</Text>
                        <Text style={styles.rowTitle}>
                          Residential address.
                        </Text>
                      </View>
                    </View>
                    {/* <View style={styles.row}>
                      <Text style={styles.rowTitle}>
                        {i18n.t('user_details.review_profile_disclaimer3')}
                      </Text>
                    </View> */}
                  </View>
                )}
                <View style={styles.verticalSpacing} />


                <Text style={styles.rowTitle}>
                  {i18n.t('user_details.review_profile_disclaimer3')}
                </Text>
                <View style={{height: 10}}/>
                <ASButton
                  label={'Update'}
                  onPress={submitForm}
                  disabled={isDisableSubmit}
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
                        : bsData.name === 'city' ||
                          bsData.name === 'state' ||
                          // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                          bsData.name.includes('taxCountry')
                        ? height / 1.4
                        : 450,
                  }}
                  onChangeValue={setSelectedBSValue}
                  onSearch={(t) => setSearchText(t)}
                  onSelectValue={(value, code) => {
                    setIsEdited(true);
                    setFieldValue(bsData.name, value);
                    setSearchText('');
                    setIsShowBottomSheet(false);
                    setSelectedReasonViewingIndex(-1);
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
                    if (isViewingReasonBS) {
                      if (bsData.name.toLowerCase().includes('reason')) {
                        const index = extractIndexFromPropertyPath(bsData.name);
                        if (value !== 'The account holder is unable to obtain a TIN') {
                          const reasonSplit = bsData.name.split('reason');
                          setFieldValue(`${reasonSplit[0]}reasonDetails`, '');
                          setFieldValue(`${reasonSplit[0]}reason`, value);
                        }
                        if (index) {
                          const newTaxes = listTaxes;
                          newTaxes[index].reason = value;
                          newTaxes[index].reasonDetails = '';
                          setListTaxes(newTaxes);
                        }
                      }
                      setSelectedBSValue(value);
                    }
                    if (isViewingCountry) {
                      if (bsData.name.includes('taxCountry')) {
                        const reasonSplit = bsData.name.split('taxCountry');
                        const countryCode = code;

                        setFieldValue(`${reasonSplit[0]}taxCountryCode`, countryCode);

                        const index = extractIndexFromPropertyPath(bsData.name);
                        if (index) {
                          const newTaxes = listTaxes;
                          newTaxes[index].taxCountry = value;
                          newTaxes[index].taxCountryCode = countryCode;
                          setListTaxes(newTaxes);
                        }
                      }
                      setSelectedBSValue(value);
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
              <ASCustomerEDDModal
                isVisible={showPurposeOfAccountOpen}
                title={
                  i18n.t('user_details.purpose_acount_opening') ?? 'Purpose of account opening'
                }
                bottomSheetHeight={SCREEN_HEIGHT - 100}
                onClose={() => setShowPurposeOfAccountOpen(false)}
                style={{
                  closeButtonContainer: {
                    justifyContent: 'center',
                    flexDirection: 'row',
                    position: 'relative',
                  },
                  titleStyle: { maxWidth: '85%', textAlign: 'center' },
                  closeIcon: {
                    width: 32,
                    justifyContent: 'center',
                    alignItems: 'center',
                    position: 'absolute',
                    right: 5,
                    top: 20,
                  },
                }}
              >
                <ScrollView style={{ height: SCREEN_HEIGHT - 310, marginTop: 0 }}>
                  {eddMetadata?.accountOpeningPurposes &&
                    eddMetadata?.accountOpeningPurposes.map((item) => {
                      return (
                        <CircularCheckBox
                          style={checkboxStyle}
                          title={item}
                          isSelected={!!values.accountOpeningPurpose?.[item]}
                          onChanged={(value) => {
                            setFieldValue(
                              `accountOpeningPurpose[${item}]`,
                              value ? value : undefined
                            );
                          }}
                        />
                      );
                    })}
                </ScrollView>
                <View style={styles.accPurposeContinueBtnContainer}>
                  <ASButton
                    label={i18n.t('edd.continue') ?? 'Continue'}
                    onPress={() => setShowPurposeOfAccountOpen(false)}
                    containerStyles={{ paddingVertical: 16 }}
                  />
                </View>
              </ASCustomerEDDModal>
              <ASCustomerEDDModal
                isVisible={showSourceOfFunds}
                title={i18n.t('user_details.source_of_funds') ?? 'Source of funds'}
                bottomSheetHeight={SCREEN_HEIGHT - 100}
                onClose={() => setShowSourceOfFunds(false)}
              >
                <ScrollView style={{ marginTop: 20, marginBottom: 20 }}>
                  {eddMetadata?.sourceOfFundOptions &&
                    eddMetadata?.sourceOfFundOptions.map((item) => {
                      return (
                        <CircularCheckBox
                          style={checkboxStyle}
                          title={item}
                          isSelected={!!values?.accountSourceOfFunds?.[item]}
                          onChanged={(value) => {
                            setFieldValue(
                              `accountSourceOfFunds[${item}]`,
                              value ? value : undefined
                            );
                          }}
                        />
                      );
                    })}
                </ScrollView>
                <View style={styles.continueButtonContainer}>
                  <ASButton
                    label={i18n.t('edd.continue') ?? 'Continue'}
                    onPress={() => setShowSourceOfFunds(false)}
                    containerStyles={{ paddingVertical: 16 }}
                  />
                </View>
              </ASCustomerEDDModal>
              <ASCustomerEDDModal
                isVisible={showSourceOfWealth}
                title={i18n.t('user_details.source_of_wealth') ?? 'Source of Wealth'}
                bottomSheetHeight={SCREEN_HEIGHT - 100}
                onClose={() => setShowSourceOfWealth(false)}
              >
                <ScrollView style={{ marginTop: 20, marginBottom: 20 }}>
                  {eddMetadata?.sourceOfWealthOptions &&
                    eddMetadata?.sourceOfWealthOptions.map((item) => {
                      return (
                        <CircularCheckBox
                          style={checkboxStyle}
                          title={item}
                          isSelected={!!values.accountSourceOfWealth?.[item]}
                          onChanged={(value) => {
                            setFieldValue(
                              `accountSourceOfWealth[${item}]`,
                              value ? value : undefined
                            );
                          }}
                        />
                      );
                    })}
                </ScrollView>
                <View style={styles.continueButtonContainer}>
                  <ASButton
                    label={i18n.t('edd.continue') ?? 'Continue'}
                    onPress={() => setShowSourceOfWealth(false)}
                    containerStyles={{ paddingVertical: 16 }}
                  />
                </View>
              </ASCustomerEDDModal>
            </>
          );
        }}
      </Formik>
    </View>
    </>
  );
};

const styles = StyleSheet.create({
  errorSection: {
    marginTop: 10,
  },
  inputValue: {borderWidth: 1, paddingVertical: 14, paddingHorizontal: 12, borderColor: '#C2C2C2', borderRadius: 4},

  placeholder: {
    position: 'absolute',
    top: -10, 
    left: 8,
    backgroundColor: 'white',
    paddingHorizontal: 5
  },
  disabledValue: {
    color: '#999999',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "400",
    fontFamily: fonts.OutfitRegular,
  },
  loaderContainer: {
    position: "absolute",
    zIndex: 2,
    height: SCREEN_HEIGHT,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
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
    color: '#999999',
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
  continueButtonContainer: {
    paddingHorizontal: 24,
    marginBottom: 250 * (SCREEN_WIDTH / SCREEN_HEIGHT),
  },
  accPurposeContinueBtnContainer: {
    paddingHorizontal: 24,
    marginTop: SCREEN_WIDTH / SCREEN_HEIGHT,
  },
  row: {
    marginTop: 30,
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 2,
  },
  innerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 2,
  },
  rowTitle: {
    marginLeft: 8,
    fontSize: 10,
    fontFamily: fonts.OutfitRegular,
    color: colors.productDescriptionColor,
    lineHeight: 16,
    fontWeight: '400',
  },
  dot: {
    color: colors.black500,
  },
  clickable: {
    fontWeight: '600',
    color: colors.primary,
    fontFamily: fonts.OutfitRegular
  },
  verticalSpacing20: {
    height: 20,
  },
  input: {
    marginTop: 5,
  },
  addMore: {
    fontSize: 14,
    color: '#1B1B1B',
    fontFamily: fonts.OutfitRegular,
    marginLeft: 7,
  },
  textInput: {
    borderBottomColor: '#C2C2C2',
    borderBottomWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 12,
    fontSize: 16,
  },
  addMoreContainer: {
    marginVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  question: {
    fontSize: 12,
    color: defaultColors.black500,
    fontFamily: fonts.OutfitRegular,
    lineHeight: 16,
    marginTop: 15,
    marginBottom: 4,
  },
  taxSectionContainer: {
  },
  taxInfomationsContainer: {},
  itemPurpose: {
    backgroundColor: defaultColors.white,
    borderRadius: 96,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: defaultColors.primayEternalBloom200,
  },
  itemPurposeAdd: {
    backgroundColor: defaultColors.primaryColor,
    borderRadius: 96,
    marginRight: 10,
    marginBottom: 10,
    width: 48,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  purposeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  titlePurpose: {
    color: defaultColors.primayEternalBloom200,
    fontSize: 12,
    fontFamily: fonts.OutfitRegular,
    fontWeight: '400',
    lineHeight: 16,
  },
  titlePurposeAdd: {
    color: defaultColors.white,
    fontSize: 16,
    fontFamily: fonts.OutfitRegular,
  },
  note: {
    color: '#3F3F3F',
    fontFamily: fonts.OutfitMedium,
    fontSize: 12,
  },
  deleteIconContainer: {
    width: 36,
    alignItems: 'center',
    flexDirection: 'row',
    alignSelf: 'center',
    justifyContent: 'space-around',
    paddingLeft: 12,
  },
  seperateLine: {
    marginVertical: 15,
    height: 1,
    width: '100%',
    backgroundColor: '#DDDDDD',
  },
  error: {
    fontSize: 12,
  },
  btnTitle: {
    fontSize: 16,
    marginLeft: 5,
  },
  rowNewPurposeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
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
    marginTop: 7,
    marginBottom: 12
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
});

export default ASUserDetailsScreenComponent;
