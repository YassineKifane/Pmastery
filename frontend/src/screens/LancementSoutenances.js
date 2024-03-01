import { Calendar } from 'primereact/calendar';
import React, { useContext, useEffect, useReducer, useState } from 'react';
import { Button, Col, Container, Row } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import { Store } from '../Store';
import axios from 'axios';
import { toast } from 'react-toastify';
import { getError } from '../utils';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, startEndDates: action.payload };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    case 'LAUNCH_REQUEST':
      return { ...state, loadingLaunch: true, successLaunch: false };
    case 'LAUNCH_SUCCESS':
      return {
        ...state,
        loadingLaunch: false,
        successLaunch: true,
      };
    case 'LAUNCH_FAIL':
      return { ...state, loadingLaunch: false };
    case 'LAUNCH_RESET':
      return { ...state, loadingLaunch: false, successLaunch: false };
    default:
      return state;
  }
};

export default function LancementSoutenances() {
  const { state } = useContext(Store);
  const { userInfo } = state;
  const currentYear = new Date().getFullYear();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [
    { loading, error, startEndDates, loadingLaunch, successLaunch },
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
          `http://localhost:8082/soutnance/getInitializeDate/${userInfo.userId}`,
          {
            headers: { Authorization: `${userInfo.token}` },
            params: {
              year: currentYear,
              affiliationCode: userInfo.affiliationCode,
            },
          }
        );
        //console.log(data);
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: err });
      }
    };
    if (successLaunch) {
      dispatch({ type: 'LAUNCH_RESET' });
    } else {
      fetchData();
    }
  }, [userInfo, currentYear, successLaunch]);

  const launchHandler = async () => {
    if (startDate === '' || endDate === '') {
      toast.error('Vous devez remplir les dates');
      return;
    }
    try {
      dispatch({ type: 'LAUNCH_REQUEST' });
      console.log(
        `${String(endDate.getDate()).padStart(2, '0')}/${String(
          endDate.getMonth() + 1
        ).padStart(2, '0')}/${String(endDate.getFullYear())}`
      );
      const { data } = await axios.put(
        `http://localhost:8082/soutnance/initializeDate/${userInfo.userId}`,
        {},
        {
          headers: { Authorization: `${userInfo.token}` },
          params: {
            finalDate: `${String(endDate.getDate()).padStart(2, '0')}/${String(
              endDate.getMonth() + 1
            ).padStart(2, '0')}/${String(endDate.getFullYear())}`,
            startDate: `${String(startDate.getDate()).padStart(
              2,
              '0'
            )}/${String(startDate.getMonth() + 1).padStart(2, '0')}/${String(
              startDate.getFullYear()
            )}`,
            year: currentYear,
          },
        }
      );
      dispatch({ type: 'LAUNCH_SUCCESS', payload: data });
      toast.success(data);
    } catch (err) {
      console.log(getError(err));
      dispatch({ type: 'LAUNCH_FAIL' });
    }
  };

  function convertDateFormat(inputDate) {
    var parts = inputDate.split('-');
    var day = parts[2];
    var month = parts[1];
    var year = parts[0];
    return day + ' / ' + month + ' / ' + year;
  }
  return (
    <div className="p-5">
      <Helmet>
        <title>Lancement Soutenance</title>
      </Helmet>
      {loadingLaunch && <LoadingBox />}
      {loading ? (
        <LoadingBox />
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        <Container className="d-flex flex-column align-items-center">
          <Row>
            <Col xs={12} className="text-center">
              {startEndDates === '' ? (
                <h4>Lancement des soutenances pour l'année {currentYear}</h4>
              ) : (
                <h4>
                  Les dates de début et de fin des soutenances pour l'année:{' '}
                  {currentYear}
                </h4>
              )}
            </Col>
          </Row>
          {startEndDates !== '' && (
            <Row className="w-md-50 p-2">
              <Col
                xs={12}
                className="p-3 w-md-50 text-center bg-light rounded-2 mb-2 d-flex justify-content-between"
              >
                <span> La date de début: </span>
                <strong>{convertDateFormat(startEndDates[0])}</strong>
              </Col>
              <Col
                xs={12}
                className="p-3 w-md-50 text-center bg-light rounded-2 mb-2 d-flex justify-content-between"
              >
                <span>La date de fin: </span>
                <strong>{convertDateFormat(startEndDates[1])}</strong>
              </Col>
            </Row>
          )}
          <Row className="w-md-50 p-2">
            {startEndDates !== '' && (
              <Col className="text-center">
                <h4>Modifier les dates</h4>
              </Col>
            )}
            <Col xs={12} className="p-3 d-flex flex-column">
              Date de début des soutenances:
              <Calendar
                value={startDate}
                maxDate={endDate}
                onChange={(e) => setStartDate(e.value)}
                dateFormat="dd/mm/yy"
                readOnlyInput
              />
            </Col>
            <Col xs={12} className="p-3 d-flex flex-column">
              Date de fin des soutenances:
              <Calendar
                value={endDate}
                minDate={startDate}
                onChange={(e) => {
                  setEndDate(e.value);
                }}
                dateFormat="dd/mm/yy"
                readOnlyInput
              />
            </Col>
            <div className="p-3 w-100">
              <Button className="btnStyle w-100" onClick={launchHandler}>
                {startEndDates === '' ? 'Lancer' : 'Modifier'}
              </Button>
            </div>
          </Row>
        </Container>
      )}
    </div>
  );
}
