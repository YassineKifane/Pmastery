export const getError = (error) => {
  return error.response && error.response.data.message
    ? error.response.data.message
    : error.message;
};

export const convertDateFormat = (dateString) => {
  const parts = dateString.split('/');
  const day = parts[0];
  const month = parts[1];
  const year = parts[2];

  // Construct the new date string in the desired format 'yyyy-mm-dd'
  const newDateString = `${year}-${month}-${day}`;

  return newDateString;
};

export const inverseDateFormat = (dateString) => {
  const parts = dateString.split('-');
  const day = parts[2];
  const month = parts[1];
  const year = parts[0];

  // Construct the new date string in the desired format 'yyyy-mm-dd'
  const newDateString = `${day}/${month}/${year}`;

  return newDateString;
};

export const formatDateToISO = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
};

export const hasArrayIntersection = (array1, array2) => {
  const lowercaseTrimmedArray1 = array1.map((value) =>
    value.toLowerCase().trim().replace(/\s/g, '')
  );
  const lowercaseTrimmedArray2 = array2.map((value) =>
    value.toLowerCase().trim().replace(/\s/g, '')
  );
  const lowercaseTrimmedReversedArray2 = array2.map((value) =>
    value.split(' ').reverse().join(' ').toLowerCase().trim().replace(/\s/g, '')
  );

  return lowercaseTrimmedArray1.some(
    (value) =>
      lowercaseTrimmedArray2.includes(value) ||
      lowercaseTrimmedReversedArray2.includes(value)
  );
};

export const compareDates = (dateString1, dateString2, except) => {
  const date1 = new Date(dateString1);
  const date2 = new Date(dateString2);
  if (except === 'Hour') {
    date1.setHours(0);
    date2.setHours(0);
    date1.setMinutes(0);
    date2.setMinutes(0);
    date1.setSeconds(0);
    date2.setSeconds(0);
  }
  if (except === 'Minute') {
    date1.setMinutes(0);
    date2.setMinutes(0);
    date1.setSeconds(0);
    date2.setSeconds(0);
  }
  if (except === 'Second') {
    date1.setSeconds(0);
    date2.setSeconds(0);
  }

  return date1.getTime() === date2.getTime();
};

export const isTimeBetween8and18 = (dateObj) => {
  const hour = dateObj.getHours();
  return hour < 8 || hour >= 18;
};

export const isValideDateInterval = (
  checkDateString,
  dateString1,
  dateString2
) => {
  const mindate = dateString1;
  const maxdate = dateString2;
  const checkDate = checkDateString;

  // mindate.setHours(0);
  // mindate.setMinutes(0);
  // mindate.setSeconds(0);
  // maxdate.setHours(0);
  // maxdate.setMinutes(0);
  // maxdate.setSeconds(0);
  // checkDate.setHours(0);
  // checkDate.setMinutes(0);
  checkDate.setSeconds(0);

  return !(
    checkDate.getTime() >= mindate.getTime() &&
    checkDate.getTime() <= maxdate.getTime()
  );
};

export const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  const options = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  };

  const formatted = new Intl.DateTimeFormat('fr-FR', options).format(date);
  return formatted.replace(/\b\w/g, (match) => match.toUpperCase());
};
