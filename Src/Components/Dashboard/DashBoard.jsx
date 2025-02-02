import {
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  formatIndRs,
  generateBoxShadowStyle,
  getCurrentWeekDates,
  getFirstAndLastDateOfMonth,
  getPastMonthsArray,
  getTotalAmount,
  getWeeksArray,
  handleAPI,
} from '../CommonFunctions';
import Styles from '../../Styles/Style';
import Dropdown from '../Accessories/DropDown';
import {
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import base64js from 'base64-js';
import {
  DatePicker,
  DrawerView,
  InputBox,
  TextLink,
  UserContext,
} from '../Accessories/Accessories';
import moment from 'moment';
import Entypo from 'react-native-vector-icons/Entypo';

import AntDesign from 'react-native-vector-icons/AntDesign';
import PDFViewer from '../Accessories/PDFViewer';

const pastMonthArray = getPastMonthsArray(),
  weeksArray = [{label: 'All', value: 0}, ...getWeeksArray()];

const TotalSummary = ({amountDetails}) => {
  return (
    <View style={{flexDirection: 'row'}}>
      <View
        style={{
          paddingVertical: 10,
          paddingHorizontal: 15,
          borderRadius: 5,
          marginVertical: 10,
          backgroundColor: Styles.themeColor.color,
          flex: 1,
          borderWidth: 1,
          flexDirection: 'row',
          justifyContent: 'space-between',
          ...generateBoxShadowStyle(0, 3, '#fff', 0.3, 5, 5, '#fff'),
        }}>
        {amountDetails.map((data, index) => {
          return (
            <Fragment key={index}>
              <View style={{alignItems: 'center'}}>
                <Text style={{color: '#fff', fontSize: 11, fontWeight: 'bold'}}>
                  {data['title']}
                </Text>
                <Text
                  style={{
                    color: '#fff',
                    fontSize: 20,
                    marginTop: 10,
                    fontWeight: 'bold',
                  }}>
                  ₹{formatIndRs(data['amount'])}
                </Text>
              </View>
              {index + 1 !== amountDetails.length && (
                <View
                  style={{
                    borderRightWidth: 1,
                    borderRightColor: '#fff',
                    marginVertical: 10,
                  }}></View>
              )}
            </Fragment>
          );
        })}
      </View>
    </View>
  );
};

const TransactionHistory = ({
  transactionHistory = [],
  handleGetTransactionHistory = () => {},
  handlePaymentStatus = () => {},
  controlDetails = {},
  setControlDetails = () => {},
  isAdmin = false,
}) => {
  const [invoiceViewIndex, setInvoiceViewIndex] = useState([]);
  const [pdfViewerDetails, setPdfViewerDetails] = useState({
    isVisible: false,
    pdfUrl: '',
  });
  const handleToggleDatePicker = dateFor => {
    setControlDetails(prevDateDetails => {
      return {
        ...prevDateDetails,
        isVisible: !prevDateDetails['isVisible'],
        dateFor: dateFor,
      };
    });
  };
  const handleConfirm = iDate => {
    const {dateFor} = controlDetails;

    setControlDetails(prevDateDetails => {
      return {
        ...prevDateDetails,
        isVisible: false,
        [dateFor]: new Date(iDate),
      };
    });
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
  const iTransactionHistory = useMemo(() => {
    return controlDetails['filterBy'] === 'All'
      ? transactionHistory
      : transactionHistory.filter(({paidBy}) => {
          return paidBy === controlDetails['filterBy'];
        });
  }, [transactionHistory, controlDetails['filterBy']]);

  const {isAllNotPaid, isAllRequested} = useMemo(() => {
    const isAllNotPaid = transactionHistory.every(
        ({settlementStatus}) => settlementStatus === 'Not Paid',
      ),
      isAllRequested = transactionHistory.every(
        ({settlementStatus}) => settlementStatus === 'Requested',
      );
    return {isAllNotPaid, isAllRequested};
  }, [transactionHistory]);

  // useEffect(() => {
  //   const handleDeepLink = (event) => {
  //     const { url } = event;

  //     // Extract and parse the transaction status from the URL
  //     if (url.includes("payment-status")) {
  //       const params = new URLSearchParams(url.split("?")[1]);

  //       const status = params.get("status"); // e.g., "SUCCESS", "FAILURE"
  //       const txnId = params.get("txnId"); // Transaction ID
  //       const responseCode = params.get("responseCode"); // Bank response code

  //       Alert.alert("Payment Status", `Status: ${status}\nTxn ID: ${txnId}`);
  //     }
  //   };

  //   // Listen for deep links
  //   Linking.addEventListener("url", handleDeepLink);

  //   // Clean up the listener
  //   return () => {
  //     Linking.removeEventListener("url", handleDeepLink);
  //   };
  // }, []);

  return (
    <>
      <PDFViewer
        headerText={pdfViewerDetails['fileName']}
        isVisible={pdfViewerDetails['isVisible']}
        url={pdfViewerDetails['url']}
        onClose={() => setPdfViewerDetails({isVisible: false})}
      />
      <View>
        <View
          style={{
            borderTopWidth: 1,
            borderColor: '#999',
            marginBottom: 10,
          }}></View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          <Text
            style={{
              fontWeight: 'bold',
              fontSize: 15,
              color: Styles.themeColor.color,
            }}
            // onPress={handleOpenPaymentApp}
          >
            Payment History
          </Text>
          <View
            style={{
              borderRadius: 5,
              flexDirection: 'row',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
            }}>
            <TouchableOpacity
              style={{
                flexDirection: 'row',
              }}
              onPress={() => {
                handleToggleDatePicker('from');
              }}>
              <Text
                style={{
                  color: Styles.themeColor.color,
                  fontWeight: 'bold',
                  fontSize: 11,
                  marginRight: 5,
                }}>
                <AntDesign name="calendar" color={Styles.themeColor.color} />{' '}
                {moment(controlDetails['from']).format('DD/MM/YYYY') || ''}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={{flexDirection: 'row'}}>
              <Text
                style={{
                  // color: Styles.themeColor.color,
                  fontSize: 11,
                }}>
                to
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{flexDirection: 'row'}}
              onPress={() => {
                handleToggleDatePicker('to');
              }}>
              <Text
                style={{
                  color: Styles.themeColor.color,
                  fontWeight: 'bold',
                  alignSelf: 'center',
                  fontSize: 11,
                  marginLeft: 5,
                }}>
                <AntDesign name="calendar" color={Styles.themeColor.color} />{' '}
                {moment(controlDetails['to']).format('DD/MM/YYYY') || ''}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        {isAdmin ? (
          <View
            style={{
              flexDirection: 'row',
              marginTop: 10,
              justifyContent: 'flex-end',
            }}>
            <Dropdown
              fontSize={11}
              style={{paddingVertical: 0, width: 100}}
              shadow={false}
              options={[
                {label: 'All', value: 'All'},
                ...[
                  ...new Set(transactionHistory.map(({paidBy}) => paidBy)),
                ].map(paidBy => ({
                  label: paidBy,
                  value: paidBy,
                })),
              ]}
              placeholder={controlDetails['filterBy'] || 'Select'}
              valueObj={controlDetails['filterBy']}
              onChange={valueObj => {
                setControlDetails(prevDateDetails => {
                  return {
                    ...prevDateDetails,
                    filterBy: valueObj['value'],
                  };
                });
              }}
            />
          </View>
        ) : (
          <View style={{margin: 3}}></View>
        )}
        <View
          style={{
            borderTopWidth: 1,
            borderColor: '#999',
            marginTop: 10,
          }}></View>
        <ScrollView>
          {iTransactionHistory.length > 0 ? (
            <>
              {iTransactionHistory.map((payment, index) => {
                const {
                    purpose,
                    amount,
                    paidBy,
                    settlementStatus = 'Not Paid',
                    invoiceFiles = [],
                    addedDate,
                  } = payment,
                  isViewInvoice = invoiceViewIndex.includes(index),
                  settlementStatusColor =
                    settlementStatus === 'Paid'
                      ? 'green'
                      : settlementStatus === 'Requested'
                      ? '#ff9800'
                      : 'red';
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
                      <Text style={{fontSize: 16}}>{purpose}</Text>
                      {isViewInvoice && (
                        <View
                          style={{
                            marginTop: 10,
                            flexDirection: 'row',
                            flexWrap: 'wrap',
                            gap: 5,
                          }}>
                          {invoiceFiles.map(file => {
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
                        {invoiceFiles?.length > 0 ? (
                          <>
                            <TextLink
                              onPress={() => {
                                setInvoiceViewIndex(prevInvoiceViewIndex => {
                                  return prevInvoiceViewIndex.includes(index)
                                    ? prevInvoiceViewIndex.filter(
                                        i => i !== index,
                                      )
                                    : [...prevInvoiceViewIndex, index];
                                });
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
                          </>
                        ) : (
                          <TextLink
                            style={{
                              fontSize: 11,
                            }}
                            text="Invoice Not Added"
                          />
                        )}
                      </View>
                      <Text
                        style={{
                          fontSize: 9,
                          marginTop: 5,
                          color: settlementStatusColor,
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
                        <Text style={{fontSize: 9, marginTop: 2}}>
                          {addedDate}
                        </Text>
                      )}
                    </View>
                  </View>
                );
              })}
              <Text
                style={{
                  fontWeight: 'bold',
                  fontSize: 10,
                  marginVertical: 10,
                  alignSelf: 'flex-end',
                  marginHorizontal: 20,
                }}>
                Total: ₹
                {formatIndRs(
                  iTransactionHistory.reduce(
                    (a, {amount}) => a + Number(amount),
                    0,
                  ),
                )}
              </Text>
              {isAdmin && (isAllRequested || isAllNotPaid) && (
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'flex-end',
                    paddingHorizontal: 5,
                  }}>
                  {isAllRequested && (
                    <TouchableOpacity
                      activeOpacity={1}
                      style={[
                        Styles.addPaymentBtn,
                        {
                          marginVertical: 10,
                          borderTopWidth: 5,
                          borderTopColor: Styles.themeColor.color,
                          borderRadius: 5,
                        },
                      ]}
                      onPress={() =>
                        setControlDetails(prevDateDetails => {
                          return {
                            ...prevDateDetails,
                            isPaymentStatusConfirm: 'Paid',
                          };
                        })
                      }>
                      <>
                        <Text
                          style={{
                            fontWeight: 'bold',
                            fontSize: 12,
                            paddingHorizontal: 20,
                          }}>
                          Mark as Paid
                        </Text>
                      </>
                    </TouchableOpacity>
                  )}
                  {isAllNotPaid && (
                    <TouchableOpacity
                      activeOpacity={1}
                      style={[
                        Styles.addPaymentBtn,
                        {
                          marginVertical: 10,
                          borderTopWidth: 5,
                          borderTopColor: Styles.themeColor.color,
                          borderRadius: 5,
                        },
                      ]}
                      onPress={() => {
                        setControlDetails(prevDateDetails => {
                          return {
                            ...prevDateDetails,
                            isPaymentStatusConfirm: 'Requested',
                          };
                        });
                      }}>
                      <>
                        <Text
                          style={{
                            fontWeight: 'bold',
                            fontSize: 12,
                            paddingHorizontal: 20,
                          }}>
                          Request to Pay
                        </Text>
                      </>
                    </TouchableOpacity>
                  )}
                </View>
              )}
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
                <Text style={{fontSize: 13}}>No Payment's found</Text>
              </View>
            </View>
          )}
        </ScrollView>

        <DrawerView
          isShow={Boolean(controlDetails['isPaymentStatusConfirm'])}
          onClose={() => {
            setControlDetails(prevDateDetails => {
              return {
                ...prevDateDetails,
                isPaymentStatusConfirm: null,
              };
            });
          }}
          headerText={
            <Text
              style={{
                paddingHorizontal: 15,
                fontSize: 16,
                fontWeight: 'bold',
              }}>
              {controlDetails['isPaymentStatusConfirm'] === 'Requested'
                ? 'Payment Request Summary'
                : 'Confirmation Summary'}
            </Text>
          }
          body={
            <View style={Styles.modalBody}>
              <View>
                <View style={{flexDirection: 'row', marginBottom: 10}}>
                  <Text>Date : </Text>
                  <Text style={{fontWeight: 'bold'}}>
                    {moment(controlDetails['from']).format('DD/MM/YYYY')}
                  </Text>
                  <Text> to </Text>
                  <Text style={{fontWeight: 'bold'}}>
                    {moment(controlDetails['to']).format('DD/MM/YYYY')}
                  </Text>
                </View>
                <View>
                  <Text>
                    Total Amount :{' '}
                    <Text style={{fontWeight: 'bold'}}>
                      ₹
                      {formatIndRs(
                        transactionHistory.reduce(
                          (a, {amount}) => a + Number(amount),
                          0,
                        ),
                      )}
                    </Text>
                  </Text>
                </View>
                {controlDetails['isPaymentStatusConfirm'] === 'Requested' ? (
                  <View>
                    <InputBox
                      label="Notes (Optional)"
                      placeholder="Notes (Optional)"
                      name="description"
                      onBlur={() => {}}
                      onChangeText={({value}) => {
                        setControlDetails(prevDateDetails => {
                          return {
                            ...prevDateDetails,
                            description: value,
                          };
                        });
                      }}
                      value={controlDetails['description']}
                    />
                  </View>
                ) : (
                  <Text style={{marginTop: 5, fontWeight: 'bold'}}>
                    Are you sure you want to mark as paid?
                  </Text>
                )}
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
                  handlePaymentStatus({
                    status: controlDetails['isPaymentStatusConfirm'],
                    from: controlDetails['from'],
                    to: controlDetails['to'],
                    amount: transactionHistory.reduce(
                      (a, {amount}) => a + Number(amount),
                      0,
                    ),
                  });
                  setControlDetails(prevDateDetails => {
                    return {
                      ...prevDateDetails,
                      isPaymentStatusConfirm: null,
                    };
                  });
                }}>
                <>
                  <Text
                    style={{
                      fontWeight: 'bold',
                      fontSize: 12,
                      paddingHorizontal: 20,
                    }}>
                    {controlDetails['isPaymentStatusConfirm'] === 'Requested'
                      ? 'Send Request'
                      : 'Mark as Paid'}
                  </Text>
                </>
              </TouchableOpacity>
            </View>
          }
        />
        {/* <View
          style={{
            borderWidth: 1,
            marginVertical: 10,
            borderRadius: 10,
            borderColor: "#d1d1d161",
          }}
        >
          <View style={{ flexDirection: "row" }}>
            <Text style={{ marginHorizontal: 5, alignSelf: "center" }}>₹</Text>
            <BarChart
              width={deviceDimensions["deviceWidth"] - 95}
              barWidth={22}
              noOfSections={3}
              barBorderRadius={4}
              frontColor="lightgray"
              hideRules
              data={data}
              yAxisThickness={0}
              xAxisThickness={0}
              showGradient
              gradientColor={Styles.themeColor.color}
              isAnimated
            />
          </View>
          {xAxisLabel && (
            <Text style={{ marginVertical: 5, textAlign: "center" }}>
              {xAxisLabel}
            </Text>
          )}
        </View> */}

        <DatePicker
          onCancel={handleToggleDatePicker}
          onChange={handleConfirm}
          isVisible={controlDetails['isVisible']}
          date={controlDetails[controlDetails['dateFor']]}
        />
      </View>
    </>
  );
};

const DashBoard = props => {
  const [transactionHistory, setTransactionHistory] = useState([]),
    [totalSummaryDetails, setTotalSummaryDetails] = useState([]),
    [refreshing, setRefreshing] = useState(false),
    [controlDetails, setControlDetails] = useState({
      isVisible: false,
      date: new Date(),
      dateFor: '',
      filterBy: 'All',
    }),
    {contextDetails} = useContext(UserContext);

  const {isAdmin = false, userId} = contextDetails;

  useEffect(() => {
    handleGetTotalSummaryDetails();
  }, [props]);

  const handleGetTotalSummaryDetails = async () => {
    const {endDate: wEndDate, startDate: wStartDate} = getCurrentWeekDates(),
      {endDate: mEndDate, startDate: mStartDate} = getFirstAndLastDateOfMonth(),
      toDayDetails = await handleAPI('getPaymentDetails', {
        date: moment(new Date()).format('DD/MM/YYYY'),
        userId,
        isAdmin,
      }),
      weekDetails = await handleAPI('getPaymentDetailsForDates', {
        sDate: moment(wStartDate).format('YYYY-MM-DD'),
        eDate: moment(wEndDate).format('YYYY-MM-DD'),
        userId,
        isAdmin,
      }),
      monthDetails = await handleAPI('getPaymentDetailsForDates', {
        sDate: moment(mStartDate).format('YYYY-MM-DD'),
        eDate: moment(mEndDate).format('YYYY-MM-DD'),
        userId,
        isAdmin,
      });

    setControlDetails(prevControlDetails => {
      return {
        ...prevControlDetails,
        from: wStartDate,
        to: wEndDate,
      };
    });

    setTransactionHistory(monthDetails['data']);

    setTotalSummaryDetails([
      {
        title: 'Today',
        amount: getTotalAmount(toDayDetails['data'] || []) || 0,
      },
      {
        title: 'This Week',
        amount: getTotalAmount(weekDetails['data'] || []) || 0,
      },
      {
        title: 'This Month',
        amount: getTotalAmount(monthDetails['data'] || []) || 0,
      },
    ]);
    setTimeout(() => {
      setRefreshing(false);
    }, 500);
  };

  const handleGetTransactionHistory = async ({from, to}) => {
    const result = await handleAPI('getPaymentDetailsForDates', {
      sDate: moment(from).format('YYYY-MM-DD'),
      eDate: moment(to).format('YYYY-MM-DD'),
      userId,
      isAdmin,
    });
    setTransactionHistory(result['data']);
    setTimeout(() => {
      setRefreshing(false);
    }, 500);
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    handleGetTotalSummaryDetails();
    handleGetTransactionHistory({
      from: controlDetails['from'],
      to: controlDetails['to'],
    });
  }, [controlDetails]);

  const handlePaymentStatus = ({status, amount}) => {
    const {from, to, description} = controlDetails,
      {Name} = contextDetails;
    setControlDetails(prevDateDetails => {
      return {
        ...prevDateDetails,
        description: '',
      };
    });
    handleAPI('updatePaymentStatusForDates', {
      status,
      sDate: moment(from).format('YYYY-MM-DD'),
      eDate: moment(to).format('YYYY-MM-DD'),
      amount,
      requestedBy: Name,
      notes: description,
    }).then(function (response) {
      handleGetTransactionHistory({
        from,
        to,
      });
    });
  };

  useEffect(() => {
    handleGetTransactionHistory({
      from: controlDetails['from'],
      to: controlDetails['to'],
    });
  }, [controlDetails['from'], controlDetails['to']]);

  return (
    <View style={{paddingHorizontal: 10, backgroundColor: '#fff', flex: 1}}>
      <TotalSummary amountDetails={totalSummaryDetails} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        <TransactionHistory
          transactionHistory={transactionHistory}
          handleGetTransactionHistory={handleGetTransactionHistory}
          handlePaymentStatus={handlePaymentStatus}
          controlDetails={controlDetails}
          setControlDetails={setControlDetails}
          isAdmin={isAdmin}
          userId={userId}
        />

        {/* <TransactionCard
          transactionArray={transactionArray}
          handleInputDetails={handleInputDetails}
        /> */}
      </ScrollView>
    </View>
  );
};

export default DashBoard;
