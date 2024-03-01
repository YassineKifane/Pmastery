package com.pfa.pmastery.app.responses;

import com.fasterxml.jackson.annotation.JsonIgnore;

import java.util.List;

public class PfeResponseWithoutUser extends PfeResponse{
    @Override
    @JsonIgnore
    public List<UserResponse> getUser() {
        return super.getUser();
    }
}
