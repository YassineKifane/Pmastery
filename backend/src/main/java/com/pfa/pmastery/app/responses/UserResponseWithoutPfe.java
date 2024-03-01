package com.pfa.pmastery.app.responses;

import com.fasterxml.jackson.annotation.JsonIgnore;

import java.util.List;

public class UserResponseWithoutPfe extends UserResponse {
    @Override
    @JsonIgnore
    public List<PfeResponse> getPfe() {
        return super.getPfe();
    }
}