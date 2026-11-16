import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ShellComponent } from '../../../../core/components/shell/shell.component';

@Component({
    selector: 'app-auth-layout',
    templateUrl: './auth-layout.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RouterLink, RouterLinkActive, RouterOutlet, ShellComponent]
})
export class AuthLayoutComponent {

}
