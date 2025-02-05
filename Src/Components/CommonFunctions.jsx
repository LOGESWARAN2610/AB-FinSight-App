import AsyncStorage from '@react-native-async-storage/async-storage';
import {android, ios, web} from './Accessories/Platform';
import axios from 'axios';
import {NODE_URI, NODE_URI_PROD} from '@env';
const {log, error} = console;
const handleAPI = async (name, params, options = {}) => {
  try {
    let iNodeUri = __DEV__ ? NODE_URI : NODE_URI_PROD;
    // iNodeUri = 'http://localhost:4440';
    // console.log('Calling API', iNodeUri + '/' + name);
    const response = await axios.post(
      `${iNodeUri}/${name}`,
      params || {},
      options,
    );
    return response;
  } catch (err) {
    return error(`Error from ${name} ===> `, err);
  }
};

const handleGetStoredCredential = async (key, userDetails) => {
  //Reading AsyncStorage to getting details for Auto re-directing
  // AsyncStorage.clear();
  // return;
  let Credentials = null;
  try {
    await AsyncStorage.getItem(key)
      .then(result => {
        if (result !== null) {
          result = JSON.parse(result);
          if (Number(result.AutoRedirectExpiryDate) < new Date().getTime()) {
            AsyncStorage.removeItem(key);
            Credentials = null;
          } else {
            Credentials = result;
          }
        } else {
          Credentials = result;
        }
      })
      .catch(err => {
        log('Error from handleGetStoredCredential ====> ', err);
      });
  } catch (error) {}
  return Credentials || userDetails;
};
const handleSetStoredCredential = (isClear, key, iUserDetails) => {
  //Storing required details for auto redirecting
  if (iUserDetails && iUserDetails['staySignedIn'] && !isClear) {
    let {Id, Name, userName, isSuperAdmin, isAdmin, userId} = iUserDetails,
      date = new Date();
    date.setDate(date.getDate() + 30);

    let objectToStore = JSON.stringify({
      Id,
      Name,
      userName,
      AutoRedirectExpiryDate: date.getTime(),
      staySignedIn: true,
      autoDirect: true,
      isSuperAdmin,
      isAdmin,
      userId,
    });
    AsyncStorage.removeItem(key);
    AsyncStorage.setItem(key, objectToStore);
  } else {
    //Clearing the details
    AsyncStorage.removeItem(key);
  }
};
const generateBoxShadowStyle = (
  xOffset,
  yOffset,
  shadowColorIos,
  shadowOpacity,
  shadowRadius,
  elevation,
  shadowColorAndroid,
) => {
  let boxShadow;
  if (ios) {
    boxShadow = {
      shadowColor: shadowColorIos,
      shadowOpacity,
      shadowRadius,
      shadowOffset: {width: xOffset, height: yOffset},
    };
  } else if (android) {
    boxShadow = {elevation, shadowColor: shadowColorAndroid};
  } else if (web) {
  }
  return boxShadow;
};
const formatIndRs = value => {
  return (Number(value) || 0).toLocaleString('en-IN');
};

const getPastMonthsArray = (startMonth = 1) => {
  const currentDate = new Date(),
    currentMonth = currentDate.getMonth() + 1,
    months = [],
    monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
  for (let i = startMonth; i <= currentMonth; i++) {
    const label = monthNames[i - 1];
    months.push({label: label, value: i});
  }
  return months.reverse();
};

const getWeeksArray = (
  year = new Date().getFullYear(),
  month = new Date().getMonth() + 1,
) => {
  const start = new Date(year, month - 1, 1),
    end = new Date(year, month, 0);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  let sDate, eDate;
  const dateArr = [],
    currentDate = new Date(start);

  let weekNumber = 1; // Initialize week number

  while (currentDate <= end) {
    if (currentDate.getDay() === 1 || (dateArr.length === 0 && !sDate)) {
      sDate = new Date(currentDate.getTime());
    }

    if (
      (sDate && currentDate.getDay() === 0) ||
      currentDate.getTime() === end.getTime()
    ) {
      eDate = new Date(currentDate.getTime());
    }

    if (sDate && eDate) {
      // Set time to midnight (0:00:00) for both start and end dates of the week
      sDate.setHours(0, 0, 0, 0);
      eDate.setHours(0, 0, 0, 0);

      dateArr.push({
        label: `${weekNumber}${getWeekSuffix(weekNumber)}`,
        startDate: sDate,
        endDate: eDate,
        value: weekNumber,
      });
      sDate = undefined;
      eDate = undefined;
      weekNumber++; // Increment week number
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dateArr;
};

const getWeekSuffix = weekNumber => {
  if (weekNumber >= 11 && weekNumber <= 13) {
    return 'th';
  }

  switch (weekNumber % 10) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    case 3:
      return 'rd';
    default:
      return 'th';
  }
};
const getWeekNumber = (date = new Date()) => {
  const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1),
    firstDayOfMonth = startOfMonth.getDay(),
    weekNumber = Math.ceil((date.getDate() + firstDayOfMonth) / 7);
  return weekNumber;
};
const getFirstAndLastDateOfMonth = (
  monthNumber = new Date().getMonth() + 1,
  year = new Date().getFullYear(),
) => {
  const startDate = new Date(year, monthNumber - 1, 1),
    endDate = new Date(year, monthNumber, 0);
  return {startDate, endDate};
};
const getCurrentWeekDates = () => {
  var currentDate = new Date();
  var startDate = new Date(currentDate);
  startDate.setDate(currentDate.getDate() - currentDate.getDay());
  var endDate = new Date(currentDate);
  endDate.setDate(currentDate.getDate() + (6 - currentDate.getDay()));
  return {
    startDate,
    endDate,
  };
};
const getTotalAmount = data =>
  data.reduce((total, obj) => Number(obj.amount) + total, 0);

export {
  handleAPI,
  handleGetStoredCredential,
  handleSetStoredCredential,
  generateBoxShadowStyle,
  formatIndRs,
  getPastMonthsArray,
  getWeeksArray,
  getWeekNumber,
  getCurrentWeekDates,
  getFirstAndLastDateOfMonth,
  getTotalAmount,
};
