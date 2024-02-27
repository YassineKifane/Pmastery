import React from 'react';
import { Button, Card, Col, Container, Row } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import { LinkContainer } from 'react-router-bootstrap';
import supervisorImg from '../assets/images/supervisorBoard.svg';
import studentImg from '../assets/images/student.svg';
import headOfDepartment from '../assets/images/headOfDepartment.svg';
import { Divider } from 'primereact/divider';

export default function JoinScreen() {
  return (
    <div className="joinScreen">
      <Helmet>
        <title>Join</title>
      </Helmet>
      <Container fluid className="p-5">
        <h1>S'inscrire</h1>
        <Row>
          <LinkContainer to="/create">
            <Col xs={12} lg={4} className="mb-2 mb-lg-0">
              <Card className="text-dark">
                <Card.Img src={headOfDepartment} alt="supervisor image" />
                <Card.ImgOverlay className="d-flex justify-content-center align-items-center">
                  <Card.Title>Chef de filière</Card.Title>
                </Card.ImgOverlay>
              </Card>
            </Col>
          </LinkContainer>
          <LinkContainer to="/supervisorjoinform">
            <Col xs={12} lg={4} className="mb-2 mb-lg-0">
              <Card className="text-dark">
                <Card.Img src={supervisorImg} alt="supervisor image" />
                <Card.ImgOverlay className="d-flex justify-content-center align-items-center">
                  <Card.Title>Encadrant</Card.Title>
                </Card.ImgOverlay>
              </Card>
            </Col>
          </LinkContainer>
          <LinkContainer to="/studentjoinform">
            <Col xs={12} lg={4}>
              <Card className="text-dark">
                <Card.Img src={studentImg} alt="student image" />
                <Card.ImgOverlay className="d-flex justify-content-center align-items-center">
                  <Card.Title>Etudiant</Card.Title>
                </Card.ImgOverlay>
              </Card>
            </Col>
          </LinkContainer>
        </Row>
        <Divider align="center" className="hidden md:flex">
          <b>Déjà inscrit</b>
        </Divider>
        <Row>
          <div className='d-flex align-items-center justify-content-center'>
            <LinkContainer to="/">
              <Button className="ps-5 pe-5 btnStyle" size="lg">
                Se connecter
              </Button>
            </LinkContainer>
          </div>
        </Row>
      </Container>
    </div>
  );
}
