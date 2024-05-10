package com.pfa.pmastery.app.responses;

import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public class UserResponse {
    private String userId;
    private String email;
    private String firstName;
    private String lastName;
    private String role;
    private String affiliationCode;
    private Boolean isVerified;
    private Boolean isEmailVerified;
    private String sector;
    private String announcementMsg;
    private List<PfeResponse> pfe;

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getAffiliationCode() {
        return affiliationCode;
    }

    public void setAffiliationCode(String affiliationCode) {
        this.affiliationCode = affiliationCode;
    }

    public Boolean getVerified() {
        return isVerified;
    }

    public void setVerified(Boolean verified) {
        isVerified = verified;
    }

    public Boolean getEmailVerified() {
        return isEmailVerified;
    }

    public void setEmailVerified(Boolean emailVerified) {
        isEmailVerified = emailVerified;
    }

    public String getSector() {
        return sector;
    }

    public void setSector(String sector) {
        this.sector = sector;
    }

    public String getAnnouncementMsg() {
        return announcementMsg;
    }

    public void setAnnouncementMsg(String announcementMsg) {
        this.announcementMsg = announcementMsg;
    }

    public List<PfeResponse> getPfe() {
        return pfe;
    }

    public void setPfe(List<PfeResponse> pfe) {
        this.pfe = pfe;
    }

}
