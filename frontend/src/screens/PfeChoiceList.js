import Axios from 'axios';
import React, { useEffect, useReducer, useState } from 'react';
import { Store } from '../Store';
import { useContext } from 'react';
import { Helmet } from 'react-helmet-async';
import LoadingBox from '../components/LoadingBox';
import { Button, Col, ListGroup, Row } from 'react-bootstrap';
import MessageBox from '../components/MessageBox';
import PfeItem from '../components/PfeItem';
import { toast } from 'react-toastify';
import { getError } from '../utils';
import { URL } from "../constants";

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        loading: false,
        allPfe: action.payload,
        supervisorChoices: action.choices,
      };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    case 'CHOICE_REQUEST':
      return { ...state, loadingChoice: true, successChoice: false };
    case 'CHOICE_SUCCESS':
      return {
        ...state,
        loadingChoice: false,
        successChoice: true,
      };
    case 'CHOICE_FAIL':
      return { ...state, loadingChoice: false };
    case 'CHOICE_RESET':
      return { ...state, loadingChoice: false, successChoice: false };
    default:
      return state;
  }
};

export default function PfeListScreen() {
  const { state } = useContext(Store);
  const { userInfo } = state;
  const currentYear = new Date().getFullYear();
  const [
    { loading, allPfe, supervisorChoices, error, loadingChoice, successChoice },
    dispatch,
  ] = useReducer(reducer, {
    loading: true,
    error: '',
  });

  const [selectedPfes, setSelectedPfes] = useState([]);
  const [modifyChoice, setModifyChoice] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await Axios.get(URL + '/user/allUsers', {
          headers: { Authorization: `${userInfo.token}` },
          params: {
            affiliationCode: userInfo.affiliationCode,
            isVerified: true,
          },
        });

        dispatch({
          type: 'FETCH_SUCCESS',
          payload: data.filter(
            (e) =>
              e.role === 'STUDENT' &&
              e.pfe[0].year === currentYear &&
              e.pfe[0].approved === false
          ),
          choices: data
            .filter((e) => e.userId === userInfo.userId)[0]
            .pfe.filter((e) => e.year === currentYear && e.approved === false),
        });
        setModifyChoice(
          !(
            data
              .filter((e) => e.userId === userInfo.userId)[0]
              .pfe.filter((e) => e.year === currentYear && e.approved === false)
              .length > 0
          )
        );
        // console.log(data.filter((e) => e.userId === userInfo.userId)[0].pfe);
        // console.log(data);
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: err });
        console.log(err);
      }
    };
    if (successChoice) {
      dispatch({ type: 'CHOICE_RESET' });
    } else {
      fetchData();
    }
  }, [userInfo, successChoice, currentYear]);

  const submitHandler = async () => {
    if (selectedPfes.length === 0) {
      toast.error('Aucun choix sélectionnée');
      return;
    }
    try {
      dispatch({ type: 'CHOICE_REQUEST' });
      await Axios.put(
        URL + `/user/selectPfe/${userInfo.userId}`,
        { userId: userInfo.userId },
        {
          headers: { Authorization: `${userInfo.token}` },
          params: {
            pfeId: selectedPfes,
          },
          paramsSerializer: { indexes: null },
        }
      );
      // console.log(result.data);
      setSelectedPfes([]);
      dispatch({ type: 'CHOICE_SUCCESS' });
      toast.success('Votre choix a été envoyé');
    } catch (err) {
      toast.error(getError(err));
      dispatch({ type: 'CHOICE_FAIL' });
    }
  };
  return (
    <div className="p-5">
      <Helmet>
        <title>Choix d'encadrement</title>
      </Helmet>
      <Row>
        <Col>
          <h4>Listes des PFEs</h4>
        </Col>
        <Col className="text-end">
          <h4>{currentYear}</h4>
        </Col>
      </Row>
      {loadingChoice && <LoadingBox />}
      {loading ? (
        <LoadingBox />
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        <>
          <Row>
            <Col xs={12} className="text-end">
              <h6>Nombre de sujets: {allPfe.length} </h6>
            </Col>
            <Col xs={12} className="text-end">
              <h6>Nombre de sujets choisis: {supervisorChoices.length} </h6>
            </Col>
          </Row>
          {allPfe.length > 0 ? (
            <>
              <Row className={modifyChoice ? 'd-none' : 'd-block'}>
                <h5>Vos sujets choisis</h5>
                <ListGroup className="p-0 mt-3">
                  {supervisorChoices.map((choice) => (
                    <ListGroup.Item key={choice.pfeId} className="p-3">
                      <Row>
                        <Col sm={10}>
                          <h5>Sujet: {choice.subject}</h5>
                          <p>
                            <strong>Les technologies utilisées: </strong>
                            {choice.usedTechnologies}
                          </p>
                        </Col>
                      </Row>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
                <Button
                  className="mt-3"
                  onClick={() => {
                    setModifyChoice(true);
                    setSelectedPfes(
                      supervisorChoices.map((choice) => choice.pfeId)
                    );
                  }}
                >
                  Modifier votre choix
                </Button>
              </Row>
              <Row
                className={
                  modifyChoice ? 'd-flex justify-content-center' : 'd-none'
                }
              >
                {supervisorChoices.length > 0 ? (
                  <Row>
                    <h5>Modifier votre choix</h5>
                  </Row>
                ) : (
                  <Row>
                    <h5>Faites votre choix de sujets à encadrer</h5>
                  </Row>
                )}
                <Row>
                  <ListGroup className="p-0 mt-3">
                    {allPfe.map((pfeDetails) => (
                      <PfeItem
                        key={pfeDetails.pfe[0].pfeId}
                        pfeDetails={pfeDetails}
                        selectedPfes={selectedPfes}
                        setSelectedPfes={setSelectedPfes}
                      />
                    ))}
                  </ListGroup>
                  <div className="p-2">
                    <Row>
                      <Col>
                        <Button
                          className="w-100 bg-success"
                          type="submit"
                          onClick={submitHandler}
                        >
                          Valider le choix
                        </Button>
                      </Col>

                      {supervisorChoices.length > 0 && (
                        <Col>
                          <Button
                            className="w-100 bg-danger"
                            onClick={() => {
                              setSelectedPfes(
                                supervisorChoices.map((choice) => choice.pfeId)
                              );
                              setModifyChoice(false);
                            }}
                          >
                            Annuler la modification
                          </Button>
                        </Col>
                      )}
                    </Row>
                  </div>
                </Row>
              </Row>
            </>
          ) : (
            <MessageBox>Pas de sujets disponibles pour le moment</MessageBox>
          )}
        </>
      )}
    </div>
  );
}
