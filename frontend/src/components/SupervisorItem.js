import {Button, Col, Form, Row} from "react-bootstrap";
import React, {useContext, useEffect, useRef, useState} from "react";
import {Dialog} from "primereact/dialog";
import PfeDialogDetails from "./PfeDialogDetails";
import MessageBox from "./MessageBox";
import useAttestationHandler from "../hooks/useAttestationHandler";
import {Store} from "../Store";
import { jsPDF } from "jspdf";
import enteteimg from '../assets/images/entete.jpg';

export  default function SupervisorItem({allstudents,deleteHandler,supervisor,selectedYearSupervisors,years}) {
    const { state } = useContext(Store);
    const { userInfo } = state;
    const currentYear = new Date().getFullYear();
    const [visible, setVisible] = useState(false);
    const [detailsVisible, setDetailsVisible] = useState({});
    const [selectedYear, setSelectedYear] = useState({
        label: null,
        value: null
    });
    const handleAttestation = useAttestationHandler(supervisor, userInfo, selectedYearSupervisors, allstudents);
    const [attestationData,setAttestationData]=useState(null);
    function getCurrentDate() {
        const date = new Date();
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Les mois commencent à 0, donc +1
        const year = date.getFullYear();

        return `${day}/${month}/${year}`;
    }

    const generatePDF=()=> {
        //const existingPdfUrl = "tickets (5).pdf";
        const doc = new jsPDF();


        const enteteX = 10;
        const enteteY = 10;
        const enteteWidth = doc.internal.pageSize.getWidth() - 25;
        const enteteHeight = 35;

        const logoImg = new Image();
        logoImg.src = enteteimg
        doc.addImage(logoImg, 'JPG', enteteX, enteteY, enteteWidth, enteteHeight);
        const currentDate = getCurrentDate();
        const dateX = enteteX+5;
        const dateY = enteteY + enteteHeight + 5;
        doc.setFont('times', 'bold');
        doc.setFontSize(11);
        doc.text("Oujda le "+currentDate, dateX, dateY);

        const titleX = (doc.internal.pageSize.getWidth() / 2);
        const titleY = dateY + 25;
        doc.setFont('times', 'bold');
        doc.setFontSize(18);
        doc.text("ATTESTATION", titleX, titleY, { align: 'center' });

        const paragraph=`Je soussigne, Monsieur ${attestationData.RESPONSABLE} ,Responsable de la filière Génie Informatique (GI) à l’école Nationale des Sciences Appliquées Oujda, atteste par la présente que :\n` +
            `Monsieur ${attestationData.SUPERVISOR} a été un membre de jury durant le semestre S2 de l'année universitaire ${attestationData.YEAR} des Projets de Fin d’étude (PFE) suivants : \n`

        const paragraphX = dateX;
        let paragraphY = titleY + 20;
        doc.setFont('times', 'normal');
        doc.setFontSize(12);
        const maxWidth = doc.internal.pageSize.getWidth() - 25;
        const splitText = doc.splitTextToSize(paragraph, maxWidth);
        splitText.forEach(text => {
            doc.text(text, paragraphX, paragraphY);
            paragraphY += 10;
        });

        const tableHeaders = ['Auteurs', 'Titres'];
        const tableData = attestationData.PFESOUTNANCES
            .map(soutnance =>
                [
                    soutnance.fullName,
                    soutnance.pfeProject
                ]);


        doc.autoTable({
            head: [tableHeaders],
            body: tableData,
            startY: paragraphY + 10,
            headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0] },
            bodyStyles: { fillColor: [255, 255, 255] }

        });

        doc.save("modified-document.pdf");

    }
    function attestationbtnHandler() {
        if (window.confirm(`Êtes-vous sûr de vouloir télécharger l'attestation?`)) {
            handleAttestation().then(attestationData => {
                setAttestationData(attestationData)
                console.log(attestationData); // Afficher les données dans la console
                generatePDF()
            }).catch(error => {
                console.error(error);
            });
        }
    }





    function handleDeleteBtn() {
        if(deleteHandler){
            deleteHandler(supervisor)
        }
    }


    return (
        <tr key={supervisor.userId}>
            <td>{supervisor.lastName}</td>
            <td>{supervisor.firstName}</td>
            <td>
                {
                    supervisor.pfe.filter(p =>
                        p.year === selectedYearSupervisors.value && p.approved === true
                    ).length
                }
            </td>
            <td>{supervisor.email}</td>
            <td className="d-flex justify-content-between">
                <Button
                    type="button"
                    variant="primary"
                    onClick={() => setVisible(true)}
                >
                    PFE encadrés
                </Button>


                {
                    selectedYearSupervisors.value !== currentYear &&
                    (
                        <Button
                            onClick={() => attestationbtnHandler()}
                        >
                            Attestation
                        </Button>
                    )
                }

                <Dialog
                    header={supervisor.lastName + " " + supervisor.firstName}
                    visible={visible}
                    style={{width: '50vw'}}
                    onHide={() => setVisible(false)}
                    draggable={true}
                >
                    <Row className="mt-5">
                        {
                            selectedYearSupervisors.value &&
                            supervisor.pfe.filter(p => (p.year === selectedYearSupervisors.value && p.approved === true).length > 0)
                                ?
                                (
                                    supervisor.pfe.filter(p => (p.year === selectedYearSupervisors.value && p.approved === true))
                                        .map(
                                            pfe => (
                                                <Row className="mb-3">
                                                    <Col>
                                                        {pfe.subject}
                                                    </Col>

                                                    <Col column sm={5} style={{width: "30%"}}>
                                                        <Button
                                                            onClick={() => setDetailsVisible({
                                                                ...detailsVisible,
                                                                [pfe.pfeId]: true
                                                            })}
                                                        >
                                                            Afficher details
                                                        </Button>
                                                        <PfeDialogDetails
                                                            visible={detailsVisible[pfe.pfeId] || false}
                                                            pfeDetails={allstudents.filter(student => student.pfe[0].pfeId === pfe.pfeId)[0]}
                                                            setVisible={setDetailsVisible}
                                                        />
                                                    </Col>
                                                </Row>
                                            )))
                                : (
                                    selectedYearSupervisors.value &&
                                    <MessageBox>Aucun sujet pour cette année</MessageBox>
                                )}
                    </Row>
                </Dialog>
            </td>
            {
            deleteHandler &&
                (
                    <td>
                        <Button
                            type="button"
                            variant="danger"
                            onClick={handleDeleteBtn}
                        >
                            Supprimer
                        </Button>
                    </td>
                )
            }
        </tr>
    );
}