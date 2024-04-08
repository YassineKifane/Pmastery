
package com.pfa.pmastery.app.controllers;


import com.pfa.pmastery.app.entities.NotificationEntity;
import com.pfa.pmastery.app.services.ChatMessageService;
import com.pfa.pmastery.app.shared.dto.ChatMessageDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import javax.management.Notification;
import java.util.List;

@RestController
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatMessageService chatMessageService;

    @Autowired
    public ChatController(SimpMessagingTemplate messagingTemplate, ChatMessageService chatMessageService) {
        this.messagingTemplate = messagingTemplate;
        this.chatMessageService = chatMessageService;
    }

    @MessageMapping("/chat")
    public void processMessage(@Payload ChatMessageDto chatMessageDto) {

        ChatMessageDto savedMsg = chatMessageService.save(chatMessageDto);

        messagingTemplate.convertAndSendToUser(
                chatMessageDto.getRecipient().getUserId(), "/queue/messages",
                new NotificationEntity(
                        chatMessageDto.getSender().getLastName() + " " + chatMessageDto.getSender().getFirstName(),
                        chatMessageDto.getRecipient().getLastName() + " " + chatMessageDto.getRecipient().getFirstName(),
                        chatMessageDto.getContent()
                )
        );

    }

    @PutMapping("/messages/notified/{messageId}")
    public ResponseEntity<ChatMessageDto> updateMessageNotifiedStatus(@PathVariable Long messageId, @RequestParam boolean isNotified) {
        ChatMessageDto updatedMessage = chatMessageService.updateNotifiedStatus(messageId, isNotified);

        return ResponseEntity.ok(updatedMessage);
    }



    @GetMapping("/messages/{senderId}/{recipientId}")
    public ResponseEntity<List<ChatMessageDto>> findChatMessages(@PathVariable String senderId,
                                                                 @PathVariable String recipientId) {
        return ResponseEntity.ok(chatMessageService.findChatMessages(senderId, recipientId));
    }

    @GetMapping("/messages/recipient")
    public ResponseEntity<List<ChatMessageDto>> findMessagesByRecipientAndNotified(
            @RequestParam String recipientId,
            @RequestParam boolean isNotified
    ) {
        List<ChatMessageDto> messages = chatMessageService.findMessagesByRecipientAndNotified(recipientId, isNotified);
        return ResponseEntity.ok(messages);
    }

}
