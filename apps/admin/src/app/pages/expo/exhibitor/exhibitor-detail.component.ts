import { DecimalPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  ExhibitorResponseDto as ExhibitorDTO,
  exhibitorControllerCreate,
  exhibitorControllerFindOne,
  exhibitorControllerUpdate,
  scheduleControllerSearch,
  ScheduleResponseDto as ScheduleDTO,
} from '@demo-shop/api-client';
import { map } from 'rxjs/operators';
import { ToastService } from '@demo-shop/ui';
import { formatPhoneNumber } from '@demo-shop/common';

const BOOTH_PRICES: Record<string, number> = {
  SPACE_ONLY: 1000000,
  SHELL_SCHEME: 1500000,
  PREMIUM: 2500000,
};

const AVAILABLE_OPTIONS = [
  { label: '단상 3kw (50,000원)', value: '단상 3kw', price: 50000 },
  { label: '삼상 10kw (150,000원)', value: '삼상 10kw', price: 150000 },
  { label: '인터넷 1회선 (100,000원)', value: '인터넷 1회선', price: 100000 },
  { label: '급배수 (200,000원)', value: '급배수', price: 200000 },
  { label: '압축공기 (100,000원)', value: '압축공기', price: 100000 },
  { label: '스포트라이트 2개 (30,000원)', value: '스포트라이트 2개', price: 30000 },
];

@Component({
  selector: 'app-exhibitor-detail',
  imports: [FormsModule, DecimalPipe],
  templateUrl: './exhibitor-detail.component.html',
})
export class ExhibitorDetailComponent implements OnInit {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toast = inject(ToastService);

  item = signal<ExhibitorDTO | null>(null);
  schedules = signal<ScheduleDTO[]>([]);
  isNew = signal(false);
  loading = signal(false);
  errorMsg = signal('');

  readonly availableOptions = AVAILABLE_OPTIONS;

  // form fields (two-way binding for new/edit)
  scheduleId = 0;
  companyName = '';
  representativeName = '';
  businessRegNumber = '';
  managerName = '';
  contact = '';
  email = '';
  boothType: 'SPACE_ONLY' | 'SHELL_SCHEME' | 'PREMIUM' = 'SPACE_ONLY';
  boothCount = 1;
  selectedOptions: string[] = [];
  totalFee = 0;
  status: 'PENDING' | 'WAITING_PAYMENT' | 'APPROVED' | 'CANCELED' = 'PENDING';
  boothNumber = '';
  adminMemo = '';

  ngOnInit() {
    this.loadSchedules();

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam === 'new') {
      this.isNew.set(true);
      this.recalculateFee();
      return;
    }

    const id = idParam ? +idParam : null;
    if (!id) { this.goBack(); return; }

    exhibitorControllerFindOne(this.http, '', { id }).pipe(map(r => r.body)).subscribe({
      next: (data) => { this.item.set(data); this.fillForm(data); },
      error: () => this.errorMsg.set('데이터를 불러오지 못했습니다.'),
    });
  }

  private loadSchedules() {
    scheduleControllerSearch(this.http, '', { pageNo: 1, pageSize: 100 })
      .pipe(map(r => r.body.items))
      .subscribe({
        next: (items) => this.schedules.set(items),
        error: () => this.toast.error('박람회 목록을 불러오지 못했습니다.'),
      });
  }

  private fillForm(e: ExhibitorDTO) {
    this.scheduleId = e.scheduleId;
    this.companyName = e.companyName;
    this.representativeName = e.representativeName;
    this.businessRegNumber = e.businessRegNumber;
    this.managerName = e.managerName;
    this.contact = e.contact;
    this.email = e.email;
    this.boothType = e.boothType as 'SPACE_ONLY' | 'SHELL_SCHEME' | 'PREMIUM';
    this.boothCount = e.boothCount;
    this.selectedOptions = [...e.options];
    this.totalFee = e.totalFee;
    this.status = e.status as 'PENDING' | 'WAITING_PAYMENT' | 'APPROVED' | 'CANCELED';
    this.boothNumber = e.boothNumber ?? '';
    this.adminMemo = e.adminMemo ?? '';
  }

  isCoreDisabled(): boolean {
    if (this.isNew()) return false;
    return this.status === 'WAITING_PAYMENT' || this.status === 'APPROVED';
  }

  toggleOption(optionValue: string) {
    if (this.isCoreDisabled()) return;
    const idx = this.selectedOptions.indexOf(optionValue);
    if (idx > -1) this.selectedOptions.splice(idx, 1);
    else this.selectedOptions.push(optionValue);
    this.recalculateFee();
  }

  recalculateFee() {
    const base = BOOTH_PRICES[this.boothType] ?? 0;
    let fee = base * this.boothCount;
    for (const opt of this.selectedOptions) {
      const found = AVAILABLE_OPTIONS.find(o => o.value === opt);
      if (found) fee += found.price;
    }
    this.totalFee = fee;
  }

  formatBusinessRegNumber(event: Event) {
    const input = event.target as HTMLInputElement;
    const digits = input.value.replace(/\D/g, '').slice(0, 10);
    let v = digits;
    if (digits.length > 5) v = `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
    else if (digits.length > 3) v = `${digits.slice(0, 3)}-${digits.slice(3)}`;
    this.businessRegNumber = v;
    input.value = v;
  }

  formatContact(event: Event) {
    const input = event.target as HTMLInputElement;
    const v = formatPhoneNumber(input.value);
    this.contact = v;
    input.value = v;
  }

  save() {
    if (!this.companyName.trim()) { this.errorMsg.set('업체명을 입력해주세요.'); return; }
    if (!this.scheduleId) { this.errorMsg.set('참가 박람회를 선택해주세요.'); return; }

    this.loading.set(true);
    this.errorMsg.set('');

    const orUndef = (s: string) => s.trim() || undefined;
    const body = {
      scheduleId: this.scheduleId,
      companyName: this.companyName.trim(),
      representativeName: orUndef(this.representativeName),
      businessRegNumber: orUndef(this.businessRegNumber),
      managerName: orUndef(this.managerName),
      contact: orUndef(this.contact),
      email: orUndef(this.email),
      boothType: this.boothType,
      boothCount: this.boothCount,
      options: this.selectedOptions,
      totalFee: this.totalFee,
    };

    const request$ = this.isNew()
      ? exhibitorControllerCreate(this.http, '', { body }).pipe(map(r => r.body))
      : exhibitorControllerUpdate(this.http, '', {
          id: this.item()!.id,
          body: { ...body, status: this.status, boothNumber: this.boothNumber, adminMemo: this.adminMemo },
        }).pipe(map(r => r.body));

    request$.subscribe({
      next: () => {
        this.toast.success(this.isNew() ? '등록되었습니다.' : '저장되었습니다.');
        this.router.navigate(['/expo/exhibitor']);
      },
      error: () => {
        this.errorMsg.set('저장 중 오류가 발생했습니다.');
        this.loading.set(false);
      },
    });
  }

  goBack() {
    this.router.navigate(['/expo/exhibitor']);
  }
}
