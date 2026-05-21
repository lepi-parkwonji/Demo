import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../auth/auth.service';
import {
  INQUIRY_TITLE_MIN, INQUIRY_TITLE_MAX,
  INQUIRY_CONTENT_MIN, INQUIRY_CONTENT_MAX,
  INQUIRY_AUTHOR_NAME_MAX,
  extractErrorMessage,
} from '@demo-shop/common';
import { ToastService } from '@demo-shop/ui';

@Component({
  selector: 'app-inquiry-form',
  imports: [FormsModule, RouterLink],
  templateUrl: './inquiry-form.component.html',
})
export class InquiryFormComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);
  private authService = inject(AuthService);
  private toast = inject(ToastService);

  readonly TITLE_MIN = INQUIRY_TITLE_MIN;
  readonly TITLE_MAX = INQUIRY_TITLE_MAX;
  readonly CONTENT_MIN = INQUIRY_CONTENT_MIN;
  readonly CONTENT_MAX = INQUIRY_CONTENT_MAX;
  readonly AUTHOR_MAX = INQUIRY_AUTHOR_NAME_MAX;

  isLoggedIn = false;
  authorName = '';
  title = '';
  content = '';
  isSecret = false;

  loading = signal(false);
  errorMsg = signal('');

  ngOnInit() {
    const user = this.authService.user();
    this.isLoggedIn = !!user;
    this.authorName = user?.nickname ?? '';
  }

  onSubmit() {
    this.errorMsg.set('');

    if (!this.isLoggedIn && !this.authorName.trim()) {
      this.errorMsg.set('작성자명을 입력해주세요.');
      return;
    }
    if (this.title.trim().length < this.TITLE_MIN) {
      this.errorMsg.set(`제목은 ${this.TITLE_MIN}자 이상 입력해주세요.`);
      return;
    }
    if (this.content.trim().length < this.CONTENT_MIN) {
      this.errorMsg.set(`내용은 ${this.CONTENT_MIN}자 이상 입력해주세요.`);
      return;
    }

    this.loading.set(true);
    this.http.post('/api/inquiry', {
      authorName: this.authorName,
      title: this.title.trim(),
      content: this.content.trim(),
      isSecret: this.isSecret,
    }).subscribe({
      next: () => {
        this.toast.success('문의가 등록되었습니다.');
        this.router.navigate(['/customer-service/inquiry']);
      },
      error: (err) => {
        const msg = extractErrorMessage(err, '등록에 실패했습니다. 다시 시도해주세요.');
        this.errorMsg.set(msg);
        this.toast.error(msg);
        this.loading.set(false);
      },
    });
  }
}
