import React, { useContext, useEffect, useReducer, useState } from 'react';
import MessageBox from '../components/MessageBox';
import { Store } from '../Store';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import { Button, Col, Container, ListGroup, Row } from 'react-bootstrap';
import LoadingBox from '../components/LoadingBox';
import {
  compareDates,
  convertDateFormat,
  formatDate,
  formatDateToISO,
  getError,
  hasArrayIntersection,
  isValideDateInterval,
} from '../utils';
import { Badge } from 'primereact/badge';
import { Calendar } from 'primereact/calendar';
import CreatableSelect from 'react-select/creatable';
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { URL } from "../constants/constants";

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
        dateInterval: action.dates,
        supervisors: action.supervisors,
      };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    case 'AFFECT_PUB_REQUEST':
      return { ...state, loadingAffect: true, successAffect: false };
    case 'AFFECT_PUB_SUCCESS':
      return {
        ...state,
        loadingAffect: false,
        successAffect: true,
      };
    case 'AFFECT_PUB_FAIL':
      return { ...state, loadingAffect: false };
    case 'AFFECT_PUB_RESET':
      return { ...state, loadingAffect: false, successAffect: false };
    default:
      return state;
  }
};

export default function SoutenanceScreen() {
  const { state } = useContext(Store);
  const { userInfo } = state;
  const [minDate, setMinDate] = useState('');
  const [maxDate, setMaxDate] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [dateToAffect, setDateToAffect] = useState('');
  const [juryMembers, setJuryMembers] = useState([]);
  const [modifySoutenance, setModifySoutenance] = useState(false);
  const [selectedSoutenance, setSelectedSoutenance] = useState(null);
  const currentYear = new Date().getFullYear();
  const [
    {
      loading,
      error,
      soutenancesAffected,
      soutenancesNotAffected,
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
        const result = await axios.get(URL + `/soutnance/getAllSoutnances`, {
          headers: { Authorization: `${userInfo.token}` },
          params: {
            year: currentYear,
            affiliationCode: userInfo.affiliationCode,
          },
        });
        const supervisors = await axios.get(URL + '/user/allUsers', {
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
          sNotAffected: result.data.filter((s) => s.affectedDate === null),
          dates: generatedDateList,
          supervisors: supervisors.data
            .filter((e) => e.role !== 'STUDENT')
            .map((s) => ({
              value: `${s.firstName}${s.lastName}`,
              label: `${s.firstName} ${s.lastName}`,
            })),
        });
        // console.log(result.data.filter((s) => s.affectedDate === null));
      } catch (err) {
        dispatch({
          type: 'FETCH_FAIL',
          payload: err,
        });
      }
    };

    if (successAffect) {
      dispatch({ type: 'AFFECT_PUB_RESET' });
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

  const generatePDF = (allSoutenances) => {
    if (soutenancesNotAffected.length > 0) {
      toast.error(
        "Y'a des soutenances pas encore programmées voir Affectation des dates"
      );
      return;
    }
    // initialize jsPDF
    const doc = new jsPDF();

    const tableRows = [];

    // for each ticket pass all its data into an array
    allSoutenances.forEach((s) => {
      const soutenanceData = [
        s.fullName,
        s.pfeSubject,
        s.supervisorName,
        s.juryMembers.join(', '),
        formatDate(s.affectedDate),
      ];

      // push each tickcet's info into a row
      tableRows.push(soutenanceData);
    });

    // Or use javascript directly:
    autoTable(doc, {
      head: [
        ['Etudiant', 'Sujet', 'Encadrant', 'Membre de jury', 'Date/Heure'],
      ],
      margin: { top: 20 },
      body: tableRows,
    });

    const date = Date().split(' ');
    // we use a date string to generate our filename.
    const dateStr = date[0] + date[1] + date[2] + date[3] + date[4];
    // ticket title. and margin-top + margin-left
    doc.text(
      `Programme des soutenances ${currentYear - 1}/${currentYear} ${
        userInfo.sector
      } :`,
      14,
      15
    );
    // we define the name of our PDF file.
    doc.save(`planning_${dateStr}.pdf`);
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
    // if (isTimeBetween8and18(dateToAffect)) {
    //   toast.error("L'heure du soutenance doit etre entre 08:00 et 18:00");
    //   return;
    // }
    if (!selectedJuryMembers.includes(selectedSoutenance.supervisorName)) {
      toast.error(
        `${selectedSoutenance.supervisorName} doit etre avec les membres de jury`
      );
      return;
    }
    // check supervisors with other soutenances
    const supervisorsChecker = soutenancesAffected
      .filter(
        (s) =>
          s.userId !== selectedSoutenance.userId &&
          compareDates(
            s.affectedDate,
            formatDateToISO(dateToAffect),
            'Minute'
          ) &&
          hasArrayIntersection(s.juryMembers, selectedJuryMembers)
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
      dispatch({ type: 'AFFECT_PUB_REQUEST' });
      const sendData = {
        affectedDate: formatDateToISO(dateToAffect),
        juryMembers: selectedJuryMembers,
      };
      // console.log(sendData);
      const { data } = await axios.post(
        URL + `/soutnance/assignDate/${userInfo.userId}/${selectedSoutenance.userId}`,
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
      dispatch({ type: 'AFFECT_PUB_SUCCESS' });
      setModifySoutenance(false);
      setSelectedSoutenance(null);
    } catch (err) {
      dispatch({ type: 'AFFECT_PUB_FAIL' });
      toast.error(getError(err));
    }
  };

  const publishHandler = async () => {
    if (soutenancesNotAffected.length > 0) {
      toast.error(
        "Y'a des soutenances pas encore programmées voir Affectation des dates"
      );
      return;
    }
    try {
      dispatch({ type: 'AFFECT_PUB_REQUEST' });
      const { data } = await axios.put(
        URL + `/soutnance/publishSoutnances/${userInfo.userId}`,
        {},
        {
          headers: {
            Authorization: userInfo.token,
          },
          params: { year: currentYear },
        }
      );
      console.log(data);
      toast.success('Le programme des soutenances a été publié');
      dispatch({ type: 'AFFECT_PUB_SUCCESS' });
    } catch (err) {
      dispatch({ type: 'AFFECT_PUB_FAIL' });
      toast.error(getError(err));
    }
  };

  return (
    <div className="p-5">
      <Helmet>
        <title>Soutenances</title>
      </Helmet>
      <Row className="pb-3">
        <Col>
          <h4>Soutenances</h4>
        </Col>
        <Col className="text-end">
          <h4>{currentYear}</h4>
        </Col>
      </Row>
      {loading ? (
        <LoadingBox />
      ) : error ? (
          <MessageBox variant="info">
            Les soutenances n'ont pas encore été lancées
          </MessageBox>
      ) : dateInterval.length > 0 ? (
        <Container fluid>
          <Row>
            <Col xs={12} className="pb-2">
              <Button className="btnStyle w-100" onClick={publishHandler}>
                Publier
              </Button>
            </Col>
            <Col xs={12} className="pb-4">
              <Button
                className="btnStyle w-100"
                onClick={() =>
                  generatePDF(
                    soutenancesAffected.sort(function (a, b) {
                      const dateA = new Date(a.affectedDate);
                      const dateB = new Date(b.affectedDate);
                      return dateA - dateB;
                    })
                  )
                }
              >
                Télécharger le programme des soutenances (PDF)
              </Button>
            </Col>
          </Row>
          <Row>
            <Col xs={12} md={2} className="border-start pt-2 pb-2">
              <ListGroup>
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
                    {soutenancesAffected.filter((s) =>
                      compareDates(s.affectedDate, convertDateFormat(d), 'Hour')
                    ).length > 0 && <Badge severity="success" />}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Col>
            <Col xs={12} md={4} className="border-start">
              {selectedDate === '' ? (
                <div className="text-center p-2 sticky-top removeZindex">
                  <p>Sélectionner une date</p>
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
                    {soutenancesAffected
                      .filter((s) =>
                        compareDates(
                          s.affectedDate,
                          convertDateFormat(selectedDate),
                          'Hour'
                        )
                      )
                      .sort((a, b) => {
                        const dateA = new Date(a.affectedDate);
                        const dateB = new Date(b.affectedDate);

                        // Compare hours
                        const hourComparison =
                          dateA.getUTCHours() - dateB.getUTCHours();
                        if (hourComparison !== 0) {
                          return hourComparison;
                        }

                        // If hours are the same, compare minutes
                        return dateA.getUTCMinutes() - dateB.getUTCMinutes();
                      })
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
                            <Col xs={10}>
                              <span>
                                <strong>Etudiant: </strong>
                                {e.fullName}
                              </span>
                              <br />
                              <span>
                                <strong>Encadrant: </strong>
                                {e.supervisorName}
                              </span>
                            </Col>
                            <Col
                              xs={2}
                              className="bg-light d-flex align-items-center justify-content-center"
                            >
                              <strong>{`${String(
                                new Date(e.affectedDate).getHours()
                              ).padStart(2, '0')}:${String(
                                new Date(e.affectedDate).getMinutes()
                              ).padStart(2, '0')}`}</strong>
                            </Col>
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
                  <ListGroup.Item>
                    <strong>Informations de la soutenance:</strong>
                    <br/>
                    <span>
                      <strong>Date et l'heure de la soutenance: </strong>
                      {formatDate(selectedSoutenance.affectedDate)}
                    </span>
                    <br/>
                    <strong>Les Membres de jury:</strong>
                    <Row>
                      {selectedSoutenance.juryMembers.map((m, index) => (
                          <Col xs={12} key={index}>
                            <span>{m}</span>
                          </Col>
                      ))}
                    </Row>
                    {
                      (selectedSoutenance.note !== -1) &&
                        (
                            <>
                              <strong>La note affectée: </strong>
                              <span>{selectedSoutenance.note}</span>
                            </>
                        )
                    }
                  </ListGroup.Item>
                  <div className={modifySoutenance ? 'd-none' : 'd-block mt-2'}>
                    <Button
                        onClick={() => setModifySoutenance(true)}
                        className="w-100"
                    >
                      Modifier la soutenance
                    </Button>
                  </div>
                  {modifySoutenance &&
                    (loadingAffect ? (
                      <LoadingBox />
                    ) : (
                      <ListGroup.Item>
                        <Row className="pt-2 pb-2">
                          <strong>Modification</strong>
                        </Row>
                        <Row>
                          <strong>
                            Choisir la nouvelle date pour cette soutenance:
                          </strong>
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
                          <Button
                            className="bg-success me-2"
                            onClick={submitHandler}
                          >
                            Modifier
                          </Button>
                          <Button
                            className="bg-danger"
                            onClick={() => {
                              setModifySoutenance(false);
                              setDateToAffect('');
                              setJuryMembers([]);
                            }}
                          >
                            Anuuler
                          </Button>
                        </div>
                      </ListGroup.Item>
                    ))}
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
