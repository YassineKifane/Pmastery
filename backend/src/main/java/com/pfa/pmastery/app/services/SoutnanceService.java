package com.pfa.pmastery.app.services;

import com.pfa.pmastery.app.responses.SoutnanceResponse;
import com.pfa.pmastery.app.responses.SoutnanceResponseExtract;

import java.time.LocalDate;
import java.util.Date;
import java.util.List;

public interface SoutnanceService {
    String initializeDate(String userId , LocalDate startDate , LocalDate  finalDate, int year);
    List<LocalDate> getInitializeDate(String userId , int year , String affiliationCode);
    String proposeDate(String userId, List<LocalDate> propositionDates , int year);
    List<LocalDate> getProposeDate(String userId);
    String assignDate(String adminId,String studentId,int year ,Date affectedDate,List<String> juryMembers);
    SoutnanceResponseExtract getSoutnanceDetails(String userId);
    String publishSoutnances(String userId,int year);
    List<SoutnanceResponse> getAllSoutnances(String affiliationCode,int year);
    List<SoutnanceResponse> getAllSoutnancesToSupervisors(String userId,int year);
}
