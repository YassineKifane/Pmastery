package com.pfa.pmastery.app.entities;

import javax.persistence.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Entity(name="soutnance")
public class SoutnanceEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long soutnanceId;
    private LocalDate startDate;
    private LocalDate finalDate;
    private Date affectedDate;
    @ElementCollection
    private List<LocalDate> propositionDates = new ArrayList<>(3);
    @ElementCollection
    private List<String> juryMembers = new ArrayList<>();
    private int year;
    private Boolean publish = false;

    @OneToOne(targetEntity = UserEntity.class, fetch = FetchType.EAGER, cascade = CascadeType.ALL)
    @JoinColumn(nullable = false, name = "userId")
    private UserEntity userEntity;


    public Long getSoutnanceId() {
        return soutnanceId;
    }

    public void setSoutnanceId(Long soutnanceId) {
        this.soutnanceId = soutnanceId;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate  startDate) {
        this.startDate = startDate;
    }

    public LocalDate  getFinalDate() {
        return finalDate;
    }

    public void setFinalDate(LocalDate finalDate) {
        this.finalDate = finalDate;
    }

    public Date getAffectedDate() {
        return affectedDate;
    }

    public void setAffectedDate(Date affectedDate) {
        this.affectedDate = affectedDate;
    }

    public List<LocalDate> getPropositionDates() {
        return propositionDates;
    }

    public void setPropositionDates(List<LocalDate> propositionDates) {
        this.propositionDates = propositionDates;
    }

    public List<String> getJuryMembers() {
        return juryMembers;
    }

    public void setJuryMembers(List<String> juryMembers) {
        this.juryMembers = juryMembers;
    }

    public int getYear() {
        return year;
    }

    public void setYear(int year) {
        this.year = year;
    }

    public Boolean getPublish() {
        return publish;
    }

    public void setPublish(Boolean publish) {
        this.publish = publish;
    }

    public UserEntity getUserEntity() {
        return userEntity;
    }

    public void setUserEntity(UserEntity userEntity) {
        this.userEntity = userEntity;
    }
}