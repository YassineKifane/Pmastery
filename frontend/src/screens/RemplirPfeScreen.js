import axios from 'axios';
import { Divider } from 'primereact/divider';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { Button,Form } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getError } from '../utils';
import LoadingBox from '../components/LoadingBox';
import CreatableSelect from 'react-select/creatable';
import techOptions from './../data';
import { Store } from '../Store';




export default function RemplirPfeScreen() {

    const navigate = useNavigate();
    const { search } = useLocation();
    const redirectInUrl = new URLSearchParams(search).get('redirect');
    const redirect = redirectInUrl ? redirectInUrl : '/pfe-form';
    const { state } = useContext(Store);
    const { userInfo } = state;
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        userId: userInfo && userInfo.userId ? userInfo.userId : '',
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
                ...form.pfe[0],
                usedTechnologies: form.pfe[0].usedTechnologies
                    .map((opt) => opt.label)
                    .join(', ')
            };

            console.log(data);
            console.log(form.userId)
            await axios.post(URL + '/pfe', data, {
                params: {
                    'userId': form.userId,
                }
            });

            setLoading(false);
            setForm({...form, pfe: [{ city: '', company: '', subject: '', supervisorEmail: '', usedTechnologies: [] }] });
            window.location.href = "/home";
        } catch (err) {
            toast.error(getError(err));
        } finally {
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


    return(
        <div className="p-5">
            <Divider align="center" className="hidden md:flex">
                <b>Informations de votre PFE</b>

            </Divider>
            <Form onSubmit={submitHandler} noValidate>
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
                    <Form.Label>Email de votre responsable de stage</Form.Label>
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
                        Envoyer
                    </Button>
                    {loading && <LoadingBox/>}
                </div>
            </Form>
        </div>

    );
}