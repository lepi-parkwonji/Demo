import { NgClass, SlicePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  InquiryResponseDto as InquiryDTO,
  inquiryControllerAnswer,
  inquiryControllerFindOne,
} from '@demo-shop/api-client';
import { map } from 'rxjs/operators';
import { ToastService } from '@demo-shop/ui';
import { RichEditorComponent } from '../../../libs/rich-editor.component';

@Component({
  selector: 'app-inquiry-answer',
  imports: [FormsModule, SlicePipe, NgClass, RichEditorComponent],
  templateUrl: './inquiry-answer.component.html',
})
export class InquiryAnswerComponent implements OnInit {
  @ViewChild(RichEditorComponent) editorRef!: RichEditorComponent;

  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toast = inject(ToastService);

  inquiry = signal<InquiryDTO | null>(null);
  answer = '';
  loading = signal(false);
  errorMsg = signal('');
  private inquiryId!: number;

  ngOnInit() {
    this.inquiryId = +(this.route.snapshot.paramMap.get('id') ?? 0);

    const state = history.state as { inquiry?: InquiryDTO } | undefined;
    if (state?.inquiry) {
      this.inquiry.set(state.inquiry);
      this.answer = state.inquiry.answer ?? '';
    }

    inquiryControllerFindOne(this.http, '', { id: this.inquiryId }).pipe(map(r => r.body)).subscribe({
      next: (data) => {
        this.inquiry.set(data);
        this.answer = data.answer ?? '';
      },
      error: () => {
        if (!state?.inquiry) this.errorMsg.set('데이터를 불러오지 못했습니다.');
      },
    });
  }

  navigateBack() {
    this.router.navigate(['/customer/inquiry']);
  }

  onSubmit() {
    if (!this.editorRef.getText().trim()) {
      this.errorMsg.set('답변을 입력해주세요.');
      return;
    }
    this.loading.set(true);
    this.errorMsg.set('');

    inquiryControllerAnswer(this.http, '', { id: this.inquiryId, body: { answer: this.answer } }).pipe(map(r => r.body)).subscribe({
      next: () => {
        this.toast.success('답변이 등록되었습니다.');
        this.router.navigate(['/customer/inquiry']);
      },
      error: (error) => {
        const status = error?.status;
        if (status === 401) this.errorMsg.set('인증이 만료되었습니다. 다시 로그인해주세요.');
        else if (status === 404) this.errorMsg.set('문의를 찾을 수 없습니다.');
        else this.errorMsg.set(`저장 중 오류가 발생했습니다. (${status ?? 'network error'})`);
        this.loading.set(false);
      },
    });
  }
}
