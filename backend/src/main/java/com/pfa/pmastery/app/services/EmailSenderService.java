package com.pfa.pmastery.app.services;

import org.springframework.web.multipart.MultipartFile;

import javax.mail.MessagingException;
import java.io.IOException;

public interface EmailSenderService {
    void sendEmail(String to, String subject, String message);

    void sendEmailWithAttachment(String to, String subject, String message, MultipartFile attachment) throws MessagingException, IOException;
}
