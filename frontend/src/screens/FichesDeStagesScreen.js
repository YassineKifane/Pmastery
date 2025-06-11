import React, { useContext, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {Button, Row, Table} from 'react-bootstrap';
import { Store } from '../Store';
import axios from 'axios';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import jsPDF from 'jspdf';
import logoENSAO from '../assets/logo/logoENSAO.png';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { URL } from "../constants/constants";



export default function FichesDeStagesScreen() {
    const { state } = useContext(Store);
    const { userInfo } = state;
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [demands, setDemands] = useState([]);
    const [demandCount, setDemandCount] = useState(0);
    const fetchData = async () => {
        try {
            const { data } = await axios.get(`${URL}` + '/demande', {
                headers: { Authorization: `${userInfo.token}` },
                params: { userId: userInfo.userId }
            });
            if (data && data.length > 0) {
                setDemandCount(data.length);
                const studentIds = data.map(demande => demande.studentId);
                const demandsData = [];
                for (const studentId of studentIds) {
                    try {
                        const response = await axios.get(`${URL}/pfe/user/${studentId}`, {
                            headers: { Authorization: `${userInfo.token}` },
                            params: { role: 'STUDENT' }
                        });

                        demandsData.push(response.data);
                    } catch (error) {
                        console.error(`Error fetching PFE for student ${studentId}:`, error);
                    }
                }
                setDemands(demandsData.flat());
            } else {
                setDemands([]);
                setDemandCount(0);
            }
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [userInfo]);

    const addSignature = (doc, signatureImage) => {
        if (signatureImage) {
            const width = 50;
            const height = 20;
            const x = 15;
            const y = 232;
            doc.addImage(signatureImage, 'PNG', x, y, width, height);
        }
    };

    const generatePDF = async (demande) => {
        try {
            const { data: imageData } = await axios.get(`${URL}/image?affiliationCode=${demande.users[0].affiliationCode}`, {
                responseType: 'arraybuffer'
            });

            const signatureImage = new Uint8Array(imageData);
        const doc = new jsPDF('p', 'mm', 'a4');
        doc.addImage(logoENSAO, 'PNG', -6, 8, 90, 30);
        doc.setFont('courier', 'bolditalic');
        doc.setFontSize(10);
        doc.setLineHeightFactor(1);
        const start = 16;
        const lineHeight = 5;
        doc.text('ROYAUME DU MAROC', doc.internal.pageSize.getWidth() / 2, start + lineHeight * 0, {align: 'center'});
        doc.text('UNIVERSITE MOHAMMED PREMIER', doc.internal.pageSize.getWidth() / 2, start + lineHeight * 1, {align: 'center'});
        doc.text('Ecole Nationale des Sciences Appliquées (ENSA)', doc.internal.pageSize.getWidth() / 2, start + lineHeight * 2, {align: 'center'});
        doc.text('Oujda - Maroc', doc.internal.pageSize.getWidth() / 2, start + lineHeight * 3, {align: 'center'});
        doc.line(10, 40, 200, 40);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Fiche de stage du 2ème Année cycle ingénieur', doc.internal.pageSize.getWidth() / 2, 50, 'center');
        doc.setFontSize(12);
        doc.text('Etudiant:', 30, 65);
        doc.rect(10, 75, doc.internal.pageSize.getWidth() - 20, 40);
        doc.setFontSize(10);
        doc.text('Nom & Prénom:', 30, 85);
        doc.text(`${demande.users[0].lastName} ${demande.users[0].firstName}`, 70, 85);
        doc.text('CNE:', 30, 95);
        doc.text('Filière:', 30, 105);
        doc.text(`${demande.users[0].sector}`, 70, 105);
        doc.setFontSize(12);
        const stageTitleY = 130;
        doc.text('Stage:', 30, stageTitleY);
        const stageRectY = stageTitleY + 10;
        doc.rect(10, stageRectY, doc.internal.pageSize.getWidth() - 20, 60);
        doc.setFontSize(10);
        doc.text(`Société: ${demande.company}`, 30, stageRectY + 10);
        doc.text(`Adresse: ${demande.city}`, 30, stageRectY + 20);
        doc.text('Tél:', 30, stageRectY + 30);
        doc.text('Fax:', 90, stageRectY + 30);
        doc.text('Durée de stage:', 30, stageRectY + 40);
        doc.text(`Sujet: ${demande.subject}`, 30, stageRectY + 50);
        const colWidth = (doc.internal.pageSize.getWidth() - 20) / 3;
        const startY = stageRectY + 80;
        const headerHeight = 10;
        const cellHeight = 30;
        doc.setDrawColor(0);
        doc.setTextColor(0);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.rect(10, startY, colWidth, headerHeight);
        doc.text('Responsable de la filière', 15, startY + 7);
        doc.rect(10 + colWidth, startY, colWidth, headerHeight);
        doc.text('Chef de département', 15 + colWidth, startY + 7);
        doc.rect(10 + 2 * colWidth, startY, colWidth, headerHeight);
        doc.text('Directeur Adjoint', 15 + 2 * colWidth, startY + 7);
        doc.line(10 + colWidth, startY, 10 + colWidth, startY + cellHeight);
        doc.line(10 + 2 * colWidth, startY, 10 + 2 * colWidth, startY + cellHeight);
        doc.line(10, startY + headerHeight, 10 + colWidth * 3, startY + headerHeight);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.rect(10, startY + headerHeight, colWidth, cellHeight);
        doc.text('', 15, startY + headerHeight + 15);
        doc.rect(10 + colWidth, startY + headerHeight, colWidth, cellHeight);
        doc.text('', 15 + colWidth, startY + headerHeight + 15);
        doc.rect(10 + 2 * colWidth, startY + headerHeight, colWidth, cellHeight);
        doc.text('', 15 + 2 * colWidth, startY + headerHeight + 15);
        addSignature(doc, signatureImage);
        const pdfBlob = doc.output('blob');
        const formData = new FormData();
        formData.append('email', demande.users[0].email);
        formData.append('subject', 'Fiche de stage');
        formData.append('message', 'Cher(e) étudiant(e),\n' + '\n' +
                'Nous avons le plaisir de vous informer que votre demande de fiche de stage a été traitée avec succès. \n'+'Veuillez trouver ci-joint le fichier PDF contenant votre fiche de stage.\n' +
                '\n' +
                'Cordialement,');
        formData.append('attachment', pdfBlob, 'fiche_de_stage.pdf');


        await axios.post(`${URL}` + '/send-pdf', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
            await axios.delete(`${URL}/demande/${demande.users[0].userId}`, {
                headers: { Authorization: `${userInfo.token}` }
            });
            toast.success('Fiche de stage envoyée avec succès !');
        } catch (error) {
            console.error('Error fetching signature image:', error);
        }
    };

    return (
        <div className="p-5">
            <Helmet>
                <title>Demandes de Fiches de Stages</title>
            </Helmet>
            <h1>Demandes Fiches de Stages ({demandCount})</h1>
            {loading ? (
                <LoadingBox />
            ) : error ? (
                <MessageBox variant="danger">{error}</MessageBox>
            ) : (
                <>
                    {demands.length > 0 ? (
                        <Table striped bordered hover>
                            <thead>
                            <tr>
                                <th>Nom</th>
                                <th>Prénom</th>
                                <th>Sujet</th>
                                <th>Entreprise</th>
                                <th>Ville</th>
                                <th>Technologies utilisées</th>
                                <th style={{ width: '350px' }}>Action</th>
                            </tr>
                            </thead>
                            <tbody>
                            {demands.map((demande) => (
                                <tr key={demande.pfeId}>
                                    <td>{demande.users[0].lastName}</td>
                                    <td>{demande.users[0].firstName}</td>
                                    <td>{demande.subject}</td>
                                    <td>{demande.company}</td>
                                    <td>{demande.city}</td>
                                    <td>{demande.usedTechnologies}</td>
                                    <td style={{ maxWidth: '350px' }}>
                                        <Row className="mb-2" style={{ display: 'flex', justifyContent: 'center' }}>
                                            <Button  onClick={() => generatePDF(demande)} style={{ width: '70%' }}>Générer fiche de stage</Button>
                                        </Row>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </Table>
                    ) : (
                        <MessageBox>Aucune demande de fiche stage</MessageBox>
                    )}
                </>
            )}
        </div>
    );
}
