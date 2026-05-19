import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '@demo-shop/ui';
import { RichEditorComponent } from '../../../shared/rich-editor.component';

@Component({
  selector: 'app-site-term-form',
  imports: [FormsModule, RichEditorComponent],
  templateUrl: './site-term-form.component.html',
})
export class SiteTermFormComponent implements OnInit {
  @ViewChild(RichEditorComponent) editorRef!: RichEditorComponent;

  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toast = inject(ToastService);

  slug = '';
  title = '';
  content = '';
  loading = signal(false);
  saving = signal(false);

  ngOnInit() {
    this.slug = this.route.snapshot.paramMap.get('slug') ?? '';
    const stateTitle = (history.state as { title?: string })?.title;
    if (stateTitle) this.title = stateTitle;

    this.loading.set(true);
    this.http.get<{ title: string; content: string }>(`/api/site/terms/${this.slug}`).subscribe({
      next: data => {
        this.title = data.title;
        this.content = data.content;
        this.editorRef?.editor.commands.setContent(data.content, { emitUpdate: false });
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  navigateBack() {
    this.router.navigate(['/site/terms']);
  }

  onSubmit() {
    if (!this.title.trim()) { this.toast.error('제목을 입력해주세요.'); return; }
    this.saving.set(true);
    this.http.put(`/api/site/terms/${this.slug}`, { title: this.title, content: this.content }).subscribe({
      next: () => { this.toast.success('저장되었습니다.'); this.saving.set(false); this.navigateBack(); },
      error: () => { this.toast.error('저장에 실패했습니다.'); this.saving.set(false); },
    });
  }
}
