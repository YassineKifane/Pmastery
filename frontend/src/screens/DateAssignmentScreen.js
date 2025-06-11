import React, { useContext, useEffect, useReducer, useState } from 'react';
import { Store } from '../Store';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import { Calendar } from 'primereact/calendar';
import { Button, Col, Container, ListGroup, Row } from 'react-bootstrap';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import CreatableSelect from 'react-select/creatable';
import { toast } from 'react-toastify';
import { URL } from "../constants/constants";
import { useAppContext } from '../context/context';

import {
  compareDates,
  convertDateFormat,
  formatDateToISO,
  getError,
  hasArrayIntersection,
  inverseDateFormat,
  isTimeBetween8and18,
  isValideDateInterval,
} from '../utils';
import { Badge } from 'primereact/badge';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        loading: false,
        soutenancesAffected: action.sAffected,
        soutenancesNotAffected: action.sNotAffected,
        soutenancesNoPropositions: action.sNoPropositions,
        dateInterval: action.dates,
        supervisors: action.supervisors,
      };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    case 'AFFECT_REQUEST':
      return { ...state, loadingAffect: true, successAffect: false };
    case 'AFFECT_SUCCESS':
      return {
        ...state,
        loadingAffect: false,
        successAffect: true,
      };
    case 'AFFECT_FAIL':
      return { ...state, loadingAffect: false };
    case 'AFFECT_RESET':
      return { ...state, loadingAffect: false, successAffect: false };
    default:
      return state;
  }
};

export default function DateAssignmentScreen() {
  const { state } = useContext(Store);
  const { userInfo } = state;
  const [minDate, setMinDate] = useState('');
  const [maxDate, setMaxDate] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [dateToAffect, setDateToAffect] = useState('');
  const [juryMembers, setJuryMembers] = useState([]);
  const [selectedSoutenance, setSelectedSoutenance] = useState(null);
  const currentYear = new Date().getFullYear();

  const { 
    fetchIsUserJuryMember
 } = useAppContext();

  const [
    {
      loading,
      error,
      soutenancesAffected,
      soutenancesNotAffected,
      soutenancesNoPropositions,
      dateInterval,
      supervisors,
      loadingAffect,
      successAffect,
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
        const result = await axios.get(`${URL}` + `/soutnance/getAllSoutnances`, {
          headers: { Authorization: `${userInfo.token}` },
          params: {
            year: currentYear,
            affiliationCode: userInfo.affiliationCode,
          },
        });
        console.log("result: "+result)
        const supervisors = await axios.get(`${URL}` + '/user/allUsers', {
          headers: { Authorization: `${userInfo.token}` },
          params: {
            affiliationCode: userInfo.affiliationCode,
            isVerified: true,
          },
        });
        const startDate = new Date(data[0]);
        const endDate = new Date(data[1]);
        const generatedDateList = Array.from(
          { length: (endDate - startDate) / (1000 * 60 * 60 * 24) + 1 },
          (_, index) => {
            const currentDate = new Date(startDate);
            currentDate.setDate(currentDate.getDate() + index);

            const day = String(currentDate.getDate()).padStart(2, '0');
            const month = String(currentDate.getMonth() + 1).padStart(2, '0');
            const year = String(currentDate.getFullYear());

            return `${day}/${month}/${year}`;
          }
        );
        // console.log(generatedDateList);
        setMinDate(new Date(data[0]));
        setMaxDate(new Date(data[1]));
        // console.log(result.data);
        dispatch({
          type: 'FETCH_SUCCESS',
          sAffected: result.data.filter(
            (s) => s.affectedDate !== null && s.propositionDates !== null
          ),
          sNotAffected: result.data.filter(
            (s) => s.affectedDate === null && s.propositionDates !== null
          ),
          sNoPropositions: result.data.filter(
            (s) => s.affectedDate === null && s.propositionDates === null
          ),
          dates: generatedDateList,
          supervisors: supervisors.data
            .filter((e) => e.role !== 'STUDENT')
            .map((s) => ({
              value: `${s.firstName}${s.lastName}`,
              label: `${s.firstName} ${s.lastName}`,
            })),
        });
        console.log(
          result.data.filter(
            (s) => s.affectedDate === null && s.propositionDates === null
          )
        );
      } catch (err) {
        dispatch({
          type: 'FETCH_FAIL',
          payload: err,
        });
      }
    };

    if (successAffect) {
      dispatch({ type: 'AFFECT_RESET' });
    } else {
      fetchData();
    }
  }, [userInfo, currentYear, successAffect]);

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
  const submitHandler = async () => {
    const selectedJuryMembers = juryMembers.map((j) => j.label);
    if (dateToAffect === '') {
      toast.error('Vous devez choisir la date');
      return;
    }
    if (selectedJuryMembers.length === 0) {
      toast.error('Vous devez choisir les membres de jury');
      return;
    }
    if (!selectedJuryMembers.includes(selectedSoutenance.supervisorName)) {
      toast.error(
        `${selectedSoutenance.supervisorName} doit etre avec les membres de jury`
      );
      return;
    }
    if (isValideDateInterval(dateToAffect, minDate, maxDate)) {
      toast.error(
        `La date doit être compris entre ${String(minDate.getDate()).padStart(
          2,
          '0'
        )}/${String(minDate.getMonth() + 1).padStart(
          2,
          '0'
        )}/${minDate.getFullYear()} et ${String(maxDate.getDate()).padStart(
          2,
          '0'
        )}/${String(maxDate.getMonth() + 1).padStart(
          2,
          '0'
        )}/${maxDate.getFullYear()}`
      );
      return;
    }
    /*if (isTimeBetween8and18(dateToAffect)) {
      toast.error("L'heure du soutenance doit etre entre 08:00 et 18:00");
      return;
    }*/
    // check supervisors with other soutenances
    const supervisorsChecker = soutenancesAffected
      .filter(
        (s) =>
          compareDates(
            s.affectedDate,
            formatDateToISO(dateToAffect),
            'Minute'
          ) && hasArrayIntersection(s.juryMembers, selectedJuryMembers)
      )
      .map((e) => e.juryMembers)
      .map((m) =>
        m.filter(
          (e) =>
            selectedJuryMembers
              .map((value) => value.toLowerCase().trim().replace(/\s/g, ''))
              .includes(e.toLowerCase().trim().replace(/\s/g, '')) ||
            selectedJuryMembers
              .map((value) =>
                value
                  .split(' ')
                  .reverse()
                  .join(' ')
                  .toLowerCase()
                  .trim()
                  .replace(/\s/g, '')
              )
              .includes(e.toLowerCase().trim().replace(/\s/g, ''))
        )
      )
      .flat();

    if (supervisorsChecker.length > 0) {
      let supervisorsFounded = supervisorsChecker.join(', ');
      toast.error(
        `${supervisorsFounded} ${
          supervisorsChecker.length === 1 ? 'a' : 'ont'
        } une soutenance dans cette date`
      );
      return;
    }
    //
    // console.log(dateToAffect);
    // console.log(selectedJuryMembers);
    try {
      dispatch({ type: 'AFFECT_REQUEST' });
      const sendData = {
        affectedDate: formatDateToISO(dateToAffect),
        juryMembers: selectedJuryMembers,
      };
      // console.log(sendData);
      const { data } = await axios.post(`${URL}` + `/soutnance/assignDate/${userInfo.userId}/${selectedSoutenance.userId}`,
        sendData,
        {
          headers: {
            Authorization: userInfo.token,
          },
          params: { year: currentYear },
        }
      );
      setJuryMembers([]);
      setDateToAffect('');
      toast.success(data);
      fetchIsUserJuryMember(userInfo);
      dispatch({ type: 'AFFECT_SUCCESS' });
      setSelectedSoutenance(null);
    } catch (err) {
      dispatch({ type: 'AFFECT_FAIL' });
      toast.error(getError(err));
    }
  };

  return (
    <div className="pt-5">
      <Helmet>
        <title>Date assignment</title>
      </Helmet>
      <Row className="pb-3">
        <Col>
          <h4>Planification des soutenances</h4>
        </Col>
        <Col className="text-end">
          <h4>{currentYear}</h4>
        </Col>
      </Row>
      {loadingAffect && <LoadingBox />}
      {loading ? (
        <LoadingBox />
      ) : error ? (
          <MessageBox variant="info">
            Les soutenances n'ont pas encore été lancées
          </MessageBox>
      ) : dateInterval.length > 0 ? (
        <Container fluid>
          <Row>
            <Col xs={12} md={2} className="border-start pt-2 pb-2">
              <ListGroup>
                <ListGroup.Item
                  action
                  onClick={() => {
                    setSelectedDate('aucun choix');
                    setSelectedSoutenance(null);
                    setDateToAffect('');
                    setJuryMembers([]);
                  }}
                  className="d-flex align-items-center justify-content-between"
                >
                  aucun choix
                  {soutenancesNoPropositions.length > 0 && (
                    <Badge severity="danger" />
                  )}
                </ListGroup.Item>
                {dateInterval.map((d, index) => (
                  <ListGroup.Item
                    key={index}
                    action
                    onClick={() => {
                      setSelectedDate(d);
                      setSelectedSoutenance(null);
                      setDateToAffect('');
                      setJuryMembers([]);
                    }}
                    className="d-flex align-items-center justify-content-between"
                  >
                    <span>{d}</span>
                    {soutenancesNotAffected.filter((s) =>
                      s.propositionDates.includes(convertDateFormat(d))
                    ).length > 0 && <Badge severity="danger" />}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Col>
            <Col xs={12} md={4} className="border-start">
              {selectedDate === '' ? (
                <div className="text-center p-2 sticky-top removeZindex">
                  <p>Sélectionner une date</p>
                </div>
              ) : selectedDate === 'aucun choix' ? (
                <div className="pt-2 sticky-top removeZindex">
                  <div>
                    <h6>
                      Les étudiants qui n'ont pas choisi des dates:{' '}
                      <span>{soutenancesNoPropositions.length}</span>
                    </h6>
                  </div>
                  <ListGroup>
                    {soutenancesNoPropositions.map((e, index) => (
                      <ListGroup.Item
                        key={index}
                        action
                        onClick={() => {
                          setSelectedSoutenance(e);
                          setDateToAffect('');
                          setJuryMembers([]);
                        }}
                      >
                        <Row>
                          <span>
                            <strong>Etudiant: </strong>
                            {e.fullName}
                          </span>
                          <br />
                          <span>
                            <strong>Encadrant: </strong>
                            {e.supervisorName}
                          </span>
                        </Row>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </div>
              ) : (
                <div className="pt-2 sticky-top removeZindex">
                  <div>
                    <h6>
                      Les étudiants ayant choisi la date:{' '}
                      <span className="bg-warning">{selectedDate}</span>
                    </h6>
                    <h6>
                      Nombre de soutenance affecter à cette date:{' '}
                      <span>
                        {
                          soutenancesAffected.filter((s) =>
                            compareDates(
                              s.affectedDate,
                              convertDateFormat(selectedDate),
                              'Hour'
                            )
                          ).length
                        }
                      </span>
                    </h6>
                  </div>
                  <ListGroup>
                    {soutenancesNotAffected
                      .filter((s) =>
                        s.propositionDates.includes(
                          convertDateFormat(selectedDate)
                        )
                      )
                      .map((e, index) => (
                        <ListGroup.Item
                          key={index}
                          action
                          onClick={() => {
                            setSelectedSoutenance(e);
                            setDateToAffect('');
                            setJuryMembers([]);
                          }}
                        >
                          <Row>
                            <span>
                              <strong>Etudiant: </strong>
                              {e.fullName}
                            </span>
                            <br />
                            <span>
                              <strong>Encadrant: </strong>
                              {e.supervisorName}
                            </span>
                          </Row>
                        </ListGroup.Item>
                      ))}
                  </ListGroup>
                </div>
              )}
            </Col>
            <Col xs={12} md={6} className="border-start border-end">
              {selectedSoutenance === null ? (
                <div className="text-center pt-2 sticky-top removeZindex">
                  <p>Sélectionner un étudiant</p>
                </div>
              ) : (
                <ListGroup variant="flush sticky-top removeZindex">
                  <ListGroup.Item>
                    <strong>Informations de l'étudiant et son sujet:</strong>
                    <br />
                    <span>
                      <strong>Etudiant: </strong>
                      {selectedSoutenance.fullName}
                    </span>
                    <br />
                    <span>
                      <strong>Encadrant: </strong>
                      {selectedSoutenance.supervisorName}
                    </span>
                    <br />
                    <span>
                      <strong>Sujet: </strong>
                      {selectedSoutenance.pfeSubject}
                    </span>
                    <br />
                    <span>
                      <strong>Entreprise: </strong>
                      {selectedSoutenance.company}
                    </span>
                  </ListGroup.Item>
                  {selectedSoutenance.propositionDates !== null && (
                    <ListGroup.Item>
                      <strong>Les dates souhaitées:</strong>
                      <Row>
                        {selectedSoutenance.propositionDates.map((d, index) => (
                          <Col xs={12} key={index}>
                            <span
                              className={
                                inverseDateFormat(d) === selectedDate
                                  ? 'bg-warning'
                                  : ''
                              }
                            >
                              {inverseDateFormat(d)}
                            </span>
                          </Col>
                        ))}
                      </Row>
                    </ListGroup.Item>
                  )}
                  <ListGroup.Item>
                    <Row>
                      <strong>Choisir une date pour cette soutenance:</strong>
                    </Row>
                    <Row className="p-2">
                      <Calendar
                        id="minmax"
                        dateFormat="dd/mm/yy"
                        value={dateToAffect}
                        onChange={(e) => setDateToAffect(e.value)}
                        minDate={minDate}
                        maxDate={maxDate}
                        dateTemplate={dateTemplate}
                        readOnlyInput
                        showTime
                        hourFormat="24"
                      />
                    </Row>
                    <Row>
                      <strong>Membres du jury:</strong>
                    </Row>
                    <Row className="p-2">
                      <CreatableSelect
                        isMulti
                        placeholder="Membres du jury"
                        value={juryMembers}
                        onChange={(e) => setJuryMembers(e)}
                        options={supervisors}
                        formatCreateLabel={(inputText) =>
                          `Autre "${inputText}"`
                        }
                        isDisabled={loading}
                      />
                    </Row>
                    <div className="p-2">
                      <Button className="btnStyle " onClick={submitHandler}>
                        Affecter
                      </Button>
                    </div>
                  </ListGroup.Item>
                </ListGroup>
              )}
            </Col>
          </Row>
        </Container>
      ) : (
        <MessageBox variant="info">
          Les soutenances n'ont pas encore été lancées
        </MessageBox>
      )}
    </div>
  );
}
