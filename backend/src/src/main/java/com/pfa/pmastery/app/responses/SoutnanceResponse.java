package com.pfa.pmastery.app.responses;

import javax.persistence.ElementCollection;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

public class SoutnanceResponse {

    private String userId;
    private String fullName;
    private String pfeSubject;
    private String company;
    private String supervisorName;
    private List<LocalDate> propositionDates = new ArrayList<>(3);
    private Date affectedDate;
    private List<String> juryMembers = new ArrayList<>();

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getPfeSubject() {
        return pfeSubject;
    }

    public void setPfeSubject(String pfeSubject) {
        this.pfeSubject = pfeSubject;
    }

    public String getCompany() {
        return company;
    }

    public void setCompany(String company) {
        this.company = company;
    }

    public String getSupervisorName() {
        return supervisorName;
    }

    public void setSupervisorName(String supervisorName) {
        this.supervisorName = supervisorName;
    }

    public List<LocalDate> getPropositionDates() {
        return propositionDates;
    }

    public void setPropositionDates(List<LocalDate> propositionDates) {
        this.propositionDates = propositionDates;
    }

    public Date getAffectedDate() {
        return affectedDate;
    }

    public void setAffectedDate(Date affectedDate) {
        this.affectedDate = affectedDate;
    }

    public List<String> getJuryMembers() {
        return juryMembers;
    }

    public void setJuryMembers(List<String> juryMembers) {
        this.juryMembers = juryMembers;
    }
}
