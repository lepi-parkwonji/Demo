import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  GalleryResponseDto as GalleryDTO,
  ScheduleResponseDto as ScheduleDTO,
  galleryControllerCreate,
  galleryControllerFindOne,
  galleryControllerUpdate,
  scheduleControllerSearch,
} from '@demo-shop/api-client';
import { map } from 'rxjs/operators';
import { ToastService } from '@demo-shop/ui';
import { RichEditorComponent } from '../../../libs/rich-editor.component';

const TITLE_MAX = 100;

@Component({
  selector: 'app-press-form',
  imports: [FormsModule, RichEditorComponent],
  templateUrl: './press-form.component.html',
})
export class PressFormComponent implements OnInit {
  @ViewChild(RichEditorComponent) editorRef!: RichEditorComponent;

  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toast = inject(ToastService);

  readonly TITLE_MAX = TITLE_MAX;
  readonly imageUploadUrl = '/api/gallery/upload/image';

  isEditMode = false;
  private galleryId?: number;

  title = '';
  content = '';
  eventName = '';

  schedules = signal<ScheduleDTO[]>([]);
  loading = signal(false);
  errorMsg = signal('');

  ngOnInit() {
    scheduleControllerSearch(this.http, '', { pageNo: 1, pageSize: 100 })
      .pipe(map(r => r.body.items))
      .subscribe({ next: items => this.schedules.set(items) });

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode = true;
      this.galleryId = +idParam;
      const state = history.state as { gallery?: GalleryDTO } | undefined;
      if (state?.gallery) {
        this.fillForm(state.gallery);
      } else {
        galleryControllerFindOne(this.http, '', { id: this.galleryId }).pipe(map(r => r.body)).subscribe({
          next: (data) => this.fillForm(data),
          error: () => this.errorMsg.set('데이터를 불러오지 못했습니다.'),
        });
      }
    }
  }

  private fillForm(gallery: GalleryDTO) {
    this.title = gallery.title;
    this.content = gallery.content;
    this.eventName = gallery.eventName ?? '';
  }

  navigateBack() {
    this.router.navigate(['/expo/press']);
  }

  onSubmit() {
    if (!this.title.trim()) { this.errorMsg.set('제목을 입력해주세요.'); return; }
    if (!this.editorRef.getText().trim()) { this.errorMsg.set('내용을 입력해주세요.'); return; }

    this.loading.set(true);
    this.errorMsg.set('');

    const body = {
      category: 'PRESS' as const,
      title: this.title.trim(),
      content: this.content,
      eventName: this.eventName.trim() || undefined,
    };

    const request$ = this.isEditMode
      ? galleryControllerUpdate(this.http, '', { id: this.galleryId ?? 0, body }).pipe(map(r => r.body))
      : galleryControllerCreate(this.http, '', { body }).pipe(map(r => r.body));

    request$.subscribe({
      next: () => {
        this.toast.success(this.isEditMode ? '보도자료가 수정되었습니다.' : '보도자료가 등록되었습니다.');
        this.router.navigate(['/expo/press']);
      },
      error: () => {
        this.errorMsg.set('저장 중 오류가 발생했습니다.');
        this.loading.set(false);
      },
    });
  }
}
