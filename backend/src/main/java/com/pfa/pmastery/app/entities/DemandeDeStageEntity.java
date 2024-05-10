package com.pfa.pmastery.app.entities;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;

@Entity(name = "DemandeFicheStage")
public class DemandeDeStageEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)

    private Long id;
    private String studentId;
    private String chefFiliereId;

    public String getChefFiliereId() {
        return chefFiliereId;
    }

    public void setChefFiliereId(String chefFiliereId) {
        this.chefFiliereId = chefFiliereId;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getStudentId() {
        return studentId;
    }

    public void setStudentId(String studentId) {
        this.studentId = studentId;
    }
}
