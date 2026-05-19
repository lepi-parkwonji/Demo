import { Component, DestroyRef, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ScheduleDTO, RegistrationDTO, PublicApiService } from '../../services/public-api.service';
import { formatPhoneNumber, extractErrorMessage } from '@demo-shop/common';
import { ToastService } from '@demo-shop/ui';

@Component({
  selector: 'app-registration-form',
  imports: [FormsModule],
  templateUrl: './registration-form.component.html',
})
export class RegistrationFormComponent {
  private api = inject(PublicApiService);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);
  private toast = inject(ToastService);

  schedules = signal<ScheduleDTO[]>([]);
  loading = signal(false);
  errorMsg = signal('');
  result = signal<RegistrationDTO | null>(null);

  privacyModal = signal(false);
  marketingModal = signal(false);
  privacyPage = signal<{ title: string; content: string } | null>(null);
  marketingPage = signal<{ title: string; content: string } | null>(null);

  name = '';
  contact = '';
  fairName = '';
  privacyConsent = false;
  marketingConsent = false;

  constructor() {
    this.api.getPublicSchedules()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(items => this.schedules.set(items));

    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(() => {
      this.result.set(null);
      this.name = '';
      this.contact = '';
      this.fairName = '';
      this.privacyConsent = false;
      this.marketingConsent = false;
      this.errorMsg.set('');
    });
  }

  openPrivacyModal() {
    this.privacyModal.set(true);
    if (!this.privacyPage()) {
      this.api.getSitePage('privacy')
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({ next: data => this.privacyPage.set(data), error: () => this.privacyPage.set({ title: '개인정보 수집 및 이용 동의', content: '' }) });
    }
  }

  openMarketingModal() {
    this.marketingModal.set(true);
    if (!this.marketingPage()) {
      this.api.getSitePage('marketing-consent')
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({ next: data => this.marketingPage.set(data), error: () => this.marketingPage.set({ title: '마케팅 정보 수신 동의', content: '' }) });
    }
  }

  onContactInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const v = formatPhoneNumber(input.value);
    this.contact = v;
    input.value = v;
  }

  onSubmit() {
    this.errorMsg.set('');
    if (!this.name.trim()) { this.errorMsg.set('이름을 입력해주세요.'); return; }
    if (!this.contact.trim()) { this.errorMsg.set('연락처를 입력해주세요.'); return; }
    if (!this.fairName) { this.errorMsg.set('참가할 박람회를 선택해주세요.'); return; }
    if (!this.privacyConsent) { this.errorMsg.set('개인정보 수집 및 이용에 동의해주세요.'); return; }

    this.loading.set(true);
    this.api.createRegistration({
      name: this.name.trim(),
      contact: this.contact.trim(),
      fairName: this.fairName,
      marketingConsent: this.marketingConsent,
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: data => { this.result.set(data); this.loading.set(false); this.toast.success('사전등록이 완료되었습니다!'); },
        error: err => {
          const msg = extractErrorMessage(err, '등록에 실패했습니다. 다시 시도해주세요.');
          this.errorMsg.set(msg);
          this.toast.error(msg);
          this.loading.set(false);
        },
      });
  }
}
