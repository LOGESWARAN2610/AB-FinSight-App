import {
  Alert,
  Linking,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Styles from '../../Styles/Style';
import {useCallback, useEffect, useState} from 'react';
import {formatIndRs, handleAPI} from '../CommonFunctions';
import moment from 'moment';

const Transaction = props => {
  const [transactionHistory, setTransactionHistory] = useState([]),
    [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    handleGetTransactionHistory();
  }, [props]);

  const handleGetTransactionHistory = async () => {
    const result = await handleAPI('getPaymentTransaction');
    setTransactionHistory([...result['data']]);
    setTimeout(() => {
      setRefreshing(false);
    }, 500);
  };
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    handleGetTransactionHistory();
  }, []);

  const handleOpenPaymentApp = async () => {
    // const url = "upi://pay?pa=example@upi&pn=John Doe&am=10&cu=INR";
    const amount = 1,
      upiId = 'logeshwaran2610@ybl',
      currency = 'INR';

    const url = `upi://pay?pa=${upiId}&am=${amount}&cu=${currency}&pn=&tr=`;

    try {
      const supported = await Linking.canOpenURL(url);

      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'No app found to handle this payment request.');
      }
    } catch (err) {
      console.error('Failed to open URL:', err);
      Alert.alert('Error', 'Failed to open the payment app.');
    }
  };

  return (
    <View
      style={{
        paddingHorizontal: 20,
        backgroundColor: '#fff',
        flex: 1,
      }}>
      <TouchableOpacity
        activeOpacity={1}
        style={{
          backgroundColor: Styles.themeColor.color,
          paddingHorizontal: 15,
          paddingVertical: 15,
          marginVertical: 10,
          borderRadius: 5,
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}>
        <Text style={{color: '#fff', fontSize: 15, fontWeight: 'bold'}}>
          Transaction History
        </Text>
      </TouchableOpacity>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        {transactionHistory.length > 0 ? (
          <>
            {transactionHistory.map((history, index) => {
              const {
                  amount,
                  from,
                  to,
                  requestedBy,
                  requestedOn,
                  status: settlementStatus,
                  notes = '',
                } = history,
                settlementStatusColor =
                  settlementStatus === 'Paid' ? 'green' : '#ff9800';

              return (
                <View
                  key={index}
                  style={{
                    backgroundColor: '#fafafa',
                    paddingHorizontal: 20,
                    paddingVertical: 10,
                    borderRadius: 10,
                    marginTop: 10,
                    justifyContent: 'space-between',
                    borderColor: '#d1d1d161',
                    borderWidth: 1,
                    flexDirection: 'row',
                  }}>
                  <View style={{flex: 2}}>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                      }}>
                      <Text>Date : </Text>
                      <Text style={{fontWeight: 'bold', fontSize: 12}}>
                        {moment(from).format('DD/MM/YYYY')}
                      </Text>
                      <Text style={{fontSize: 11}}> to </Text>
                      <Text style={{fontWeight: 'bold', fontSize: 12}}>
                        {moment(to).format('DD/MM/YYYY')}
                      </Text>
                    </View>
                    <Text style={{fontSize: 11, marginTop: 8}}>
                      Req. By:{' '}
                      <Text style={{fontWeight: 'bold'}}>{requestedBy}</Text>
                    </Text>
                    <Text style={{fontSize: 11, marginTop: 8}}>
                      Req. On:{' '}
                      <Text style={{fontWeight: 'bold'}}>
                        {moment(requestedOn).format('DD/MM/YYYY')}
                      </Text>
                    </Text>
                    {notes && (
                      <Text style={{fontSize: 11, marginTop: 8}}>
                        Notes: <Text style={{fontWeight: 'bold'}}>{notes}</Text>
                      </Text>
                    )}
                  </View>
                  <View style={{alignItems: 'flex-end', flex: 1}}>
                    <Text
                      style={{
                        fontSize: 23,
                        fontWeight: 'bold',
                        color: 'green',
                      }}>
                      ₹{formatIndRs(amount)}
                    </Text>
                    <Text
                      style={{
                        fontSize: 10,
                        marginTop: 5,
                        color: settlementStatusColor,
                      }}>
                      {settlementStatus}
                    </Text>
                    {settlementStatus === 'Requested' && (
                      <TouchableOpacity
                        onPress={handleOpenPaymentApp}
                        style={{
                          backgroundColor: Styles.themeColor.color,
                          paddingVertical: 5,
                          paddingHorizontal: 15,
                          borderRadius: 25,
                          marginTop: 10,
                          alignSelf: 'flex-end',
                        }}>
                        <Text
                          style={{
                            color: '#fff',
                            fontSize: 11,
                            fontWeight: 'bold',
                          }}>
                          Pay
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })}
          </>
        ) : (
          <View
            style={{
              width: '100%',
            }}>
            <View
              style={{
                margin: 25,
                borderRadius: 5,
                padding: 5,
                backgroundColor: '#f5dade',
                alignItems: 'center',
              }}>
              <Text style={{fontSize: 13}}>No Transaction's found</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};
export default Transaction;
