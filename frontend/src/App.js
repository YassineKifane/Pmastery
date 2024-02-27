import { Container } from 'react-bootstrap';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import NavbarComponent from './components/NavbarComponent';
import CreateScreen from './screens/CreateScreen';
import JoinScreen from './screens/JoinScreen';
import SigninScreen from './screens/SigninScreen';
import StudentJoinForm from './screens/StudentJoinForm';
import SupervisorJoinForm from './screens/SupervisorJoinForm';
import UsersDemandsScreen from './screens/UsersDemandsScreen';
import AdminRoute from './components/AdminRoute';
import ProtectedRoute from './components/ProtectedRoute';
import HomeScreen from './screens/HomeScreen';
import SupervisorsListScreen from './screens/SupervisorsListScreen';
import StudentsListScreen from './screens/StudentsListScreen';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ProfileScreen from './screens/ProfileScreen';
import PfeListScreen from './screens/PfeListScreen';
import PfeChoiceList from './screens/PfeChoiceList';
import SupervisorRoute from './components/SupervisorRoute';
import StudentRoute from './components/StudentRoute';
import PfeDetailsScreen from './screens/PfeDetailsScreen';
import MonPfeStudentScreen from './screens/MonPfeStudentScreen';
import { useContext, useEffect, useState } from 'react';
import { Store } from './Store';
import axios from 'axios';
import { getError } from './utils';
import AssignmentScreen from './screens/AssignmentScreen';
import MesPfeSupervisorScreen from './screens/MesPfeSupervisorScreen';
import axiosInterceptor from './axiosInterceptor';
import SoutenanceScreen from './screens/SoutenanceScreen';
import ArchiveScreen from './screens/ArchiveScreen';
import ResetPasswordScreen from './screens/ResetPasswordScreen';
import LancementSoutenances from './screens/LancementSoutenances';
import StudentDatesChoice from './screens/StudentDatesChoice';
import DateAssignmentScreen from './screens/DateAssignmentScreen';
import MaSoutenanceStudentScreen from './screens/MaSoutenanceStudentScreen';
import MesSoutenancesScreen from './screens/MesSoutenancesScreen';

axiosInterceptor();

function App() {
  const { state } = useContext(Store);

  const { userInfo } = state;
  const [numberOfDemands, setNumberOfDemands] = useState(0);

  useEffect(() => {
    const fetchNumberOfDemands = async () => {
      try {
        const { data } = await axios.get('https://apps.ump.ma:5005/user/nbRequests', {
          params: { affiliationCode: userInfo.affiliationCode },
          headers: { Authorization: `${userInfo.token}` },
        });
        setNumberOfDemands(data);
      } catch (err) {
        toast.error(getError(err));
      }
    };
    if (userInfo) {
      if (userInfo.role === 'ADMIN') fetchNumberOfDemands();
    }
  }, [userInfo]);

  return (
    <BrowserRouter>
      <div className="d-flex flex-column site-container">
        <ToastContainer position="bottom-center" limit={1} />
        <header>
          <NavbarComponent numberOfDemands={numberOfDemands} />
        </header>
        <main>
          <Container fluid="md" className="p-0">
            <Routes>
              {/* <Route path="/" element={<SignupScreen />} /> */}
              <Route path="/" element={<SigninScreen />} />
              <Route path="/resetpassword" element={<ResetPasswordScreen />} />
              <Route path="/create" element={<CreateScreen />} />
              <Route path="/join" element={<JoinScreen />} />
              <Route
                path="/supervisorjoinform"
                element={<SupervisorJoinForm />}
              />
              <Route path="/studentjoinform" element={<StudentJoinForm />} />
              <Route
                path="/usersdemands"
                element={
                  <AdminRoute>
                    <UsersDemandsScreen
                      setNumberOfDemands={setNumberOfDemands}
                    />
                  </AdminRoute>
                }
              />
              <Route
                path="/supervisors-list"
                element={
                  <AdminRoute>
                    <SupervisorsListScreen />
                  </AdminRoute>
                }
              />
              <Route
                path="/student-list"
                element={
                  <AdminRoute>
                    <StudentsListScreen />
                  </AdminRoute>
                }
              />
              <Route
                path="/affectation"
                element={
                  <AdminRoute>
                    <AssignmentScreen />
                  </AdminRoute>
                }
              />
              <Route
                path="/pfe"
                element={
                  <AdminRoute>
                    <PfeListScreen />
                  </AdminRoute>
                }
              />
              <Route
                path="/lancementsoutenance"
                element={
                  <AdminRoute>
                    <LancementSoutenances />
                  </AdminRoute>
                }
              />
              <Route
                path="/dateaffectation"
                element={
                  <AdminRoute>
                    <DateAssignmentScreen />
                  </AdminRoute>
                }
              />
              <Route
                path="/archive"
                element={
                  <SupervisorRoute>
                    <ArchiveScreen />
                  </SupervisorRoute>
                }
              />
              <Route
                path="/list-choix"
                element={
                  <SupervisorRoute>
                    <PfeChoiceList />
                  </SupervisorRoute>
                }
              />
              <Route
                path="/mes-pfe"
                element={
                  <SupervisorRoute>
                    <MesPfeSupervisorScreen />
                  </SupervisorRoute>
                }
              />
              <Route
                path="/messoutenances"
                element={
                  <SupervisorRoute>
                    <MesSoutenancesScreen />
                  </SupervisorRoute>
                }
              />
              <Route
                path="/pfe/:pfeId"
                element={
                  <SupervisorRoute>
                    <PfeDetailsScreen />
                  </SupervisorRoute>
                }
              />
              <Route
                path="/mon-pfe"
                element={
                  <StudentRoute>
                    <MonPfeStudentScreen />
                  </StudentRoute>
                }
              />
              <Route
                path="/studentsoutenancechoice"
                element={
                  <StudentRoute>
                    <StudentDatesChoice />
                  </StudentRoute>
                }
              />
              <Route
                path="/masoutenance"
                element={
                  <StudentRoute>
                    <MaSoutenanceStudentScreen />
                  </StudentRoute>
                }
              />
              <Route
                path="/home"
                element={
                  <ProtectedRoute>
                    <HomeScreen />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/soutenances"
                element={
                  <ProtectedRoute>
                    <SoutenanceScreen />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfileScreen />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Container>
        </main>
        <footer></footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
