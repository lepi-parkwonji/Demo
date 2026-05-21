import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../auth/auth.service';

@Component({
  selector: 'app-sign-in',
  imports: [FormsModule],
  templateUrl: './sign-in.component.html',
})
export class SignInComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  username = '';
  password = '';
  loading = signal(false);
  errorMsg = signal('');

  async onSubmit() {
    if (!this.username || !this.password) return;
    this.loading.set(true);
    this.errorMsg.set('');

    this.authService.signin(this.username, this.password).subscribe({
      next: (tokens) => {
        this.authService.loginAndFetch(tokens).then(ok => {
          if (ok) this.router.navigate(['/']);
          else {
            this.errorMsg.set('로그인 정보를 불러오지 못했습니다.');
            this.loading.set(false);
          }
        });
      },
      error: () => {
        this.errorMsg.set('아이디 또는 비밀번호가 올바르지 않습니다.');
        this.loading.set(false);
      },
    });
  }
}
