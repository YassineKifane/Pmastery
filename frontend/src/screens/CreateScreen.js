import axios from 'axios';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Store } from '../Store';
import { getError } from '../utils';
import LoadingBox from '../components/LoadingBox';
import { URL } from "../constants/constants";

export default function StudentJoinForm() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const redirectInUrl = new URLSearchParams(search).get('redirect');
  const redirect = redirectInUrl ? redirectInUrl : '/home';
  const { state } = useContext(Store);
  const { userInfo } = state;
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    lastName: '',
    firstName: '',
    email: '',
    password: '',
    confirmPassword: '',
    sector: '',
    image: null,
  });
  const [showPassword, setShowPassword] = useState(true);
  const firstErrorRef = useRef(null);
  const [errors, setErrors] = useState({});

  const handleImageUpload = (files) => {
    if (files && files[0]) {
      setForm({ ...form, image: files[0] });
    }
  };
  const setField = (field, value) => {
    setForm({ ...form, [field]: value });
    if (!!errors[field]) setErrors({ ...errors, [field]: null });
  };

  const validateForm = () => {
    const { lastName, firstName, email, password, confirmPassword, sector } =
      form;
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

    if (!email || email === '') newErrors.email = 'Entrez votre email';
    else if (
      !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email) ||
      !email.includes('@')
    )
      newErrors.email = `Format d'email invalide`;
    else if (email.length > 100)
      newErrors.email = `L'email doit comporter au maximum 100 caractères`;

    if (!password || password === '')
      newErrors.password = 'Entrez votre mot de passe';
    else if (!/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.*\s).{8,20}$/.test(password))
      newErrors.password =
        'Le mot de passe doit contenir entre 8 et 20 caractères utilise des minuscules majuscules et des chiffres';

    if (!confirmPassword || confirmPassword === '')
      newErrors.confirmPassword = 'confirmez votre mot de passe';
    else if (confirmPassword !== password)
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';

    if (!sector || sector === '')
      newErrors.sector = 'Entrez le nom de la filière';
    else if (sector.length < 2 || sector.length > 50)
      newErrors.sector =
        'Le nom de la filière doit comporter entre 3 et 50 caractères';
    else if (!/^[A-Za-z ]+$/.test(sector))
      newErrors.sector =
        'Le nom de la filière ne doit contenir que des caractères';

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
      setLoading(true);
  
      // Step 1: Create user
      const response = await axios.post(`${URL}` + "/user", form, {
        params: { role: "ADMIN" },
      });
      const userId = response.data.userId;
  
      // Step 2: Always send FormData
      const formData = new FormData();
      formData.append("userId", userId); // Always include userId
      if (form.image) {
        formData.append("image", form.image); // Add image only if exists
      }
  
      await axios.post(`${URL}/image`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
  
      setLoading(false);
      navigate(redirect || "/");
      toast.info("Vérifier votre email pour valider votre compte");
    } catch (err) {
      toast.error(getError(err));
      setLoading(false);
    }
  };
  
  useEffect(() => {
    // Find the first input element with an error
    const firstErrorInput = Object.keys(errors).find(
        (inputName) => errors[inputName]
    );

    // Scroll to the first error element
    if (firstErrorInput) {
      const firstErrorRefElement = document.querySelector(
          `[id=${firstErrorInput}]`
      );
      if (firstErrorRefElement) {
        firstErrorRefElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    }
  }, [errors]);

  useEffect(() => {
    // Find the first input element with an error
    const firstErrorInput = Object.keys(errors).find(
      (inputName) => errors[inputName]
    );

    // Scroll to the first error element
    if (firstErrorInput) {
      const firstErrorRefElement = document.querySelector(
        `[id=${firstErrorInput}]`
      );
      if (firstErrorRefElement) {
        firstErrorRefElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    }
  }, [errors]);


  useEffect(() => {
    if (userInfo) {
      navigate(redirect);
    }
  }, [navigate, redirect, userInfo]);

  return (
    <div className="p-5">
      <Helmet>
        <title>Create</title>
      </Helmet>
      <h1>Créez votre compte de gestion</h1>
      <Container className="p-5">
        <Form onSubmit={submitHandler} noValidate  >
          <Row>
            <Form.Group as={Col} md="6" className="mb-3" controlId="lastName">
              <Form.Label>Nom</Form.Label>
              <Form.Control
                type="text"
                placeholder="Nom"
                value={form.lastName}
                onChange={(e) => setField('lastName', e.target.value)}
                isInvalid={!!errors.lastName}
                disabled={loading}
                ref={errors.lastName ? firstErrorRef : null}
              />
              <Form.Control.Feedback className="formErrorMsg" type="invalide">
                {errors.lastName}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group as={Col} md="6" className="mb-3" controlId="firstName">
              <Form.Label>Prénom</Form.Label>
              <Form.Control
                type="text"
                placeholder="Pénom"
                value={form.firstName}
                onChange={(e) => setField('firstName', e.target.value)}
                isInvalid={!!errors.firstName}
                disabled={loading}
                ref={errors.firstName ? firstErrorRef : null}
              />
              <Form.Control.Feedback className="formErrorMsg" type="invalide">
                {errors.firstName}
              </Form.Control.Feedback>
            </Form.Group>
          </Row>
          <Form.Group className="mb-3" controlId="email">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setField('email', e.target.value)}
              isInvalid={!!errors.email}
              disabled={loading}
              ref={errors.email ? firstErrorRef : null}
            />
            <Form.Control.Feedback className="formErrorMsg" type="invalide">
              {errors.email}
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group className="mb-3" controlId="password">
            <Form.Label>Mot de passe</Form.Label>
            <Form.Control
              type={showPassword ? 'password' : 'text'}
              placeholder="Mot de passe"
              value={form.password}
              onChange={(e) => setField('password', e.target.value)}
              isInvalid={!!errors.password}
              disabled={loading}
              ref={errors.password ? firstErrorRef : null}
            />
            <Form.Control.Feedback className="formErrorMsg" type="invalide">
              {errors.password}
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group className="mb-2" controlId="confirmPassword">
            <Form.Label>Confirmer le mot de passe</Form.Label>
            <Form.Control
              type={showPassword ? 'password' : 'text'}
              placeholder="Confirmer le mot de passe"
              value={form.confirmPassword}
              onChange={(e) => setField('confirmPassword', e.target.value)}
              isInvalid={!!errors.confirmPassword}
              disabled={loading}
              ref={errors.confirmPassword ? firstErrorRef : null}
            />
            <Form.Control.Feedback className="formErrorMsg" type="invalide">
              {errors.confirmPassword}
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
          <Form.Group className="mb-3" controlId="sector">
            <Form.Label>Nom de la filière</Form.Label>
            <Form.Control
              type="text"
              placeholder="Nom de la filière"
              value={form.sector}
              onChange={(e) => setField('sector', e.target.value)}
              isInvalid={!!errors.sector}
              disabled={loading}
              ref={errors.sector ? firstErrorRef : null}
            />
            <Form.Control.Feedback className="formErrorMsg" type="invalide">
              {errors.sector}
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group className="mb-3" controlId="image">
            <Form.Label>Télécharger votre signature (PNG uniquement)</Form.Label>
            <Form.Control
                type="file"
                accept="image/png"
                name="image"
                onChange={(e) => handleImageUpload(e.target.files)}
                isInvalid={!!errors.image}
                disabled={loading}

            />
          </Form.Group>
          <div className="mb-3">
            <Button type="submit" disabled={loading} className="btnStyle">
              Créer
            </Button>
            {loading && <LoadingBox />}
          </div>
          <div className="mb-3 linkStyle">
            Vous avez déjà un compte?{' '}
            <Link to={`/?redirect=${redirect}`}>Se connecter</Link>
          </div>
        </Form>
      </Container>
    </div>
  );
}
