import React, { useContext, useReducer, useState } from 'react';
import { Store } from '../Store';
import { Helmet } from 'react-helmet-async';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { getError } from '../utils';
import axios from 'axios';
import LoadingBox from '../components/LoadingBox';
import { URL } from "../constants/constants";

const reducer = (state, action) => {
  switch (action.type) {
    case 'UPDATE_REQUEST':
      return { ...state, loadingUpdate: true };
    case 'UPDATE_SUCCESS':
      return { ...state, loadingUpdate: false };
    case 'UPDATE_FAIL':
      return { ...state, loadingUpdate: false };
    default:
      return state;
  }
};

export default function ProfileScreen() {
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { userInfo } = state;

  const [{ loadingUpdate }, dispatch] = useReducer(reducer, {
    loadingUpdate: false,
  });

  const initialState = {
    lastName: userInfo.lastName,
    firstName: userInfo.firstName,
  };
  const [form, setForm] = useState({
    ...initialState,
  });
  const [modifyProfile, setModifyProfile] = useState(false);
  const [errors, setErrors] = useState({});
  const setField = (field, value) => {
    setForm({ ...form, [field]: value });
    if (!!errors[field]) setErrors({ ...errors, [field]: null });
  };

  const validateForm = () => {
    const { lastName, firstName } = form;
    const newErrors = {};

    if (!lastName || lastName === '') newErrors.lastName = 'Entrez votre nom';
    else if (lastName.length < 3 || lastName.length > 30)
      newErrors.lastName = 'Le nom doit comporter entre 3 et 30 caractères';
    else if (!/^[A-Za-z ]+$/.test(lastName))
      newErrors.lastName = 'Le nom ne doit contenir que des caractères';

    if (!firstName || firstName === '')
      newErrors.firstName = 'Entrez votre prénom';
    else if (firstName.length < 3 || firstName.length > 30)
      newErrors.firstName = 'Le prénom doit comporter entre 3 et 30 caractères';
    else if (!/^[A-Za-z ]+$/.test(firstName))
      newErrors.firstName = 'Le prénom ne doit contenir que des caractères';

    return newErrors;
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    try {
      dispatch({ type: 'UPDATE_REQUEST' });
      const { data } = await axios.put(
        URL + `/user/${userInfo.userId}`,
        {
          userId: userInfo.userId,
          affiliationCode: userInfo.affiliationCode,
          email: userInfo.email,
          ...form,
        },
        {
          headers: { Authorization: `${userInfo.token}` },
        }
      );
      dispatch({
        type: 'UPDATE_SUCCESS',
      });
      ctxDispatch({
        type: 'USER_SIGNIN',
        payload: { ...data, token: userInfo.token },
      });
      localStorage.setItem(
        'userInfo',
        JSON.stringify({ ...data, token: userInfo.token })
      );
      setModifyProfile(false);
      toast.success('User updated successfully');
    } catch (err) {
      dispatch({
        type: 'FETCH_FAIL',
      });
      toast.error(getError(err));
    }
  };

  return (
    <div className="p-5">
      <Helmet>
        <title>Profile</title>
      </Helmet>
      <h1>Profile</h1>
      {loadingUpdate ? (
        <LoadingBox />
      ) : (
        <Container className="p-5">
          <Row className={modifyProfile ? 'd-none' : 'd-block'}>
            <Row>
              <Col>Nom:</Col>
              <Col>{userInfo.lastName}</Col>
            </Row>
            <Row>
              <Col>Prénom:</Col>
              <Col>{userInfo.firstName}</Col>
            </Row>
            <Row>
              <Col>Email:</Col>
              <Col>{userInfo.email}</Col>
            </Row>
            {userInfo.role === 'ADMIN' && (
              <Row>
                <Col>Code d'affiliation de votre espace:</Col>
                <Col>{userInfo.affiliationCode}</Col>
              </Row>
            )}
            <div className="mt-3">
              <Button onClick={() => setModifyProfile(true)}>
                Modifier le profile
              </Button>
            </div>
          </Row>
          <Row className={modifyProfile ? 'd-block' : 'd-none'}>
            <Form onSubmit={submitHandler} noValidate>
              <Form.Group className="mb-3" controlId="lastName">
                <Form.Label>Nom</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Nom"
                  value={form.lastName}
                  onChange={(e) => setField('lastName', e.target.value)}
                  isInvalid={!!errors.lastName}
                />
                <Form.Control.Feedback className="formErrorMsg" type="invalide">
                  {errors.lastName}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="mb-3" controlId="firstName">
                <Form.Label>Pénom</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Pénom"
                  value={form.firstName}
                  onChange={(e) => setField('firstName', e.target.value)}
                  isInvalid={!!errors.firstName}
                />
                <Form.Control.Feedback className="formErrorMsg" type="invalide">
                  {errors.firstName}
                </Form.Control.Feedback>
              </Form.Group>
              <div>
                <Button className="me-2" type="submit">
                  Modifier
                </Button>
                <Button
                  onClick={() => {
                    setModifyProfile(false);
                    setForm(initialState);
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
