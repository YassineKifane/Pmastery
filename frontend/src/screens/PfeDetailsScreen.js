import axios from 'axios';
import React, { useContext, useEffect, useReducer } from 'react';
import { useParams } from 'react-router-dom';
import { getError } from '../utils';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { Col, ListGroup, Row } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import { Store } from '../Store';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return { ...state, pfe: action.payload, loading: false };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};
export default function PfeDetailsScreen() {
  const params = useParams();
  const { pfeId } = params;
  const [{ loading, error, pfe }, dispatch] = useReducer(reducer, {
    pfe: [],
    loading: true,
    error: '',
  });

  const { state } = useContext(Store);
  const { userInfo } = state;

  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: 'FETCH_REQUEST' });
      try {
        const result = await axios.get(`https://apps.ump.ma:5005/pfe/${pfeId}`, {
          params: { role: userInfo.role },
          headers: { Authorization: `${userInfo.token}` },
        });
        dispatch({ type: 'FETCH_SUCCESS', payload: result.data });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
      }
    };
    fetchData();
  }, [pfeId, userInfo]);
  return loading ? (
    <LoadingBox />
  ) : error ? (
    <MessageBox variant="danger">{error}</MessageBox>
  ) : (
    <div className="p-5">
      <Row>
        <ListGroup variant="flush">
          <ListGroup.Item>
            <Helmet>
              <title>{pfe[0].pfeId}</title>
            </Helmet>
            <h5>Sujet: {pfe[0].subject}</h5>
            <p>Les technologies utilisées: {pfe[0].usedTechnologies}</p>
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>Informations de l'étudiant:</strong>
            <Row>
              <Row>
                <Col>Nom: {pfe[0].user[0].lastName}</Col>
              </Row>
              <Row>
                <Col>Prénom: {pfe[0].user[0].firstName}</Col>
              </Row>
              <Row>
                <Col>Email: {pfe[0].user[0].email}</Col>
              </Row>
            </Row>
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>Informations du stage:</strong>
            <Row>
              <Row>
                <Col>Entreprise: {pfe[0].company}</Col>
              </Row>
              <Row>
                <Col>Ville: {pfe[0].city}</Col>
              </Row>
              <Row>
                <Col>Email d'encadrant du stage: {pfe[0].supervisorEmail}</Col>
              </Row>
            </Row>
          </ListGroup.Item>
        </ListGroup>
      </Row>
    </div>
  );
}
