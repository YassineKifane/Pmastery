import axios from 'axios';
import React, { useContext, useEffect, useReducer, useState } from 'react';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import LoadingBox from '../components/LoadingBox';
import { toast } from 'react-toastify';
import { getError } from '../utils';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Store } from '../Store';
import resetPassImg from '../assets/images/resetPass.svg';
import { URL } from "../constants";

const reducer = (state, action) => {
  switch (action.type) {
    case 'SEND_EMAIL':
      return { ...state, loadingSendEmail: true, successSendEmail: false };
    case 'SEND_EMAIL_SUCCESS':
      return {
        ...state,
        loadingSendEmail: false,
        successSendEmail: true,
      };
    case 'SEND_EMAIL_FAIL':
      return { ...state, loadingSendEmail: false };
    case 'SEND_EMAIL_RESET':
      return {
        ...state,
        loadingSendEmail: false,
        successSendEmail: false,
      };
    case 'RESET_PASSWORD_REQUEST':
      return {
        ...state,
        loadingResetPassword: true,
        successResetPassword: false,
      };
    case 'RESET_PASSWORD_SUCCESS':
      return {
        ...state,
        loadingResetPassword: false,
        successResetPassword: true,
      };
    case 'RESET_PASSWORD_FAIL':
      return { ...state, loadingResetPassword: false };
    case 'RESET_PASSWORD_RESET':
      return {
        ...state,
        loadingResetPassword: false,
        successResetPassword: false,
      };
    default:
      return state;
  }
};

export default function ResetPasswordScreen() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const redirectInUrl = new URLSearchParams(search).get('redirect');
  const redirect = redirectInUrl ? redirectInUrl : '/home';
  const { state } = useContext(Store);
  const { userInfo } = state;
  const [resetPass, setResetPass] = useState(false);
  const [showPassword, setShowPassword] = useState(true);
  const [
    {
      loadingSendEmail,
      successSendEmail,
      loadingResetPassword,
      successResetPassword,
    },
    dispatch,
  ] = useReducer(reducer, {
    loading: false,
    error: '',
  });

  const [form, setForm] = useState({
    email: '',
    newPass: '',
    confirmNewPass: '',
    code: '',
  });

  const [errors, setErrors] = useState({});
  const setField = (field, value) => {
    setForm({ ...form, [field]: value });
    if (!!errors[field]) setErrors({ ...errors, [field]: null });
  };

  const validateForm = () => {
    const { email, newPass, confirmNewPass, code } = form;
    const newErrors = {};

    if (!email || email === '') newErrors.email = 'Entrez votre email';
    else if (
      !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email) ||
      !email.includes('@')
    )
      newErrors.email = `Format d'email invalide`;
    else if (email.length > 100)
      newErrors.email = `L'email doit comporter au maximum 100 caractères`;

    if (!newPass || newPass === '')
      newErrors.newPass = 'Entrez le nouveau mot de passe';
    else if (!/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.*\s).{8,20}$/.test(newPass))
      newErrors.newPass =
        'Le mot de passe doit contenir entre 8 et 20 caractères utilise des minuscules majuscules et des chiffres';

    if (!confirmNewPass || confirmNewPass === '')
      newErrors.confirmNewPass = 'confirmez votre nouveau mot de passe';
    else if (confirmNewPass !== newPass)
      newErrors.confirmNewPass = 'Les mots de passe ne correspondent pas';

    if (!code || code === '') newErrors.code = 'Entrez le code';

    return newErrors;
  };

  useEffect(() => {
    if (userInfo) {
      navigate(redirect);
    }
    if (successSendEmail) {
      dispatch({ type: 'SEND_EMAIL_RESET' });
    }
    if (successResetPassword) {
      dispatch({ type: 'RESET_PASSWORD_RESET' });
    }
  }, [successSendEmail, successResetPassword, userInfo, navigate, redirect]);

  const submitEmailHandler = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).includes('email')) {
      setErrors(formErrors);
      return;
    }
    try {
      dispatch({ type: 'SEND_EMAIL' });
      await axios.put(URL + '/user/forgotPassword', null, {
        params: { email: form.email },
      });
      // console.log(result);
      toast.info('Un code a été envoyé, vérifiez votre email');
      setResetPass(true);
      dispatch({ type: 'SEND_EMAIL_SUCCESS' });
    } catch (err) {
      dispatch({ type: 'SEND_EMAIL_FAIL' });
      toast.error(getError(err));
    }
  };

  const resetPasswordHandler = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    if (
      Object.keys(formErrors).includes('newPass') ||
      Object.keys(formErrors).includes('confirmNewPass') ||
      Object.keys(formErrors).includes('code')
    ) {
      setErrors(formErrors);
      return;
    }
    try {
      dispatch({ type: 'RESET_PASSWORD_REQUEST' });
      await axios.put(URL + '/user/resetPassword', `${form.newPass}`, {
        params: { token: form.code },
        headers: { 'Content-Type': 'application/json' },
        transformRequest: [(data) => data],
      });
      // console.log(result);
      toast.info('Votre mot de passe a été changé');
      setResetPass(false);
      dispatch({ type: 'RESET_PASSWORD_SUCCESS' });
      navigate('/');
    } catch (err) {
      dispatch({ type: 'RESET_PASSWORD_FAIL' });
      toast.error(getError(err));
    }
  };

  return (
    <div className="p-5 signinScreen">
      <Helmet>
        <title>Reset Password</title>
      </Helmet>
      {loadingSendEmail || loadingResetPassword ? (
        <LoadingBox />
      ) : (
        <Container className="p-5 pt-0 pb-0">
          <Row>
            <Col
              xs={12}
              className="d-flex align-items-center justify-content-center"
            >
              <img className="w-25" alt="resetPassword" src={resetPassImg} />
            </Col>
          </Row>
          <Row className={resetPass ? 'd-none' : 'd-block'}>
            <Col>
              <Form onSubmit={submitEmailHandler} className="w-75 m-auto">
                <Form.Group className="mb-3" controlId="email">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={(e) => setField('email', e.target.value)}
                    isInvalid={!!errors.email}
                  />
                  <Form.Control.Feedback
                    className="formErrorMsg"
                    type="invalide"
                  >
                    {errors.email}
                  </Form.Control.Feedback>
                </Form.Group>
                <div className="mb-2">
                  <Button type="submit" className="btnStyle">
                    Suivant
                  </Button>
                </div>
                <div className="linkStyle">
                  <div className="mb-1">
                    <Link to={`/`}>Retour à la page de connexion</Link>
                  </div>
                </div>
              </Form>
            </Col>
          </Row>
          <Row className={resetPass ? 'd-block' : 'd-none'}>
            <Col>
              <Form onSubmit={resetPasswordHandler} className="w-75 m-auto">
                <Form.Group className="mb-3" controlId="password">
                  <Form.Label>Nouveau mot de passe</Form.Label>
                  <Form.Control
                    type={showPassword ? 'password' : 'text'}
                    placeholder="Nouveau mot de passe"
                    value={form.newPass}
                    onChange={(e) => setField('newPass', e.target.value)}
                    isInvalid={!!errors.newPass}
                  />
                  <Form.Control.Feedback
                    className="formErrorMsg"
                    type="invalide"
                  >
                    {errors.newPass}
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="mb-2" controlId="confirmPassword">
                  <Form.Label>Confirmer le nouveau mot de passe</Form.Label>
                  <Form.Control
                    type={showPassword ? 'password' : 'text'}
                    placeholder="Confirmer le nouveau mot de passe"
                    value={form.confirmNewPass}
                    onChange={(e) => setField('confirmNewPass', e.target.value)}
                    isInvalid={!!errors.confirmNewPass}
                  />
                  <Form.Control.Feedback
                    className="formErrorMsg"
                    type="invalide"
                  >
                    {errors.confirmNewPass}
                  </Form.Control.Feedback>
                </Form.Group>
                <div className="mb-3">
                  <Button
                    size="sm"
                    variant="light"
                    className="d-flex align-items-center justify-content-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <i className="pi pi-eye-slash" />
                    ) : (
                      <i className="pi pi-eye" />
                    )}
                  </Button>
                </div>
                <Form.Group className="mb-3" controlId="code">
                  <Form.Label>
                    Code pour confirmer la réinitialisation (vérifiez votre
                    email)
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Code"
                    value={form.code}
                    onChange={(e) => setField('code', e.target.value)}
                    isInvalid={!!errors.code}
                  />
                  <Form.Control.Feedback
                    className="formErrorMsg"
                    type="invalide"
                  >
                    {errors.code}
                  </Form.Control.Feedback>
                </Form.Group>
                <div className="mb-2">
                  <Button type="submit" className="btnStyle">
                    Réinitialiser
                  </Button>
                </div>
                <div className="linkStyle">
                  <div className="mb-1">
                    <Link to={`/`}>Retour à la page de connexion</Link>
                  </div>
                </div>
              </Form>
            </Col>
          </Row>
        </Container>
      )}
    </div>
  );
}
