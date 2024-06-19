import React, { useContext, useEffect, useReducer, useState } from 'react';
import { Store } from '../Store';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { Button, Col, Container, Row } from 'react-bootstrap';
import DatePickerImage from '../assets/images/DatePicker.svg';
import { Calendar } from 'primereact/calendar';
import { toast } from 'react-toastify';
import { getError } from '../utils';
import { URL } from "../constants/constants";
import { useNavigate } from 'react-router-dom'; 

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        loading: false,
        propositionDates: action.payload,
        studentSoutenance: action.soutenance,
        startEndDates: action.dateInterval,
      };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    case 'SEND_CHOICE_REQUEST':
      return { ...state, loadingSendChoice: true, successSendChoice: false };
    case 'SEND_CHOICE_SUCCESS':
      return {
        ...state,
        loadingSendChoice: false,
        successSendChoice: true,
      };
    case 'SEND_CHOICE_FAIL':
      return { ...state, loadingSendChoice: false };
    case 'SEND_CHOICE_RESET':
      return { ...state, loadingSendChoice: false, successSendChoice: false };
    default:
      return state;
  }
};
export default function StudentDatesChoice() {
  const { state } = useContext(Store);
  const { userInfo } = state;
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  const [minDate, setMinDate] = useState('');
  const [maxDate, setMaxDate] = useState('');
  const [selectedDates, setSelectedDates] = useState(['', '', '']);
  const handleDateChange = (index, date) => {
    const updatedDates = [...selectedDates];
    updatedDates[index] = date;
    setSelectedDates(updatedDates);
  };
  const [
    {
      loading,
      error,
      propositionDates,
      studentSoutenance,
      startEndDates,
      loadingSendChoice,
      successSendChoice,
    },
    dispatch,
  ] = useReducer(reducer, {
    loading: true,
    error: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(
          URL + `/soutnance/getInitializeDate/${userInfo.userId}`,
          {
            headers: { Authorization: `${userInfo.token}` },
            params: {
              year: currentYear,
              affiliationCode: userInfo.affiliationCode,
            },
          }
        );
        const result = await axios.get(
          URL + `/soutnance/getProposeDates/${userInfo.userId}`,
          {
            headers: { Authorization: `${userInfo.token}` },
          }
        );
        const result2 = await axios.get(
          URL + `/soutnance/getAssignedSoutnance/${userInfo.userId}`,
          { headers: { Authorization: `${userInfo.token}` } }
        );
        // console.log(result.data);
        console.log(result2.data);
        setMinDate(new Date(data[0]));
        setMaxDate(new Date(data[1]));
        dispatch({
          type: 'FETCH_SUCCESS',
          payload: result.data,
          soutenance: result2.data,
          dateInterval: data,
        });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: err });
      }
    };
    if (successSendChoice) {
      dispatch({ type: 'SEND_CHOICE_RESET' });
    } else {
      fetchData();
    }
  }, [userInfo, currentYear, successSendChoice]);

  const dateTemplate = (date) => {
    // const checkDate = new Date(`${date.month}/${date.day}/${date.year}`);
    if (
      String(date.year) === String(minDate.getFullYear()) ||
      String(date.year) === String(maxDate.getFullYear())
    ) {
      if (
        String(date.month) === String(minDate.getMonth()) ||
        String(date.month) === String(maxDate.getMonth())
      ) {
        if (
          date.day >= String(minDate.getDate()) &&
          date.day <= String(maxDate.getDate())
        ) {
          return <strong style={{ color: '#1f9582' }}>{date.day}</strong>;
        }
      }
    }
    return date.day;
  };

  function convertDateFormat(inputDate) {
    var parts = inputDate.split('-');
    var day = parts[2];
    var month = parts[1];
    var year = parts[0];
    return day + ' / ' + month + ' / ' + year;
  }

  function sendDateFormat(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  // check dates are unique
  function areDatesUnique(arr) {
    var uniqueDates = new Set();
    for (var i = 0; i < arr.length; i++) {
      var date = `${String(arr[i].getDate()).padStart(2, '0')}/${String(
        arr[i].getMonth() + 1
      ).padStart(2, '0')}/${String(arr[i].getFullYear())}`;
      if (uniqueDates.has(date)) {
        // Duplicate date found
        return false;
      }
      uniqueDates.add(date);
    }
    // No duplicate dates found
    return true;
  }

  const submitHandler = async () => {
    if (selectedDates.some((date) => date === '')) {
      toast.error('Vous devez remplir les trois choix');
      return;
    }
    if (!areDatesUnique(selectedDates)) {
      toast.error('Les dates doivent être uniques');
      return;
    }
    try {
      dispatch({ type: 'SEND_CHOICE_REQUEST' });
      let datePropositions = selectedDates.map((d) => sendDateFormat(d));
      await axios.post(
        URL + `/soutnance/proposeDates/${userInfo.userId}`,
        datePropositions,
        {
          headers: {
            Authorization: userInfo.token,
          },
          params: { year: currentYear },
        }
      );
      dispatch({ type: 'SEND_CHOICE_SUCCESS' });
      toast.success('Votre choix a été envoyé');
      //navigate('/home');
      setTimeout(() => {
        window.location.href = '/home';
      }, 2000);      
      
    } catch (err) {
      dispatch({ type: 'SEND_CHOICE_FAIL' });
      toast.error(getError(err));
      // console.log(getError(err));
    }
  };
  return (
    <div>
      <Helmet>
        <title>Date Choice</title>
      </Helmet>
      {loadingSendChoice && (
        <div className="p-5">
          <LoadingBox />
        </div>
      )}
      {loading ? (
        <div className="p-5">
          <LoadingBox />
        </div>
      ) : error ? (
        <div className="p-5">
          <MessageBox variant="danger">{error}</MessageBox>
        </div>
      ) : startEndDates === '' ? (
        <div className="p-5">
          <MessageBox variant="info">
            le choix des dates n'est pas disponible pour le moment
          </MessageBox>
        </div>
      ) : propositionDates === '' && studentSoutenance === '' ? (
        <Container className="p-5">
          <Row className="pb-4 text-center">
            <Col>
              <h4>Choix des dates pour le jour de votre soutenance</h4>
            </Col>
          </Row>
          <Row>
            <Col
              md={6}
              className="d-flex align-items-center justify-content-center"
            >
              <img className="w-100" alt="report" src={DatePickerImage} />
            </Col>
            <Col md={6} className="bg-light rounded-2 p-5">
              <Row className="text-center">
                <Col>
                  <div className="startEndDate p-2 rounded-2">
                    <span>
                      La date de début
                      <br />
                      <strong>
                        {`${String(minDate.getDate()).padStart(2, '0')} /
              ${String(minDate.getMonth() + 1).padStart(2, '0')} /
              ${String(minDate.getFullYear())}`}
                      </strong>
                    </span>
                  </div>
                </Col>
                <Col>
                  <div className="startEndDate p-2 rounded-2">
                    <span>
                      La date de fin
                      <br />
                      <strong>
                        {`${String(maxDate.getDate()).padStart(2, '0')} /
              ${String(maxDate.getMonth() + 1).padStart(2, '0')} /
              ${String(maxDate.getFullYear())}`}
                      </strong>
                    </span>
                  </div>
                </Col>
              </Row>
              <Row>
                <Col xs={12} className="p-3 text-center">
                  Veuillez sélectionner les dates qui vous conviennent pour
                  votre soutenance
                </Col>
              </Row>
              <Row>
                {' '}
                <Col className="p-3 d-flex flex-column">
                  Choix 1
                  <Calendar
                    id="minmax"
                    dateFormat="dd/mm/yy"
                    value={selectedDates[0]}
                    onChange={(e) => handleDateChange(0, e.value)}
                    minDate={minDate}
                    maxDate={maxDate}
                    dateTemplate={dateTemplate}
                    readOnlyInput
                  />
                </Col>
              </Row>
              <Row>
                {' '}
                <Col className="p-3 d-flex flex-column">
                  Choix 2
                  <Calendar
                    id="minmax"
                    dateFormat="dd/mm/yy"
                    value={selectedDates[1]}
                    onChange={(e) => handleDateChange(1, e.value)}
                    minDate={minDate}
                    maxDate={maxDate}
                    dateTemplate={dateTemplate}
                    readOnlyInput
                  />
                </Col>
              </Row>
              <Row>
                {' '}
                <Col className="p-3 d-flex flex-column">
                  Choix 3
                  <Calendar
                    id="minmax"
                    dateFormat="dd/mm/yy"
                    value={selectedDates[2]}
                    onChange={(e) => handleDateChange(2, e.value)}
                    minDate={minDate}
                    maxDate={maxDate}
                    dateTemplate={dateTemplate}
                    readOnlyInput
                  />
                </Col>
              </Row>
              <div className="p-2">
                <Button className="w-100 btnStyle" onClick={submitHandler}>
                  Envoyer votre choix
                </Button>
              </div>
            </Col>
          </Row>
        </Container>
      ) : propositionDates !== '' && studentSoutenance.affectedDate === null ? (
        <Container className="p-5 d-flex flex-column align-items-center">
          <Row>
            <Col xs={12} className="text-center">
              <h4>Les dates que vous avez suggérées pour votre soutenance</h4>
            </Col>
          </Row>
          <Row className="p-2 w-md-50">
            {propositionDates.map((d, index) => (
              <Col
                xs={12}
                className="p-3 w-md-50 text-center bg-light rounded-2 mb-2 d-flex justify-content-between"
                key={index}
              >
                <span>Choix {index + 1}: </span>
                <strong>{convertDateFormat(d)}</strong>
              </Col>
            ))}
          </Row>
        </Container>
      ) : (
        <div className="p-5">
          <MessageBox variant="info">
            Votre choix des dates est envoyé.
          </MessageBox>
        </div>
      )}
    </div>
  );
}
