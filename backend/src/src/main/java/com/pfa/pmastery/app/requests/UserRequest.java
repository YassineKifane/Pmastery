package com.pfa.pmastery.app.requests;

import javax.validation.Valid;
import javax.validation.constraints.*;
import java.util.List;

public class UserRequest {
    @NotBlank(message = "Ce Champ ne doit pas etre null !")
    @Email
    @Size(max=100)
    private String email;

    @NotBlank(message = "Ce Champ ne doit pas etre null !")
    @Size(min=8 , message="Ce champ doit avoir au moins 8 Caracteres !")
    @Pattern(regexp="(?=^.{8,}$)((?=.*\\d)|(?=.*\\W+))(?![.\\n])(?=.*[A-Z])(?=.*[a-z]).*$",
            message="ce mot de passe doit avoir des lettres en Maj et Minsc et numero")
    private String password;

    @NotBlank(message = "Ce Champ ne doit pas etre null !")
    @Size(min=3 ,message="Ce champ doit avoir au moins 3 Caracteres !")
    @Size(max=30 ,message="Ce champ ne doit pas avoir plus de 30 Caracteres !")
    private String firstName;

    @NotBlank(message = "Ce Champ ne doit pas etre null !")
    @Size(min=3 ,message="Ce champ doit avoir au moins 3 Caracteres !")
    @Size(max=30 ,message="Ce champ ne doit pas avoir plus de 30 Caracteres !")
    private String lastName;

    private String affiliationCode;

    @Size(min=2 ,message="Ce champ doit avoir au moins 2 Caracteres !")
    @Size(max=50 ,message="Ce champ ne doit pas avoir plus de 50 Caracteres !")
    private String sector;

    private List<@Valid PfeRequest> pfe;

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
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

    public List<PfeRequest> getPfe() {
        return pfe;
    }

    public void setPfe(List<PfeRequest> pfe) {
        this.pfe = pfe;
    }
}
