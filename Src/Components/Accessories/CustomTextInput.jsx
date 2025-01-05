import {useEffect, useState} from 'react';
import {Platform, TextInput} from 'react-native';
import {web} from './Platform';
import Styles from '../../Styles/Style';

export default function CustomTextInput(props) {
  const {
    style,
    onChangeText,
    value,
    placeholder,
    keyboardType,
    autoCapitalize,
    secureTextEntry,
    border,
    onBlur = () => {},
    onKeyPress = () => {},
    onFocus = () => {},
    name = '',
    disable = false,
  } = props;

  const [iValue, setIValue] = useState(value || '');
  useEffect(() => {
    setIValue(value);
  }, [value]);

  return (
    <TextInput
      {...props}
      style={[Styles.inputBox, style, {opacity: disable ? 0.7 : 1}]}
      onChangeText={text => {
        web && setIValue(text);
        onChangeText({name: name, value: text});
      }}
      value={web ? iValue : value || ''}
      placeholder={placeholder || ''}
      keyboardType={keyboardType || 'default'}
      autoCapitalize={autoCapitalize}
      secureTextEntry={secureTextEntry}
      placeholderTextColor="#999"
      onBlur={e => {
        onBlur(e);
      }}
      onFocus={e => {
        onFocus(e);
      }}
      onKeyPress={onKeyPress}
      editable={!disable}
    />
  );
}
