package com.pfa.pmastery.app.requests;

import java.io.Serializable;

public class Pfe implements Serializable {
    private String city;
    private String company;
    private String subject;
    private String supervisorEmail;
    private String usedTechnologies;

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getCompany() {
        return company;
    }

    public void setCompany(String company) {
        this.company = company;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getSupervisorEmail() {
        return supervisorEmail;
    }

    public void setSupervisorEmail(String supervisorEmail) {
        this.supervisorEmail = supervisorEmail;
    }

    public String getUsedTechnologies() {
        return usedTechnologies;
    }

    public void setUsedTechnologies(String usedTechnologies) { // Modifier le type ici
        this.usedTechnologies = usedTechnologies;
    }
}
