package com.pfa.pmastery.app.shared.dto;

import java.io.Serializable;
import java.util.Date;
import java.util.List;

public class PfeDto implements Serializable {

    private Long id;
    private String pfeId;
    private String subject;
    private String city;
    private String company;
    private String supervisorEmail;
    private String usedTechnologies;
    private Boolean isApproved;
    private int year;
    private UserDto user;

    private List<UserDto> users;


    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getPfeId() {
        return pfeId;
    }

    public void setPfeId(String pfeId) {
        this.pfeId = pfeId;
    }

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

    public Boolean getApproved() {
        return isApproved;
    }

    public void setApproved(Boolean approved) {
        isApproved = approved;
    }

    public int getYear() {
        return year;
    }

    public void setYear(int year) {
        this.year = year;
    }

    public UserDto getUser() {
        return user;
    }

    public void setUser(UserDto user) {
        this.user = user;
    }

    public List<UserDto> getUsers() {
        return users;
    }

    public void setUsers(List<UserDto> users) {
        this.users = users;
    }
}
