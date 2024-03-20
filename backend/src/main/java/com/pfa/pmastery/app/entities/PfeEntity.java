package com.pfa.pmastery.app.entities;

import javax.persistence.*;
import java.io.Serializable;
import java.util.Date;
import java.util.List;

@Entity(name="pfe")
public class PfeEntity implements Serializable {


    @Id
    @GeneratedValue
    private Long id;

    @Column(nullable = false , unique = true)
    private String pfeId;
    @Column(nullable = false , unique = true)
    private  String userId;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }
    public String getUserId() {
        return userId;
    }
    public void setUserId(String userId) {
        this.userId = userId;
    }

    @Column(nullable = false , length = 255)
    private String subject;
    @Column(nullable = false ,length = 50)
    private String city;
    @Column(nullable = false ,length = 50)
    private String company;
    @Column(nullable = false ,length = 100)
    private String supervisorEmail;
    @Column(nullable = false, length = 255)
    private String usedTechnologies;
    @Column(nullable = false)
    private Boolean isApproved = false;
    /*@Column(name = "year", columnDefinition = "integer default year(current_date)")*/
    @Column(name = "year", columnDefinition = "integer default extract(year from current_date)")
    private int year;


    @PrePersist
    protected void onCreate() {
        year = java.time.LocalDate.now().getYear();
    }

    @ManyToMany(fetch = FetchType.EAGER , cascade = CascadeType.ALL)
    @JoinTable(name="pfe_users" , joinColumns = @JoinColumn(name="pfeId") ,
            inverseJoinColumns = @JoinColumn(name="userId"))
    private List<UserEntity> users;

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

    public List<UserEntity> getUsers() {
        return users;
    }

    public void setUsers(List<UserEntity> users) {
        this.users = users;
    }
}