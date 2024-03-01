package com.pfa.pmastery.app.services.Impl;

import com.pfa.pmastery.app.entities.PfeEntity;
import com.pfa.pmastery.app.entities.SoutnanceEntity;
import com.pfa.pmastery.app.entities.UserEntity;
import com.pfa.pmastery.app.repositories.PfeRepository;
import com.pfa.pmastery.app.repositories.SoutnanceRepository;
import com.pfa.pmastery.app.repositories.UserRepository;
import com.pfa.pmastery.app.responses.SoutnanceResponse;
import com.pfa.pmastery.app.responses.SoutnanceResponseExtract;
import com.pfa.pmastery.app.services.SoutnanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Service
public class SoutnanceServiceImpl implements SoutnanceService {

    @Autowired
    UserRepository userRepository;
    @Autowired
    PfeRepository pfeRepository;
    @Autowired
    SoutnanceRepository soutnanceRepository;

    @Override
    public String initializeDate(String userId, LocalDate startDate, LocalDate finalDate, int year) {
        UserEntity user= userRepository.findByUserId(userId);
        if(user== null || !user.getRole().equals("ADMIN")){
            throw new RuntimeException("Utilisateur Invalid!");
        }

        SoutnanceEntity soutnanceEntity = soutnanceRepository.findByUserEntityUserIdAndYear(userId, year);
        if (soutnanceEntity == null) {
            soutnanceEntity = new SoutnanceEntity();
            soutnanceEntity.setUserEntity(user);
            soutnanceEntity.setYear(year);
        }

        soutnanceEntity.setStartDate(startDate);
        soutnanceEntity.setFinalDate(finalDate);

        //CHANGE FIRST AND LAST DATE FOR OLD SOUTNANCES
        List<UserEntity> students=userRepository.findAllByAffiliationCodeAndRoleAndYear(user.getAffiliationCode(),"STUDENT",year);
        for (int i=0;i<students.size();i++){
            SoutnanceEntity studentSoutnance = soutnanceRepository.findByUserEntityUserId(students.get(i).getUserId());
            if(studentSoutnance != null){
                studentSoutnance.setStartDate(startDate);
                studentSoutnance.setFinalDate(finalDate);
            }
        }

        try {
            SoutnanceEntity soutnance=soutnanceRepository.save(soutnanceEntity);

            if (soutnance != null) {
                return "Vous avez bien initializer l'intervalle des dates ";
            }
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de l'envoi des informations" + e.getMessage());
        }
        return null;
    }

    @Override
    public List<LocalDate> getInitializeDate(String userId, int year ,String affiliationCode) {

        UserEntity user= userRepository.findByUserId(userId);
        if(user== null){
            throw new RuntimeException("Utilisateur Invalid!");
        }

        UserEntity admin=userRepository.findByAffiliationCodeAndRole(affiliationCode,"ADMIN");

        try {
            SoutnanceEntity soutnance=soutnanceRepository.findByUserEntityUserIdAndYear(admin.getUserId(), year);

            if (soutnance == null || (soutnance.getStartDate() == null && soutnance.getFinalDate() == null)) {
                return null; // Return null when soutnance or both dates are null
            }

            List<LocalDate> startAndFinalDates = new ArrayList<>();
            startAndFinalDates.add((soutnance.getStartDate()));
            startAndFinalDates.add(soutnance.getFinalDate());

            return startAndFinalDates;
        } catch (Exception e) {
            return null;
        }
    }

    @Override
    public String proposeDate(String userId, List<LocalDate> propositionDates , int year) {
        UserEntity user= userRepository.findByUserId(userId);
        if(user== null || !user.getRole().equals("STUDENT")){
            throw new RuntimeException("Utilisateur Invalid!");
        }

        SoutnanceEntity soutnanceStudent = soutnanceRepository.findByUserEntityUserIdAndYear(user.getUserId(),year);
        if (soutnanceStudent != null){
            throw new RuntimeException("Vous avez deja submitter vos proposition");
        }

        UserEntity userAdmin = userRepository.findByAffiliationCodeAndRole(user.getAffiliationCode(),"ADMIN");
        SoutnanceEntity soutnanceAdmin = soutnanceRepository.findByUserEntityUserIdAndYear(userAdmin.getUserId(),year);

        SoutnanceEntity soutnanceEntity = new SoutnanceEntity();

        soutnanceEntity.setStartDate(soutnanceAdmin.getStartDate());
        soutnanceEntity.setFinalDate(soutnanceAdmin.getFinalDate());
        soutnanceEntity.setYear(soutnanceAdmin.getYear());

        soutnanceEntity.setPropositionDates(propositionDates);
        soutnanceEntity.setUserEntity(user);

        try {
            SoutnanceEntity soutnance=soutnanceRepository.save(soutnanceEntity);

            if (soutnance != null) {
                return "Vos dates de proposition bien enregistrées";
            }
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de l'envoi des informations" + e.getMessage());
        }
        return null;
    }

    @Override
    public List<LocalDate> getProposeDate(String userId) {
        UserEntity user= userRepository.findByUserId(userId);
        if(user== null || !user.getRole().equals("STUDENT")){
            throw new RuntimeException("Utilisateur Invalid!");
        }

        try {
            SoutnanceEntity soutnance=soutnanceRepository.findByUserEntityUserId(userId);


            List<LocalDate> propositionDates = soutnance.getPropositionDates();

            return propositionDates;
        } catch (Exception e) {
            return null;
        }
    }

    @Override
    public String assignDate(String adminId, String studentId,int year, Date affectedDate, List<String> juryMembers) {

        UserEntity checkAdmin = userRepository.findByUserId(adminId);
        if(checkAdmin== null || !checkAdmin.getRole().equals("ADMIN")){
            throw new RuntimeException("Vous avez pas le droit de modifier cette fonction!");
        }

        UserEntity checkStudent = userRepository.findByUserId(studentId);
        if(checkStudent== null || !checkStudent.getRole().equals("STUDENT")){
            throw new RuntimeException("Utilisateur Invalid!");
        }

        SoutnanceEntity soutnanceEntity = soutnanceRepository.findByUserEntityUserIdAndYear(studentId,year);
        if (soutnanceEntity == null) {
            soutnanceEntity = new SoutnanceEntity();
            soutnanceEntity.setUserEntity(checkStudent);
            soutnanceEntity.setYear(year);
        }

        soutnanceEntity.setJuryMembers(juryMembers);
        soutnanceEntity.setAffectedDate(affectedDate);
        soutnanceEntity.setUserEntity(checkStudent);

        try {
            SoutnanceEntity soutnance=soutnanceRepository.save(soutnanceEntity);

            if (soutnance != null) {
                return "Vous avez bien affecter la date de soutenance a: "+affectedDate+" pour: "+checkStudent.getFirstName()
                        +" "+checkStudent.getLastName();
            }
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de l'envoi des informations" + e.getMessage());
        }
        return null;
    }

    @Override
    public SoutnanceResponseExtract getSoutnanceDetails(String userId) {
        UserEntity user=userRepository.findByUserId(userId);
        if(user == null){
            throw new RuntimeException("Utilisateur Introuvable!");
        }
        SoutnanceEntity soutnance=soutnanceRepository.findByUserEntityUserId(userId);

        SoutnanceResponseExtract soutnanceResponseExtract=new SoutnanceResponseExtract();
        if(soutnance != null && soutnance.getPublish() == true){
            soutnanceResponseExtract.setFullName(user.getFirstName()+" "+user.getLastName());
            soutnanceResponseExtract.setAffectedDate(soutnance.getAffectedDate());
            soutnanceResponseExtract.setJuryMembers(soutnance.getJuryMembers());
            return soutnanceResponseExtract;
        } else {
            return null;
        }
    }

    @Override
    public String publishSoutnances(String userId, int year) {

        UserEntity checkAdmin = userRepository.findByUserId(userId);
        if(checkAdmin== null || !checkAdmin.getRole().equals("ADMIN")){
            throw new RuntimeException("Vous avez pas le droit de modifier cette fonction!");
        }

        List<UserEntity> students = userRepository.findAllByAffiliationCodeAndRoleAndYear(checkAdmin.getAffiliationCode(),"STUDENT",year);
        for(int i=0;i< students.size();i++){
            SoutnanceEntity soutnance = soutnanceRepository.findByUserEntityUserId(students.get(i).getUserId());
            if(soutnance != null){
                soutnance.setPublish(true);
                try {
                    soutnanceRepository.save(soutnance);
                } catch (Exception e) {
                    e.printStackTrace();
                    return "An error occurred while saving changes.";
                }
            }
        }
        return "Changes saved successfully.";
    }

    @Override
    public List<SoutnanceResponse> getAllSoutnances(String affiliationCode, int year) {

        List<SoutnanceResponse> soutnanceResponse = new ArrayList<>();

        List<UserEntity> allStudents=userRepository.findAllByAffiliationCodeAndRoleAndYear(affiliationCode,"STUDENT",year);
        for (int i=0;i<allStudents.size();i++){

            List<PfeEntity> studentPfe=pfeRepository.findByUserId(allStudents.get(i).getUserId(),"STUDENT");

            if (!studentPfe.isEmpty()) {
                SoutnanceEntity studentSoutnance = soutnanceRepository.findByUserEntityUserId(allStudents.get(i).getUserId());

                SoutnanceResponse student = new SoutnanceResponse();
                student.setUserId(allStudents.get(i).getUserId());
                student.setFullName(allStudents.get(i).getFirstName() + " " + allStudents.get(i).getLastName());
                student.setPfeSubject(studentPfe.get(0).getSubject());
                student.setCompany(studentPfe.get(0).getCompany());
                if (!studentPfe.get(0).getUsers().get(0).getRole().equals("STUDENT")){
                    student.setSupervisorName(studentPfe.get(0).getUsers().get(0).getFirstName()+" "+studentPfe.get(0).getUsers().get(0).getLastName());
                } else {
                    student.setSupervisorName(studentPfe.get(0).getUsers().get(1).getFirstName()+" "+studentPfe.get(0).getUsers().get(1).getLastName());
                }
                //student.setSupervisorName(studentPfe.get(0).getUsers().get(0).getFirstName()+" "+studentPfe.get(0).getUsers().get(0).getLastName());
                //student.setSupervisorName(supervisor.get(0).getFirstName() +" "+supervisor.get(0).getLastName());
                if (studentSoutnance != null) {
                    student.setPropositionDates(studentSoutnance.getPropositionDates());
                    student.setAffectedDate(studentSoutnance.getAffectedDate());
                    student.setJuryMembers(studentSoutnance.getJuryMembers());
                } else {
                    student.setPropositionDates(null);
                    student.setAffectedDate(null);
                    student.setJuryMembers(null);
                }

                soutnanceResponse.add(student);
            }
        }

        return soutnanceResponse;
    }

    @Override
    public List<SoutnanceResponse> getAllSoutnancesToSupervisors(String userId, int year) {

        UserEntity user=userRepository.findByUserId(userId);
        List<SoutnanceResponse> soutnanceResponse = new ArrayList<>();

        List<PfeEntity> allPfes = new ArrayList<>();
        if(user.getRole().equals("SUPERVISOR")){
            allPfes= pfeRepository.findByUserId(userId,"SUPERVISOR");
        } else if (user.getRole().equals("ADMIN")){
            allPfes= pfeRepository.findByUserId(userId,"ADMIN");
        }


        for (int i=0;i<allPfes.size();i++){

            List<UserEntity> allStudents=userRepository.findByPfeIdAndRole(allPfes.get(i).getPfeId(),"STUDENT");
            //UserEntity student = allStudents.get(0);

            if (!allStudents.isEmpty()) {
                SoutnanceEntity studentSoutnance = soutnanceRepository.findByUserEntityUserId(allStudents.get(0).getUserId());

                SoutnanceResponse student = new SoutnanceResponse();
                student.setUserId(allStudents.get(0).getUserId());
                student.setFullName(allStudents.get(0).getFirstName() + " " + allStudents.get(0).getLastName());
                student.setPfeSubject(allPfes.get(0).getSubject());
                student.setCompany(allPfes.get(0).getCompany());
                student.setSupervisorName(user.getFirstName()+" "+user.getLastName());
                if (studentSoutnance != null && studentSoutnance.getPublish() == true) {
                    student.setPropositionDates(studentSoutnance.getPropositionDates());
                    student.setAffectedDate(studentSoutnance.getAffectedDate());
                    student.setJuryMembers(studentSoutnance.getJuryMembers());
                } else {
                    student.setPropositionDates(null);
                    student.setAffectedDate(null);
                    student.setJuryMembers(null);
                }

                soutnanceResponse.add(student);
            }
        }

        return soutnanceResponse;
    }
}
