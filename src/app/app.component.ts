import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface StatusResponse { online: boolean; ip?: string; port?: number; version?: string; icon?: string; players?: { online?: number; max?: number; list?: string[] }; }

@Component({
  selector: 'app-root',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit, OnDestroy {
  readonly statusApi = 'https://api.mcsrvstat.us/3/169.155.122.96:9130';
  readonly skins = ['linear-gradient(#4b271b 0 22%,#a9653e 22% 47%,#f0ad77 47% 83%,#82503c 83%)', 'linear-gradient(#ef8b36 0 22%,#f5ba8f 22% 52%,#f4d29f 52% 80%,#6cbc69 80%)', 'linear-gradient(#573823 0 23%,#926040 23% 52%,#c58e63 52% 80%,#5a3a29 80%)', 'linear-gradient(#f2d271 0 24%,#f5cf91 24% 54%,#fae2b4 54% 81%,#69b4a5 81%)'];
  online = false; checking = true; host = '169.155.122.96'; port = 9130; version = 'Connecting…'; players: string[] = []; playerCount = 0; playerMax = 0; ping = '—'; icon?: string;
  private refreshTimer?: ReturnType<typeof setInterval>;

  ngOnInit(): void { this.refresh(); this.refreshTimer = setInterval(() => this.refresh(), 5000); }
  ngOnDestroy(): void { if (this.refreshTimer) clearInterval(this.refreshTimer); }
  async refresh(): Promise<void> {
    const started = performance.now(); this.checking = true;
    try {
      const response = await fetch(this.statusApi, { cache: 'no-store' });
      const data = await response.json() as StatusResponse;
      this.online = response.ok && data.online; this.host = data.ip || this.host; this.port = data.port || this.port; this.version = data.version || 'Unknown'; this.icon = data.icon;
      this.playerCount = data.players?.online || 0; this.playerMax = data.players?.max || 0; this.players = data.players?.list || []; this.ping = `${Math.round(performance.now() - started)} ms`;
    } catch { this.online = false; this.version = 'Server unreachable'; this.players = []; this.playerCount = 0; this.playerMax = 0; }
    finally { this.checking = false; }
  }
}
