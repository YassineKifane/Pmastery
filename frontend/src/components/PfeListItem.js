import React, { useEffect, useState } from 'react';
import {
  Button,
  Col,
  ListGroup,
  Row,
  ToggleButton,
  ToggleButtonGroup,
} from 'react-bootstrap';
import MessageBox from './MessageBox';
import { toast } from 'react-toastify';
import axios from 'axios';
import { getError } from '../utils';
import LoadingBox from './LoadingBox';
import { URL } from "../constants/constants";


export default function PfeListItem(props) {
  const {
    allPfe,
    setPfeSelectedAction,
    pfeSelectedAction,
    supervisors,
    dispatch,
    userInfo,
    loadingAssignment,
  } = props;
  const [modifySupervisor, setModifySupervisor] = useState(false);
  const [value, setValue] = useState([]);
  const handleChange = (val) => setValue(val);

  useEffect(() => {
    setModifySupervisor(false);
    setValue([]);

    setPfeSelectedAction(
      allPfe.find((p) => p.pfeId === pfeSelectedAction.pfeId)
    );
  }, [pfeSelectedAction, allPfe, setPfeSelectedAction]);

  const submitHandler = async () => {
    if (value.length === 0) {
      toast.error('Aucun encadrant sélectionnée');
      return;
    }
    try {
      dispatch({ type: 'ASSIGNMENT_REQUEST' });
      await axios.put(
        `${URL}/pfe/approve/${pfeSelectedAction.pfeId}`,
        {},
        {
          headers: { Authorization: `${userInfo.token}` },
          params: {
            pfeId: pfeSelectedAction.pfeId,
            userIds: value,
          },
          paramsSerializer: { indexes: null },
        }
      );
      dispatch({ type: 'ASSIGNMENT_SUCCESS' });
    } catch (err) {
      toast.error(getError(err));
      dispatch({ type: 'ASSIGNMENT_FAIL' });
    }
  };
  return (
    <ListGroup variant="flush sticky-top removeZindex">
      <ListGroup.Item>
        <h5>Sujet: {pfeSelectedAction.subject}</h5>
        <p>Les technologies utilisées: {pfeSelectedAction.usedTechnologies}</p>
      </ListGroup.Item>
      <ListGroup.Item>
        <strong>Informations de l'étudiant:</strong>
        <Row>
          <Row>
            <Col>
              Nom:{' '}
              {
                pfeSelectedAction.users.find((e) => e.role === 'STUDENT')
                  .lastName
              }
            </Col>
          </Row>
          <Row>
            <Col>
              Prénom:{' '}
              {
                pfeSelectedAction.users.find((e) => e.role === 'STUDENT')
                  .firstName
              }
            </Col>
          </Row>
          <Row>
            <Col>
              Email:{' '}
              {pfeSelectedAction.users.find((e) => e.role === 'STUDENT').email}
            </Col>
          </Row>
        </Row>
      </ListGroup.Item>
      <ListGroup.Item>
        <strong>Informations du stage:</strong>
        <Row>
          <Row>
            <Col>Entreprise: {pfeSelectedAction.company}</Col>
          </Row>
          <Row>
            <Col>Ville: {pfeSelectedAction.city}</Col>
          </Row>
          <Row>
            <Col>
              Email d'encadrant du stage: {pfeSelectedAction.supervisorEmail}
            </Col>
          </Row>
        </Row>
      </ListGroup.Item>
      <ListGroup.Item>
        <strong>Les encadrants:</strong>
        <Row>
          {pfeSelectedAction.users.filter((e) => e.role !== 'STUDENT').length >
            0 && pfeSelectedAction.approved === true ? (
            <>
              <div>
                {pfeSelectedAction.users
                  .filter((e) => e.role !== 'STUDENT')
                  .map((e) => (
                    <span
                      key={e.userId}
                      className={modifySupervisor ? 'bg-warning ps-2 pe-2' : ''}
                    >
                      <span>{`${e.firstName} ${e.lastName}`}</span>
                      <br />
                    </span>
                  ))}
              </div>
              <div className={modifySupervisor ? 'd-none' : 'd-block mt-2'}>
                <Button onClick={() => setModifySupervisor(true)}>
                  Changer l'encadrant
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="mt-2">
                <MessageBox variant="danger">
                  Aucun encadrant affecter à ce sujet
                </MessageBox>
              </div>
              <div className={modifySupervisor ? 'd-none' : 'd-block'}>
                <Button onClick={() => setModifySupervisor(true)}>
                  Affecter un encadrant
                </Button>
              </div>
            </>
          )}
        </Row>
        <Row className={modifySupervisor ? 'd-block pt-2 pb-2' : 'd-none'}>
          <Col>
            <strong>
              {pfeSelectedAction.approved === true
                ? "Changer l'encadrant pour ce sujet"
                : 'Affecter un encadrant à ce sujet'}
            </strong>
            {loadingAssignment ? (
              <LoadingBox />
            ) : (
              <>
                <div className="supervisorsList mt-2">
                  <ToggleButtonGroup
                    className="w-100"
                    vertical
                    type="checkbox"
                    value={value}
                    onChange={handleChange}
                  >
                    {supervisors.map((e) => (
                      <ToggleButton
                        variant="light"
                        className="text-start"
                        key={e.userId}
                        id={e.userId}
                        value={e.userId}
                      >
                        {`${e.firstName} ${e.lastName}`}
                      </ToggleButton>
                    ))}
                  </ToggleButtonGroup>
                </div>
                <div className="mt-2">
                  <Button className="bg-success me-2" onClick={submitHandler}>
                    {pfeSelectedAction.approved === true
                      ? 'Modifier'
                      : 'Affecter'}
                  </Button>
                  <Button
                    className="bg-danger"
                    onClick={() => {
                      setModifySupervisor(false);
                      setValue([]);
                    }}
                  >
                    Annuler
                  </Button>
                </div>
              </>
            )}
          </Col>
        </Row>
      </ListGroup.Item>
    </ListGroup>
  );
}
