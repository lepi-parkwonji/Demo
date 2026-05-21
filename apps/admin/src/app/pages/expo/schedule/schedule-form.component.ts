import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  ScheduleResponseDto as ScheduleDTO,
  scheduleControllerCreate,
  scheduleControllerFindOne,
  scheduleControllerUpdate,
} from '@demo-shop/api-client';
import { map } from 'rxjs/operators';
import { ToastService } from '@demo-shop/ui';

@Component({
  selector: 'app-schedule-form',
  imports: [FormsModule],
  templateUrl: './schedule-form.component.html',
})
export class ScheduleFormComponent implements OnInit {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toast = inject(ToastService);

  isEdit = false;
  private scheduleId: number | null = null;

  fairName = '';
  year = new Date().getFullYear();
  region = '';
  type = '';
  startTime = '';
  endTime = '';
  entranceFee = 0;
  place = '';
  details = '';
  notice = '';
  eventNotes = '';
  thumbnail = '';

  loading = signal(false);
  errorMsg = signal('');

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.isEdit = true;
    this.scheduleId = +id;

    const state = history.state as { schedule?: ScheduleDTO } | undefined;
    if (state?.schedule) this.fillForm(state.schedule);

    scheduleControllerFindOne(this.http, '', { id: this.scheduleId }).pipe(map(r => r.body)).subscribe({
      next: (data) => this.fillForm(data),
      error: () => {
        if (!state?.schedule) this.errorMsg.set('데이터를 불러오지 못했습니다.');
      },
    });
  }

  private fillForm(s: ScheduleDTO) {
    this.fairName = s.fairName;
    this.year = s.year;
    this.region = s.region;
    this.type = s.type;
    this.startTime = s.startTime.slice(0, 16);
    this.endTime = s.endTime.slice(0, 16);
    this.entranceFee = s.entranceFee;
    this.place = s.place;
    this.details = s.details;
    this.notice = s.notice ?? '';
    this.eventNotes = s.eventNotes ?? '';
    this.thumbnail = s.thumbnail ?? '';
  }

  navigateBack() {
    this.router.navigate(['/expo/schedule']);
  }

  onSubmit() {
    if (!this.fairName.trim()) { this.errorMsg.set('박람회명을 입력해주세요.'); return; }
    if (!this.region.trim()) { this.errorMsg.set('지역을 입력해주세요.'); return; }
    if (!this.startTime || !this.endTime) { this.errorMsg.set('기간을 입력해주세요.'); return; }
    if (!this.place.trim()) { this.errorMsg.set('장소를 입력해주세요.'); return; }
    if (!this.details.trim()) { this.errorMsg.set('상세 내용을 입력해주세요.'); return; }

    this.loading.set(true);
    this.errorMsg.set('');

    const body = {
      fairName: this.fairName.trim(),
      year: this.year,
      region: this.region.trim(),
      type: this.type.trim(),
      startTime: new Date(this.startTime).toISOString(),
      endTime: new Date(this.endTime).toISOString(),
      entranceFee: this.entranceFee,
      place: this.place.trim(),
      details: this.details.trim(),
      notice: this.notice.trim() || undefined,
      eventNotes: this.eventNotes.trim() || undefined,
      thumbnail: this.thumbnail.trim() || undefined,
    };

    const request$ = this.isEdit && this.scheduleId
      ? scheduleControllerUpdate(this.http, '', { id: this.scheduleId, body }).pipe(map(r => r.body))
      : scheduleControllerCreate(this.http, '', { body }).pipe(map(r => r.body));

    request$.subscribe({
      next: () => {
        this.toast.success(this.isEdit ? '박람회가 수정되었습니다.' : '박람회가 등록되었습니다.');
        this.router.navigate(['/expo/schedule']);
      },
      error: (error) => {
        const status = error?.status;
        if (status === 401) this.errorMsg.set('인증이 만료되었습니다. 다시 로그인해주세요.');
        else if (status === 404) this.errorMsg.set('박람회를 찾을 수 없습니다.');
        else this.errorMsg.set(`저장 중 오류가 발생했습니다. (${status ?? 'network error'})`);
        this.loading.set(false);
      },
    });
  }
}
