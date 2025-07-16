import { Component, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from '../../services/message/message.service';
import { Message, MessageResponse, MessagesResponse } from '../../models/message.model';
import { AuthService } from '../../../auth/services/auth.service';
import { ErrorResponse } from '../../models/server.model';
import { Subscription } from 'rxjs';
import { SocketService } from '../../services/socketio/socket.service';

@Component({
  selector: 'app-chat',
  standalone: false,
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})
export class ChatComponent {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  private channelId: string | null = "";
  textMessage: string = "";
  protected messages: Message[] = [];
  private subscription?: Subscription;
  private messageSubscription?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private messageService: MessageService,
    private authService: AuthService,
    private socketService: SocketService
  ) { }

  /**
   * Initialise le composant en récupérant l'ID du serveur depuis l'URL et charge la liste des utilisateurs
   */
  async ngOnInit() {
    this.subscription = this.route.paramMap.subscribe(async (params) => {
      this.channelId = params.get("channelId");
      if (this.channelId) {
        this.messages = [];
        await this.loadMessages();
      }
    });

    this.socketService.emit("join-channel", this.channelId);

    this.messageSubscription = this.socketService.listen<Message>("message").subscribe((message) => {
      this.messages.push(message);
    });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
    this.messageSubscription?.unsubscribe();
  }

  /**
   * Fait défiler automatiquement vers le bas après mise à jour de la vue
   */
  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  /**
   * Vérifie si la réponse est de type MessagesResponse
   * @param res Réponse à vérifier
   * @returns true si la réponse est un MessagesResponse, false sinon
   */
  isMessagesResponse(res: MessagesResponse | ErrorResponse): res is MessagesResponse {
    return res.success === true;
  }

  /**
   * Vérifie si la réponse est de type MessageResponse
   * @param res Réponse à vérifier
   * @returns true si la réponse est un MessageResponse, false sinon
   */  
  isMessageResponse(res: MessageResponse | ErrorResponse): res is MessageResponse {
    return res.success === true;
  }

  /**
   * Charge les messages du channel
   */
  private async loadMessages(): Promise<void> {
    if (!this.channelId) return;

    this.messageService.getMessagesByChannel(this.channelId).subscribe({
      next: (res) => {
        if (this.isMessagesResponse(res)) {
          this.messages = res.data || [];
        }
      },
      error: (err) => {
        console.error("Erreur lors du chargement des messages: ", err);
        alert("Une erreur est survenue, veuillez ressayer plus tard.");
      }
    });
  }

  /**
   * Gère les événements clavier dans la zone de texte
   * @param ev Événement clavier
   */
  handleKeyDown(ev: KeyboardEvent): void {
    if (ev.key === "Enter" && !ev.shiftKey) {
      ev.preventDefault();
      this.sendMessage();
    }
  }

  /**
   * Envoie un nouveau message
   */
  async sendMessage(): Promise<void> {
    const content = this.textMessage.trim();
    const referenceId = (typeof this.channelId === "string") ? this.channelId : "null";
    let author = "null";
    if (this.authService.user?.username) {
      author = this.authService.user.username;
    }
    const now = new Date();

    const message: Message = {
      content,
      authorId: { _id: "null", username: author },
      referenceId,
      isDeleted: false,
      _id: `temp-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
      __v: 0
    }

    this.socketService.emit("message", message);

    this.messages.push(message);
    this.textMessage = "";

    this.messageService.postMessage({content, referenceId}).subscribe({
      next: (res) => {
        if (this.isMessageResponse(res)) {
          const tempIndex = this.messages.findIndex(m => m._id === message._id);
          if (tempIndex !== -1 && res.data) {
            this.messages[tempIndex] = res.data;
          }
        }
      },
      error: (err) => {
        console.error("Erreur lors de l'envoi du message: ", err);
        
        const tempIndex = this.messages.findIndex(m => m._id === message._id);
        if (tempIndex !== -1) {
          this.messages.splice(tempIndex, 1);
        }
        this.textMessage = content;

        alert("Une erreur est survenue, veuillez ressayer plus tard.");
      }
    })
  }

  /**
   * Fait défiler la zone de messages vers le bas
   */
  private scrollToBottom(): void {
    try {
      if (this.messagesContainer) {
        this.messagesContainer.nativeElement.scrollTop = 
          this.messagesContainer.nativeElement.scrollHeight;
      }
    } catch (err) {
      console.error("Erreur lors du scroll: ", err);
    }
  }

/**
 * Formate l'heure d'un message
 * @param date Date à formater (string ou Date)
 * @returns Heure au format HH:MM
 */
formatTime(date: Date | string): string {
  const messageDate = typeof date === 'string' ? new Date(date) : date;
  return messageDate.toTimeString().slice(0, 5);
}
}
