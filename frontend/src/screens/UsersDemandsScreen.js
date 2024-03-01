import Axios from 'axios';
import { useContext, useEffect, useReducer } from 'react';
import { Badge, Button, Tab, Table, Tabs } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-toastify';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { Store } from '../Store';
import { getError } from '../utils';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, lading: true };
    case 'FETCH_SUCCESS':
      return { ...state, users: action.payload, loading: false };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    case 'DELETE_REQUEST':
      return { ...state, loadingDelete: true, successDelete: false };
    case 'DELETE_SUCCESS':
      return {
        ...state,
        loadingDelete: false,
        successDelete: true,
      };
    case 'DELETE_FAIL':
      return { ...state, loadingDelete: false };
    case 'DELETE_RESET':
      return { ...state, loadingDelete: false, successDelete: false };
    case 'ACCEPT_REQUEST':
      return { ...state, loadingAccept: true, successAccept: false };
    case 'ACCEPT_SUCCESS':
      return {
        ...state,
        loadingAccept: false,
        successAccept: true,
      };
    case 'ACCEPT_FAIL':
      return { ...state, loadingAccept: false };
    case 'ACCEPT_RESET':
      return { ...state, loadingAccept: false, successAccept: false };
    default:
      return state;
  }
};

export default function UsersDemandsScreen(props) {
  const { state } = useContext(Store);
  const { userInfo } = state;
  const { setNumberOfDemands } = props;
  const [
    {
      loading,
      error,
      users,
      loadingDelete,
      successDelete,
      loadingAccept,
      successAccept,
    },
    dispatch,
  ] = useReducer(reducer, {
    loading: true,
    error: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await Axios.get('http://localhost:8082/user/allUsers', {
          headers: { Authorization: `${userInfo.token}` },
          params: {
            affiliationCode: userInfo.affiliationCode,
            isVerified: false,
          },
        });
        setNumberOfDemands(data.length);
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
        // console.log(data);
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: err });
      }
    };
    if (successDelete) {
      dispatch({ type: 'DELETE_RESET' });
    } else if (successAccept) {
      dispatch({ type: 'ACCEPT_RESET' });
    } else {
      fetchData();
    }
  }, [successDelete, successAccept, userInfo, setNumberOfDemands]);

  const acceptHandler = async (user) => {
    try {
      dispatch({ type: 'ACCEPT_REQUEST' });
      await Axios.put(
        `http://localhost:8082/user/accept/${user.userId}`,
        { userId: user.userId },
        {
          headers: { Authorization: `${userInfo.token}` },
        }
      );
      toast.success('Demande acceptée');
      dispatch({ type: 'ACCEPT_SUCCESS' });
    } catch (err) {
      toast.error(getError(err));
      dispatch({ type: 'ACCEPT_FAIL' });
    }
  };

  const refuseHandler = async (user) => {
    if (
      window.confirm(
        `Êtes-vous sûr de vouloir refuser? (ce compte ne sera pas créé)`
      )
    ) {
      try {
        dispatch({ type: 'DELETE_REQUEST' });
        await Axios.delete(`http://localhost:8082/user/${user.userId}`, {
          headers: { Authorization: `${userInfo.token}` },
        });
        toast.success('Demande refusée');
        dispatch({ type: 'DELETE_SUCCESS' });
      } catch (err) {
        toast.error(getError(err));
        dispatch({ type: 'DELETE_FAIL' });
      }
    }
  };

  return (
    <div className="p-5">
      <Helmet>
        <title>Users demands</title>
      </Helmet>
      <h1>Demandes</h1>
      {loadingDelete && <LoadingBox />}
      {loadingAccept && <LoadingBox />}
      {loading ? (
        <LoadingBox />
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        <Tabs
          defaultActiveKey="Demandes des encadrants"
          id="fill-tab-example"
          className="mb-3"
          fill
        >
          <Tab
            eventKey="Demandes des encadrants"
            title={
              <>
                Demandes des encadrants{' '}
                {users.filter((user) => user.role === 'SUPERVISOR').length >
                  0 && (
                  <Badge pill className="bg-danger">
                    {users.filter((user) => user.role === 'SUPERVISOR').length}
                  </Badge>
                )}
              </>
            }
          >
            {users.filter((user) => user.role === 'SUPERVISOR').length > 0 ? (
              <Table striped responsive size="sm">
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Prénom</th>
                    <th>Email</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users
                    .filter((user) => user.role === 'SUPERVISOR')
                    .map((user) => (
                      <tr key={user.userId}>
                        <td>{user.lastName}</td>
                        <td>{user.firstName}</td>
                        <td>{user.email}</td>
                        <td>
                          <Button
                            type="button"
                            variant="success"
                            onClick={() => acceptHandler(user)}
                          >
                            Accepter
                          </Button>
                          &nbsp;
                          <Button
                            type="button"
                            variant="danger"
                            onClick={() => refuseHandler(user)}
                          >
                            Refuser
                          </Button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </Table>
            ) : (
              <MessageBox>Pas de demandes</MessageBox>
            )}
          </Tab>
          <Tab
            eventKey="Demandes des étudiants"
            title={
              <>
                Demandes des étudiants{' '}
                {users.filter((user) => user.role === 'STUDENT').length > 0 && (
                  <Badge pill className="bg-danger">
                    {users.filter((user) => user.role === 'STUDENT').length}
                  </Badge>
                )}
              </>
            }
          >
            {users.filter((user) => user.role === 'STUDENT').length > 0 ? (
              <Table striped responsive size="sm">
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Prénom</th>
                    <th>Email</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users
                    .filter((user) => user.role === 'STUDENT')
                    .map((user) => (
                      <tr key={user.userId}>
                        <td>{user.lastName}</td>
                        <td>{user.firstName}</td>
                        <td>{user.email}</td>
                        <td>
                          <Button
                            type="button"
                            variant="success"
                            onClick={() => acceptHandler(user)}
                          >
                            Accepter
                          </Button>
                          &nbsp;
                          <Button
                            type="button"
                            variant="danger"
                            onClick={() => refuseHandler(user)}
                          >
                            Refuser
                          </Button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </Table>
            ) : (
              <MessageBox>Pas de demandes</MessageBox>
            )}
          </Tab>
        </Tabs>
      )}
    </div>
  );
}
