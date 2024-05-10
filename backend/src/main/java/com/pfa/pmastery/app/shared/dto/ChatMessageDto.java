
package com.pfa.pmastery.app.shared.dto;

import java.util.Date;

public class ChatMessageDto {

    private Long id;
    private String chatId;
    private String content;
    private ChatUserDto sender;
    private ChatUserDto recipient;
    private Date timestamp;
    private boolean isNotified;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getChatId() {
        return chatId;
    }

    public void setChatId(String chatId) {
        this.chatId = chatId;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public ChatUserDto getSender() {
        return sender;
    }

    public void setSender(ChatUserDto sender) {
        this.sender = sender;
    }

    public ChatUserDto getRecipient() {
        return recipient;
    }

    public void setRecipient(ChatUserDto recipient) {
        this.recipient = recipient;
    }

    public Date getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Date timestamp) {
        this.timestamp = timestamp;
    }

    public boolean isNotified() {
        return isNotified;
    }

    public void setNotified(boolean notified) {
        isNotified = notified;
    }
}
