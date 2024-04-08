import React, {useState} from 'react';
import { ExpandableButton } from './ExpandableButton';
import { Button, Col, Container, Row } from 'react-bootstrap';
import useOpenController from '../hooks/useOpenController';
import {Dialog} from "primereact/dialog";

export const TableSection = ({ user, deleteHandler }) => {
  const  [detailsVisible,setDetailsVisible]=useState(false)
  return (
    <React.Fragment key={user.userId}>
      <tr>
        <td>{user.lastName}</td>
        <td>{user.firstName}</td>
        <td>{user.email}</td>
        <td>
          <Button
              type="button"
              variant="primary"
              onClick={()=>setDetailsVisible(true)}
          >
            Afficher Pfe
          </Button>
          <Dialog
              draggable={false}
              visible={detailsVisible}
              header={user.lastName + " " + user.firstName}
              style={{width: '40vw'}}
              onHide={()=>setDetailsVisible(false)}
          >
            <Row>
              <Col xs={3}>Sujet:</Col>
              <Col xs={9}>{user.pfe[0].subject}</Col>
            </Row>
            <Row>
              <Col xs={3}>Entreprise:</Col>
              <Col xs={9}>{user.pfe[0].company}</Col>
            </Row>
            <Row>
              <Col xs={3}>Ville:</Col>
              <Col xs={9}>{user.pfe[0].city}</Col>
            </Row>
          </Dialog>
        </td>
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
    </React.Fragment>
  );
};
