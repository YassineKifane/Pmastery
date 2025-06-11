import axios from 'axios';
import React, { useContext, useEffect, useReducer, useState } from 'react';
import { Button, Col, Form, InputGroup, Row, Table } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-toastify';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { Store } from '../Store';
import { getError } from '../utils';
import SupervisorItem from "../components/SupervisorItem";
import { URL } from "../constants/constants";

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false,supervisors: action.payload};
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
  const [{ loading, error, supervisors, loadingDelete, successDelete }, dispatch,] =
      useReducer(reducer, {
        loading: true,
        error: '',
      });

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(`${URL}` + '/user/usersWithCurrentPfeAndApproved', {
          headers: { Authorization: `${userInfo.token}` },
          params: {
            role : "SUPERVISOR",
            affiliationCode: userInfo.affiliationCode,
            year: currentYear,
          },
        });


        const dataa = await axios.get(`${URL}` + '/pfe/pfeYears', {
          headers: { Authorization: `${userInfo.token}` },
          params: {
            affiliationCode: userInfo.affiliationCode,
          },
        });
        console.log("dataaa  "+dataa.data)


        console.log("data  "+data)
        dispatch({
          type: 'FETCH_SUCCESS',
          payload:data
        });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: err });
      }
    };
    if (successDelete) {
      dispatch({ type: 'DELETE_RESET' });
    } else {
      fetchData();
      //console.log("data  " +data)
    }
  }, [userInfo, successDelete,currentYear]);

  const deleteHandler = async (supervisor) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer ce compte?`)) {
      try {
        dispatch({ type: 'DELETE_REQUEST' });

        // Assurez-vous que l'URL et les headers sont correctement définis
        await axios.delete(`${URL}/user/${supervisor.userId}`, {
          headers: { Authorization: `${userInfo.token}` },
          params: { role: 'SUPERVISOR' },
        });

        // Afficher un toast de succès après la suppression réussie
        toast.success('Encadrant supprimé avec succès');

        // Dispatch l'action DELETE_SUCCESS pour réinitialiser l'état
        dispatch({ type: 'DELETE_SUCCESS' });
      } catch (err) {
        // En cas d'erreur, afficher un toast d'erreur avec les détails de l'erreur
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
            <MessageBox>{error.message} Il n'y a pas d'encadrants disponibles</MessageBox>
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
                        <th></th>
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
                              <SupervisorItem
                                  key={supervisor.userId}
                                  supervisor={supervisor}
                                  selectedYearSupervisors={{value:currentYear,label:currentYear}}
                                  deleteHandler={()=>deleteHandler(supervisor)}
                              />
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