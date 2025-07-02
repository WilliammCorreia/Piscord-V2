import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-server-layout',
  standalone: false,
  templateUrl: './server-layout.component.html',
  styleUrl: './server-layout.component.scss'
})
export class ServerLayoutComponent {
  id: string | null = "";

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get("id");
  }
}
