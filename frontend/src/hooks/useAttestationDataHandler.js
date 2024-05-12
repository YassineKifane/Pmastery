import axios from "axios";
import {useEffect, useRef, useState} from "react";
import { URL } from "../constants/constants";


export default function useAttestationDataHandler(supervisor, userinfo, selectedYearSupervisors, allstudents){
    const [soutnances,setSoutnances]=useState([])
    const supervisor_name=supervisor.firstName+" "+supervisor.lastName

    function getCurrentDate() {
        const date = new Date();
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }

    useEffect(()=>{
        const fetchData=async ()=>{
            try{
                const {data}=await axios.get(`${URL}/soutnance/getAllSoutnancesJuryToSupervisors/${supervisor.userId}`,{
                    headers:{Authorization:`${userinfo.token}`},
                    params:{year:selectedYearSupervisors.value}
                })
                setSoutnances(data)
                console.log("soutnance: "+soutnances)
            }
            catch (err){
                console.log(err)
            }
        }
        fetchData()
    },[supervisor.userId, selectedYearSupervisors.value, userinfo.token])


    const attestationHandler = async () => {
        try {
            const pfeSoutnance = soutnances.filter(soutnance => soutnance.supervisorName === supervisor_name).map(soutnance=>({
                fullName:soutnance.fullName,
                pfeProject:soutnance.pfeSubject
            }));

            const pfeJury = soutnances.filter(soutnance =>soutnance.supervisorName !== supervisor_name).map(soutnance=>({
                fullName:soutnance.fullName,
                pfeProject:soutnance.pfeSubject
            }));
            const lastyear=selectedYearSupervisors.value-1
            const selectedyear=selectedYearSupervisors.value
            const year=lastyear+"/"+selectedYearSupervisors.value
            const role=pfeSoutnance.length!==0 ? "a encadré" : "a été un membre de jury"

            const jsonData = {
                currentdate:getCurrentDate(),
                SELECTEDYEAR : selectedyear,
                RESPONSABLE: userinfo.firstName+" "+userinfo.lastName,
                SUPERVISOR: supervisor_name,
                ROLE: role,
                YEAR: year,
                PFESOUTNANCES: pfeSoutnance,
                PFEJURYS: pfeJury
            };
            return jsonData

        } catch (err) {
            console.log(err);
        }
    };
    return attestationHandler;
}