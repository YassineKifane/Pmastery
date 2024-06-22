import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';
import { URL } from '../constants/constants';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [existSoutenance, setExistSoutenance] = useState(false);
    const [existSoutnancePropDates, setExistSoutnancePropDates] = useState(false);
    const [isUserJuryMember, setIsUserJuryMember] = useState(false);


    const fetchExistSoutenanceData = async (userInfo) => {
        try {
            const response = await axios.get(`${URL}/soutnance/exists`, {
                headers: { Authorization: userInfo.token },
            });
            setExistSoutenance(response.data);
            console.log("exist soutenance: " + response.data);
        } catch (error) {
            console.error('Une erreur s\'est produite lors de la récupération des données:', error);
        }
    }; 
    
    const fetchExistSoutnanceAndPropDatesData = async (userInfo) => {
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

    const fetchIsUserJuryMember = async (userInfo) => {
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


    return (
        <AppContext.Provider
            value={{
                existSoutenance,
                existSoutnancePropDates,
                isUserJuryMember, 
                fetchExistSoutenanceData,
                fetchExistSoutnanceAndPropDatesData,
                fetchIsUserJuryMember
            }}
        >
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => useContext(AppContext);
