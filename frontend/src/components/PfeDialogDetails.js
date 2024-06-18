import {Col, ListGroup, Row} from "react-bootstrap";
import {Dialog} from "primereact/dialog";
import React from "react";


export default function PfeDialogDetails({student, pfeDetails,visible,setVisible}){
    return(
        <Dialog
            header={pfeDetails.subject}
            visible={visible}
            style={{ width: '50vw' }}
            onHide={() => setVisible(false)}
            draggable={false}
        >
            <Row>
                <ListGroup variant="flush">
                    <ListGroup.Item>
                        <p>
                            <strong>Les technologies utilisées: </strong>
                            {pfeDetails.usedTechnologies}
                        </p>
                    </ListGroup.Item>
                    <ListGroup.Item>
                        <strong>Informations de l'étudiant:</strong>
                        <Row>
                            <Row>
                                <Col>Nom: {student.lastName}</Col>
                            </Row>
                            <Row>
                                <Col>Prénom: {student.firstName}</Col>
                            </Row>
                            <Row>
                                <Col>Email: {student.email}</Col>
                            </Row>
                        </Row>
                    </ListGroup.Item>

                    <ListGroup.Item>
                        <strong>Informations du stage:</strong>
                        <Row>
                            <Row>
                                <Col>Entreprise: {pfeDetails.company}</Col>
                            </Row>
                            <Row>
                                <Col>Ville: {pfeDetails.city}</Col>
                            </Row>
                            <Row>
                                <Col>
                                    Email d'encadrant du stage:{' '}
                                    {pfeDetails.supervisorEmail}
                                </Col>
                            </Row>
                        </Row>
                    </ListGroup.Item>
                </ListGroup>
            </Row>
        </Dialog>
    );
}