import axios from 'axios';
import React, { useContext, useEffect, useReducer, useState } from 'react';
import { Col, Form, InputGroup, Row, Table } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-toastify';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { Store } from '../Store';
import { getError } from '../utils';
import { TableSection } from '../components/TableSection';
import { URL } from "../constants/constants";

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, students: action.payload };
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
export default function ListScreen() {
  const { state } = useContext(Store);
  const { userInfo } = state;
  const currentYear = new Date().getFullYear();
  const [search, setSearch] = useState('');
  const [{ loading, error, students, loadingDelete, successDelete }, dispatch] =
    useReducer(reducer, {
      loading: true,
      error: '',
    });
  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(URL + '/user/studentsWithPfe', {
          headers: { Authorization: `${userInfo.token}` },
          params: {
            affiliationCode: userInfo.affiliationCode
          },
        });
        console.log("data1  ",data)

        dispatch({
          type: 'FETCH_SUCCESS',
          payload: data.filter((student) => student.pfe[0].year === currentYear),
        });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: err });
      }
    };
    if (successDelete) {
      dispatch({ type: 'DELETE_RESET' });
    } else {
      fetchData();
    }
  }, [userInfo, successDelete, currentYear]);

  const deleteHandler = async (student) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimmer ce compte?`)) {
      try {
        dispatch({ type: 'DELETE_REQUEST' });
        await axios.delete(URL + `/user/${student.userId}`, {
          headers: { Authorization: `${userInfo.token}` },
        });
        toast.success('Étudiant supprimé avec succès');
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
        <title>Students List</title>
      </Helmet>
      <Row>
        <Col>
          <h4>Liste des étudiants</h4>
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
              <h6>Nombre d'étudiants: {students.length}</h6>
            </Col>
          </Row>
          {students.length > 0 ? (
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
              <Table responsive>
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Prénom</th>
                    <th>Email</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students
                    .filter((student) => {
                      return search.toLowerCase() === ''
                        ? student
                        : student.lastName
                            .toLowerCase()
                            .includes(search.toLowerCase()) ||
                            student.firstName
                              .toLowerCase()
                              .includes(search.toLowerCase()) ||
                            student.email
                              .toLowerCase()
                              .includes(search.toLowerCase()) ||
                            student.pfe[0].city
                              .toLowerCase()
                              .includes(search.toLowerCase()) ||
                            student.pfe[0].company
                              .toLowerCase()
                              .includes(search.toLowerCase());
                    })
                    .map((student) => (
                      <TableSection
                        key={student.userId}
                        user={student}
                        deleteHandler={deleteHandler}
                      />
                    ))}
                </tbody>
              </Table>
            </>
          ) : (
            <MessageBox>Aucun étudiant inscrit pour cette année</MessageBox>
          )}
        </>
      )}
    </div>
  );
}
