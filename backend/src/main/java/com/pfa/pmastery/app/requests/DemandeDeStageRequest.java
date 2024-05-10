package com.pfa.pmastery.app.requests;

public class DemandeDeStageRequest {
    private String studentId;
    private String affiliationCode;


    public DemandeDeStageRequest() {}

    public String getStudentId() {
        return studentId;
    }

    public void setStudentId(String studentId) {
        this.studentId = studentId;
    }

    public String getAffiliationCode() {
        return affiliationCode;
    }

    public void setAffiliationCode(String affiliationCode) {
        this.affiliationCode = affiliationCode;
    }
}
