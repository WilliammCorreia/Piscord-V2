import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-channel',
    templateUrl: './channel-layout.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './channel-layout.component.scss',
    imports: [RouterLink, RouterLinkActive, RouterOutlet]
})
export class ChannelLayoutComponent {

}
