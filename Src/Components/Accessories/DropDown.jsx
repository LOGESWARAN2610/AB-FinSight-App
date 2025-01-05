import React, {useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Dropdown} from 'react-native-element-dropdown';

import {generateBoxShadowStyle} from '../CommonFunctions';

const DropdownComponent = ({
  options,
  label = '',
  icon = null,
  bgColor = '#fff',
  fgColor = '#111',
  valueObj = {},
  onChange = () => {},
  style = {},
  placeholder = '',
  search = false,
  shadow = true,
  fontSize = 14,
}) => {
  const {value} = valueObj;
  const [isFocus, setIsFocus] = useState(false);

  const renderLabel = () => {
    return (
      <Text style={[styles.label, isFocus && {color: 'blue'}]}>{label}</Text>
    );
  };

  return (
    <View>
      {label && renderLabel()}
      <Dropdown
        style={[
          styles.dropdown,
          {backgroundColor: bgColor},
          style,
          shadow
            ? {
                elevation: 2,
                shadowColor: '#000',
                shadowOffset: {width: 3, height: 3},
                shadowRadius: 5,
                shadowOpacity: 0.1,
                ...generateBoxShadowStyle(0, 3, 'black', 0.1, 5, 5, 'black'),
              }
            : {},
        ]}
        placeholderStyle={{
          ...styles.placeholderStyle,
          color: fgColor,
          fontSize,
        }}
        selectedTextStyle={{fontSize, color: fgColor}}
        inputSearchStyle={{...styles.inputSearchStyle, fontSize}}
        iconStyle={{...styles.iconStyle, color: fgColor}}
        data={options}
        search={search}
        maxHeight={300}
        labelField="label"
        valueField="value"
        placeholder={placeholder}
        searchPlaceholder="Search..."
        value={value}
        onFocus={() => setIsFocus(true)}
        onBlur={() => setIsFocus(false)}
        onChange={item => {
          onChange(item);
          setIsFocus(false);
        }}
        renderLeftIcon={() => <>{icon}</>}
      />
    </View>
  );
};

export default DropdownComponent;

const styles = StyleSheet.create({
  dropdown: {
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  icon: {
    marginRight: 5,
  },
  label: {},
  placeholderStyle: {},

  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
  },
});
