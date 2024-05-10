import React, { useEffect, useState } from 'react';
import { Button, Col, ListGroup, Row } from 'react-bootstrap';
import { Dialog } from 'primereact/dialog';
import PfeDialogDetails from "./PfeDialogDetails";

function PfeItem({ pfeDetails, selectedPfes, setSelectedPfes }) {
  const [visible, setVisible] = useState(false);
  const [pfeChecked, setPfeChecked] = useState();
  useEffect(() => {
    setPfeChecked(selectedPfes.includes(pfeDetails.pfe[0].pfeId));
  }, [selectedPfes, pfeDetails]);

  const addPfeToChoices = (pfeId) => {
    const newPfeChoices = [...selectedPfes, pfeId];
    setSelectedPfes(newPfeChoices);
    setPfeChecked(true);
  };

  const remPfeFromChoices = (pfeId) => {
    const newSelectedPfes = selectedPfes.filter((e) => e !== pfeId);
    setSelectedPfes(newSelectedPfes);
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
          <PfeDialogDetails
              visible={visible}
              setVisible={setVisible}
              pfeDetails={pfeDetails}
          />
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
