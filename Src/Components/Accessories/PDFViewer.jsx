import React from 'react';
import {
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import useKeyboardHeight from './KeyboardHeight';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

let Pdf;
try {
  Pdf = require('react-native-pdf');
} catch (error) {}

const PDFViewer = ({
  isVisible = !true,
  onClose,
  url = 'https://pdfobject.com/pdf/sample.pdf',
  headerText = '',
}) => {
  const source = {
    uri: url,
  };
  const keyboardHeight = useKeyboardHeight() || 0;

  return (
    <Modal visible={isVisible} transparent animationType="slide">
      <TouchableOpacity
        activeOpacity={1}
        style={[
          {
            height: Dimensions.get('window').height,
            flex: 1,
            backgroundColor: '#535252a3',
          },
        ]}
        onPress={() => onClose()}></TouchableOpacity>
      <View
        style={[
          {
            backgroundColor: '#fff',
            zIndex: 2,
            width: Dimensions.get('window').width - 20,
            height: Dimensions.get('window').height - 200,
            borderRadius: 5,
            alignSelf: 'center',
            justifyContent: 'center',
            position: 'absolute',
            top: '13%',
            overflow: 'hidden',
          },
        ]}>
        <TouchableOpacity
          onPress={() => onClose()}
          style={{
            justifyContent: 'space-between',
            paddingVertical: 15,
            // paddingHorizontal: 10,
            marginBottom: 15,
            marginHorizontal: 10,
            flexDirection: 'row',
            backgroundColor: '#ffffff',
            borderBottomWidth: 1,
            borderColor: '#999',
          }}>
          <Text style={{fontSize: 16, fontWeight: 'bold'}}>{headerText}</Text>
          <FontAwesome
            name={'close'}
            size={20}
            style={{
              color: 'red',
              marginBottom: 0,
            }}
          />
        </TouchableOpacity>

        <View style={styles.container}>
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            maximumZoomScale={3}
            minimumZoomScale={1}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            style={{
              borderRadius: 5,
            }}>
            <Image
              source={source}
              style={{
                width: '100%',
                height: null,
                aspectRatio: 0.5,
                borderWidth: 1,
                borderRadius: 5,
                borderColor: '#999',
              }}
            />
            <View
              style={{
                marginVertical: 15,
                borderColor: '#999',
                borderBottomWidth: 1,
                borderColor: '#999',
                width: '100%',
              }}></View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    height: Dimensions.get('window').height,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  scrollContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default PDFViewer;
