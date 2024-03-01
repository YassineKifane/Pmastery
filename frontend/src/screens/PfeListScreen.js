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
import PfeListItem from '../components/PfeListItem';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        loading: false,
        allPfe: action.payload,
        supervisors: action.supervisors,
      };
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
      return state;
  }
};
export default function PfeListScreen() {
  const { state } = useContext(Store);
  const { userInfo } = state;
  const [pfeSelectedAction, setPfeSelectedAction] = useState(null);
  const currentYear = new Date().getFullYear();
  const [search, setSearch] = useState('');
  const [
    {
      loading,
      error,
      allPfe,
      supervisors,
      successAssignment,
      loadingAssignment,
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
        const { data } = await axios.get('http://localhost:8082/pfe', {
          params: {
            affiliationCode: userInfo.affiliationCode,
            year: currentYear,
          },
          headers: { Authorization: `${userInfo.token}` },
        });
        const supervisors = await axios.get('http://localhost:8082/user/allUsers', {
          headers: { Authorization: `${userInfo.token}` },
          params: {
            affiliationCode: userInfo.affiliationCode,
            isVerified: true,
          },
        });

        dispatch({
          type: 'FETCH_SUCCESS',
          payload: data.filter(
            (e) => e.users.find((e) => e.role === 'STUDENT').verified === true
          ),
          supervisors: supervisors.data.filter((e) => e.role !== 'STUDENT'),
        });
        // console.log(data);
      } catch (err) {
        dispatch({ type: 'FAIL_REQUEST', payload: err });
      }
    };
    if (successAssignment) {
      dispatch({ type: 'ASSIGNMENT_RESET' });
    } else {
      fetchData();
    }
  }, [userInfo, currentYear, successAssignment]);
  return (
    <div className="p-5">
      <Helmet>
        <title>PFE</title>
      </Helmet>
      <Container>
        <Row>
          <Col>
            <h4>Listes des PFE</h4>
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
            {' '}
            <Row>
              <Col xs={12} className="text-end">
                <h6>Nombre de sujets: {allPfe.length}</h6>
              </Col>
              <Col xs={12} className="text-end">
                <h6>
                  Nombre de sujets non affectés:{' '}
                  {allPfe.filter((p) => p.approved === false).length}
                </h6>
              </Col>
            </Row>
            {allPfe.length > 0 ? (
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
                      {allPfe
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
                                (pfe.approved === true &&
                                  pfe.users.find(
                                    (u) =>
                                      (u.role === 'SUPERVISOR' ||
                                        u.role === 'ADMIN') &&
                                      (`${u.firstName.toLowerCase()} ${u.lastName.toLowerCase()}`.includes(
                                        search.toLowerCase()
                                      ) ||
                                        `${u.lastName.toLowerCase()} ${u.firstName.toLowerCase()}`.includes(
                                          search.toLowerCase()
                                        ) ||
                                        u.email
                                          .toLowerCase()
                                          .includes(search.toLowerCase()))
                                  )) ||
                                pfe.users.find(
                                  (u) =>
                                    u.role === 'STUDENT' &&
                                    (`${u.firstName.toLowerCase()} ${u.lastName.toLowerCase()}`.includes(
                                      search.toLowerCase()
                                    ) ||
                                      `${u.lastName.toLowerCase()} ${u.firstName.toLowerCase()}`.includes(
                                        search.toLowerCase()
                                      ) ||
                                      u.email
                                        .toLowerCase()
                                        .includes(search.toLowerCase()))
                                );
                        })
                        .map((item) => (
                          <ListGroup.Item
                            key={item.pfeId}
                            action
                            onClick={() => setPfeSelectedAction(item)}
                          >
                            <Row>
                              <h5>{item.subject}</h5>
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
                                {item.approved === true ? (
                                  <span>
                                    le nombre d'encadrants:{' '}
                                    {
                                      item.users.filter(
                                        (e) => e.role !== 'STUDENT'
                                      ).length
                                    }
                                  </span>
                                ) : (
                                  <strong className="text-danger">
                                    Aucun encadrant affecter à ce sujet
                                  </strong>
                                )}
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
                      <PfeListItem
                        allPfe={allPfe}
                        setPfeSelectedAction={setPfeSelectedAction}
                        pfeSelectedAction={pfeSelectedAction}
                        supervisors={supervisors}
                        dispatch={dispatch}
                        userInfo={userInfo}
                        loadingAssignment={loadingAssignment}
                      />
                    )}
                  </Col>
                </Row>
              </>
            ) : (
              <MessageBox>Pas de sujets pour le moment</MessageBox>
            )}
          </>
        )}
      </Container>
    </div>
  );
}
