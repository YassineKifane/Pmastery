import React, { useContext, useEffect, useReducer, useState } from 'react';
import {
  Col,
  Container,
  Form,
  InputGroup,
  ListGroup,
  Row,
} from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import { Store } from '../Store';
import axios from 'axios';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import AssignmentChecklist from '../components/AssignmentChecklist';
import { URL } from "../constants/constants";

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, pfeSupervisorChoices: action.payload };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    case 'ASSIGNMENT_REQUEST':
      return { ...state, loadingAssignment: true, successAssignment: false };
    case 'ASSIGNMENT_SUCCESS':
      return {
        ...state,
        loadingAssignment: false,
        successAssignment: true,
      };
    case 'ASSIGNMENT_FAIL':
      return { ...state, loadingAssignment: false };
    case 'ASSIGNMENT_RESET':
      return { ...state, loadingAssignment: false, successAssignment: false };
    default:
      return { ...state };
  }
};
export default function AssignmentScreen() {
  const { state } = useContext(Store);
  const { userInfo } = state;
  const currentYear = new Date().getFullYear();
  const [search, setSearch] = useState('');
  const [pfeSelectedAction, setPfeSelectedAction] = useState(null);
  const [
    {
      loading,
      error,
      pfeSupervisorChoices,
      successAssignment,
      loadingAssignment,
    },
    dispatch,
  ] = useReducer(reducer, { loading: true, error: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(URL + '/pfe/process', {
          params: {
            affiliationCode: userInfo.affiliationCode,
            isApproved: false,
            year: currentYear,
          },
          headers: { Authorization: `${userInfo.token}` },
        });
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
        // console.log(data);
      } catch (err) {
        dispatch({ type: 'FAIL_REQUEST', payload: err });
      }
    };
    if (successAssignment) {
      dispatch({ type: 'ASSIGNMENT_RESET' });
      setPfeSelectedAction(null);
    } else {
      fetchData();
    }
  }, [userInfo, currentYear, successAssignment]);

  return (
    <div className="p-5">
      <Helmet>
        <title>Affectation</title>
      </Helmet>
      <Container>
        <Row>
          <Col>
            <h4>Affectation</h4>
          </Col>
          <Col className="text-end">
            <h4>{currentYear}</h4>
          </Col>
        </Row>
        {loading ? (
          <LoadingBox />
        ) : error ? (
          <MessageBox varinat="danger">{error}</MessageBox>
        ) : (
          <>
            <Row>
              <Col className="text-end">
                <h6>
                  Nombre de sujets non affectés: {pfeSupervisorChoices.length}
                </h6>
              </Col>
            </Row>
            {pfeSupervisorChoices.length > 0 ? (
              <>
                <Form>
                  <InputGroup className="my-3">
                    {/* onChange for search */}
                    <Form.Control
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setPfeSelectedAction(null);
                      }}
                      placeholder="Rechercher"
                    />
                  </InputGroup>
                </Form>
                <Row>
                  <Col>
                    <ListGroup>
                      {pfeSupervisorChoices
                        .filter((pfe) => {
                          return search.toLowerCase() === ''
                            ? pfe
                            : pfe.city
                                .toLowerCase()
                                .includes(search.toLowerCase()) ||
                                pfe.company
                                  .toLowerCase()
                                  .includes(search.toLowerCase()) ||
                                pfe.subject
                                  .toLowerCase()
                                  .includes(search.toLowerCase()) ||
                                pfe.usedTechnologies
                                  .toLowerCase()
                                  .includes(search.toLowerCase()) ||
                                pfe.supervisorEmail
                                  .toLowerCase()
                                  .includes(search.toLowerCase()) ||
                                pfe.users.find(
                                  (u) =>
                                    `${u.firstName.toLowerCase()} ${u.lastName.toLowerCase()}`.includes(
                                      search.toLowerCase()
                                    ) ||
                                    `${u.lastName.toLowerCase()} ${u.firstName.toLowerCase()}`.includes(
                                      search.toLowerCase()
                                    ) ||
                                    u.email
                                      .toLowerCase()
                                      .includes(search.toLowerCase())
                                );
                        })
                        .map((item) => (
                          <ListGroup.Item
                            key={item.pfeId}
                            action
                            onClick={() => setPfeSelectedAction(item)}
                          >
                            <Row>
                              <h5>Sujet: {item.subject}</h5>
                              <p>
                                Etudiant:
                                {` ${
                                  item.users.find((e) => e.role === 'STUDENT')
                                    .firstName
                                } ${
                                  item.users.find((e) => e.role === 'STUDENT')
                                    .lastName
                                }`}
                                <br />
                                Le nombre de demandes:{' '}
                                {
                                  item.users.filter((e) => e.role !== 'STUDENT')
                                    .length
                                }
                              </p>
                            </Row>
                          </ListGroup.Item>
                        ))}
                    </ListGroup>
                  </Col>
                  <Col>
                    {pfeSelectedAction === null ? (
                      <div className="text-center sticky-top removeZindex">
                        <p>Sélectionner un sujet</p>
                      </div>
                    ) : (
                      <ListGroup variant="flush sticky-top removeZindex">
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
                                  pfeSelectedAction.users.find(
                                    (e) => e.role === 'STUDENT'
                                  ).lastName
                                }
                              </Col>
                            </Row>
                            <Row>
                              <Col>
                                Prénom:{' '}
                                {
                                  pfeSelectedAction.users.find(
                                    (e) => e.role === 'STUDENT'
                                  ).firstName
                                }
                              </Col>
                            </Row>
                            <Row>
                              <Col>
                                Email:{' '}
                                {
                                  pfeSelectedAction.users.find(
                                    (e) => e.role === 'STUDENT'
                                  ).email
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
                          <strong>Les encadrants ayant choisi ce sujet:</strong>
                          {pfeSelectedAction.users.filter(
                            (e) => e.role !== 'STUDENT'
                          ).length > 0 ? (
                            loadingAssignment ? (
                              <LoadingBox />
                            ) : (
                              <AssignmentChecklist
                                pfeId={pfeSelectedAction.pfeId}
                                userInfo={userInfo}
                                dispatch={dispatch}
                                users={pfeSelectedAction.users.filter(
                                  (e) => e.role !== 'STUDENT'
                                )}
                              />
                            )
                          ) : (
                            <span> Aucun</span>
                          )}
                        </ListGroup.Item>
                      </ListGroup>
                    )}
                  </Col>
                </Row>
              </>
            ) : (
              <MessageBox>Pas de sujets à affecter pour le moment</MessageBox>
            )}
          </>
        )}
      </Container>
    </div>
  );
}
