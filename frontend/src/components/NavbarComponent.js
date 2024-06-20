
import React, { useContext, useEffect, useState } from 'react';
import { Navbar, Nav, NavDropdown, Container, Badge } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { Store } from '../Store';
import { URL } from "../constants/constants";
import { Link, useLocation } from 'react-router-dom';
import PMasteryLogo from '../assets/logo/PMasteryv2.png';
import axios from 'axios';

export default function NavbarComponent(props) {
    const location = useLocation();
    const { state, dispatch: ctxDispatch } = useContext(Store);
    const { userInfo } = state;
    const { numberOfDemands, numberOfNotifications , markNotificationsAsRead } = props;
    const [hasPFE, setHasPFE] = useState(false);
    const [hasSoutnance, setHasSoutnance] = useState(false);
    const [existSoutnance, setExistSoutnance] = useState(false);
    const [existSoutnancePropDates, setExistSoutnancePropDates] = useState(false);
    const [existSoutnanceAndPublish, setExistSoutnanceAndPublish] = useState(false);
    const [affectedDate, setAffectedDate] = useState(false);
    const [isUserJuryMember, setIsUserJuryMember] = useState(false);
    const [hasSupervisor, setHasSupervisor] = useState(false);


    useEffect(() => {
        console.log("existSoutnancePropDates changed:", existSoutnancePropDates);
        const fetchHasPfeData = async () => {
            try {
                const hasPFEResponse = await axios.get(`${URL}/pfe/hasPFE`, {
                    params: { userId: userInfo.userId },
                    headers: { Authorization: `${userInfo.token}` },
                });
                const hasPFEValue = hasPFEResponse.data;
                setHasPFE(hasPFEValue);
                console.log(userInfo.pfe[0].pfeId)
                console.log("has pfe: "+hasPFEValue);

                if (hasPFEValue) {
                    const hasSupervisorResponse = await axios.get(`${URL}/pfe/hasSupervisorEmail`, {
                        params: { pfeId: userInfo.pfe[0].pfeId },
                        headers: { Authorization: `${userInfo.token}` },
                    });
                    const hasSupervisorValue = hasSupervisorResponse.data;
                    setHasSupervisor(hasSupervisorValue);
                }

            } catch (err) {
                console.error(err);
            }
        };

        const fetchExistSoutnanceAndPublishData = async () => {
            try {
                const response = await axios.get(`${URL}/soutnance/exists/${userInfo.userId}/true`, {
                    headers: { Authorization: userInfo.token },
                });
                setExistSoutnanceAndPublish(response.data);                
                console.log("exist soutnance and publish: " + response.data);
            } catch (error) {
                console.error('Une erreur s\'est produite lors de la récupération des données:', error);
            }
        };  
        
        const fetchExistSoutnanceAndPropDatesData = async () => {
            try {
                const response = await axios.get(`${URL}/soutnance/exists/${userInfo.userId}/hasPropositionDates`, {
                    headers: { Authorization: userInfo.token },
                });
                setExistSoutnancePropDates(response.data);                
                console.log("exist soutnance and proposition dates : " + response.data);
            } catch (error) {
                console.error('Une erreur s\'est produite lors de la récupération des données:', error);
            }
        };
          
        const fetchExistSoutnanceAffectedDateData = async () => {
            try {
                const response = await axios.get(`${URL}/soutnance/exists/${userInfo.userId}/hasAffectedDate`, {
                    headers: { Authorization: userInfo.token },
                });
                setAffectedDate(response.data);                
                console.log("exist soutnance and affected : " + response.data);
            } catch (error) {
                console.error('Une erreur s\'est produite lors de la récupération des données:', error);
            }
        };

        const fetchIsUserJuryMember = async () => {
            try {
                const response = await axios.get(`${URL}/soutnance/exists/${userInfo.firstName + ' ' + userInfo.lastName}/isUserJuryMember`, {
                    headers: { Authorization: userInfo.token },
                });
                setIsUserJuryMember(response.data);                
                console.log("user in jury member : " + response.data);
            } catch (error) {
                console.error('Une erreur s\'est produite lors de la récupération des données:', error);
            }
        };


        const fetchExistSoutnanceData = async () => {
            try {
                const response = await axios.get(`${URL}/soutnance/exists`, {
                    headers: { Authorization: userInfo.token },
                });
                setExistSoutnance(response.data);
                console.log("exist soutnance: " + response.data);
            } catch (error) {
                console.error('Une erreur s\'est produite lors de la récupération des données:', error);
            }
        };     
        fetchHasPfeData();
        fetchExistSoutnanceAndPropDatesData();
        fetchExistSoutnanceAndPublishData();
        fetchExistSoutnanceData();
        fetchExistSoutnanceAffectedDateData();
        fetchIsUserJuryMember();

    }, [userInfo,existSoutnancePropDates]);


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
                          className="pi pi-user me-1"
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
            {userInfo &&(
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
                                    {userInfo.role === 'STUDENT'  ? (
                                        hasPFE ?  (
                                            <NavDropdown title="PFE" id="basic-nav-dropdown">
                                                <LinkContainer to="/mon-pfe">
                                                    <NavDropdown.Item>Mon-PFE</NavDropdown.Item>
                                                </LinkContainer>

                                                {hasSupervisor && (
                                                    <LinkContainer to="/suivi-pfe">
                                                        <NavDropdown.Item onClick={markNotificationsAsRead}>
                                                            Suivi Mon PFE{' '}
                                                            {numberOfNotifications > 0 && (
                                                                <Badge pill className="bg-danger">
                                                                    {numberOfNotifications}
                                                                </Badge>
                                                            )}
                                                        </NavDropdown.Item>
                                                    </LinkContainer>
                                                )}
                                            </NavDropdown>
                                        ) : (
                                            ' '
                                        )
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
                                                <LinkContainer to="/suivi-pfe">
                                                    <NavDropdown.Item onClick={props.markNotificationsAsRead}>
                                                        Suivi Mes PFE{' '}
                                                        {numberOfNotifications > 0 && (
                                                            <Badge pill className="bg-danger">
                                                                {numberOfNotifications}
                                                            </Badge>
                                                        )}
                                                    </NavDropdown.Item>
                                                </LinkContainer>
                                                {userInfo.role === 'ADMIN' && (
                                                <LinkContainer to="/fiches-de-stages">
                                                    <NavDropdown.Item>
                                                        Fiches de stages
                                                    </NavDropdown.Item>
                                                </LinkContainer>
                                                )}
                                            </NavDropdown>
                                        </>
                                    )}
                                    {userInfo.role === 'ADMIN' ? (
                                         <>
                                         {existSoutnance ? (
                                             <NavDropdown title="Soutenances" id="basic-nav-dropdown">
                                                 <LinkContainer to="/lancementsoutenance">
                                                     <NavDropdown.Item>Lancement</NavDropdown.Item>
                                                 </LinkContainer>
                                                 <LinkContainer to="/dateaffectation">
                                                     <NavDropdown.Item>Affectation des dates</NavDropdown.Item>
                                                 </LinkContainer>
                                                 <LinkContainer to="/soutenances">
                                                     <NavDropdown.Item>Soutenances</NavDropdown.Item>
                                                 </LinkContainer>
                                                 {isUserJuryMember && (
                                                     <LinkContainer to="/messoutenances">
                                                         <NavDropdown.Item>Mes soutenances</NavDropdown.Item>
                                                     </LinkContainer>
                                                 )}
                                             </NavDropdown>
                                         ) : (
                                             <NavDropdown title="Soutenances" id="basic-nav-dropdown">
                                                 <LinkContainer to="/lancementsoutenance">
                                                     <NavDropdown.Item>Lancement</NavDropdown.Item>
                                                 </LinkContainer>
                                             </NavDropdown>
                                         )}
                                     </>
                                    ) : (
                                        <>
                                        {userInfo.role === 'STUDENT' && existSoutnance ? (
                                            (!existSoutnancePropDates && !existSoutnanceAndPublish) || (existSoutnancePropDates && existSoutnanceAndPublish) ? (
                                                <NavDropdown title="Soutenance" id="basic-nav-dropdown">
                                                    {!affectedDate && (
                                                        <LinkContainer to="/studentsoutenancechoice">
                                                            <NavDropdown.Item>Choix des dates</NavDropdown.Item>
                                                        </LinkContainer>
                                                    )}
                                                    {affectedDate && (
                                                        <LinkContainer to="/masoutenance">
                                                            <NavDropdown.Item>Ma soutenance</NavDropdown.Item>
                                                        </LinkContainer>
                                                    )}
                                                </NavDropdown>
                                            ) : (
                                                <></>
                                            )
                                        ) : (
                                            isUserJuryMember && (
                                                <Nav.Item className="ms-3 me-3">
                                                    <LinkContainer to="/messoutenances">
                                                        <Nav.Link>Mes Soutenances</Nav.Link>
                                                    </LinkContainer>
                                                </Nav.Item>
                                            )
                                        )}
                                    </>
                                                                                               
                                    )}
                                    {userInfo.role === 'ADMIN' && (
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