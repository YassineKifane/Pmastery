import React, { useContext } from 'react';
import { Badge, Container, Nav, Navbar, NavDropdown } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import PMasteryLogo from '../assets/logo/PMastery_text.png';
import { Store } from '../Store';

export default function NavbarComponent(props) {
  const location = useLocation();
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { userInfo } = state;
  const { numberOfDemands } = props;
  const signoutHandler = () => {
    ctxDispatch({ type: 'USER_SIGNOUT' });
    localStorage.removeItem('userInfo');
    window.location.href = '/';
  };

  return (
    <>
      <Navbar expand="lg" bg="light" className="navBarStyle" variant="dark">
        <Container>
          <LinkContainer to="/">
            <Navbar.Brand>
              <img
                alt="PMasteryLogo"
                src={PMasteryLogo}
                width="150px"
                height="auto"
                className="d-inline-block align-top"
              />
            </Navbar.Brand>
          </LinkContainer>
          <Navbar.Toggle aria-controls="basic-navbar-nav">
            <i className="pi pi-bars"></i>
          </Navbar.Toggle>
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto  w-100  justify-content-end">
              {userInfo ? (
                <NavDropdown
                  title={
                    <span>
                      <i
                        className="pi pi-user"
                        style={{ color: '#708090' }}
                      ></i>{' '}
                      {`${userInfo.firstName} ${userInfo.lastName}`}
                    </span>
                  }
                  id="basic-nav-dropdown"
                >
                  <LinkContainer to="/profile">
                    <NavDropdown.Item>Profile</NavDropdown.Item>
                  </LinkContainer>
                  <NavDropdown.Divider />
                  <Link
                    className="dropdown-item"
                    to="#signout"
                    onClick={signoutHandler}
                  >
                    Se déconnecter
                  </Link>
                </NavDropdown>
              ) : location.pathname === '/' ? (
                <Link className="nav-link" to="/join">
                  S'inscrire
                </Link>
              ) : (
                <Link className="nav-link" to="/">
                  Se connecter
                </Link>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      {userInfo && (
        <>
          <Navbar expand="lg" className="userNavBarStyle" variant="dark">
            <Container>
              <Navbar.Toggle className="w-100" aria-controls="user-navbar-nav">
                <i className="pi pi-arrow-circle-down"></i>
              </Navbar.Toggle>
              <Navbar.Collapse id="user-navbar-nav">
                <Nav className="text-center w-100 d-flex justify-content-center">
                  <Nav.Item className="ms-3 me-3">
                    <LinkContainer to="/home">
                      <Nav.Link>Accueil</Nav.Link>
                    </LinkContainer>
                  </Nav.Item>
                  {userInfo.role === 'ADMIN' && (
                    <>
                      <Nav.Item className="ms-3 me-3">
                        <LinkContainer to="/usersdemands">
                          <Nav.Link>
                            Demandes{' '}
                            {numberOfDemands > 0 && (
                              <Badge pill className="bg-danger">
                                {numberOfDemands}
                              </Badge>
                            )}
                          </Nav.Link>
                        </LinkContainer>
                      </Nav.Item>
                      <Nav.Item className="ms-3 me-3">
                        <LinkContainer to="/supervisors-list">
                          <Nav.Link>Encadrants</Nav.Link>
                        </LinkContainer>
                      </Nav.Item>
                      <Nav.Item className="ms-3 me-3">
                        <LinkContainer to="/student-list">
                          <Nav.Link>Étudiants</Nav.Link>
                        </LinkContainer>
                      </Nav.Item>
                    </>
                  )}
                  {userInfo.role === 'STUDENT' ? (
                    <Nav.Item className="ms-3 me-3">
                      <LinkContainer to="/mon-pfe">
                        <Nav.Link>Mon-PFE</Nav.Link>
                      </LinkContainer>
                    </Nav.Item>
                  ) : (
                    <>
                      <NavDropdown title="PFE" id="basic-nav-dropdown">
                        <LinkContainer to="/list-choix">
                          <NavDropdown.Item>
                            Choix d'encadrement
                          </NavDropdown.Item>
                        </LinkContainer>
                        {userInfo.role === 'ADMIN' && (
                          <>
                            <LinkContainer to="/pfe">
                              <NavDropdown.Item>PFE</NavDropdown.Item>
                            </LinkContainer>
                            <LinkContainer to="/affectation">
                              <NavDropdown.Item>Affectation</NavDropdown.Item>
                            </LinkContainer>
                          </>
                        )}
                        <LinkContainer to="/mes-pfe">
                          <NavDropdown.Item>Mes-PFE</NavDropdown.Item>
                        </LinkContainer>
                      </NavDropdown>
                    </>
                  )}
                  {userInfo.role === 'ADMIN' ? (
                    <>
                      <NavDropdown title="Soutenances" id="basic-nav-dropdown">
                        <LinkContainer to="/lancementsoutenance">
                          <NavDropdown.Item>Lancement</NavDropdown.Item>
                        </LinkContainer>
                        <LinkContainer to="/dateaffectation">
                          <NavDropdown.Item>
                            Affectation des dates
                          </NavDropdown.Item>
                        </LinkContainer>
                        <LinkContainer to="/soutenances">
                          <NavDropdown.Item>Soutenances</NavDropdown.Item>
                        </LinkContainer>
                        <LinkContainer to="/messoutenances">
                          <NavDropdown.Item>Mes soutenances</NavDropdown.Item>
                        </LinkContainer>
                      </NavDropdown>
                    </>
                  ) : userInfo.role === 'STUDENT' ? (
                    <>
                      <NavDropdown title="Soutenance" id="basic-nav-dropdown">
                        <LinkContainer to="/studentsoutenancechoice">
                          <NavDropdown.Item>Choix des dates</NavDropdown.Item>
                        </LinkContainer>
                        <LinkContainer to="/masoutenance">
                          <NavDropdown.Item>Ma soutenance</NavDropdown.Item>
                        </LinkContainer>
                      </NavDropdown>
                    </>
                  ) : (
                    <Nav.Item className="ms-3 me-3">
                      <LinkContainer to="/messoutenances">
                        <Nav.Link>Mes Soutenances</Nav.Link>
                      </LinkContainer>
                    </Nav.Item>
                  )}
                  {userInfo.role !== 'STUDENT' && (
                    <Nav.Item className="ms-3 me-3">
                      <LinkContainer to="/archive">
                        <Nav.Link>Archive</Nav.Link>
                      </LinkContainer>
                    </Nav.Item>
                  )}
                </Nav>
              </Navbar.Collapse>
            </Container>
          </Navbar>
        </>
      )}
    </>
  );
}
