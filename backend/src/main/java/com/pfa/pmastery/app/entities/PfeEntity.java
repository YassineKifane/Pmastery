package com.pfa.pmastery.app.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;

import javax.persistence.*;
import java.io.Serializable;
import java.util.Date;
import java.util.List;
import javax.validation.constraints.Max;
import javax.validation.constraints.Min;

@Entity(name="pfe")
public class PfeEntity implements Serializable {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String pfeId;

    @Column(nullable = false, length = 255)
    private String subject;

    @Column(nullable = false, length = 50)
    private String city;

    @Column(nullable = false, length = 50)
    private String company;

    @Column(nullable = false, length = 100)
    private String supervisorEmail;

    @Column(nullable = false, length = 255)
    private String usedTechnologies;

    @Column(nullable = false)
    private Boolean isApproved = false;

    @Column(name = "year", columnDefinition = "integer default extract(year from current_date)")
    private int year;

    private boolean published = false;

    @Min(0)
    @Max(20)
    @Column(nullable = true)
    private Double note;
    
    @PrePersist
    protected void onCreate() {
        year = java.time.LocalDate.now().getYear();
    }

    @ManyToMany(fetch = FetchType.EAGER, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(name = "pfe_users",
            joinColumns = @JoinColumn(name = "pfe_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id"))
            
    @JsonIgnore
    private List<UserEntity> users;
    

    public Double getNote() {
        return note;
    }
    public void setNote(Double note) {
        this.note = note;
    }

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

    public List<UserEntity> getUsers() {
        return users;
    }

    public void setUsers(List<UserEntity> users) {
        this.users = users;
    }

    public boolean isPublished() {
        return published;
    }
    
    public void setPublished(boolean published) {
        this.published = published;
    }

}