
import React, { useContext, useEffect, useState, useReducer } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../chat.css";
import RecipientMessage from "../components/RecipientMessage";
import SenderMessage from "../components/SenderMessage";
import SenderItem from "../components/SenderItem";
import axios from 'axios';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { Store } from "../Store";
import { URL } from "../constants/constants";


const reducer = (state, action) => {
    switch (action.type) {
        case 'FETCH_REQUEST':
            return { ...state, loading: true };
        case 'FETCH_SUCCESS':
            return { ...state, loading: false, result: action.payload };
        case 'FETCH_FAIL':
            return { ...state, loading: false, error: action.payload };
        default:
            return state;
    }
};

export default function ChatScreen(props) {
    const [content, setContent] = useState('');
    const [recipient, setRecipient] = useState({});
    const [students, setStudents] = useState(null);
    const [supervisors, setSupervisors] = useState(null);
    const [active, setActive] = useState(false);
    const [recipientMessages, setRecipientMessages] = useState({});
    const { state } = useContext(Store);
    const { userInfo } = state;
    const [{ loading, result, error }, dispatch] = useReducer(reducer, {
        loading: true,
        error: '',
        result: null,
    });

    const { stompClient } = props;

    useEffect(() => {
        const fetchData = async () => {
            dispatch({ type: 'FETCH_REQUEST' });
            try {
                const { data } = await axios.get(URL + `/pfe/user/${userInfo.userId}`, {
                    params: { role: userInfo.role },
                    headers: { Authorization: `${userInfo.token}` },
                });

                console.log(data);
                if (userInfo.role === "SUPERVISOR" || userInfo.role === "ADMIN") {
                    let allStudents = [];

                    data.forEach(pfe => {
                        const students = pfe.users.filter(user => user.role === 'STUDENT');
                        allStudents = allStudents.concat(students);
                    });
                    handleSenderItemClick(allStudents[0]);
                    console.log("allStudents" + allStudents);
                    setStudents(allStudents);
                    console.log(students);
                }

                if (userInfo.role === "STUDENT") {
                    let allSupervisors = [];

                    data.forEach(pfe => {
                        const supervisors = pfe.users.filter(user => user.role === 'SUPERVISOR' || user.role === 'ADMIN');
                        allSupervisors = allSupervisors.concat(supervisors);
                    });
                    handleSenderItemClick(allSupervisors[0]);
                    console.log("allSupervisors" + allSupervisors);
                    setSupervisors(allSupervisors);
                    console.log(supervisors);
                }

                dispatch({ type: 'FETCH_SUCCESS', payload: data });
            } catch (err) {
                dispatch({ type: 'FETCH_FAIL', payload: err });
                console.log(err);
            }
        };
        fetchData();
    }, [userInfo]);





    const handleContentChange = (event) => {
        setContent(event.target.value);
    };



    const sendMessage = () => {
        if (stompClient && content.trim() !== '') {
            const newMessage = {
                content: content,
                sender: {
                    userId: userInfo.userId,
                    firstName: userInfo.firstName,
                    lastName: userInfo.lastName,
                    role: userInfo.role,
                },
                recipient: {
                    userId: recipient.userId,
                    firstName: recipient.firstName,
                    lastName: recipient.lastName,
                    role: recipient.role
                },
                timestamp: new Date()
            };

            stompClient.send('/app/chat', {}, JSON.stringify(newMessage));


            setContent('');

            setRecipientMessages(prevRecipientMessages => {
                const recipientUserId = recipient.userId;
                const updatedMessages = [...(prevRecipientMessages[recipientUserId] || []), newMessage];
                return { ...prevRecipientMessages, [recipientUserId]: updatedMessages };
            });
        }
    };



    const handleSenderItemClick = async (selectedRecipient) => {
        if (selectedRecipient) {

            setRecipient(selectedRecipient);
            try {
                const response = await axios.get(URL + `/messages/${userInfo.userId}/${selectedRecipient.userId}`, {
                    headers: { Authorization: `${userInfo.token}` },
                });
                setRecipientMessages({ ...recipientMessages, [selectedRecipient.userId]: response.data });
            } catch (err) {
                console.error("Error fetching messages:", err);
            }
        }
    };


    return (
        <main className="my-4 mx-5">
            {((userInfo.role === 'SUPERVISOR' || userInfo.role === 'ADMIN') && !students) ? (
                <MessageBox variant="info" className="bg-blue">
                    Pas d'étudiants pour le moment.
                </MessageBox>
            ) : ((userInfo.role === 'STUDENT') && !supervisors) ? (
                <MessageBox variant="info" className="bg-blue">
                    Pas d'encadrants pour le moment.
                </MessageBox>
            ) : (
                (students || supervisors) && (
                    <div className="card">
                        <div className="row g-0">
                            <div className="col-12 col-lg-5 col-xl-3 border-end">
                                {loading ? (
                                    <LoadingBox/>
                                ) : error ? (
                                    <MessageBox variant="danger">{error}</MessageBox>
                                ) : userInfo.role === 'SUPERVISOR' || userInfo.role === 'ADMIN' ? (
                                    students && students.length > 0 ? (
                                        students.map((student, index) => (
                                            <SenderItem
                                                key={index}
                                                sender={`${student.firstName} ${student.lastName}`}
                                                role={"Etudiant"}
                                                active={recipient === student}
                                                onClick={() => handleSenderItemClick(student)}
                                            />
                                        ))
                                    ) : null
                                ) : userInfo.role === 'STUDENT' ? (
                                    supervisors && supervisors.length > 0 ? (
                                        supervisors.map((supervisor, index) => (
                                            <SenderItem
                                                key={index}
                                                sender={`${supervisor.firstName} ${supervisor.lastName}`}
                                                role={"Encadrant"}
                                                active={recipient === supervisor}
                                                onClick={() => handleSenderItemClick(supervisor)}
                                            />
                                        ))
                                    ) : null
                                ) : (
                                    <MessageBox variant="danger">Not Found</MessageBox>
                                )}
                            </div>
                            <div className="col-12 col-lg-7 col-xl-9">
                                {state.loading ? (
                                    <LoadingBox/>
                                ) : state.error ? (
                                    <MessageBox variant="danger">{state.error}</MessageBox>
                                ) : (
                                    <div className="chat-messages">
                                        {recipientMessages[recipient.userId] && recipientMessages[recipient.userId].map((msg, index) => {
                                            if (msg.sender.userId === userInfo.userId) {
                                                return (
                                                    <SenderMessage
                                                        key={index}
                                                        text={msg.content}
                                                        date={msg.timestamp}
                                                    />
                                                );
                                            } else {
                                                return (
                                                    <RecipientMessage
                                                        key={index}
                                                        recipient={msg.sender.firstName + " " + msg.sender.lastName}
                                                        text={msg.content}
                                                        date={msg.timestamp}
                                                    />
                                                );
                                            }
                                        })}
                                    </div>
                                )}

                                {(students && students.length > 0) || (supervisors && supervisors.length > 0) ? (
                                    <div className="d-flex align-items-center py-3 px-4 border-top">
                                        <div className="d-flex justify-content-center input-group">
                                            <input
                                                type="text"
                                                className="custom-input"
                                                placeholder="Tapez votre message..."
                                                value={content}
                                                onChange={handleContentChange}
                                            />
                                            <button className="btn bg-blue" onClick={sendMessage}>Envoyer</button>
                                        </div>
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    </div>
                )
            )}
        </main>
    );


}
