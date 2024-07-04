import axios from 'axios';
import React, { useContext, useEffect, useReducer, useState } from 'react';
import {Button, Col, Form, InputGroup, Row, Table } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-toastify';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { Store } from '../Store';
import { getError } from '../utils';
import { TableSection } from '../components/TableSection';
import { URL } from "../constants/constants";
import * as XLSX from 'xlsx';
const reducer = (state, action) => {
    switch (action.type) {
        case 'FETCH_REQUEST':
            return { ...state, loading: true };
        case 'FETCH_SUCCESS':
            return { ...state, loading: false, students: action.payload };
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
        case 'GENERATEFILE_REQUEST':
            return { ...state, loadingFile: true };
        case 'GENERATEFILE_SUCCESS':
            return { ...state, loadingFile: false, listStudents : action.payload };
        case 'GENERATEFILE_FAIL':
            return { ...state, loadingFile: false, error : action.payload };
        default:
            return state;
    }
};
export default function ListScreen() {
    const { state } = useContext(Store);
    const { userInfo } = state;
    const currentYear = new Date().getFullYear();
    const [search, setSearch] = useState('');
    const [{ loading, error, students, loadingDelete, successDelete , listStudents , loadingFile }, dispatch] =
        useReducer(reducer, {
            loading: true,
            error: '',
        });
    useEffect(() => {
        const fetchData = async () => {
            try {
                dispatch({ type: 'FETCH_REQUEST' });
                const { data } = await axios.get(URL+'/user/allUsers', {
                    headers: { Authorization: `${userInfo.token}` },
                    params: {
                        affiliationCode: userInfo.affiliationCode,
                        isVerified: true,
                    },
                });
                dispatch({
                    type: 'FETCH_SUCCESS',
                    payload: data.filter((user) => user.role === 'STUDENT' && (!user.pfe[0] || user.pfe[0].year === currentYear)),
                });
            } catch (err) {
                dispatch({ type: 'FETCH_FAIL', payload: err });
            }
        };
        if (successDelete) {
            dispatch({ type: 'DELETE_RESET' });
        } else {
            fetchData();
        }
    }, [userInfo, successDelete, currentYear]);

    const generateExcelDoc = async () => {
        if (window.confirm(`Voulez-vous télécharger la liste des étudiants sous format Excel`)) {
            try {
                dispatch({type: 'GENERATEFILE_REQUEST'});
                const {data} = await axios.get(`${URL}/pfe/process/`, {
                    headers: {Authorization: `${userInfo.token}`},
                    params: {
                        affiliationCode: userInfo.affiliationCode,
                        isApproved: true,
                        year: currentYear
                    }
                });

                const listStudents = data.map(pfe => {
                    const student = pfe.users.find(user => user.role === "STUDENT");
                    const supervisor = pfe.users.find(user => user.role === "SUPERVISOR" || user.role === "ADMIN");

                    return {
                        "Nom": student ? student.lastName : "",
                        "Prénom": student ? student.firstName : "",
                        "Sujet PFE": pfe.subject,
                        "Entreprise": pfe.company,
                        "Ville": pfe.city,
                        "Technologies utilisées": pfe.usedTechnologies,
                        "Email Encadrant entreprise": pfe.supervisorEmail,
                        "Email Encadrant (prof)": supervisor ? supervisor.email : "",
                        "Note affectée":pfe.note
                    };
                });

                dispatch({
                    type: 'GENERATEFILE_SUCCESS',
                    payload: listStudents,
                });

                // Conversion des données JSON en feuille de calcul
                const worksheet = XLSX.utils.json_to_sheet(listStudents);

                // Définir la largeur des colonnes
                const columnWidths = [
                    {wch: 20}, // Nom
                    {wch: 20}, // Prénom
                    {wch: 30}, // Sujet PFE
                    {wch: 20}, // Entreprise
                    {wch: 20}, // Ville
                    {wch: 30}, // Technologies utilisées
                    {wch: 30}, // Email Encadrant entreprise
                    {wch: 30}, // Email Encadrant (prof)
                    {wch: 15}  // Note
                ];

                worksheet['!cols'] = columnWidths;

                // Création d'un nouveau classeur
                const workbook = XLSX.utils.book_new();

                // Ajout de la feuille de calcul au classeur
                XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

                // Génération du fichier Excel
                XLSX.writeFile(workbook, `listStudents_${currentYear}.xlsx`);
            } catch (e) {
                console.log(e);
                dispatch({type: 'GENERATEFILE_FAIL', payload: e});
            }
        }
    }

    const deleteHandler = async (student) => {
        if (window.confirm(`Êtes-vous sûr de vouloir supprimer ce compte?`)) {
            try {
                dispatch({ type: 'DELETE_REQUEST' });
                await axios.delete(URL + `/user/${student.userId}`, {
                    headers: { Authorization: `${userInfo.token}` },
                    params: { role: 'STUDENT' }
                });
                toast.success('Étudiant supprimé avec succès');
                dispatch({ type: 'DELETE_SUCCESS' });
            } catch (err) {
                toast.error(getError(err));
                dispatch({ type: 'DELETE_FAIL' });
            }
        }
    };

    return (
        <div className="p-5">
            <Helmet>
                <title>Students List</title>
            </Helmet>
            <Row>
                <Col>
                    <h4>Liste des étudiants</h4>
                </Col>
                <Col className="text-end">
                    <h4>{currentYear}</h4>
                </Col>
            </Row>
            {loadingDelete && <LoadingBox />}
            {loading ? (
                <LoadingBox />
            ) : error ? (
                <MessageBox variant="danger">{error.message}</MessageBox>
            ) : (
                <>
                    <Row>
                        <Col className="text-end">
                            <h6>Nombre d'étudiants: {students.length}</h6>
                        </Col>
                    </Row>

                    <Row>
                        <Col className="text-end">
                            {loadingFile ? <LoadingBox /> :
                                <Button
                                    type="button"
                                    onClick={()=>generateExcelDoc()}
                                >
                                    Télécharger la liste
                                </Button>
                            }
                        </Col>
                    </Row>
                    {students.length > 0 ? (
                        <>
                            <Form>
                                <InputGroup className="my-3">
                                    {/* onChange for search */}
                                    <Form.Control
                                        onChange={(e) => setSearch(e.target.value)}
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
                                        return search.toLowerCase() === ''
                                            ? student
                                            : student.lastName
                                                .toLowerCase()
                                                .includes(search.toLowerCase()) ||
                                            student.firstName
                                                .toLowerCase()
                                                .includes(search.toLowerCase()) ||
                                            student.email
                                                .toLowerCase()
                                                .includes(search.toLowerCase()) ||
                                            (student.pfe[0] && (
                                                    student.pfe[0].city
                                                        .toLowerCase()
                                                        .includes(search.toLowerCase()) ||
                                                    student.pfe[0].company
                                                        .toLowerCase()
                                                        .includes(search.toLowerCase())
                                                )
                                            )
                                    })
                                    .map((student) => (
                                        <>
                                            <TableSection
                                                key={student.userId}
                                                user={student}
                                                deleteHandler={deleteHandler}
                                                currentYear={currentYear}
                                                token={userInfo.token}
                                            />
                                        </>
                                    ))}
                                </tbody>
                            </Table>
                        </>
                    ) : (
                        <MessageBox>Aucun étudiant inscrit pour cette année</MessageBox>
                    )}
                </>
            )}
        </div>
    );
}
