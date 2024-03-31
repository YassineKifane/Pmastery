import axios from "axios";
import {useEffect, useRef, useState} from "react";
import {json} from "react-router-dom";
import data from "../data";

export default function useAttestationHandler(supervisor,userinfo,selectedYearSupervisors,allstudents){

    const [soutnances,setSoutnances]=useState([])
    const supervisor_name=supervisor.firstName+" "+supervisor.lastName

        const fetchData=async ()=>{
            try{
                const {data}=await axios.get(`http://localhost:8082/soutnance/getAllSoutnancesJuryToSupervisors/${supervisor.userId}`,{
                    headers:{Authorization:`${userinfo.token}`},
                    params:{
                        year:selectedYearSupervisors.value
                    }
                })
                setSoutnances(data)
            }
            catch (err){
                console.log(err)
            }
        }

        useEffect(()=>{
            fetchData()
        },[])


    const attestationHandler = async () => {
        try {
            const pfeSoutnance = soutnances.filter(soutnance => soutnance.supervisorName === supervisor_name).
                                            map(soutnance=>({
                fullName:soutnance.fullName,
                pfeProject:soutnance.pfeSubject
            }));
            const pfeJury = soutnances.filter(soutnance =>soutnance.supervisorName !== supervisor_name).
                                                    map(soutnance=>({
                fullName:soutnance.fullName,
                pfeProject:soutnance.pfeSubject
            }));
            const fullName = pfeSoutnance[0].fullName;
            console.log("fullName"+fullName);
            console.log("pfeSoutnance ", pfeSoutnance);
            console.log("pfeJury ", pfeJury);
            console.log("soutnance: "+soutnances)
            const lastyear=selectedYearSupervisors.value-1
            const year=lastyear+"/"+selectedYearSupervisors.value

            const jsonData = {
                RESPONSABLE: userinfo.firstName+" "+userinfo.lastName,
                SUPERVISOR: supervisor_name,
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