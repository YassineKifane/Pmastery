package com.pfa.pmastery.app.services.Impl;

import com.pfa.pmastery.app.services.EmailSenderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import javax.mail.MessagingException;
import javax.mail.internet.MimeMessage;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

@Service
public class EmailSenderServiceImpl implements EmailSenderService {

    private JavaMailSender javaMailSender;

    @Autowired
    public EmailSenderServiceImpl(JavaMailSender javaMailSender) {
        this.javaMailSender = javaMailSender;
    }

    @Override
    public void sendEmail(String to, String subject, String message){

        SimpleMailMessage mailMessage = new SimpleMailMessage();
        mailMessage.setFrom("PMastery");
        mailMessage.setTo(to);
        mailMessage.setSubject(subject);
        mailMessage.setText(message);

        this.javaMailSender.send(mailMessage);
    }

    @Override
    public void sendEmailWithAttachment(String to, String subject, String message, MultipartFile attachment) throws MessagingException, IOException {
        MimeMessage mimeMessage = javaMailSender.createMimeMessage();
        MimeMessageHelper mimeMessageHelper = new MimeMessageHelper(mimeMessage, true);
        mimeMessageHelper.setFrom("PMastery");
        mimeMessageHelper.setTo(to);
        mimeMessageHelper.setSubject(subject);
        mimeMessageHelper.setText(message);
        String fileName = StringUtils.cleanPath(attachment.getOriginalFilename());
        Path tempFile = Files.createTempFile("temp-", fileName);
        attachment.transferTo(tempFile);
        mimeMessageHelper.addAttachment(fileName, tempFile.toFile());
        this.javaMailSender.send(mimeMessage);
        Files.delete(tempFile);
    }
}
