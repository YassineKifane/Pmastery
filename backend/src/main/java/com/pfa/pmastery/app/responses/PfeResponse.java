package com.pfa.pmastery.app.responses;

import java.util.List;

public class PfeResponse {
    private String pfeId;
    private String userId;
    private String subject;
    private String city;
    private String company;
    private String supervisorEmail;
    private String usedTechnologies;
    private Boolean isApproved;
    private int year;
    private List<UserResponse> user;

    private List<UserResponseWithoutPfe> users;


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

    public List<UserResponse> getUser() {
        return user;
    }

    public void setUser(List<UserResponse> user) {
        this.user = user;
    }

    public List<UserResponseWithoutPfe> getUsers() {
        return users;
    }

    public void setUsers(List<UserResponseWithoutPfe> users) {
        this.users = users;
    }
    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }
}