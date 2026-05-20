import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FaqResponseDto as FaqDTO,
  faqControllerCreate,
  faqControllerFindOne,
  faqControllerUpdate,
} from '@demo-shop/api-client';
import { map } from 'rxjs/operators';
import { ToastService } from '@demo-shop/ui';
import { RichEditorComponent } from '../../../libs/rich-editor.component';

const QUESTION_MAX = 200;

@Component({
  selector: 'app-faq-form',
  imports: [FormsModule, RichEditorComponent],
  templateUrl: './faq-form.component.html',
})
export class FaqFormComponent implements OnInit {
  @ViewChild(RichEditorComponent) editorRef!: RichEditorComponent;

  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toast = inject(ToastService);

  readonly QUESTION_MAX = QUESTION_MAX;

  question = '';
  answer = '';
  loading = signal(false);
  errorMsg = signal('');
  isEdit = false;
  private faqId: number | null = null;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.isEdit = true;
    this.faqId = +id;

    const state = history.state as { faq?: FaqDTO } | undefined;
    if (state?.faq) {
      this.question = state.faq.question;
      this.answer = state.faq.answer;
    }

    faqControllerFindOne(this.http, '', { id: this.faqId }).pipe(map(r => r.body)).subscribe({
      next: (faq) => {
        this.question = faq.question;
        this.answer = faq.answer;
      },
      error: () => {
        if (!state?.faq) {
          this.errorMsg.set('데이터를 불러오지 못했습니다.');
        }
      },
    });
  }

  navigateBack() {
    this.router.navigate(['/customer/faq']);
  }

  onSubmit() {
    if (!this.question.trim()) {
      this.errorMsg.set('질문을 입력해주세요.');
      return;
    }
    if (!this.editorRef.getText().trim()) {
      this.errorMsg.set('답변을 입력해주세요.');
      return;
    }
    this.loading.set(true);
    this.errorMsg.set('');

    const body = { question: this.question, answer: this.answer };
    const request$ = this.isEdit && this.faqId
      ? faqControllerUpdate(this.http, '', { id: this.faqId, body }).pipe(map(r => r.body))
      : faqControllerCreate(this.http, '', { body }).pipe(map(r => r.body));

    request$.subscribe({
      next: () => {
        this.toast.success(this.isEdit ? 'FAQ가 수정되었습니다.' : 'FAQ가 등록되었습니다.');
        this.router.navigate(['/customer/faq']);
      },
      error: (error) => {
        const status = error?.status;
        if (status === 401) this.errorMsg.set('인증이 만료되었습니다. 다시 로그인해주세요.');
        else if (status === 404) this.errorMsg.set('FAQ를 찾을 수 없습니다.');
        else this.errorMsg.set(`저장 중 오류가 발생했습니다. (${status ?? 'network error'})`);
        this.loading.set(false);
      },
    });
  }
}
