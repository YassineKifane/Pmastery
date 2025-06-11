import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import thesisImg from '../assets/images/Thesis.svg';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import { Store } from '../Store';

import { toast } from 'react-toastify';
import { getError } from '../utils';
import axios from 'axios';
import { URL } from "../constants/constants";
export default function SigninScreen() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const redirectInUrl = new URLSearchParams(search).get('redirect');
  const redirect = redirectInUrl ? redirectInUrl : '/home';

  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { userInfo } = state;

  const [form, setForm] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(true);
  const [errors, setErrors] = useState({});
  const setField = (field, value) => {
    setForm({ ...form, [field]: value });
    if (!!errors[field]) setErrors({ ...errors, [field]: null });
  };

  const validateForm = () => {
    const { email, password } = form;
    const newErrors = {};

    if (!email || email === '') newErrors.email = 'Entrez votre email';
    if (!password || password === '')
      newErrors.password = 'Entrez votre mot de passe';

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
      const result = await axios.post('/api/users/login', form);
      
      if (/*result.data.emailVerified*/ true) {
        if (result.data.verified) {
          delete result.data.announcementMsg;
          ctxDispatch({
            type: 'USER_SIGNIN',
            payload: { ...result.data, token: result.headers.authorization },
          });
          localStorage.setItem(
              'userInfo',
              JSON.stringify({
                ...result.data,
                token: result.headers.authorization,
              })
              
          );
          navigate(redirect || '/home');
        } else {
          if (result.data.role === 'ADMIN') {
            toast.info(
                "Vous devez d'abord valider votre compte (vérifier votre email)"
            );
          } else {
            toast.info("Votre demande n'a pas encore été acceptée");
          }
        }
      } else {
        toast.info(
            "Vous devez d'abord valider votre compte (vérifier votre email)"
        );
      }
    } catch (err) {
      console.log(err);
      toast.error(getError(err));
    }
  };


  useEffect(() => {
    if (userInfo) {
      navigate(redirect);
    }
  }, [navigate, redirect, userInfo]);

  return (
    <div className="p-5 signinScreen">
      <Helmet>
        <title>Signin</title>
      </Helmet>
      <Container fluid>
        <Row>
          <Col
            md={6}
            className="d-flex align-items-center justify-content-center"
          >
            <img className="w-100" alt="Thesis" src={thesisImg} />
          </Col>
          <Col
            md={6}
            className="d-flex flex-column align-items-center justify-content-center"
          >
            <Form onSubmit={submitHandler} className="w-75">
              <Form.Group className="mb-3" controlId="email">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) => setField('email', e.target.value)}
                  isInvalid={!!errors.email}
                />
                <Form.Control.Feedback className="formErrorMsg" type="invalide">
                  {errors.email}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="mb-2" controlId="password">
                <Form.Label>Mot de passe</Form.Label>
                <Form.Control
                  type={showPassword ? 'password' : 'text'}
                  placeholder="Mot de passe"
                  value={form.password}
                  onChange={(e) => setField('password', e.target.value)}
                  isInvalid={!!errors.password}
                />
                <Form.Control.Feedback className="formErrorMsg" type="invalide">
                  {errors.password}
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
              <div className="mb-2">
                <Button type="submit" className="btnStyle">
                  Se connecter
                </Button>
              </div>
              <div className="linkStyle">
                <div className="mb-1">
                  <Link to={`/resetpassword`}>Mot de passe oublié ?</Link>
                </div>
                <div>
                  Nouvel utilisateur?{' '}
                  <Link to={`/join`}>Créez votre compte</Link>
                </div>
              </div>
            </Form>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
