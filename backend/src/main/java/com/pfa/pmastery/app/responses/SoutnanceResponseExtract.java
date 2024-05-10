package com.pfa.pmastery.app.responses;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

public class SoutnanceResponseExtract {

    private String fullName;
    private Date affectedDate;
    private List<String> juryMembers = new ArrayList<>();

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
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
