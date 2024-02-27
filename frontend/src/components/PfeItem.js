import React, { useEffect, useState } from 'react';
import { Button, Col, ListGroup, Row } from 'react-bootstrap';
import { Dialog } from 'primereact/dialog';

function PfeItem(props) {
  const { pfeDetails, selectedPfes, setSelectedPfes } = props;
  const [visible, setVisible] = useState(false);
  const [pfeChecked, setPfeChecked] = useState();

  useEffect(() => {
    setPfeChecked(selectedPfes.includes(pfeDetails.pfe[0].pfeId));
  }, [selectedPfes, pfeDetails]);

  const addPfeToChoices = (pfeId) => {
    const newPfeChoisces = [...selectedPfes, pfeId];
    setSelectedPfes(newPfeChoisces);
    setPfeChecked(true);
  };

  const remPfeFromChoices = (pfeId) => {
    const newselectedPfes = selectedPfes.filter((e) => e !== pfeId);
    setSelectedPfes(newselectedPfes);
    setPfeChecked(false);
  };
  return (
    <ListGroup.Item className={pfeChecked ? 'bg-light p-3' : 'p-3'}>
      <Row>
        <Col sm={10}>
          <h5>Sujet: {pfeDetails.pfe[0].subject}</h5>
          <p>
            <span>
              <strong>Etudiant: </strong>
              {`${pfeDetails.firstName} ${pfeDetails.lastName}`}
            </span>
            <br />
            <span>
              <strong>Les technologies utilisées: </strong>
              {pfeDetails.pfe[0].usedTechnologies}
            </span>
          </p>
          <Button onClick={() => setVisible(true)}>Details</Button>
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
        </Col>
        <Col
          sm={2}
          className="d-flex align-items-center justify-content-center"
        >
          <Button
            className={pfeChecked ? 'bg-success' : 'bg-white'}
            onClick={
              pfeChecked
                ? () => remPfeFromChoices(pfeDetails.pfe[0].pfeId)
                : () => addPfeToChoices(pfeDetails.pfe[0].pfeId)
            }
          >
            <i className="pi pi-check"></i>
          </Button>
        </Col>
      </Row>
    </ListGroup.Item>
  );
}

export default PfeItem;
