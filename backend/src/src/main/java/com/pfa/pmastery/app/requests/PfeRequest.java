package com.pfa.pmastery.app.requests;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

public class PfeRequest {
    @NotBlank(message = "Ce Champ ne doit pas etre null !")
    @Size(max=255 ,message="Ce champ ne doit pas avoir plus de 255 Caracteres !")
    private String subject;
    @NotBlank(message = "Ce Champ ne doit pas etre null !")
    @Size(max=50 ,message="Ce champ ne doit pas avoir plus de 50 Caracteres !")
    private String city;
    @NotBlank(message = "Ce Champ ne doit pas etre null !")
    @Size(max=50 ,message="Ce champ ne doit pas avoir plus de 50 Caracteres !")
    private String company;
    @Email
    @Size(max=100,message="Ce champ ne doit pas avoir plus de 100 Caracteres !")
    private String supervisorEmail;
    @NotBlank(message = "Ce Champ ne doit pas etre null !")
    @Size(max=255 ,message="Ce champ ne doit pas avoir plus de 255 Caracteres !")
    private String usedTechnologies;

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

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

    public String getSupervisorEmail() {
        return supervisorEmail;
    }

    public void setSupervisorEmail(String supervisorEmail) {
        this.supervisorEmail = supervisorEmail;
    }

    public String getUsedTechnologies() {
        return usedTechnologies;
    }

    public void setUsedTechnologies(String usedTechnologies) {
        this.usedTechnologies = usedTechnologies;
    }
}
