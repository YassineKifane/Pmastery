package com.pfa.pmastery.app.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;

import javax.persistence.*;
import java.io.Serializable;
import java.util.List;

@Entity(name="users")
public class UserEntity implements Serializable {
    @Id
    @GeneratedValue
    private Long id;
    @Column(nullable = false , unique = true , length = 40)
    private String userId;
    @Column(nullable = false , unique = true , length = 100)
    private String email;
    @Column(nullable = false)
    private String encryptedPassword;
    @Column(nullable = false , length = 30)
    private String firstName;
    @Column(nullable = false , length = 30)
    private String lastName;
    @Column(nullable = false , length = 20)
    private String role;
    @Column(nullable = true)
    private Boolean isVerified = false;

    private Boolean isEmailVerified = false;
    @Column(nullable = false , length = 10)
    private String affiliationCode;
    @Column(nullable = false , length = 50)
    private String sector;

    private String announcementMsg;

    //@ManyToMany(fetch = FetchType.LAZY , cascade = CascadeType.ALL , mappedBy = "users")

    @ManyToMany(fetch = FetchType.EAGER , cascade = CascadeType.ALL)
    @JoinTable(name="pfe_users" , joinColumns = @JoinColumn(name="userId") ,
            inverseJoinColumns = @JoinColumn(name="pfeId"))
    @JsonIgnore
    private List<PfeEntity> pfe;


    @OneToMany(mappedBy = "sender")
    @JsonIgnore
    private List<ChatMessageEntity> sentMessages;

    @OneToMany(mappedBy = "recipient")
    @JsonIgnore
    private List<ChatMessageEntity> receivedMessages;


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

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getEncryptedPassword() {
        return encryptedPassword;
    }

    public void setEncryptedPassword(String encryptedPassword) {
        this.encryptedPassword = encryptedPassword;
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

    public String getAffiliationCode() {
        return affiliationCode;
    }

    public void setAffiliationCode(String affiliationCode) {
        this.affiliationCode = affiliationCode;
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

    public List<PfeEntity> getPfe() {
        return pfe;
    }

    public void setPfe(List<PfeEntity> pfe) {
        this.pfe = pfe;
    }

    public List<ChatMessageEntity> getSentMessages() {
        return sentMessages;
    }

    public void setSentMessages(List<ChatMessageEntity> sentMessages) {
        this.sentMessages = sentMessages;
    }

    public List<ChatMessageEntity> getReceivedMessages() {
        return receivedMessages;
    }

    public void setReceivedMessages(List<ChatMessageEntity> receivedMessages) {
        this.receivedMessages = receivedMessages;
    }
}