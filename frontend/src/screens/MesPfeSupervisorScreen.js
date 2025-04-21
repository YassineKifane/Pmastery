import React, { useContext, useEffect, useReducer, useState } from 'react';
import { Col, Container, ListGroup, Row } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import { Store } from '../Store';
import axios from 'axios';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { URL } from "../constants/constants";

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, supervisorPfe: action.payload };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

export default function MesPfeSupervisorScreen() {
  const { state } = useContext(Store);
  const { userInfo } = state;
  const [pfeSelectedAction, setPfeSelectedAction] = useState(null);
  const currentYear = new Date().getFullYear();
  const [{ loading, error, supervisorPfe }, dispatch] = useReducer(reducer, {
    loading: true,
    error: '',
    supervisorPfe: [], // Initialize as empty array
  });

  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: 'FETCH_REQUEST' });
      try {
        const { data } = await axios.get(URL + `/pfe/user/${userInfo.userId}`, {
          params: { role: userInfo.role },
          headers: { Authorization: `${userInfo.token}` },
        });
        dispatch({
          type: 'FETCH_SUCCESS',
          payload: data.filter(
            (e) => e.approved === true && e.year === currentYear
          ),
        });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: err });
        console.log(err);
      }
    };
    fetchData();
  }, [userInfo, currentYear]);

  // Filter out invalid PFEs (those without valid student data)
  const validSupervisorPfe = supervisorPfe.filter(item => {
    const student = item.users?.find((e) => e.role === 'STUDENT');
    return student && student.firstName && student.lastName && student.email; // Ensure valid student info
  });

  return (
    <div className="p-5">
      <Helmet>
        <title>Mes PFE</title>
      </Helmet>
      <Container>
        {/* Check if there are valid assigned PFEs */}
        {validSupervisorPfe.length > 0 ? (
          <>
            <Row>
              <Col>
                <h4>Vos PFEs</h4>
              </Col>
              <Col className="text-end">
                <h4>{currentYear}</h4>
              </Col>
            </Row>
            {loading ? (
              <LoadingBox />
            ) : error ? (
              <MessageBox variant="danger">{error}</MessageBox>
            ) : validSupervisorPfe.length > 0 ? (
              <>
                <Row>
                  <Col>
                    <ListGroup>
                      {validSupervisorPfe.map((item) => {
                        const student = item.users?.find((e) => e.role === 'STUDENT');
                        return (
                          <ListGroup.Item
                            key={item.pfeId}
                            action
                            onClick={() => setPfeSelectedAction(item)}
                          >
                            <Row>
                              <h5>{item.subject}</h5>
                              <p>
                                Etudiant:
                                {` ${student.firstName} ${student.lastName}`}
                                <br />
                                Le nombre de demandes:{' '}
                                {item.users?.filter((e) => e.role !== 'STUDENT').length || 0}
                              </p>
                            </Row>
                          </ListGroup.Item>
                        );
                      })}
                    </ListGroup>
                  </Col>
                  <Col>
                    {pfeSelectedAction === null ? (
                      <div className="text-center">
                        <p>Sélectionner un sujet</p>
                      </div>
                    ) : (
                      <ListGroup variant="flush">
                        <ListGroup.Item>
                          <h5>Sujet: {pfeSelectedAction.subject}</h5>
                          <p>
                            Les technologies utilisées:{' '}
                            {pfeSelectedAction.usedTechnologies}
                          </p>
                        </ListGroup.Item>
                        <ListGroup.Item>
                          <strong>Informations de l'étudiant:</strong>
                          <Row>
                            <Row>
                              <Col>
                                Nom:{' '}
                                {
                                  pfeSelectedAction.users?.find(
                                    (e) => e.role === 'STUDENT'
                                  )?.lastName
                                }
                              </Col>
                            </Row>
                            <Row>
                              <Col>
                                Prénom:{' '}
                                {
                                  pfeSelectedAction.users?.find(
                                    (e) => e.role === 'STUDENT'
                                  )?.firstName
                                }
                              </Col>
                            </Row>
                            <Row>
                              <Col>
                                Email:{' '}
                                {
                                  pfeSelectedAction.users?.find(
                                    (e) => e.role === 'STUDENT'
                                  )?.email
                                }
                              </Col>
                            </Row>
                          </Row>
                        </ListGroup.Item>
                        <ListGroup.Item>
                          <strong>Informations du stage:</strong>
                          <Row>
                            <Row>
                              <Col>Entreprise: {pfeSelectedAction.company}</Col>
                            </Row>
                            <Row>
                              <Col>Ville: {pfeSelectedAction.city}</Col>
                            </Row>
                            <Row>
                              <Col>
                                Email d'encadrant du stage:{' '}
                                {pfeSelectedAction.supervisorEmail}
                              </Col>
                            </Row>
                          </Row>
                        </ListGroup.Item>
                        <ListGroup.Item>
                          <strong>Les encadrants:</strong>
                          <p>
                            {pfeSelectedAction.users
                              ?.filter((e) => e.role !== 'STUDENT')
                              .map((e) => (
                                <span key={e.userId}>
                                  <span>{`${e.firstName} ${e.lastName}`}</span>
                                  <br />
                                </span>
                              )) || 'Aucun encadrant disponible'}
                          </p>
                        </ListGroup.Item>
                      </ListGroup>
                    )}
                  </Col>
                </Row>
              </>
            ) : (
              <MessageBox>Pas de sujets pour le moment</MessageBox>
            )}
          </>
        ) : (
          // Render message when there are no valid assigned PFEs
          <MessageBox>Vous n'avez aucun PFE assigné.</MessageBox>
        )}
      </Container>
    </div>
  );
}
