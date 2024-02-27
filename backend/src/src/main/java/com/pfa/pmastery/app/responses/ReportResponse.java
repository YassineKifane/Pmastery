package com.pfa.pmastery.app.responses;

import java.util.Date;

public class ReportResponse {
    private String userId;
    private String fullName;
    private Date date;
    private Boolean isSubmitedd;

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public Date getDate() {
        return date;
    }

    public void setDate(Date date) {
        this.date = date;
    }

    public Boolean getSubmitedd() {
        return isSubmitedd;
    }

    public void setSubmitedd(Boolean submitedd) {
        isSubmitedd = submitedd;
    }
}
