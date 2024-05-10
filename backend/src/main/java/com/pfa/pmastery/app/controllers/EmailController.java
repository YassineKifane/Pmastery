package com.pfa.pmastery.app.controllers;

import com.pfa.pmastery.app.services.EmailSenderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import javax.mail.MessagingException;
import java.io.IOException;

@RestController
@RequestMapping
public class EmailController {

    private final EmailSenderService emailSenderService;

    @Autowired
    public EmailController(EmailSenderService emailSenderService) {
        this.emailSenderService = emailSenderService;
    }

    @PostMapping("/send-pdf")
    public ResponseEntity<Void> sendPDFByEmail(
            @RequestParam("email") String to,
            @RequestParam("subject") String subject,
            @RequestParam("message") String message,
            @RequestParam("attachment") MultipartFile attachment) {

        try {
            emailSenderService.sendEmailWithAttachment(to, subject, message, attachment);
            return ResponseEntity.ok().build();
        } catch (MessagingException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

}
