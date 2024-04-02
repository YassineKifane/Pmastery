import {Button, Col, Form, Row} from "react-bootstrap";
import React, {useContext, useEffect, useRef, useState} from "react";
import {Dialog} from "primereact/dialog";
import PfeDialogDetails from "./PfeDialogDetails";
import MessageBox from "./MessageBox";
import useAttestationHandler from "../hooks/useAttestationHandler";
import {Store} from "../Store";
import { jsPDF } from "jspdf";
import docxTemplate from '../assets/images/Attestation_pfe_2023.docx';
import PizZip from 'pizzip';
import { saveAs } from 'file-saver';
import enteteimg from '../assets/images/entete.jpg';
import Docxtemplater from "docxtemplater";
import {forEach} from "underscore";


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



    const loadDocxFile = async () => {
        try {
            const response = await fetch(docxTemplate);
            const content = await response.arrayBuffer();
            return content;
        } catch (error) {
            console.error('Erreur lors du chargement du fichier .docx:', error);
            throw error;
        }
    };

    const generatePDF = async () => {
        try {
            const docxContent = await loadDocxFile();
            const zip = new PizZip(docxContent);

            const doc = new Docxtemplater();
            doc.loadZip(zip);

            doc.setData(attestationData);

            const docContent = doc.getZip().file('word/document.xml').asText();

            const tableStartIndex = docContent.indexOf('<w:tbl>');
            const tableEndIndex = docContent.indexOf('</w:tbl>');
            let newLine =null
            const firstRowStartIndex = docContent.indexOf('<w:tr>', tableStartIndex);
            const firstRowEndIndex = docContent.indexOf('</w:tr>', firstRowStartIndex) + '</w:tr>'.length;
            if(attestationData.PFESOUTNANCES.length!==0){
                newLine =
                    `
                    <w:tr>
                        <w:tc>
                            <w:p>
                                <w:pPr>
                                    <w:jc w:val="center"/>
                                </w:pPr>
                                <w:r>
                                    <w:t>Encadrant</w:t>
                                </w:r>
                            </w:p>
                        </w:tc>
                    </w:tr>
                    `;

                attestationData.PFESOUTNANCES.forEach(soutnance=>{
                    let name = soutnance.fullName
                    let projet = soutnance.pfeProject
                    newLine +=`
                        <w:tr>
                            <w:tc>
                                <w:p>
                                    <w:pPr>
                                        <w:jc w:val="center"/>
                                    </w:pPr>
                                    <w:r>
                                        <w:t>${name}</w:t>
                                    </w:r>
                                </w:p>
                            </w:tc>
                            <w:tc>
                                <w:p>
                                    <w:pPr>
                                        <w:jc w:val="center"/>
                                    </w:pPr>
                                    <w:r>
                                        <w:t>${projet}</w:t>
                                    </w:r>
                                </w:p>
                            </w:tc>
                        </w:tr>
                        `;
                })
                if(attestationData.PFEJURYS.length!==0){
                    newLine +=
                        `
                    <w:tr>
                        <w:tc>
                            <w:p>
                                <w:pPr>
                                    <w:jc w:val="center"/>
                                </w:pPr>
                                <w:r>
                                    <w:t>Jury</w:t>
                                </w:r>
                            </w:p>
                        </w:tc>
                    </w:tr>
                    `;

                    attestationData.PFEJURYS.forEach(soutnance=>{
                        let name = soutnance.fullName
                        let projet = soutnance.pfeProject
                        newLine +=`
                        <w:tr>
                            <w:tc>
                                <w:p>
                                    <w:pPr>
                                        <w:jc w:val="center"/>
                                    </w:pPr>
                                    <w:r>
                                        <w:t>${name}</w:t>
                                    </w:r>
                                </w:p>
                            </w:tc>
                            <w:tc>
                                <w:p>
                                    <w:pPr>
                                        <w:jc w:val="center"/>
                                    </w:pPr>
                                    <w:r>
                                        <w:t>${projet}</w:t>
                                    </w:r>
                                </w:p>
                            </w:tc>
                        </w:tr>
                        `;
                    })


                }


                const updatedDocContent = docContent.slice(0, firstRowEndIndex) + newLine + docContent.slice(firstRowEndIndex);
                doc.getZip().file('word/document.xml', updatedDocContent);

            } else {
                if(attestationData.PFEJURYS.length!==0){
                    newLine =
                        `
                    <w:tr>
                        <w:tc>
                            <w:p>
                                <w:pPr>
                                    <w:jc w:val="center"/>
                                </w:pPr>
                                <w:r>
                                    <w:t>Jury</w:t>
                                </w:r>
                            </w:p>
                        </w:tc>
                    </w:tr>
                    `;

                    attestationData.PFEJURYS.forEach(soutnance=>{
                        let name = soutnance.fullName
                        let projet = soutnance.pfeProject
                        newLine +=`
                        <w:tr>
                            <w:tc>
                                <w:p>
                                    <w:pPr>
                                        <w:jc w:val="center"/>
                                    </w:pPr>
                                    <w:r>
                                        <w:t>${name}</w:t>
                                    </w:r>
                                </w:p>
                            </w:tc>
                            <w:tc>
                                <w:p>
                                    <w:pPr>
                                        <w:jc w:val="center"/>
                                    </w:pPr>
                                    <w:r>
                                        <w:t>${projet}</w:t>
                                    </w:r>
                                </w:p>
                            </w:tc>
                        </w:tr>
                        `;
                    })
                    const updatedDocContent = docContent.slice(0, firstRowEndIndex) + newLine + docContent.slice(firstRowEndIndex);
                    doc.getZip().file('word/document.xml', updatedDocContent);


                }

            }


            doc.render();
            const output = doc.getZip().generate({type: 'blob'});
            saveAs(output, 'document_modifie.docx');
        } catch (error) {
            console.error('Erreur lors du remplacement des variables:', error);
        }
    };


    function attestationbtnHandler() {
        if (window.confirm(`Êtes-vous sûr de vouloir télécharger l'attestation?`)) {
            handleAttestation().then(attestationData => {
                setAttestationData(attestationData)
                console.log(attestationData);

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