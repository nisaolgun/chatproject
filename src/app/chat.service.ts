import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { HubConnection, HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr';
import { from } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private hubConnection: HubConnection;
  private apiUrl = 'http://192.168.1.77:8888/api/Message/SendMessage';

  constructor(private http: HttpClient) {
    this.startConnection();
  }

  private async startConnection(): Promise<void> {
    if (this.hubConnection && this.hubConnection.state === HubConnectionState.Connected) {
      return;
    }

    this.hubConnection = new HubConnectionBuilder()
      .withUrl('http://192.168.1.77:8888/chat-hub')
      .build();

    this.hubConnection.onclose(error => {
      console.error('Connection closed with error:', error);
      setTimeout(() => this.startConnection(), 5000);
    });

    try {
      await this.hubConnection.start();
      console.log('Connection started');
      this.addReceiveMessageListener(this.onMessageReceived);
      this.hubConnection.invoke("Connect", "3932b1a3-4e09-4f7e-25e5-08dc9ce76380");
    } catch (err) {
      console.error('Error while starting connection: ', err);
      setTimeout(() => this.startConnection(), 5000);
    }
  }

  public addReceiveMessageListener(callback: (senderUserId: string, messageContent: string) => void): void {
    if (!this.hubConnection) {
      console.error('Hub connection is not initialized.');
      return;
    }

    this.hubConnection.on('ReceiveMessage', (senderUserId: string, messageContent: string) => {
      console.log('ReceiveMessage event triggered');
      callback(senderUserId, messageContent);
    });
  }

  public sendMessage(senderUserId: string, message: string, messageRecipientId: string, token: string): Observable<any> {
    const payload = { message, senderUserId, messageRecipientId };
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    return from(this.startConnection()).pipe(
      switchMap(() => {
        return this.http.post(this.apiUrl, payload, { headers }).pipe(
          tap(response => console.log('Message sent:', response)),
          catchError(error => {
            console.error('Error sending message:', error);
            return throwError(error);
          })
        );
      })
    );
  }

  public getMessages(recipeUserId: string, token: string): Observable<any> {
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    const url = `http://192.168.1.77:8888/api/Message/GetMessage?recipeUserId=${recipeUserId}`;

    return this.http.get(url, { headers }).pipe(
      tap(response => console.log('Messages retrieved:', response)),
      catchError(error => {
        console.error('Error retrieving messages:', error);
        return throwError(error);
      })
    );
  }

  private onMessageReceived(senderUserId: string, messageContent: string): void {
    console.log('Received message:', senderUserId, messageContent);
  }
}
