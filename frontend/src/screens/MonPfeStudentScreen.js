import React, { useContext, useEffect, useReducer, useState } from 'react';
import { Store } from '../Store';
import axios from 'axios';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { Button, Col, Container, Form, ListGroup, Row } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import CreatableSelect from 'react-select/creatable';
import techOptions from '../data';
import { toast } from 'react-toastify';
import { getError } from '../utils';
import { URL } from "../constants";

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, pfe: action.payload };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    case 'UPDATE_REQUEST':
      return { ...state, loadingUpdate: true };
    case 'UPDATE_SUCCESS':
      return { ...state, loadingUpdate: false, pfe: action.payload };
    case 'UPDATE_FAIL':
      return { ...state, loadingUpdate: false };
    default:
      return state;
  }
};
export default function MonPfeStudentScreen() {
  const [{ loading, pfe, error, loadingUpdate }, dispatch] = useReducer(
    reducer,
    {
      loading: true,
      error: '',
    }
  );
  const { state } = useContext(Store);
  const { userInfo } = state;

  const [modifyPfe, setModifyPfe] = useState(false);
  const [form, setForm] = useState({});
  const [errors, setErrors] = useState({});

  const setField = (field, value) => {
    setForm({ ...form, [field]: value });
    if (!!errors[field]) setErrors({ ...errors, [field]: null });
  };

  const validateForm = () => {
    const { city, company, subject, supervisorEmail, usedTechnologies } = form;
    const newErrors = {};

    if (!city || city === '')
      newErrors.city = 'Entrez la ville où tu passes votre stage';
    else if (city.length < 3 || city.length > 30)
      newErrors.city = 'La ville doit comporter entre 3 et 30 caractères';
    else if (!/^[A-Za-z ]+$/.test(city))
      newErrors.city = 'La ville ne doit contenir que des caractères';

    if (!company || company === '')
      newErrors.company = "Entrez le nom de l'entreprise";

    if (!subject || subject === '')
      newErrors.subject = 'Entrez votre sujet PFE';
    else if (subject.length > 255 || subject.length < 10)
      newErrors.subject = 'Le sujet doit comporter entre 10 et 255 caractères';

    if (!supervisorEmail || supervisorEmail === '')
      newErrors.supervisorEmail =
        "Entrez l'email de votre encadrant dans l'entreprise";
    else if (
      !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(
        supervisorEmail
      ) ||
      !supervisorEmail.includes('@')
    )
      newErrors.supervisorEmail = `Format d'email invalide`;
    else if (supervisorEmail.length > 100)
      newErrors.supervisorEmail = `L'email doit comporter au maximum 100 caractères`;

    if (!usedTechnologies || usedTechnologies.length === 0)
      newErrors.usedTechnologies = 'Entrez les technologies utilisées';
    if (usedTechnologies.length > 255)
      newErrors.usedTechnologies = 'Taille insuffisante ';

    return newErrors;
  };

  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: 'FETCH_REQUEST' });
      try {
        const result = await axios.get(URL + `/pfe/user/${userInfo.userId}`, {
          params: { role: userInfo.role },
          headers: { Authorization: `${userInfo.token}` },
        });

        if(result.data && result.data.length > 0 && result.data[0].usedTechnologies){
          dispatch({ type: 'FETCH_SUCCESS', payload: result.data[0] });
          setForm({
            ...result.data[0],
            usedTechnologies: result.data[0].usedTechnologies
                .split(', ')
                .map((tech) => {
                  return { value: tech.toLowerCase().trim(), label: tech };
                }),
          });
        }

        // console.log(result.data);
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: err });
        console.log(err);
      }
    };
    fetchData();
  }, [userInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    try {
      dispatch({ type: 'UPDATE_REQUEST' });
      const sendData = {
        ...form,
        usedTechnologies: form.usedTechnologies
          .map((opt) => opt.label)
          .join(', '),
      };
      const { data } = await axios.put(URL + `/pfe/${pfe.pfeId}`, sendData, {
        headers: { Authorization: `${userInfo.token}` },
      });
      dispatch({
        type: 'UPDATE_SUCCESS',
        payload: data,
      });

      setModifyPfe(false);
      toast.success('PFE updated successfully');
    } catch (err) {
      dispatch({
        type: 'FETCH_FAIL',
      });
      toast.error(getError(err));
    }
  };

  return (
    <div className="p-5">
      {loadingUpdate && <LoadingBox />}
      {loading ? (
        <LoadingBox />
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        <Container>
          <Row className={modifyPfe ? 'd-none' : 'd-block'}>
            <ListGroup variant="flush">
              <ListGroup.Item>
                <Helmet>
                  <title>Mon PFE</title>
                </Helmet>
                <h5>Sujet: {pfe.subject}</h5>
                <p>Les technologies utilisées: {pfe.usedTechnologies}</p>
              </ListGroup.Item>
              <ListGroup.Item>
                <strong>Informations du stage:</strong>
                <Row>
                  <Row>
                    <Col>Entreprise: {pfe.company}</Col>
                  </Row>
                  <Row>
                    <Col>Ville: {pfe.city}</Col>
                  </Row>
                  <Row>
                    <Col>Email d'encadrant du stage: {pfe.supervisorEmail}</Col>
                  </Row>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <strong>Vos encadrants:</strong>
                {pfe.users.filter((e) => e.role !== 'STUDENT').length > 0 &&
                pfe.approved === true ? (
                  pfe.users
                    .filter((e) => e.role !== 'STUDENT')
                    .map((e) => (
                      <p key={e.userId}>
                        <span>{`${e.firstName} ${e.lastName}`}</span>
                        <br />
                      </p>
                    ))
                ) : (
                  <MessageBox>
                    Vous n'avez pas d'encadrant pour le moment
                  </MessageBox>
                )}
              </ListGroup.Item>
            </ListGroup>
            <div className="mt-3">
              <Button
                onClick={() => {
                  setModifyPfe(true);
                }}
              >
                Modifier les informations de PFE{' '}
              </Button>
            </div>
          </Row>
          <Row className={modifyPfe ? 'd-block' : 'd-none'}>
            <Form onSubmit={submitHandler} noValidate>
              <Form.Group className="mb-3" controlId="city">
                <Form.Label>Ville</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Ville"
                  value={form.city}
                  onChange={(e) => setField('city', e.target.value)}
                  isInvalid={!!errors.city}
                />
                <Form.Control.Feedback className="formErrorMsg" type="invalide">
                  {errors.city}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="mb-3" controlId="company">
                <Form.Label>Entreprise</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Entreprise"
                  value={form.company}
                  onChange={(e) => setField('company', e.target.value)}
                  isInvalid={!!errors.company}
                />
                <Form.Control.Feedback className="formErrorMsg" type="invalide">
                  {errors.company}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="mb-3" controlId="subject">
                <Form.Label>Sujet</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Sujet"
                  value={form.subject}
                  onChange={(e) => setField('subject', e.target.value)}
                  isInvalid={!!errors.subject}
                />
                <Form.Control.Feedback className="formErrorMsg" type="invalide">
                  {errors.subject}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="mb-3" controlId="supervisorEmail">
                <Form.Label>Email de votre encadrant</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Email de votre encadrant"
                  value={form.supervisorEmail}
                  onChange={(e) => setField('supervisorEmail', e.target.value)}
                  isInvalid={!!errors.supervisorEmail}
                />
                <Form.Control.Feedback className="formErrorMsg" type="invalide">
                  {errors.supervisorEmail}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="mb-3" controlId="usedTechnologies">
                <Form.Label>Technologies utilisées</Form.Label>
                <CreatableSelect
                  isMulti
                  placeholder="Technologies utilisées"
                  value={form.usedTechnologies}
                  onChange={(e) => setField('usedTechnologies', e)}
                  options={techOptions}
                  formatCreateLabel={(inputText) => `Autre "${inputText}"`}
                />
                <Form.Control.Feedback className="formErrorMsg" type="invalide">
                  {errors.usedTechnologies}
                </Form.Control.Feedback>
              </Form.Group>
              <div>
                <Button className="me-2" type="submit">
                  Modifier
                </Button>
                <Button
                  onClick={() => {
                    setModifyPfe(false);
                    setForm({
                      ...pfe,
                      usedTechnologies: pfe.usedTechnologies
                        .split(', ')
                        .map((tech) => {
                          return {
                            value: tech.toLowerCase().trim(),
                            label: tech,
                          };
                        }),
                    });
                    setErrors({});
                  }}
                >
                  Annuler
                </Button>
              </div>
            </Form>
          </Row>
        </Container>
      )}
    </div>
  );
}
