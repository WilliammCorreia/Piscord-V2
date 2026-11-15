import { AfterViewChecked, ChangeDetectionStrategy, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { apiErrorMessage } from '../../../../core/models/api.model';
import { AuthService } from '../../../auth/services/auth.service';
import { Message, MessageDeletedEvent, TypingEvent } from '../../models/message.model';
import { MessageService } from '../../services/message/message.service';
import { SocketService } from '../../services/socketio/socket.service';

/** Préfixe des identifiants provisoires des messages en cours d'envoi */
const TEMP_ID_PREFIX = 'temp-';

/** En dessous de cette distance du bas (en pixels), on considère que l'utilisateur suit la conversation */
const NEAR_BOTTOM_THRESHOLD = 80;

const TYPING_DISPLAY_MS = 3000;
const TYPING_EMIT_INTERVAL_MS = 2000;

@Component({
    selector: 'app-chat',
    templateUrl: './chat.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './chat.component.scss',
    imports: [FormsModule]
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef<HTMLElement>;

  private channelId: string | null = null;
  textMessage: string = "";
  protected messages: Message[] = [];
  protected hasMore: boolean = false;
  protected loadingOlder: boolean = false;

  /** Pseudo -> minuterie qui retire l'indicateur de saisie */
  private typingUsers = new Map<string, ReturnType<typeof setTimeout>>();
  private lastTyping: number = 0;

  private subscriptions = new Subscription();

  /** Défilement à appliquer une fois la vue mise à jour */
  private scrollToBottomPending: boolean = false;
  private scrollHeightBeforePrepend: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private messageService: MessageService,
    private authService: AuthService,
    private socketService: SocketService
  ) { }

  /**
   * Suit le salon affiché (paramètre d'URL) et s'abonne aux événements temps réel
   */
  ngOnInit(): void {
    this.subscriptions.add(
      this.route.paramMap.subscribe((params) => this.switchChannel(params.get("channelId")))
    );

    this.subscriptions.add(
      this.socketService.listen<Message>("message").subscribe((message) => this.onIncomingMessage(message))
    );

    this.subscriptions.add(
      this.socketService.listen<MessageDeletedEvent>("message-deleted").subscribe((event) => {
        this.messages = this.messages.filter((message) => message._id !== event._id);
      })
    );

    this.subscriptions.add(
      this.socketService.listen<TypingEvent>("typing").subscribe((event) => this.onTyping(event))
    );

    // Après une reconnexion, le serveur a oublié les salons de ce socket : on y retourne
    this.subscriptions.add(
      this.socketService.listen<void>("connect").subscribe(() => {
        if (this.channelId) {
          this.socketService.emit("join-channel", this.channelId);
        }
      })
    );
  }

  ngOnDestroy(): void {
    if (this.channelId) {
      this.socketService.emit("leave-channel", this.channelId);
    }
    this.subscriptions.unsubscribe();
    this.clearTypingUsers();
  }

  /**
   * Applique le défilement demandé, une fois que la vue reflète la nouvelle liste de messages
   */
  ngAfterViewChecked(): void {
    const container = this.messagesContainer?.nativeElement;
    if (!container) return;

    if (this.scrollHeightBeforePrepend !== null) {
      // Des messages plus anciens ont été ajoutés au-dessus : on garde le même message sous les yeux
      container.scrollTop += container.scrollHeight - this.scrollHeightBeforePrepend;
      this.scrollHeightBeforePrepend = null;
    }

    if (this.scrollToBottomPending) {
      container.scrollTop = container.scrollHeight;
      this.scrollToBottomPending = false;
    }
  }

  /**
   * Quitte le salon précédent, rejoint le nouveau et charge ses derniers messages
   */
  private switchChannel(newChannelId: string | null): void {
    if (this.channelId) {
      this.socketService.emit("leave-channel", this.channelId);
    }

    this.channelId = newChannelId;
    this.messages = [];
    this.hasMore = false;
    this.clearTypingUsers();

    if (newChannelId) {
      this.socketService.emit("join-channel", newChannelId);
      this.loadMessages(newChannelId);
    }
  }

  /**
   * Charge les messages les plus récents du channel
   */
  private loadMessages(channelId: string): void {
    this.messageService.getMessagesByChannel(channelId).subscribe({
      next: (res) => {
        // L'utilisateur a pu changer de salon pendant la requête
        if (channelId !== this.channelId) return;

        this.messages = res.data;
        this.hasMore = res.hasMore;
        this.scrollToBottomPending = true;
      },
      error: (err) => {
        console.error("Erreur lors du chargement des messages: ", err);
        alert(apiErrorMessage(err));
      }
    });
  }

  /**
   * Charge la page de messages qui précède le plus ancien message affiché
   */
  loadOlderMessages(): void {
    const channelId = this.channelId;
    const oldest = this.messages.find((message) => !message._id.startsWith(TEMP_ID_PREFIX));

    if (!channelId || !oldest || !this.hasMore || this.loadingOlder) return;

    this.loadingOlder = true;

    this.messageService.getMessagesByChannel(channelId, oldest._id).subscribe({
      next: (res) => {
        this.loadingOlder = false;
        if (channelId !== this.channelId) return;

        this.scrollHeightBeforePrepend = this.messagesContainer.nativeElement.scrollHeight;
        this.messages = [...res.data, ...this.messages];
        this.hasMore = res.hasMore;
      },
      error: (err) => {
        this.loadingOlder = false;
        console.error("Erreur lors du chargement des messages: ", err);
        alert(apiErrorMessage(err));
      }
    });
  }

  /**
   * Traite un message diffusé par le serveur
   */
  private onIncomingMessage(message: Message): void {
    // Un message d'un autre salon ne doit jamais s'afficher ici
    if (message.referenceId !== this.channelId) return;
    if (this.messages.some((m) => m._id === message._id)) return;

    this.stopTyping(message.authorId.username);

    // Le serveur diffuse aussi à l'expéditeur : c'est alors la confirmation du message en cours d'envoi
    if (message.authorId._id === this.authService.user?.id) {
      const pendingIndex = this.messages.findIndex(
        (m) => m._id.startsWith(TEMP_ID_PREFIX) && m.content === message.content
      );
      if (pendingIndex !== -1) {
        this.messages[pendingIndex] = message;
        return;
      }
    }

    // On ne fait défiler que si l'utilisateur était déjà en bas : sinon il relit l'historique
    this.scrollToBottomPending = this.isNearBottom();
    this.messages.push(message);
  }

  /**
   * Affiche l'indicateur de saisie d'un utilisateur pendant quelques secondes
   */
  private onTyping(event: TypingEvent): void {
    if (event.channelId !== this.channelId) return;

    this.stopTyping(event.username);
    this.typingUsers.set(
      event.username,
      setTimeout(() => this.typingUsers.delete(event.username), TYPING_DISPLAY_MS)
    );
  }

  private stopTyping(username: string): void {
    clearTimeout(this.typingUsers.get(username));
    this.typingUsers.delete(username);
  }

  private clearTypingUsers(): void {
    this.typingUsers.forEach((timer) => clearTimeout(timer));
    this.typingUsers.clear();
  }

  /**
   * Gère les événements clavier dans la zone de texte
   * @param ev Événement clavier
   */
  handleKeyDown(ev: KeyboardEvent): void {
    if (ev.key === "Enter" && !ev.shiftKey) {
      ev.preventDefault();
      this.sendMessage();
      return;
    }

    if (this.channelId && Date.now() - this.lastTyping > TYPING_EMIT_INTERVAL_MS) {
      this.socketService.emit("typing", { channelId: this.channelId });
      this.lastTyping = Date.now();
    }
  }

  /**
   * Envoie un nouveau message.
   * Il est affiché tout de suite avec un identifiant provisoire, puis remplacé par la version
   * enregistrée. C'est le serveur qui le diffuse aux autres membres, une fois en base.
   */
  sendMessage(): void {
    const content = this.textMessage.trim();
    const referenceId = this.channelId;
    const user = this.authService.user;

    if (!content || !referenceId || !user) return;

    const now = new Date();
    const pending: Message = {
      content,
      authorId: { _id: user.id, username: user.username },
      referenceId,
      isDeleted: false,
      _id: `${TEMP_ID_PREFIX}${Date.now()}`,
      createdAt: now,
      updatedAt: now,
      __v: 0
    };

    this.messages.push(pending);
    this.textMessage = "";
    this.scrollToBottomPending = true;

    this.messageService.postMessage({ content, referenceId }).subscribe({
      next: (res) => {
        const pendingIndex = this.messages.findIndex((m) => m._id === pending._id);
        if (pendingIndex === -1) return; // déjà confirmé par l'événement socket

        if (this.messages.some((m) => m._id === res.data._id)) {
          this.messages.splice(pendingIndex, 1);
        } else {
          this.messages[pendingIndex] = res.data;
        }
      },
      error: (err) => {
        console.error("Erreur lors de l'envoi du message: ", err);

        this.messages = this.messages.filter((m) => m._id !== pending._id);
        this.textMessage = content;

        alert(apiErrorMessage(err));
      }
    });
  }

  private isNearBottom(): boolean {
    const container = this.messagesContainer?.nativeElement;
    if (!container) return true;

    return container.scrollHeight - container.scrollTop - container.clientHeight < NEAR_BOTTOM_THRESHOLD;
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

  get typingText(): string {
    const users = Array.from(this.typingUsers.keys());
    if (!users.length) return '';

    if (users.length === 1) return `${users[0]} écrit...`;
    if (users.length === 2) return `${users[0]} et ${users[1]} écrivent...`;
    return `${users.length} personnes écrivent...`;
  }
}
