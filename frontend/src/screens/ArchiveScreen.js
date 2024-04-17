import React, {useContext, useEffect, useReducer, useState} from 'react';
import MessageBox from '../components/MessageBox';
import {Helmet} from "react-helmet-async";
import {Col, Form, InputGroup,Row, Tab, Table, Tabs} from "react-bootstrap";
import axios from "axios";
import {Store} from "../Store";
import {TableSection} from "../components/TableSection";
import CreatableSelect from "react-select/creatable";
import SupervisorItem from "../components/SupervisorItem";
import { URL } from "../constants/constants";

const reducer = (state, action) => {
    switch (action.type) {
        case 'FETCH_REQUEST':
            return { ...state, loading: true };
        case 'FETCH_SUCCESS':
            return { ...state,
                    loading: false,
                    allstudents: action.payload.allstudents,
                    students: action.payload.students,
                    supervisors: action.payload.supervisors,
            };
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
export default function ArchiveScreen() {
    const { state } = useContext(Store);
    const { userInfo } = state;
    const [{ loading, error,allstudents,students,supervisors, loadingDelete, successDelete }, dispatch] =
        useReducer(reducer, {
            loading: true,
            error: '',
        });
    const currentYear = new Date().getFullYear();
    const [years, setYears] = useState([]);
    const [selectedYear, setselectedYear] = useState({
        supervisor:{
            label: null,
            value: null
        },
        student:{
            label: null,
            value: null
        }
    });
    const [searchValues, setSearchValues] = useState({
        supervisor: '',
        students: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                dispatch({ type: 'FETCH_REQUEST' });
                const { data } = await axios.get(URL + '/user/allUsers', {
                    headers: { Authorization: `${userInfo.token}` },
                    params: {
                        affiliationCode: userInfo.affiliationCode,
                        isVerified: true,
                    },
                });
                const allstudents=data.filter(user=>user.role==="STUDENT")
                const students = data.filter((user) =>
                    user.role === 'STUDENT' &&
                    user.pfe[0].year===selectedYear.student.value
                );
                const supervisors = data.filter((user) =>
                    user.role === 'SUPERVISOR' &&
                    user.pfe.flatMap(p => p.year).includes(selectedYear.supervisor.value)
                );
                dispatch({
                    type: 'FETCH_SUCCESS',
                    payload: {
                        allstudents: allstudents,
                        students: students,
                        supervisors: supervisors,
                    },
                });
                let listyears = [...new Set(data.flatMap(user => user.pfe.map(pfe=> pfe.year)))].filter(year => year !== currentYear);
                setYears(listyears)
            } catch (err) {
                dispatch({ type: 'FETCH_FAIL', payload: err });
            }
        };
        if (successDelete) {
            dispatch({ type: 'DELETE_RESET' });
        } else {
            fetchData();
        }
    }, [userInfo, successDelete,years,selectedYear.supervisor.value,selectedYear.student.value]);

  return (
      <div className="p-5">
          <Helmet>
              <title>Archives</title>
          </Helmet>
          <h1>Archives</h1>
          <Tabs
              defaultActiveKey="Archives des encadrants"
              id="fill-tab-example"
              className="mb-3"
              fill
          >
              <Tab
                  eventKey="Archives des encadrants"
                  title={
                      <>
                          Archives des encadrants{' '}
                      </>
                  }
                >
                  <Form.Group as={Row} controlId="yearSelect" className="justify-content-end mb-4">
                      <Form.Label column sm={3} style={{ width: "8%"}}>
                          L'année:
                      </Form.Label>
                      <Col sm={2}>
                          <CreatableSelect
                              placeholder="Choisir l'annee"
                              options={years.map(year=>(({value:year, label:year})))}
                              isSearchable={false}
                              value={selectedYear.supervisor}
                              onChange={selectedOption =>
                                  setselectedYear({
                                      ...selectedYear,
                                      supervisor: {
                                          value:selectedOption.value,
                                          label: selectedOption.value
                                      }})}
                          />
                      </Col>
                  </Form.Group>
                  {
                    (selectedYear.supervisor.value && supervisors && supervisors.length > 0 ) ?
                    (<>
                            <Row>
                                <Col className="text-end">
                                    <h6>Nombre d'encadrants: {supervisors.length}</h6>
                                </Col>
                            </Row>
                            <>
                                <div >
                                    <Form >
                                        <InputGroup >
                                            <Form.Control
                                                onChange={(e) =>
                                                    setSearchValues({
                                                        ...searchValues,
                                                        supervisor:e.target.value
                                                    })
                                                }
                                                placeholder="Rechercher"
                                            />
                                        </InputGroup>
                                    </Form>
                                </div>
                                <Table responsive>
                                    <thead>
                                    <tr>
                                        <th>Nom</th>
                                        <th>Prénom</th>
                                        <th>Nombre de sujets</th>
                                        <th>Email</th>
                                        <th>Actions</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                        {supervisors
                                        .filter((supervisor) => {
                                        return searchValues.supervisor.toLowerCase() === ''
                                            ? supervisor
                                            : supervisor.lastName
                                                .toLowerCase()
                                                .includes(searchValues.supervisor.toLowerCase()) ||
                                                supervisor.firstName
                                                .toLowerCase()
                                                .includes(searchValues.supervisor.toLowerCase()) ||
                                                supervisor.email
                                                .toLowerCase()
                                                .includes(searchValues.supervisor.toLowerCase()) ||
                                                supervisor.pfe
                                                .filter((p) => p.year === currentYear)
                                                .length.toString() === searchValues.supervisor;
                                        })
                                        .map((supervisor) => (
                                           <SupervisorItem
                                            supervisor={supervisor}
                                            selectedYearSupervisors={selectedYear.supervisor}
                                            years={years}
                                            allstudents={allstudents}
                                           />
                                        ))
                                        }
                                    </tbody>
                                </Table>
                            </>
                    </>)
                        : (
                            (selectedYear.supervisor.value && supervisors && supervisors.length === 0) &&
                            <MessageBox>Aucun encadrant inscrit pour cette année</MessageBox>
                        )
                  }
              </Tab>
              <Tab
                  eventKey="Archives des étudiants"
                  title={
                      <>
                          Archives des étudiants{' '}

                      </>
                  }
              >
                  <Form.Group as={Row} controlId="yearSelect" className="justify-content-end mb-4">
                      <Form.Label column sm={3} style={{width: "18%"}}>
                          Sélectionner l'année:
                      </Form.Label>
                      <Col sm={2}>
                          <CreatableSelect
                              placeholder="choisir l'annee"
                              options={years.map(year => (({value: year, label: year})))}
                              isSearchable={false}
                              value={selectedYear.student}
                              onChange={(selectedOption) =>
                                  setselectedYear({
                                  ...selectedYear,
                                  student: {
                                      value: selectedOption.value,
                                      label: selectedOption.value
                                  }
                                  })}
                          />
                      </Col>
                  </Form.Group>
                  {(selectedYear.student.value && students && students.length > 0) ? (
                      <>
                          <Row>
                              <Col className="text-end">
                                  <h6>Nombre d'étudiants: {students.length}</h6>
                              </Col>
                          </Row>
                          <>
                              <Form>
                                  <InputGroup className="my-3">
                                      <Form.Control
                                          onChange={e =>
                                              setSearchValues({
                                                  ...searchValues,
                                                  students:  e.target.value
                                              })}
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
                                          return searchValues.students.toLowerCase() === ''
                                              ? student
                                              : student.lastName
                                                  .toLowerCase()
                                                .includes(searchValues.students.toLowerCase()) ||
                                                student.firstName
                                                .toLowerCase()
                                                .includes(searchValues.students.toLowerCase()) ||
                                                student.email
                                                .toLowerCase()
                                                .includes(searchValues.students.toLowerCase()) ||
                                                student.pfe
                                                .filter((p) => p.year === currentYear)
                                                .length.toString() === searchValues.students;
                                        })
                                      .map((student) => (
                                          <TableSection
                                              key={student.userId}
                                              user={student}
                                          />
                                      ))}
                                  </tbody>
                              </Table>
                        </>
                    </>
                      ) : ( (selectedYear.student.value && students && students.length === 0) &&
                          <MessageBox>Aucun étudiant inscrit pour cette année</MessageBox>
                      )}
              </Tab>
          </Tabs>
      </div>
  );
}
