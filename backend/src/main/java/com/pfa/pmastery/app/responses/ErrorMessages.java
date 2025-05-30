package com.pfa.pmastery.app.responses;

public enum ErrorMessages {
    MISSING_REQUIRED_FIELD("Missing required field."),
    RECORD_ALREADY_EXISTS("Record already exists."),
    INTERNAL_SERVER_ERROR("Internal P-Mastery server error."),
    NO_RECORD_FOUND("Record with provided id is not found.");

    private String errorMessage;

    private ErrorMessages(String errorMessage) {
        this.errorMessage = errorMessage;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }
}
