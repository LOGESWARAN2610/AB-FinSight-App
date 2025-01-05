import {useState, useEffect} from 'react';
import {Keyboard} from 'react-native';
import {ios} from './Platform';

const useKeyboardHeight = () => {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const keyboardEvent = ios ? 'keyboardWill' : 'keyboardDid';

    const keyboardWillShowListener = Keyboard.addListener(
      `${keyboardEvent}Show`,
      event => {
        setKeyboardHeight(event.endCoordinates.height + 5);
      },
    );

    const keyboardDidHideListener = Keyboard.addListener(
      `${keyboardEvent}Hide`,
      () => {
        setKeyboardHeight(0);
      },
    );

    return () => {
      keyboardWillShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  return keyboardHeight;
};

export default useKeyboardHeight;
