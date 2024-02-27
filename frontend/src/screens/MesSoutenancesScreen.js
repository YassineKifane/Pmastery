import React, { useContext, useEffect, useReducer, useState } from 'react';
import MessageBox from '../components/MessageBox';
import { Store } from '../Store';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import { Col, Container, ListGroup, Row } from 'react-bootstrap';
import LoadingBox from '../components/LoadingBox';
import { compareDates, convertDateFormat, formatDate } from '../utils';
import { Badge } from 'primereact/badge';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        loading: false,
        mesSoutenances: action.sAffected,
        dateInterval: action.dates,
      };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};
export default function MesSoutenancesScreen() {
  const { state } = useContext(Store);
  const { userInfo } = state;
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSoutenance, setSelectedSoutenance] = useState(null);
  const currentYear = new Date().getFullYear();
  const [
    { loading, error, mesSoutenances, dateInterval, successAffect },
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
          `https://apps.ump.ma:5005/soutnance/getInitializeDate/${userInfo.userId}`,
          {
            headers: { Authorization: `${userInfo.token}` },
            params: {
              year: currentYear,
              affiliationCode: userInfo.affiliationCode,
            },
          }
        );
        const result = await axios.get(`https://apps.ump.ma:5005/soutnance/getAllSoutnances`, {
          headers: { Authorization: `${userInfo.token}` },
          params: {
            year: currentYear,
            affiliationCode: userInfo.affiliationCode,
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
        // console.log(result.data);
        dispatch({
          type: 'FETCH_SUCCESS',
          sAffected: result.data.filter(
            (s) =>
              s.affectedDate !== null &&
              s.propositionDates !== null &&
              s.juryMembers.includes(
                `${userInfo.firstName} ${userInfo.lastName}`
              )
          ),
          dates: generatedDateList,
        });
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

  return (
    <div className="p-5">
      <Helmet>
        <title>Mes Soutenances</title>
      </Helmet>
      <Row className="pb-3">
        <Col>
          <h4>Mes Soutenances</h4>
        </Col>
        <Col className="text-end">
          <h4>{currentYear}</h4>
        </Col>
      </Row>
      {loading ? (
        <LoadingBox />
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : dateInterval.length > 0 ? (
        <Container fluid>
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
                    }}
                    className="d-flex align-items-center justify-content-between"
                  >
                    <span>{d}</span>
                    {mesSoutenances.filter((s) =>
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
                          mesSoutenances.filter((s) =>
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
                    {mesSoutenances
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
                    <br />
                    <span>
                      <strong>Date et l'heure de la soutenance: </strong>
                      {formatDate(selectedSoutenance.affectedDate)}
                    </span>
                    <br />
                    <strong>Les Membres de jury:</strong>
                    <Row>
                      {selectedSoutenance.juryMembers.map((m, index) => (
                        <Col xs={12} key={index}>
                          <span>{m}</span>
                        </Col>
                      ))}
                    </Row>
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
