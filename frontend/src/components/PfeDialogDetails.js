import {Col, ListGroup, Row} from "react-bootstrap";
import {Dialog} from "primereact/dialog";
import React from "react";


export default function PfeDialogDetails({pfeDetails,visible,setVisible}){
    return(
        <Dialog
            header={pfeDetails.pfe[0].subject}
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
                            {pfeDetails.pfe[0].usedTechnologies}
                        </p>
                    </ListGroup.Item>
                    <ListGroup.Item>
                        <strong>Informations de l'étudiant:</strong>
                        <Row>
                            <Row>
                                <Col>Nom: {pfeDetails.lastName}</Col>
                            </Row>
                            <Row>
                                <Col>Prénom: {pfeDetails.firstName}</Col>
                            </Row>
                            <Row>
                                <Col>Email: {pfeDetails.email}</Col>
                            </Row>
                        </Row>
                    </ListGroup.Item>
                    <ListGroup.Item>
                        <strong>Informations du stage:</strong>
                        <Row>
                            <Row>
                                <Col>Entreprise: {pfeDetails.pfe[0].company}</Col>
                            </Row>
                            <Row>
                                <Col>Ville: {pfeDetails.pfe[0].city}</Col>
                            </Row>
                            <Row>
                                <Col>
                                    Email d'encadrant du stage:{' '}
                                    {pfeDetails.pfe[0].supervisorEmail}
                                </Col>
                            </Row>
                        </Row>
                    </ListGroup.Item>
                </ListGroup>
            </Row>
        </Dialog>
    );
}