import React, { useContext, useEffect, useReducer, useState } from 'react';
import { Alert, Button, Col, Container, Form, Row } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import { Store } from '../Store';
import { Calendar } from 'primereact/calendar';
import axios from 'axios';
import { toast } from 'react-toastify';
import LoadingBox from '../components/LoadingBox';
import { useNavigate } from 'react-router-dom';
import { URL } from "../constants";


const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return { ...state, announcementMsg: action.payload, loading: false };
    case 'FETCH_FAIL':
      return { ...state, loading: false };
    default:
      return state;
  }
};

export default function HomeScreen() {
  const navigate = useNavigate();
  const { state } = useContext(Store);
  const { userInfo } = state;
  const [{ loading, announcementMsg }, dispatch] = useReducer(reducer, {
    announcementMsg: '',
    loading: true,
  });
  const [annonce, setAnnonce] = useState({ message: '', targetRoles: 'All' });
  const setField = (field, value) => {
    setAnnonce({ ...annonce, [field]: value });
  };
  const [hasPFE, setHasPFE] = useState(false); // Add this line

  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: 'FETCH_REQUEST' });
      try {
        // Fetch announcement message
        const { data } = await axios.get(URL + `/user/announcementMsg`, {
          params: { userId: userInfo.userId },
          headers: { Authorization: `${userInfo.token}` },
        });
        dispatch({ type: 'FETCH_SUCCESS', payload: data });

        // Check if the student has a PFE
        const hasPFEResponse = await axios.get(URL + `/pfe/hasPFE`, {
          params: { userId: userInfo.userId },
          headers: { Authorization: `${userInfo.token}` },
        });
        const hasPFEValue = hasPFEResponse.data;
        setHasPFE(hasPFEValue);
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL' });
        console.error(err);
      }
    };
    fetchData();
  }, [userInfo]);


  const submitHandler = async () => {
    if (
        !annonce.message ||
        annonce.message === '' ||
        annonce.message.length > 255 ||
        annonce.message.length < 10
    ) {
      toast.error('Le message doit comporter entre 10 et 255 caractères');
      return;
    }
    let roles = ['SUPERVISOR', 'STUDENT'];
    if (annonce.targetRoles === 'SUPERVISOR') roles = ['SUPERVISOR'];
    if (annonce.targetRoles === 'STUDENT') roles = ['STUDENT'];
    dispatch({ type: 'FETCH_REQUEST' });
    try {
      // console.log(annonce, roles);
      const { data } = await axios.put(
          URL + `/user/addAnnouncement`,
          {},
          {
            headers: { Authorization: `${userInfo.token}` },
            params: {
              affiliationCode: userInfo.affiliationCode,
              announcementMsg: annonce.message,
              roles: roles,
            },
            paramsSerializer: { indexes: null },
          }
      );
      setField('message', '');
      dispatch({ type: 'FETCH_SUCCESS', payload: data.announcementMsg });
      // console.log(data);
    } catch (err) {
      dispatch({ type: 'FETCH_FAIL' });
      toast.error(err);
    }
  };
  const handleFormFill = () => {
    navigate('/pfe-form');
  };




  return (
      <div className="p-5">
        <Helmet>
          <title>Home</title>
        </Helmet>
        <Container fluid>
          <Row>
            <Col sm={12} md={7} className="mb-3 mb-md-0">
              <Row className="p-4 bg-light rounded mb-2">
                <Row>
                  <Col
                      sm={2}
                      className="d-flex align-items-center justify-content-center"
                  >
                    <i className="pi pi-user" style={{ fontSize: '2.5rem' }}></i>
                  </Col>
                  <Col>
                    <Row>
                      <Col>{`${userInfo.firstName} ${userInfo.lastName} (${
                          userInfo.role === 'ADMIN'
                              ? 'Chef de filière'
                              : userInfo.role === 'SUPERVISOR'
                                  ? 'Encadrant'
                                  : 'Etudiant'
                      })`}</Col>
                    </Row>
                    <Row>
                      <Col>{userInfo.email}</Col>
                    </Row>
                    <Row>
                      <Col>{userInfo.sector}</Col>
                    </Row>
                    {userInfo.role === 'ADMIN' && (
                        <Row>
                          <Col>{`Code d'affiliation de votre espace: ${userInfo.affiliationCode}`}</Col>
                        </Row>
                    )}
                  </Col>
                </Row>
              </Row>

              {userInfo.role === 'ADMIN' && (
                  <Row className="mb-2">
                    <h5>Annonce</h5>
                    <Row>
                      <Col sm={12} className="mb-2">
                        <Form.Control
                            as="textarea"
                            placeholder="Annonce"
                            value={annonce.message}
                            onChange={(e) => setField('message', e.target.value)}
                            style={{ height: '100px', resize: 'none' }}
                        />
                      </Col>
                    </Row>
                    <Row>
                      <Col>
                        <Button onClick={submitHandler}>Envoyer</Button>
                      </Col>
                      <Col sm={6}>
                        <Form.Select
                            defaultValue={annonce.targetRoles}
                            onChange={(e) => setField('targetRoles', e.target.value)}
                            aria-label="Default select example"
                        >
                          <option value="All">Pour tout le monde</option>
                          <option value="SUPERVISOR">Encadrants</option>
                          <option value="STUDENT">Etudiants</option>
                        </Form.Select>
                      </Col>
                    </Row>
                  </Row>
              )}
              <Row>
                {loading ? (
                    <LoadingBox />
                ) : (
                    announcementMsg !== null && (
                        <Alert
                            variant="success"
                            className="rounded-0 overflow-auto"
                            style={{ height: '150px' }}
                        >
                          {userInfo.role === 'ADMIN' ? (
                              <strong>Dernière annonce envoyée</strong>
                          ) : (
                              <strong>Annonce:</strong>
                          )}
                          <br />
                          {announcementMsg}
                        </Alert>
                    )
                )}
              </Row>
              {userInfo.role === 'STUDENT' && !hasPFE && (
                  <Row className="mb-2">
                    <Button onClick={handleFormFill}>Saisir PFE</Button>
                  </Row>
              )}

            </Col>
            <Col sm={12} md={5}>
              <Calendar
                  className="w-100"
                  inline
              />
            </Col>
          </Row>
        </Container>
      </div>
  );
}
