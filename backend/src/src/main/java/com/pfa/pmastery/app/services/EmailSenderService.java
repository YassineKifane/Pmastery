package com.pfa.pmastery.app.services;

import javax.mail.MessagingException;
import java.io.IOException;

public interface EmailSenderService {
    void sendEmail(String to, String subject, String message);

    void sendEmailWithAttachment(String to, String subject, String message, String attachment) throws MessagingException;
}
