import React, { useContext, useEffect, useReducer } from 'react';
import { Store } from '../Store';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { Col, Container, Row } from 'react-bootstrap';
import { formatDate } from '../utils';
import { URL } from "../constants/constants";

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, soutenance: action.payload };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};
export default function MaSoutenanceStudentScreen() {
  const { state } = useContext(Store);
  const { userInfo } = state;
  const [{ loading, error, soutenance }, dispatch] = useReducer(reducer, {
    loading: true,
    error: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(
         `${URL}` + `/soutnance/getAssignedSoutnance/${userInfo.userId}`,
          { headers: { Authorization: `${userInfo.token}` } }
        );
        // console.log(data);
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: err });
      }
    };
    fetchData();
  }, [userInfo]);

  return (
    <div className="p-5">
      <Helmet>
        <title>Ma soutenance</title>
      </Helmet>
      {loading ? (
        <LoadingBox />
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : soutenance.affectedDate === null || soutenance === '' ? (
        <MessageBox variant="info">
          Votre soutenance n'est pas encore programmé
        </MessageBox>
      ) : (
        <Container>
          <Row className="w-md-50">
            <Col xs={12} className="text-center p-2">
              <h5>
                Votre soutenance est prévue pour:{' '}
                <strong>{formatDate(soutenance.affectedDate)}</strong>
              </h5>
            </Col>
            <Col xs={12} className="p-2 text-center">
              <h5 className="p-2">Membres de jury</h5>
              {soutenance.juryMembers.map((e, index) => (
                <Row key={index}>
                  <Col className="p-3 w-md-50 text-center bg-light rounded-2 mb-2 d-flex justify-content-center">
                    {e}
                  </Col>
                </Row>
              ))}
            </Col>
          </Row>
        </Container>
      )}
    </div>
  );
}
