import axios from 'axios';
import React, { useContext, useEffect, useReducer, useState } from 'react';
import { Button, Col, Form, InputGroup, Row, Table } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-toastify';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { Store } from '../Store';
import { getError } from '../utils';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, supervisors: action.payload };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    case 'DELETE_REQUEST':
      return { ...state, loadingDelete: true, successDelete: false };
    case 'DELETE_SUCCESS':
      return {
        ...state,
        loadingDelete: false,
        successDelete: true,
      };
    case 'DELETE_FAIL':
      return { ...state, loadingDelete: false };
    case 'DELETE_RESET':
      return { ...state, loadingDelete: false, successDelete: false };
    default:
      return state;
  }
};
export default function SupervisorsListScreen() {
  const { state } = useContext(Store);
  const { userInfo } = state;
  const currentYear = new Date().getFullYear();
  const [search, setSearch] = useState('');
  const [
    { loading, error, supervisors, loadingDelete, successDelete },
    dispatch,
  ] = useReducer(reducer, {
    loading: true,
    error: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get('http://localhost:8082/user/allUsers', {
          headers: { Authorization: `${userInfo.token}` },
          params: {
            affiliationCode: userInfo.affiliationCode,
            isVerified: true,
          },
        });
        dispatch({
          type: 'FETCH_SUCCESS',
          payload: data.filter((user) => user.role === 'SUPERVISOR'),
        });
        // console.log(data.filter((user) => user.role === 'SUPERVISOR'));
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: err });
      }
    };
    if (successDelete) {
      dispatch({ type: 'DELETE_RESET' });
    } else {
      fetchData();
    }
  }, [userInfo, successDelete]);

  const deleteHandler = async (supervisor) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimmer ce compte?`)) {
      try {
        dispatch({ type: 'DELETE_REQUEST' });
        await axios.delete(`http://localhost:8082/user/${supervisor.userId}`, {
          headers: { Authorization: `${userInfo.token}` },
        });
        toast.success('Encadrant supprimé avec succès');
        dispatch({ type: 'DELETE_SUCCESS' });
      } catch (err) {
        toast.error(getError(err));
        dispatch({ type: 'DELETE_FAIL' });
      }
    }
  };

  return (
    <div className="p-5">
      <Helmet>
        <title>Supervisors List</title>
      </Helmet>
      <Row>
        <Col>
          <h4>Liste des encadrants</h4>
        </Col>
        <Col className="text-end">
          <h4>{currentYear}</h4>
        </Col>
      </Row>
      {loadingDelete && <LoadingBox />}
      {loading ? (
        <LoadingBox />
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        <>
          <Row>
            <Col className="text-end">
              <h6>Nombre d'encadrant: {supervisors.length}</h6>
            </Col>
          </Row>
          {supervisors.length > 0 ? (
            <>
              <Form>
                <InputGroup className="my-3">
                  {/* onChange for search */}
                  <Form.Control
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Rechercher"
                  />
                </InputGroup>
              </Form>
              <Table striped responsive>
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Prénom</th>
                    <th>Nombre de sujets ({currentYear})</th>
                    <th>Email</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {supervisors
                    .filter((supervisor) => {
                      return search.toLowerCase() === ''
                        ? supervisor
                        : supervisor.lastName
                            .toLowerCase()
                            .includes(search.toLowerCase()) ||
                            supervisor.firstName
                              .toLowerCase()
                              .includes(search.toLowerCase()) ||
                            supervisor.email
                              .toLowerCase()
                              .includes(search.toLowerCase()) ||
                            supervisor.pfe
                              .filter((p) => p.year === currentYear)
                              .length.toString() === search;
                    })
                    .map((supervisor) => (
                      <tr key={supervisor.userId}>
                        <td>{supervisor.lastName}</td>
                        <td>{supervisor.firstName}</td>
                        <td>
                          {
                            supervisor.pfe.filter(
                              (p) =>
                                p.year === currentYear && p.approved === true
                            ).length
                          }
                        </td>
                        <td>{supervisor.email}</td>
                        <td>
                          <Button
                            type="button"
                            variant="danger"
                            onClick={() => deleteHandler(supervisor)}
                          >
                            Supprimer
                          </Button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </Table>
            </>
          ) : (
            <MessageBox>Il n'y a pas d'encadrants disponibles</MessageBox>
          )}
        </>
      )}
    </div>
  );
}
