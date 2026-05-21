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
  selector: 'app-gallery-form',
  imports: [FormsModule, RichEditorComponent],
  templateUrl: './gallery-form.component.html',
})
export class GalleryFormComponent implements OnInit {
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
  imageUrl = '';
  coverUploading = signal(false);

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
    this.imageUrl = gallery.imageUrl ?? '';
  }

  navigateBack() {
    this.router.navigate(['/expo/gallery']);
  }

  onCoverImageChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.coverUploading.set(true);
    const formData = new FormData();
    formData.append('file', file);

    this.http.post<{ url: string }>(this.imageUploadUrl, formData).subscribe({
      next: (res) => { this.imageUrl = res.url; this.coverUploading.set(false); },
      error: () => { this.toast.error('이미지 업로드에 실패했습니다.'); this.coverUploading.set(false); },
    });
  }

  removeCoverImage() {
    this.imageUrl = '';
  }

  onSubmit() {
    if (!this.title.trim()) { this.errorMsg.set('갤러리명을 입력해주세요.'); return; }

    this.loading.set(true);
    this.errorMsg.set('');

    const body = {
      category: 'GALLERY' as const,
      title: this.title.trim(),
      content: this.content,
      imageUrl: this.imageUrl || undefined,
      eventName: this.eventName.trim() || undefined,
    };

    const request$ = this.isEditMode
      ? galleryControllerUpdate(this.http, '', { id: this.galleryId ?? 0, body }).pipe(map(r => r.body))
      : galleryControllerCreate(this.http, '', { body }).pipe(map(r => r.body));

    request$.subscribe({
      next: () => {
        this.toast.success(this.isEditMode ? '갤러리가 수정되었습니다.' : '갤러리가 등록되었습니다.');
        this.router.navigate(['/expo/gallery']);
      },
      error: () => {
        this.errorMsg.set('저장 중 오류가 발생했습니다.');
        this.loading.set(false);
      },
    });
  }
}
