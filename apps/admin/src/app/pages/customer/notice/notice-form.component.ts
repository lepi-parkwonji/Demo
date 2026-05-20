import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  NoticeResponseDto as NoticeDTO,
  noticeControllerCreate,
  noticeControllerFindOne,
  noticeControllerUpdate,
} from '@demo-shop/api-client';
import { map } from 'rxjs/operators';
import { ToastService } from '@demo-shop/ui';
import { RichEditorComponent } from '../../../libs/rich-editor.component';

const TITLE_MAX = 100;

@Component({
  selector: 'app-notice-form',
  imports: [FormsModule, RichEditorComponent],
  templateUrl: './notice-form.component.html',
})
export class NoticeFormComponent implements OnInit {
  @ViewChild(RichEditorComponent) editorRef!: RichEditorComponent;

  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toast = inject(ToastService);

  readonly TITLE_MAX = TITLE_MAX;

  title = '';
  content = '';
  loading = signal(false);
  errorMsg = signal('');
  isEdit = false;
  private noticeId: number | null = null;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.isEdit = true;
    this.noticeId = +id;

    const state = history.state as { notice?: NoticeDTO } | undefined;
    if (state?.notice) {
      this.title = state.notice.title;
      this.content = state.notice.content;
    }

    noticeControllerFindOne(this.http, '', { id: this.noticeId }).pipe(map(r => r.body)).subscribe({
      next: (notice) => {
        this.title = notice.title;
        this.content = notice.content;
      },
      error: () => {
        if (!state?.notice) {
          this.errorMsg.set('데이터를 불러오지 못했습니다.');
        }
      },
    });
  }

  navigateBack() {
    this.router.navigate(['/customer/notice']);
  }

  onSubmit() {
    if (!this.title.trim()) {
      this.errorMsg.set('제목을 입력해주세요.');
      return;
    }
    if (!this.editorRef.getText().trim()) {
      this.errorMsg.set('내용을 입력해주세요.');
      return;
    }
    this.loading.set(true);
    this.errorMsg.set('');

    const body = { title: this.title, content: this.content };
    const saveRequest = this.isEdit && this.noticeId
      ? noticeControllerUpdate(this.http, '', { id: this.noticeId, body }).pipe(map(r => r.body))
      : noticeControllerCreate(this.http, '', { body }).pipe(map(r => r.body));

    saveRequest.subscribe({
      next: () => {
        this.toast.success(this.isEdit ? '공지사항이 수정되었습니다.' : '공지사항이 등록되었습니다.');
        this.router.navigate(['/customer/notice']);
      },
      error: (error) => {
        const status = error?.status;
        if (status === 401) this.errorMsg.set('인증이 만료되었습니다. 다시 로그인해주세요.');
        else if (status === 404) this.errorMsg.set('공지사항을 찾을 수 없습니다.');
        else this.errorMsg.set(`저장 중 오류가 발생했습니다. (${status ?? 'network error'})`);
        this.loading.set(false);
      },
    });
  }
}
