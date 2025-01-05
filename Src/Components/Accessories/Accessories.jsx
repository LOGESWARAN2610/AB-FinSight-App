import React, {useState, createContext, useLayoutEffect} from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  Dimensions,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import DateTimePicker from 'react-native-ui-datepicker';

import CustomTextInput from './CustomTextInput';
// import { REDIRECT_URL } from "@env";
import {android, web} from './Platform';
import Styles from '../../Styles/Style';
import useKeyboardHeight from './KeyboardHeight';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

import {launchCamera, launchImageLibrary} from 'react-native-image-picker';

import DocumentScanner from 'react-native-document-scanner-plugin';
import DropdownComponent from './DropDown';
import Style from '../../Styles/Style';

const {width: deviceWidth, height: deviceHeight} = Dimensions.get('window'),
  deviceDimensions = {deviceWidth, deviceHeight};

const Separator = () => <View style={Styles.separator} />;
//======================================================
const Button = ({onPress, title, style = {}, textStyle = {}, icon = null}) => (
  <TouchableOpacity
    activeOpacity={1}
    onPress={onPress}
    style={[Styles.buttonContainer, style]}>
    <Text style={[Styles.buttonText, textStyle, {fontWeight: 'bold'}]}>
      {title}
    </Text>
    {icon && <Text style={{marginLeft: 10, alignSelf: 'center'}}>{icon}</Text>}
  </TouchableOpacity>
);
//======================================================
const InputBox = props => {
  const {
    value,
    type,
    placeholder,
    ref,
    secureTextEntry,
    onKeyPress = () => {},
    isValid = false,
  } = props;
  return (
    <View style={[Styles.inputBoxContainer]}>
      <CustomTextInput
        secureTextEntry={secureTextEntry || false}
        value={value || ''}
        placeholder={placeholder || ''}
        keyboardType={type || 'default'}
        style={[
          Styles.inputBox,
          isValid && {borderWidth: 1, borderColor: 'red'},
        ]}
        autoCapitalize={'none'}
        ref={ref || null}
        {...props}
        onKeyPress={onKeyPress}
      />
    </View>
  );
};
//======================================================
const SelectBox = props => {
  const {value = {}, ref, options, onChange = () => {}} = props;
  return (
    <View style={[Styles.inputBoxContainer]}>
      <DropdownComponent
        style={{height: 45}}
        options={options}
        valueObj={value}
        onChange={onChange}
      />
    </View>
  );
};

//======================================================
const UserContext = createContext();
//======================================================
const useWindowSize = () => {
  const [size, setSize] = useState([0, 0]);
  useLayoutEffect(() => {
    function updateSize() {
      setSize([window.innerWidth, window.innerHeight]);
    }
    window.addEventListener('resize', updateSize);
    updateSize();
    return () => window.removeEventListener('resize', updateSize);
  }, []);
  return size;
};
//======================================================
const DrawerView = props => {
  const {
      isShow = false,
      headerText = <></>,
      body = <></>,
      onClose = () => {},
      bodyStyle = {},
      footer = <></>,
    } = props,
    keyboardHeight = useKeyboardHeight() || 0,
    isMobileWeb = Dimensions.get('window').width <= 480;

  return (
    <Modal visible={isShow} transparent animationType="slide">
      <TouchableOpacity
        activeOpacity={1}
        style={[
          {
            height: '100%',
            flex: 1,
            backgroundColor: '#535252a3',
          },
          web
            ? {
                width: isMobileWeb ? '100%' : 750,
                right: 0,
                position: 'absolute',
                height: '100%',
              }
            : {},
        ]}
        onPress={() => onClose()}></TouchableOpacity>
      <View
        style={[
          {
            backgroundColor: '#fff',
            zIndex: 2,
            width: '99%',
            // borderColor: "#d3dadf",
            // borderWidth: 2,
            borderRadius: 5,
            // boxShadow: "0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)",
            alignSelf: 'center',
            justifyContent: 'center',
            position: 'absolute',
            bottom: android ? 0 : keyboardHeight,
            overflow: 'hidden',
          },
        ]}>
        <View>
          <TouchableOpacity
            style={Styles.modalHeader}
            activeOpacity={1}
            onPress={onClose}>
            {headerText}
            <FontAwesome
              name={'close'}
              size={20}
              style={{
                color: 'red',
                marginBottom: 0,
                marginRight: 5,
              }}
            />
          </TouchableOpacity>
          <View
            style={[
              {
                paddingHorizontal: 20,
                paddingVertical: 10,
                borderBottomWidth: 1.5,
                maxHeight:
                  Dimensions.get('window').height - (keyboardHeight + 150),
                borderBottomColor: '#f5f5f5',
              },
              bodyStyle,
            ]}>
            <ScrollView showsVerticalScrollIndicator={false}>{body}</ScrollView>
            {footer}
          </View>
        </View>
      </View>
    </Modal>
  );
};
//======================================================
const scanDocument = async isPickFile => {
  try {
    const {status} = await launchCamera();
    let result;
    if (status !== 'granted') {
      console.error('Sorry, we need camera permissions to make this work!');
    } else {
      if (isPickFile) {
        result = await launchImageLibrary({
          allowsEditing: true,
          quality: 1,
          base64: true,
        });
        result = result['assets'];
      } else {
        try {
          const {scannedImages} = await DocumentScanner.scanDocument({
            maxNumDocuments: 1,
          });
          if (scannedImages?.length > 0) {
            result = scannedImages.map(uri => ({
              uri: uri,
            }));
          }
        } catch (error) {
          Alert.alert('Error form DocumentScanner', error.message);
        }
      }
    }
    return result;
  } catch (error) {
    Alert.alert('Error form launchCamera', error.message);
    return null;
  }
};
//======================================================
const Divider = () => {
  return (
    <Text
      style={{
        color: Styles.themeColor.color,
        fontSize: 12,
        marginHorizontal: 5,
        alignSelf: 'center',
        fontWeight: 'bold',
      }}>
      |
    </Text>
  );
};
//======================================================
const TextLink = ({text, onPress = () => {}, style = {}}) => {
  return (
    <Text
      style={{
        ...{
          color: Styles.themeColor.color,
          fontSize: 12,
          alignSelf: 'center',
          fontWeight: 'bold',
        },
        ...style,
      }}
      onPress={onPress}>
      {text}
    </Text>
  );
};
//======================================================
const DatePicker = ({
  mode = 'date',
  date = new Date(),
  onChange = () => {},
  isVisible = false,
}) => {
  return isVisible ? (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={() => setShowModal(false)}>
      <View style={Style.modalOverlay}>
        <View style={Style.modalContent}>
          <DateTimePicker
            mode="single"
            date={date}
            onChange={params => onChange(params.date)}
            selectedTextStyle={{
              color: '#fff',
            }}
            selectedItemColor={Styles.themeColor.color}
            style={{borderWidth: 1, borderColor: 'red', borderRadius: 5}}
          />
        </View>
      </View>
    </Modal>
  ) : null;
};
//======================================================

export {
  Separator,
  Button,
  Divider,
  InputBox,
  TextLink,
  UserContext,
  useWindowSize,
  deviceDimensions,
  DrawerView,
  scanDocument,
  SelectBox,
  DatePicker,
};
