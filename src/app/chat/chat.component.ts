import { Component, OnInit } from '@angular/core';
import { ChatService } from '../chat.service';
import { AuthService } from '../authservice.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
  messages: { senderId: string, message: string }[] = [];
  isOpen: boolean = false;
  senderUserId: string = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
  messageRecipientId: string = '3932b1a3-4e09-4f7e-25e5-08dc9ce76380';
  newMessage: string = '';

  constructor(private chatService: ChatService, private authService: AuthService) {}

  ngOnInit(): void {
    const token = this.authService.getToken();
    const recipeUserId = this.messageRecipientId;

    if (token) {
      this.loadMessages(recipeUserId, token);
    } else {
      console.error('No token found, unable to retrieve messages.');
    }

    this.chatService.addReceiveMessageListener((messageRecipientId, messageContent) => {
      this.onMessageReceived(messageRecipientId, messageContent);
    });
  }

  loadMessages(recipeUserId: string, token: string) {
    this.chatService.getMessages(recipeUserId, token).subscribe(
      response => {
        this.messages = response;
        console.log('Messages retrieved:', this.messages);
      },
      error => {
        console.error('Error retrieving messages:', error);
      }
    );
  }

  onMessageReceived(messageRecipientId: string, messageContent: string) {
    this.messages.push({
      senderId: messageRecipientId,
      message: messageContent
    });
    console.log('Message received:', messageRecipientId, messageContent);
  }

  sendMessage(event: Event): void {
    event.preventDefault();
    const token = this.authService.getToken();

    if (token) {
      this.chatService.sendMessage(this.senderUserId, this.newMessage, this.messageRecipientId, token).subscribe(
        response => {
          console.log('Message sent successfully:', response);
          this.messages.push({
            senderId: this.senderUserId,
            message: this.newMessage
          });
          this.newMessage = '';
        },
        error => {
          console.error('Error sending message:', error);
        }
      );
    } else {
      console.error('No token found, unable to send message.');
    }
  }

  toggleChat(): void {
    this.isOpen = !this.isOpen;
  }

  adjustTextarea(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }
}
