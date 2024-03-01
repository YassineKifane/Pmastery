import axios from 'axios';
import { Divider } from 'primereact/divider';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Store } from '../Store';
import { getError } from '../utils';
import CreatableSelect from 'react-select/creatable';
import techOptions from '../data';
import LoadingBox from '../components/LoadingBox';

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
    affiliationCode: '',
    pfe: [
      {
        city: '',
        company: '',
        subject: '',
        supervisorEmail: '',
        usedTechnologies: [],
      },
    ],
  });
  const [showPassword, setShowPassword] = useState(true);
  const firstErrorRef = useRef(null);
  const [errors, setErrors] = useState({});
  const setField = (field, value, pfeIndex = null) => {
    if (pfeIndex !== null) {
      const pfeCopy = [...form.pfe];
      pfeCopy[pfeIndex] = { ...pfeCopy[pfeIndex], [field]: value };
      setForm({ ...form, pfe: pfeCopy });
    } else {
      setForm({ ...form, [field]: value });
    }
    if (!!errors[field]) setErrors({ ...errors, [field]: null });
  };

  const validateForm = () => {
    const {
      lastName,
      firstName,
      email,
      password,
      confirmPassword,
      affiliationCode,
      pfe: [{ city, company, subject, supervisorEmail, usedTechnologies }],
    } = {
      ...form,
      pfe: [
        {
          ...form.pfe[0],
          usedTechnologies: form.pfe[0].usedTechnologies
            .map((opt) => opt.label)
            .join(', '),
        },
      ],
    };
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
      newErrors.email = `L'email doit comporter au maximum 100 caractères`;

    if (!password || password === '')
      newErrors.password = 'Entrez votre mot de passe';
    else if (!/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.*\s).{8,20}$/.test(password))
      newErrors.password =
        'Le mot de passe doit contenir entre 8 et 20 caractères utilise des minuscules majuscules et des chiffres';

    if (!confirmPassword || confirmPassword === '')
      newErrors.confirmPassword = 'confirmez votre mot de passe';
    else if (confirmPassword !== password)
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';

    if (!affiliationCode || affiliationCode === '')
      newErrors.affiliationCode = 'Entrez le code';

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

  const submitHandler = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    try {
      setLoading(true);
      let data = {
        ...form,
        pfe: [
          {
            ...form.pfe[0],
            usedTechnologies: form.pfe[0].usedTechnologies
              .map((opt) => opt.label)
              .join(', '),
          },
        ],
      };
      // console.log(data);
      // data.pfe[0].usedTechnologies = data.pfe[0].usedTechnologies
      //   .map((opt) => opt.label)
      //   .join(', ');
      await axios.post('http://localhost:8082/user', data, {
        params: { role: 'STUDENT' },
      });
      setLoading(false);
      navigate(redirect || '/');
      toast.info('Vérifier votre email pour valider votre compte');
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
    if (userInfo) {
      navigate(redirect);
    }
  }, [navigate, redirect, userInfo]);

  return (
    <div className="p-5">
      <Helmet>
        <title>Student</title>
      </Helmet>
      <h1>Créez votre compte</h1>
      <Container className="p-5">
        <Divider align="center" className="hidden md:flex">
          <b>Informations personnelles</b>
        </Divider>
        <Form onSubmit={submitHandler} noValidate>
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
              <Form.Label>Pénom</Form.Label>
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
          <Form.Group className="mb-3" controlId="affiliationCode">
            <Form.Label>Code</Form.Label>
            <Form.Text> (Demandez le code à votre chef de filière)</Form.Text>
            <Form.Control
              type="text"
              placeholder="Code"
              value={form.affiliationCode}
              onChange={(e) => setField('affiliationCode', e.target.value)}
              isInvalid={!!errors.affiliationCode}
              disabled={loading}
              ref={errors.affiliationCode ? firstErrorRef : null}
            />
            <Form.Control.Feedback className="formErrorMsg" type="invalide">
              {errors.affiliationCode}
            </Form.Control.Feedback>
          </Form.Group>{' '}
          <Divider align="center" className="hidden md:flex">
            <b>Informations de votre PFE</b>
          </Divider>
          <Form.Group className="mb-3" controlId="city">
            <Form.Label>Ville</Form.Label>
            <Form.Control
              type="text"
              placeholder="Ville"
              value={form.pfe[0].city}
              onChange={(e) => setField('city', e.target.value, 0)}
              isInvalid={!!errors.city}
              disabled={loading}
              ref={errors.city ? firstErrorRef : null}
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
              value={form.pfe[0].company}
              onChange={(e) => setField('company', e.target.value, 0)}
              isInvalid={!!errors.company}
              disabled={loading}
              ref={errors.company ? firstErrorRef : null}
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
              value={form.pfe[0].subject}
              onChange={(e) => setField('subject', e.target.value, 0)}
              isInvalid={!!errors.subject}
              disabled={loading}
              ref={errors.subject ? firstErrorRef : null}
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
              value={form.pfe[0].supervisorEmail}
              onChange={(e) => setField('supervisorEmail', e.target.value, 0)}
              isInvalid={!!errors.supervisorEmail}
              disabled={loading}
              ref={errors.supervisorEmail ? firstErrorRef : null}
            />
            <Form.Control.Feedback className="formErrorMsg" type="invalide">
              {errors.supervisorEmail}
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group className="mb-3" controlId="usedTechnologies">
            <Form.Label>Technologies utilisées</Form.Label>
            <CreatableSelect
              isMulti
              className={errors.usedTechnologies ? 'errorInput' : ''}
              placeholder="Technologies utilisées"
              value={form.pfe[0].usedTechnologies}
              onChange={(e) => setField('usedTechnologies', e, 0)}
              options={techOptions}
              formatCreateLabel={(inputText) => `Autre "${inputText}"`}
              isDisabled={loading}
              ref={errors.usedTechnologies ? firstErrorRef : null}
            />
            <Form.Control.Feedback className="formErrorMsg" type="invalide">
              {errors.usedTechnologies}
            </Form.Control.Feedback>
          </Form.Group>
          <div className="mb-3">
            <Button type="submit" disabled={loading} className="btnStyle">
              Rejoindre
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
