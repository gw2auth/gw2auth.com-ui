import { AfterViewInit, Component, TemplateRef, ViewChild } from '@angular/core';
import { NgbOffcanvas, NgbOffcanvasRef } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';


@Component({
  selector: 'app-banner',
  templateUrl: './banner.component.html'
})
export class BannerComponent implements AfterViewInit {

  @ViewChild('content') content!: TemplateRef<any>;
  showApiIssuesBanner: boolean;
  showSotoReleaseBanner: boolean;
  sotoReleaseDate: string;
  sotoApiDowntimeFromDate: string;
  sotoApiDowntimeUntilDate: string;

  private offcanvasRef?: NgbOffcanvasRef

  constructor(private readonly offcanvasService: NgbOffcanvas, private readonly httpClient: HttpClient) {
    const showSotoFrom = Date.parse('2023-08-18T00:00:00.000Z');
    const showSotoUntil = Date.parse('2023-08-25T00:00:00.000Z');
    const now = Date.now();

    this.showApiIssuesBanner = false;
    this.showSotoReleaseBanner = now >= showSotoFrom && now <= showSotoUntil;
    this.sotoReleaseDate = new Date('2023-08-22T16:00:00.000Z').toLocaleString();// seattle 9am
    this.sotoApiDowntimeFromDate = new Date('2023-08-18T07:00:00.000Z').toLocaleDateString();// seattle 00:00
    this.sotoApiDowntimeUntilDate = new Date('2023-08-24T06:59:59.999Z').toLocaleDateString();// seattle 23:59
  }

  ngAfterViewInit(): void {
    this.checkApiStatus().then(() => {});

    if (this.showApiIssuesBanner || this.showSotoReleaseBanner) {
      this.open();
    }
  }

  private async checkApiStatus(): Promise<void> {
    const relevantEndpoints = new Set<string>([
      '/v2/tokeninfo',
      '/v2/account',
      '/v2/characters',
      '/v2/createsubtoken',
      '/v2/commerce/transactions/current/buys',
    ]);

    const promise = firstValueFrom(this.httpClient.get<{data: any[]}>('https://status.gw2efficiency.com/api'));
    let result;
    try {
      result = await promise;
    } catch (e) {
      // no critical request, nothing to handle here
      return;
    }

    for (let value of result.data) {
      if (relevantEndpoints.has(value.name)) {
        if (value.error || value.status !== 200) {
          this.showApiIssuesBanner = true;
          this.open();
          break;
        }
      }
    }
  }

  private open(): void {
    if (!this.offcanvasRef) {
      this.offcanvasRef = this.offcanvasService.open(
        this.content,
        {
          position: 'top',
          scroll: true,
          backdrop: false,
          keyboard: true,
          panelClass: 'bg-accent',
          beforeDismiss: () => {
            this.offcanvasRef = undefined;
            return true;
          }
        },
      );
    }
  }
}
