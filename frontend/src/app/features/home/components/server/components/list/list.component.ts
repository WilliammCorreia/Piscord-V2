import { Component } from '@angular/core';
import { ServerService } from '../../services/server.service';
import { ErrorResponse, Server, UserServersResponse } from '../../models/server.model';

@Component({
  selector: 'app-list',
  standalone: false,
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss'
})
export class ListComponent {
  protected servers: Server[] = [];

  constructor(private serverService: ServerService) { }

  async ngOnInit() {
    await this.listServers();
  }

  isUserResponse(res: UserServersResponse | ErrorResponse): res is UserServersResponse {
    return res.success === true;
  }

  async listServers() {
    this.serverService.getServerByUser().subscribe({
      next: (res) => {
        if (this.isUserResponse(res)) {
          this.servers = res.data;
        }
      },
      error: (err) => {
        console.error("Erreur la récupération des serveurs:", err);
        alert("Une erreur est survenue, veuillez ressayer plus tard.");
      }
    });
  }
}
