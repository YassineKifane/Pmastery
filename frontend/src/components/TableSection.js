import React from 'react';
import { ExpandableButton } from './ExpandableButton';
import { Button, Col, Container, Row } from 'react-bootstrap';
import useOpenController from '../hooks/useOpenController';

export const TableSection = ({ user, deleteHandler }) => {
  deleteHandler && console.log("salma")
  const { isOpen, toggle } = useOpenController(false);
  return (
    <React.Fragment key={user.userId}>
      <tr>
        <td>
          <ExpandableButton isOpen={isOpen} toggle={toggle} />
        </td>
        <td>{user.lastName}</td>
        <td>{user.firstName}</td>
        <td>{user.email}</td>
        {deleteHandler &&
        <td>
          <Button
            type="button"
            variant="danger"
            onClick={() => deleteHandler(user)}
          >
            Supprimer
          </Button>
        </td>
        }
      </tr>
      {isOpen && (
        <tr className="bg-light">
          <td></td>
          <td colSpan={4}>
            <Container fluid>
              <Row>
                <Col xs={2}>Sujet:</Col>
                <Col xs={10}>{user.pfe[0].subject}</Col>
              </Row>
              <Row>
                <Col xs={2}>Entreprise:</Col>
                <Col xs={10}>{user.pfe[0].company}</Col>
              </Row>
              <Row>
                <Col xs={2}>Ville:</Col>
                <Col xs={10}>{user.pfe[0].city}</Col>
              </Row>
            </Container>
          </td>
        </tr>
      )}
    </React.Fragment>
  );
};
