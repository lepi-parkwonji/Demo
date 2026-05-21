import { SlicePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  RegistrationResponseDto as RegistrationDTO,
  registrationControllerCreate,
  registrationControllerFindOne,
  registrationControllerUpdate,
  scheduleControllerSearch,
  ScheduleResponseDto as ScheduleDTO,
} from '@demo-shop/api-client';
import { map } from 'rxjs/operators';
import { ToastService } from '@demo-shop/ui';
import { formatPhoneNumber } from '@demo-shop/common';

@Component({
  selector: 'app-registration-form',
  imports: [FormsModule, SlicePipe],
  templateUrl: './registration-form.component.html',
})
export class RegistrationFormComponent implements OnInit {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toast = inject(ToastService);

  item = signal<RegistrationDTO | null>(null);
  schedules = signal<ScheduleDTO[]>([]);
  isNew = signal(false);
  loading = signal(false);
  errorMsg = signal('');

  name = '';
  contact = '';
  fairName = '';
  marketingConsent = false;

  ngOnInit() {
    scheduleControllerSearch(this.http, '', { pageNo: 1, pageSize: 100 })
      .pipe(map(r => r.body.items))
      .subscribe({
        next: items => this.schedules.set(items),
        error: () => this.toast.error('박람회 목록을 불러오지 못했습니다.'),
      });

    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) {
      this.isNew.set(true);
      return;
    }

    const id = +idParam;
    if (!id) { this.goBack(); return; }

    registrationControllerFindOne(this.http, '', { id }).pipe(map(r => r.body)).subscribe({
      next: data => { this.item.set(data); this.fillForm(data); },
      error: () => this.errorMsg.set('데이터를 불러오지 못했습니다.'),
    });
  }

  private fillForm(r: RegistrationDTO) {
    this.name = r.name;
    this.contact = r.contact;
    this.fairName = r.fairName;
    this.marketingConsent = r.marketingConsent;
  }

  onContactInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const v = formatPhoneNumber(input.value);
    this.contact = v;
    input.value = v;
  }

  save() {
    if (!this.name.trim()) { this.errorMsg.set('이름을 입력해주세요.'); return; }
    if (!this.contact.trim()) { this.errorMsg.set('연락처를 입력해주세요.'); return; }
    if (!this.fairName) { this.errorMsg.set('참가 박람회를 선택해주세요.'); return; }

    this.loading.set(true);
    this.errorMsg.set('');

    const body = { name: this.name.trim(), contact: this.contact.trim(), fairName: this.fairName, marketingConsent: this.marketingConsent };

    const item = this.item();
    const request$ = this.isNew() || !item
      ? registrationControllerCreate(this.http, '', { body }).pipe(map(r => r.body))
      : registrationControllerUpdate(this.http, '', { id: item.id, body }).pipe(map(r => r.body));

    request$.subscribe({
      next: () => {
        this.toast.success(this.isNew() ? '등록되었습니다.' : '저장되었습니다.');
        this.router.navigate(['/expo/registration']);
      },
      error: () => {
        this.errorMsg.set('저장 중 오류가 발생했습니다.');
        this.loading.set(false);
      },
    });
  }

  goBack() {
    this.router.navigate(['/expo/registration']);
  }
}
