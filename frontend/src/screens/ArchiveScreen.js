import React, {useContext, useEffect, useReducer, useRef, useState} from 'react';
import MessageBox from '../components/MessageBox';
import {Helmet} from "react-helmet-async";
import {Badge, Button, Col, Form, InputGroup, Row, Tab, Table, Tabs} from "react-bootstrap";
import axios from "axios";
import {Store} from "../Store";
import {TableSection} from "../components/TableSection";
import CreatableSelect from "react-select/creatable";


const reducer = (state, action) => {
    switch (action.type) {
        case 'FETCH_REQUEST':
            return { ...state, loading: true };
        case 'FETCH_SUCCESS':
            return { ...state, loading: false, students: action.payload.students, supervisors: action.payload.supervisors };
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
    const currentYear = new Date().getFullYear();
    const [years, setYears] = useState([]);

    const [{ loading, error, students,supervisors, loadingDelete, successDelete }, dispatch] =
        useReducer(reducer, {
            loading: true,
            error: '',
        });

        const [selectedYearSupervisors, setselectedYearSupervisors] = useState({
            label: null,
            value: null
          });
          
          const [selectedYearStudents, setselectedYearStudents] = useState({
            label: null,
            value: null
          });
        
        const [searchsupervisor, setSearchsupervisor] = useState('');
        const [searchstudents, setSearchstudents] = useState('');



    const handleMenuOpen = (menuIsOpen) => {
        if (menuIsOpen) {
            console.log('Menu opened!');
        }
    };

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
                console.log("data",data)
                const students = data.filter((user) => user.role === 'STUDENT' && user.pfe[0].year===selectedYearStudents.value);
                const supervisors = data.filter((user) => user.role === 'SUPERVISOR' && user.pfe[0].year===selectedYearSupervisors.value);
                var listyears= [...new Set(data.map(student=>student.pfe[0].year))].filter(year=>year!==currentYear)
                setYears(listyears)
                console.log("selectedYearSupervisors"+selectedYearSupervisors.value)
                console.log("encadrants : "+supervisors)
                console.log("students : "+students)

        
                
                dispatch({
                    type: 'FETCH_SUCCESS',
                    payload: {students,supervisors},
                });


                // console.log(data);
            } catch (err) {
                dispatch({ type: 'FETCH_FAIL', payload: err });
            }
        };
        if (successDelete) {
            dispatch({ type: 'DELETE_RESET' });
        } else {
            fetchData();
        }
    }, [userInfo, successDelete, currentYear,selectedYearSupervisors.value,selectedYearStudents.value]);


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
                      <Form.Label column sm={3}>
                          Sélectionner l'année:
                      </Form.Label>
                      <Col sm={4}>
                          <CreatableSelect
                              placeholder="chosir l'annee"
                              options={years.map(year=>(({value:year, label:year})))}
                              isSearchable={false}
                              value={selectedYearSupervisors}
                              onChange={(selectedOption) => setselectedYearSupervisors(selectedOption)}
                          />
                      </Col>
                  </Form.Group>

                  {
                    (selectedYearSupervisors.value && supervisors && supervisors.length > 0 ) ? 
                    (<>
                            <Row>
                                <Col className="text-end">
                                    <h6>Nombre d'encadrants: {supervisors.length}</h6>
                                </Col>
                            </Row>
                            <>
                                <Form>
                                    <InputGroup className="my-3">
                                        <Form.Control
                                            onChange={(e) => setSearchsupervisor(e.target.value)}
                                            placeholder="Rechercher"
                                        />
                                    </InputGroup>
                                </Form>
                                <Table responsive>
                                    <thead>
                                        <tr>
                                            <th>Nom</th>
                                            <th>Prénom</th>
                                            <th>Nombre de sujets</th>
                                            <th>Email</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {supervisors
                                        .filter((supervisor) => {
                                        return searchsupervisor.toLowerCase() === ''
                                            ? supervisor
                                            : supervisor.lastName
                                                .toLowerCase()
                                                .includes(searchsupervisor.toLowerCase()) ||
                                                supervisor.firstName
                                                .toLowerCase()
                                                .includes(searchsupervisor.toLowerCase()) ||
                                                supervisor.email
                                                .toLowerCase()
                                                .includes(searchsupervisor.toLowerCase()) ||
                                                supervisor.pfe
                                                .filter((p) => p.year === currentYear)
                                                .length.toString() === searchsupervisor;
                                        })
                                        .map((supervisor) => (
                                                <tr key={supervisor.userId}>
                                                    <td>{supervisor.lastName}</td>
                                                    <td>{supervisor.firstName}</td>
                                                    <td>
                                                        {
                                                            supervisor.pfe.filter(p=>
                                                                    p.year === selectedYearSupervisors && p.approved === true
                                                            ).length
                                                        }
                                                    </td>
                                                    <td>{supervisor.email}</td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </Table>
                            </>
                    </>)
                    :(
                        (selectedYearSupervisors.value && supervisors && supervisors.length === 0) &&
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
                      <Form.Label column sm={3}>
                          Sélectionner l'année:
                      </Form.Label>
                      <Col sm={4}>
                          <CreatableSelect
                              placeholder="chosir l'annee"
                              options={years.map(year=>(({value:year, label:year})))}
                              value={selectedYearStudents}
                              onChange={(selectedOption) => setselectedYearStudents(selectedOption)}
                          />
                      </Col>
                  </Form.Group>

                  {(selectedYearStudents.value && students && students.length > 0) ? (
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
                                            onChange={(e) => setSearchstudents(e.target.value)}
                                            placeholder="Rechercher"
                                        />
                                    </InputGroup>
                                </Form>
                              <Table responsive>
                                  <thead>
                                  <tr>
                                      <th></th>
                                      <th>Nom</th>
                                      <th>Prénom</th>
                                      <th>Email</th>
                                  </tr>
                                  </thead>
                                  <tbody>
                                  {students
                                        .filter((student) => {
                                        return searchstudents.toLowerCase() === ''
                                            ? student
                                            : student.lastName
                                                .toLowerCase()
                                                .includes(searchstudents.toLowerCase()) ||
                                                student.firstName
                                                .toLowerCase()
                                                .includes(searchstudents.toLowerCase()) ||
                                                student.email
                                                .toLowerCase()
                                                .includes(searchstudents.toLowerCase()) ||
                                                student.pfe
                                                .filter((p) => p.year === currentYear)
                                                .length.toString() === searchstudents;
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
                      ) : ( (selectedYearStudents.value && students && students.length === 0) &&
                          <MessageBox>Aucun étudiant inscrit pour cette année</MessageBox>
                      )}
              </Tab>
          </Tabs>
      </div>
  );
}
