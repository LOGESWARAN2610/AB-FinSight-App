import React, {useState, useContext, useEffect, useCallback} from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  ScrollView,
  RefreshControl,
  Image,
} from 'react-native';
import base64js from 'base64-js';
import {
  Button,
  DatePicker,
  Divider,
  DrawerView,
  InputBox,
  TextLink,
  UserContext,
  scanDocument,
} from '../Accessories/Accessories';
import {
  formatIndRs,
  generateBoxShadowStyle,
  handleAPI,
  handleSetStoredCredential,
} from '../CommonFunctions';
import Moment from 'moment';
import Styles from '../../Styles/Style';
import Entypo from 'react-native-vector-icons/Entypo';
import AntDesign from 'react-native-vector-icons/AntDesign';

import moment from 'moment';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

import {
  ALERT_TYPE,
  AlertNotificationRoot,
  Dialog,
} from 'react-native-alert-notification';
import PDFViewer from '../Accessories/PDFViewer';

const ActionButton = ({onPress, text, iconName = '', type = ''}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        {
          backgroundColor: '#fff',
          paddingVertical: 5,
          paddingHorizontal: 15,
          borderRadius: 25,
          flexDirection: 'row',
          borderWidth: 1,
          alignSelf: 'center',
          display: 'flex',
          alignContent: 'center',
          justifyContent: 'center',
          alignItems: 'center',
        },
      ]}>
      <Text
        style={{
          fontSize: 11,
          fontWeight: 'bold',
          paddingRight: 5,
        }}>
        {text}
      </Text>
      {iconName && <FontAwesome name={iconName} size={12} />}
    </TouchableOpacity>
  );
};

const Home = props => {
  const {navigation} = props;
  const {contextDetails, setContextDetails} = useContext(UserContext);

  const {isAdmin = false, userId, isSuperAdmin = false} = contextDetails;
  const [dateDetails, setDateDetails] = useState({
    isVisible: false,
    date: new Date(),
  });
  const [newPaymentDetails, setNewPaymentDateDetails] = useState({
    isVisible: false,
    amount: 0.0,
    purpose: null,
    paidBy: null,
    invoiceFiles: [],
  });
  const [pdfViewerDetails, setPdfViewerDetails] = useState({
    isVisible: false,
    pdfUrl: '',
  });

  const [paymentDetails, setPaymentDetails] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    handleGetPaymentDetails();
  }, [dateDetails]);

  useEffect(() => {
    handleGetPaymentDetails();
  }, [dateDetails['date']]);

  const handleGetPaymentDetails = async () => {
    const {date} = dateDetails;

    if (date) {
      const result = await handleAPI('getPaymentDetails', {
        date: moment(date).format('YYYY-MM-DD'),
        userId,
        isAdmin,
      });

      setPaymentDetails([...result['data']]);
      setTimeout(() => {
        setRefreshing(false);
      }, 500);
    }
  };
  const handlePaymentDetails = ({name, index, value}) => {
    setPaymentDetails(prevPaymentDetails => {
      prevPaymentDetails[index][name] = value;
      return [...prevPaymentDetails];
    });
  };
  const handleLogOut = isClear => {
    isClear && handleSetStoredCredential(isClear, 'logInDetails');
    navigation.navigate('SignIn');
    setContextDetails({});
  };
  const handleConfirm = iDate => {
    setDateDetails(prevDateDetails => {
      return {...prevDateDetails, date: new Date(iDate), isVisible: false};
    });
  };
  const handleToggleDatePicker = () => {
    setDateDetails(prevDateDetails => {
      return {...prevDateDetails, isVisible: !prevDateDetails['isVisible']};
    });
  };
  const handleAddPayment = async (isUpdate, updateIndex) => {
    try {
      let iPaymentDetails = paymentDetails,
        {amount, purpose, invoiceFiles = [], paidBy, _id} = newPaymentDetails,
        invoiceDetails =
          isUpdate === 'addInvoice'
            ? await handleAPI('storeInvoice', {
                file: invoiceFiles.filter(({isSaved}) => !isSaved),
              })
            : {data: invoiceFiles};

      let payment = {
        userId,
        amount,
        purpose,
        // invoice: [...(invoiceFiles || []), ...(invoiceDetails["data"] || [])],
        invoiceFiles:
          isUpdate === 'addInvoice'
            ? [...invoiceFiles.map(({fileName}) => ({fileName}))]
            : invoiceDetails?.['data'] || [],
        paidBy,
        date: moment(new Date(dateDetails['date'])).format('YYYY-MM-DD'),
        addedDate: moment(new Date()).format('DD/MM/YYYY'),
        _id,
      };
      if (!isUpdate) {
        payment['settlementStatus'] = 'Not Paid';
      }

      if (isUpdate && updateIndex >= 0)
        iPaymentDetails[updateIndex] = {
          ...iPaymentDetails[updateIndex],
          ...payment,
        };
      else iPaymentDetails = [...iPaymentDetails, payment];

      setPaymentDetails([...iPaymentDetails]);

      setNewPaymentDateDetails({
        ...newPaymentDetails,
        ...{
          purpose: null,
          paidBy: null,
          amount: null,
          isVisible: false,
          invoiceFiles: [],
        },
      });

      handleAPI(isUpdate ? 'UpdatePayment' : 'addPayment', {
        ...payment,
      }).then(function (response) {});
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeletePayment = async index => {
    handleAPI('deletePayment', {
      _id: paymentDetails[index]['_id'],
    }).then(function (response) {
      const {status} = response['data'];
      if (status === 'Success') {
        setPaymentDetails(prevPaymentDetails => {
          return prevPaymentDetails.filter((payment, i) => i !== index);
        });
      }
    });
  };

  const onChangeText = ({name, value}) => {
    setNewPaymentDateDetails({...newPaymentDetails, [name]: value});
  };
  const handleInvoiceUpload = async isScan => {
    const file = await scanDocument(isScan);
    if (file) {
      setNewPaymentDateDetails(prevNewPaymentDetails => {
        try {
          const {invoiceFiles = []} = prevNewPaymentDetails;
          return {
            ...prevNewPaymentDetails,
            invoiceFiles: [
              ...invoiceFiles,
              ...(Array.from(file) || []).map(file => {
                const fileUri = file.uri || file.name,
                  fileExtension = fileUri.split('.').pop();
                file['isSaved'] = false;

                file['fileName'] = `${moment(
                  new Date(dateDetails['date']),
                ).format('DD_MM_YYYY')}_${Math.floor(
                  100000 + Math.random() * 900000,
                )}.${fileExtension}`;

                return file;
              }),
            ],
          };
        } catch (error) {
          console.error('Error form setNewPaymentDateDetails ====> ', error);
          return prevNewPaymentDetails;
        }
      });
    }
  };

  const handleViewInvoice = async fileName => {
    handleAPI(
      'getInvoice',
      {
        fileName,
      },
      {
        responseType: 'arraybuffer',
      },
    )
      .then(function (response) {
        const firstBytes = new Uint8Array(response.data).slice(0, 10);
        console.log('First few bytes of the image data:', firstBytes);

        const base64Image = `data:image/jpeg;base64,${base64js.fromByteArray(
          new Uint8Array(response.data),
        )}`;

        setPdfViewerDetails({
          isVisible: true,
          url: base64Image,
          fileName,
        });
      })
      .catch(error => {
        console.error('Error form getInvoice ====> ', error);
      });
  };

  return (
    <>
      <PDFViewer
        headerText={pdfViewerDetails['fileName']}
        isVisible={pdfViewerDetails['isVisible']}
        url={pdfViewerDetails['url']}
        onClose={() => setPdfViewerDetails({isVisible: false})}
      />
      <View
        style={{
          ...Styles.loginContainer,
          ...{top: 0, flex: 1},
        }}>
        <TouchableOpacity
          activeOpacity={1}
          style={{
            padding: 10,
            backgroundColor: Styles.themeColor.color,
            paddingHorizontal: 10,
            paddingVertical: 10,
            borderRadius: 5,
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}
          onPress={handleToggleDatePicker}>
          <View style={{flexDirection: 'row'}}>
            <Text
              style={{
                fontWeight: 'bold',
                color: '#fff',
                fontSize: 16,
                alignSelf: 'center',
              }}>
              {/* Payment  */}
              Date :{' '}
            </Text>
            <Text
              style={{
                color: '#fff',
                fontWeight: 'bold',
                fontSize: 16,
                alignSelf: 'center',
              }}>
              {Moment(dateDetails['date']?.toString()).format('DD/MM/YYYY') ||
                ''}
              {'  '}
              <AntDesign
                name="calendar"
                size={18}
                // color={Styles.themeColor.color}
              />
            </Text>
          </View>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() =>
              setNewPaymentDateDetails({
                ...newPaymentDetails,
                isVisible: true,
              })
            }
            style={[
              Styles.addPaymentBtn,
              {
                paddingRight: 10,
                borderTopWidth: 5,
                borderTopColor: 'red',
                borderRadius: 5,
              },
            ]}>
            <>
              <Text
                style={{
                  fontWeight: 'bold',
                  fontSize: 12,
                  paddingLeft: 10,
                  paddingRight: 5,
                }}>
                Add Payment
              </Text>
              <Entypo
                name="circle-with-plus"
                size={16}
                color={Styles.themeColor.color}
              />
            </>
          </TouchableOpacity>
        </TouchableOpacity>

        <View
          style={{
            borderTopWidth: 1,
            borderColor: '#999',
            marginTop: 10,
          }}></View>
        {paymentDetails.length > 0 ? (
          <>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: 8,
              }}>
              <Text
                style={{
                  fontSize: 18,
                  paddingBottom: 5,
                  color: Styles.themeColor.color,
                }}>
                Total Expenses :{' '}
                <Text style={{fontWeight: 'bold'}}>
                  ₹
                  {formatIndRs(
                    paymentDetails.reduce(
                      (a, {amount}) => a + Number(amount),
                      0,
                    ),
                  )}
                </Text>
              </Text>
            </View>
            <ScrollView
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }>
              {paymentDetails.map((payment, index) => {
                const {
                  purpose,
                  amount,
                  paidBy,
                  isViewInvoice = false,
                  invoiceFiles = [],
                  addedDate,
                  settlementStatus = 'Not Paid',
                  isSelected = false,
                } = payment;
                return (
                  <View
                    key={index}
                    style={{
                      borderColor: '#eaeaeb',
                      borderWidth: 1,
                      marginTop: 10,
                      borderRadius: 8,
                      overflow: 'hidden',
                    }}>
                    {isSelected &&
                      settlementStatus === 'Not Paid' &&
                      (isAdmin || isSuperAdmin) && (
                        <View
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            width: '100%',
                            backgroundColor: '#fafafae0',
                            zIndex: 1,
                            justifyContent: 'center',
                            // borderColor: Styles.themeColor.color,
                            borderWidth: 1,
                            borderRadius: 8,
                          }}>
                          <View
                            style={{
                              justifyContent: 'space-around',
                              flexDirection: 'row',
                            }}>
                            <ActionButton
                              type="secondary"
                              text="Edit"
                              iconName="pencil"
                              onPress={() => {
                                handlePaymentDetails({
                                  name: 'isSelected',
                                  index,
                                  value: false,
                                });
                                setNewPaymentDateDetails({
                                  ...payment,
                                  isVisible: true,
                                  isUpdate: true,
                                  index,
                                  invoiceFiles: invoiceFiles.map(file => {
                                    file['isSaved'] = true;
                                    return file;
                                  }),
                                });
                              }}
                            />
                            <ActionButton
                              text="Delete"
                              iconName="trash"
                              type="danger"
                              onPress={() => {
                                handleDeletePayment(index);
                              }}
                            />
                            <ActionButton
                              text="Cancel"
                              iconName="close"
                              type="secondary"
                              onPress={() => {
                                handlePaymentDetails({
                                  name: 'isSelected',
                                  index,
                                  value: false,
                                });
                              }}
                            />
                          </View>
                        </View>
                      )}
                    <TouchableOpacity
                      onLongPress={() => {
                        handlePaymentDetails({
                          name: 'isSelected',
                          index,
                          value: !isSelected,
                        });
                      }}
                      activeOpacity={0.5}
                      key={index}
                      style={{
                        backgroundColor: '#fafafa',
                        paddingHorizontal: 20,
                        paddingVertical: 10,
                        borderRadius: 10,
                        justifyContent: 'space-between',
                        flexDirection: 'row',
                      }}>
                      <View style={{flex: 2}}>
                        <Text style={{fontSize: 16}}>{purpose}</Text>
                        {isViewInvoice && (
                          <View
                            style={{
                              marginTop: 10,
                              flexDirection: 'row',
                              flexWrap: 'wrap',
                              gap: 5,
                            }}>
                            {invoiceFiles.map((file, index) => {
                              const {fileName} = file;
                              return (
                                <Text
                                  onPress={() => {
                                    handleViewInvoice(fileName);
                                  }}
                                  key={fileName}
                                  style={{
                                    fontSize: 9,
                                    textAlign: 'center',
                                    paddingHorizontal: 6,
                                    paddingVertical: 3,
                                    borderWidth: 1,
                                    borderRadius: 3,
                                  }}>
                                  {fileName}
                                </Text>
                              );
                            })}
                          </View>
                        )}
                        <View style={{flexDirection: 'row', marginTop: 10}}>
                          {invoiceFiles?.length > 0 && (
                            <>
                              <TextLink
                                onPress={() => {
                                  setTimeout(() => {
                                    setPaymentDetails(prevPaymentDetails => {
                                      prevPaymentDetails[index][
                                        'isViewInvoice'
                                      ] = !isViewInvoice;
                                      return [...prevPaymentDetails];
                                    });
                                  }, 100);
                                }}
                                style={{
                                  fontSize: 11,
                                }}
                                text={
                                  isViewInvoice ? (
                                    <>
                                      Hide Invoice{' '}
                                      <Entypo name="chevron-up" size={12} />
                                    </>
                                  ) : (
                                    <>
                                      View Invoice{' '}
                                      <Entypo name="chevron-down" size={12} />
                                    </>
                                  )
                                }
                              />

                              <Divider />
                            </>
                          )}
                          <TextLink
                            style={{
                              fontSize: 11,
                            }}
                            text={
                              <>
                                Add Invoice{' '}
                                <Entypo
                                  name="circle-with-plus"
                                  size={10}
                                  color={Styles.themeColor.color}
                                />
                              </>
                            }
                            onPress={() => {
                              setNewPaymentDateDetails({
                                ...payment,
                                isVisible: true,
                                isUpdate: 'addInvoice',
                                index,
                                invoiceFiles: invoiceFiles.map(file => {
                                  file['isSaved'] = true;
                                  return file;
                                }),
                              });
                            }}
                          />
                        </View>
                        <Text
                          style={{
                            fontSize: 9,
                            marginTop: 5,
                            color:
                              settlementStatus === 'Paid'
                                ? 'green'
                                : settlementStatus === 'Requested'
                                ? '#ff9800'
                                : 'red',
                          }}>
                          {settlementStatus}
                        </Text>
                      </View>
                      <View style={{alignItems: 'flex-end', flex: 1}}>
                        <Text
                          style={{
                            fontSize: 20,
                            fontWeight: 'bold',
                            color: 'green',
                          }}>
                          ₹{formatIndRs(amount)}
                        </Text>
                        <Text style={{fontSize: 11, marginTop: 10}}>
                          Paid By:{' '}
                          <Text style={{fontWeight: 'bold'}}>{paidBy}</Text>
                        </Text>
                        {addedDate && (
                          <Text style={{fontSize: 11, marginTop: 2}}>
                            On: <Text style={{fontSize: 9}}>{addedDate}</Text>
                          </Text>
                        )}
                      </View>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </ScrollView>
          </>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }>
            <View
              style={{
                width: '100%',
              }}>
              <View
                style={{
                  marginHorizontal: 20,
                  marginVertical: 25,
                  borderRadius: 5,
                  padding: 5,
                  backgroundColor: '#f5dade',
                  alignItems: 'center',
                }}>
                <Text style={{fontSize: 13}}>No Payment's found</Text>
              </View>
            </View>
          </ScrollView>
        )}
      </View>

      <DatePicker
        onChange={handleConfirm}
        isVisible={dateDetails['isVisible']}
        date={dateDetails['date']}
      />

      <DrawerView
        isShow={newPaymentDetails?.['isVisible'] || false}
        onClose={() => {
          setNewPaymentDateDetails({
            isVisible: false,
            amount: 0.0,
            purpose: null,
            invoiceFiles: [],
            paidBy: null,
          });
        }}
        headerText={
          <Text
            style={{paddingHorizontal: 15, fontSize: 16, fontWeight: 'bold'}}>
            {newPaymentDetails?.isUpdate ? 'Update ' : 'Add New '}
            Payment
          </Text>
        }
        body={
          <View style={Styles.modalBody}>
            <InputBox
              label="Purpose"
              placeholder="Purpose"
              name="purpose"
              disable={newPaymentDetails?.isUpdate === 'addInvoice'}
              onBlur={() => {}}
              onChangeText={onChangeText}
              value={newPaymentDetails['purpose']}
            />
            <InputBox
              label="Amount (₹)"
              placeholder="0.00"
              disable={newPaymentDetails?.isUpdate === 'addInvoice'}
              name="amount"
              onBlur={() => {}}
              onChangeText={onChangeText}
              value={newPaymentDetails['amount']}
            />
            <InputBox
              label="Paid By"
              placeholder="Paid By"
              disable={newPaymentDetails?.isUpdate === 'addInvoice'}
              name="paidBy"
              onBlur={() => {}}
              onChangeText={onChangeText}
              value={newPaymentDetails['paidBy']}
            />
            {/* <SelectBox
              options={[{ label: "Paid By", value: 0 }]}
              value={newPaymentDetails["paidBy"] || {}}
              onChange={(value) => {
                onChangeText({ name: "paidBy", value });
              }}
            /> */}
            <View
              style={{
                marginTop: 10,
                marginBottom: 10,
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: 5,
              }}>
              {newPaymentDetails['invoiceFiles']?.map((file, index) => {
                const {fileName, isSaved = true} = file;
                return (
                  <TouchableOpacity
                    key={fileName}
                    style={{
                      flexDirection: 'row',
                      borderWidth: 1,
                      borderRadius: 3,
                    }}
                    onPress={() => {
                      handleViewInvoice(fileName);
                    }}>
                    <Text
                      key={index}
                      style={{
                        fontSize: 9,
                        textAlign: 'center',
                        paddingHorizontal: 6,
                        paddingVertical: 3,
                      }}>
                      {fileName}
                    </Text>

                    {(!isSaved || isAdmin) && (
                      <TouchableOpacity
                        style={{
                          marginRight: 5,
                          paddingBottom: 2,
                          alignSelf: 'center',
                        }}
                        onPress={() => {
                          setNewPaymentDateDetails(prevNewPaymentDetails => {
                            const {invoiceFiles = []} = prevNewPaymentDetails;
                            return {
                              ...prevNewPaymentDetails,
                              invoiceFiles: invoiceFiles.filter(
                                ({fileName: iFileName}) =>
                                  iFileName !== fileName,
                              ),
                            };
                          });
                        }}>
                        <FontAwesome
                          name={'close'}
                          onPress={() => {
                            setNewPaymentDateDetails(prevNewPaymentDetails => {
                              const {invoiceFiles = []} = prevNewPaymentDetails;
                              return {
                                ...prevNewPaymentDetails,
                                invoiceFiles: invoiceFiles.filter(
                                  ({fileName: iFileName}) =>
                                    iFileName !== fileName,
                                ),
                              };
                            });
                          }}
                          size={12}
                          style={{
                            color: 'red',
                          }}
                        />
                      </TouchableOpacity>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-around',
              }}>
              <Button
                title="Scan Invoice"
                icon={<AntDesign name="scan1" size={16} color="#fff" />}
                onPress={() => {
                  handleInvoiceUpload(false);
                }}
                style={{
                  borderRadius: 25,
                  paddingVertical: 8,
                  paddingHorizontal: 10,
                  ...generateBoxShadowStyle(0, 3, 'black', 0.3, 5, 5, 'black'),
                }}
                textStyle={{fontSize: 11, paddingLeft: 5}}
              />
              <Button
                title="Upload Invoice"
                icon={<Entypo name="circle-with-plus" size={16} color="#fff" />}
                onPress={() => {
                  handleInvoiceUpload(true);
                }}
                style={{
                  borderRadius: 25,
                  paddingVertical: 8,
                  paddingHorizontal: 10,
                  ...generateBoxShadowStyle(0, 3, 'black', 0.3, 5, 5, 'black'),
                }}
                textStyle={{fontSize: 11, paddingLeft: 5}}
              />
            </View>
          </View>
        }
        footer={
          <View style={Styles.modalFooter}>
            <TouchableOpacity
              activeOpacity={1}
              style={[
                Styles.addPaymentBtn,
                {
                  margin: 10,
                  borderTopWidth: 5,
                  borderTopColor: Styles.themeColor.color,
                  borderRadius: 5,
                },
              ]}
              onPress={() => {
                handleAddPayment(
                  newPaymentDetails?.isUpdate,
                  newPaymentDetails?.index ?? -1,
                );
              }}>
              <>
                <Text
                  style={{
                    fontWeight: 'bold',
                    fontSize: 12,
                    paddingHorizontal: 20,
                  }}>
                  {newPaymentDetails?.isUpdate ? 'Update' : 'Save'}
                </Text>
              </>
            </TouchableOpacity>
          </View>
        }
      />
    </>
  );
};

export default Home;
