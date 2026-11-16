import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { apiErrorCode, apiErrorMessage } from '../../../../core/models/api.model';
import { PresenceService } from '../../../../core/services/presence.service';
import { Friend, FriendRequest } from '../../models/friend.model';
import { FriendService } from '../../services/friend.service';

/**
 * Page des amis : ajouter un ami par son pseudo, répondre aux demandes,
 * et ouvrir une conversation privée.
 */
@Component({
    selector: 'app-friends',
    templateUrl: './friends.component.html',
    styleUrl: './friends.component.scss',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [ReactiveFormsModule, RouterLink]
})
export class FriendsComponent implements OnInit {
  public formGroup: FormGroup;

  /** Retour affiché sous le formulaire d'ajout */
  feedback: string = '';
  feedbackIsError: boolean = false;

  constructor(
    private fb: FormBuilder,
    protected friendService: FriendService,
    protected presence: PresenceService
  ) {
    this.formGroup = this.fb.group({
      username: ['', [Validators.required, Validators.pattern(/^\S+$/), Validators.maxLength(24)]]
    });
  }

  ngOnInit(): void {
    this.friendService.load();
  }

  /**
   * Envoie une demande d'ami au pseudo saisi
   */
  onSubmit(ev: Event): void {
    ev.preventDefault();
    this.feedback = '';

    if (this.formGroup.invalid) return;

    const username: string = this.formGroup.value.username;

    this.friendService.sendRequest({ username }).subscribe({
      next: (res) => {
        this.feedbackIsError = false;
        this.feedback = res.data.status === 'accepted'
          ? `Vous êtes maintenant ami avec ${username}.`
          : `Demande envoyée à ${username}.`;
        this.formGroup.reset();
      },
      error: (err) => {
        this.feedbackIsError = true;
        this.feedback = apiErrorCode(err) === 'USER_NOT_FOUND'
          ? `Aucun utilisateur ne porte le pseudo « ${username} ».`
          : apiErrorMessage(err);
      }
    });
  }

  accept(request: FriendRequest): void {
    this.friendService.accept(request._id).subscribe({
      error: (err) => alert(apiErrorMessage(err))
    });
  }

  /**
   * Refuse ou annule une demande
   */
  dismiss(request: FriendRequest): void {
    this.friendService.remove(request._id).subscribe({
      error: (err) => alert(apiErrorMessage(err))
    });
  }

  unfriend(friend: Friend): void {
    if (!confirm(`Retirer ${friend.user.username} de vos amis ?`)) return;

    this.friendService.remove(friend._id).subscribe({
      error: (err) => alert(apiErrorMessage(err))
    });
  }
}
