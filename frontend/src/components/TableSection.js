import React, {useEffect, useState} from 'react';
import { ExpandableButton } from './ExpandableButton';
import { Button, Col, Container, Row } from 'react-bootstrap';
import useOpenController from '../hooks/useOpenController';
import {Dialog} from "primereact/dialog";
import MessageBox from "./MessageBox";
import axios from "axios";
import { URL } from "../constants/constants";

export const TableSection = ({ user, deleteHandler,currentYear, token}) => {
  const  [detailsVisible,setDetailsVisible]=useState(false)
  const  [result,setResult]=useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await axios.get(`${URL}` + `/pfe/${user.pfe[0].pfeId}`, {
          headers: { Authorization: `${token}` },
        });
        setResult(result.data)
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, [user]);



  return (
      <React.Fragment key={user.userId}>
        <tr>
          <td>{user.lastName}</td>
          <td>{user.firstName}</td>
          <td>{user.email}</td>
          {(user.pfe[0] && user.pfe[0].year === currentYear) && (
              <td>
                <Button
                    type="button"
                    variant="primary"
                    onClick={() => setDetailsVisible(true)}
                >
                  Afficher Pfe
                </Button>
                <Dialog
                    draggable={false}
                    visible={detailsVisible}
                    header={user.lastName + " " + user.firstName}
                    style={{width: '40vw'}}
                    onHide={() => setDetailsVisible(false)}
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
                  <Row>
                    <Col xs={3}>Encadrant:</Col>
                    <Col xs={9}>
                      {result && result.users && result.users.filter((e) => e.role !== 'STUDENT').length > 0 &&
                      result.approved === true ? (
                          result.users
                              .filter((e) => e.role !== 'STUDENT')
                              .map((e) => (
                                  <p key={e.userId}>
                                    <span>{`${e.firstName} ${e.lastName}`}</span>
                                    <br />
                                  </p>
                              ))
                      ) : (
                          <p>
                            Pas d'encadrant pour le moment
                          </p>
                      )}
                    </Col>
                  </Row>
                </Dialog>
              </td>
          )}
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
