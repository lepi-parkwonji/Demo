import { HttpClient } from '@angular/common/http';
import {
  Component, Input, OnChanges, OnDestroy, OnInit,
  Output, EventEmitter, SimpleChanges, inject, signal,
} from '@angular/core';
import { Editor } from '@tiptap/core';
import Image from '@tiptap/extension-image';
import Youtube from '@tiptap/extension-youtube';
import StarterKit from '@tiptap/starter-kit';
import { TiptapEditorDirective } from 'ngx-tiptap';
import { ToastService } from '@demo-shop/ui';

@Component({
  selector: 'app-rich-editor',
  imports: [TiptapEditorDirective],
  templateUrl: './rich-editor.component.html',
})
export class RichEditorComponent implements OnInit, OnChanges, OnDestroy {
  @Input() content = '';
  @Output() contentChange = new EventEmitter<string>();
  @Input() imageUploadUrl = '/api/upload/image';
  @Input() videoUploadUrl = '/api/upload/video';

  private http = inject(HttpClient);
  private toast = inject(ToastService);

  uploading = signal<false | 'image' | 'video'>(false);
  showVideoMenu = signal(false);

  private emitting = false;

  editor = new Editor({
    extensions: [
      StarterKit,
      Image.configure({ inline: false, allowBase64: false }),
      Youtube.configure({ width: 640, height: 360, nocookie: true }),
    ],
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      this.emitting = true;
      this.contentChange.emit(html);
      this.emitting = false;
    },
  });

  ngOnInit() {
    if (this.content) {
      this.editor.commands.setContent(this.content, { emitUpdate: false });
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['content'] && !changes['content'].firstChange && !this.emitting) {
      const incoming = changes['content'].currentValue as string;
      if (incoming !== this.editor.getHTML()) {
        this.editor.commands.setContent(incoming || '', { emitUpdate: false });
      }
    }
  }

  ngOnDestroy() {
    this.editor.destroy();
  }

  isActive(type: string, attrs?: Record<string, unknown>) {
    return this.editor.isActive(type, attrs);
  }

  execCommand(command: 'toggleBold' | 'toggleItalic' | 'toggleBulletList' | 'toggleOrderedList') {
    this.editor.chain().focus()[command]().run();
  }

  toggleHeading(level: 1 | 2 | 3) {
    this.editor.chain().focus().toggleHeading({ level }).run();
  }

  toggleVideoMenu() {
    this.showVideoMenu.update(v => !v);
  }

  insertYoutubeVideo() {
    const url = prompt('YouTube 또는 Vimeo URL을 입력하세요');
    if (!url) return;
    this.editor.chain().focus().setYoutubeVideo({ src: url }).run();
  }

  onImageSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.uploading.set('image');
    const formData = new FormData();
    formData.append('file', file);
    this.http.post<{ url: string }>(this.imageUploadUrl, formData).subscribe({
      next: ({ url }) => {
        this.editor.chain().focus().setImage({ src: url }).run();
        this.uploading.set(false);
      },
      error: () => {
        this.toast.error('이미지 업로드에 실패했습니다.');
        this.uploading.set(false);
      },
    });
    input.value = '';
  }

  onVideoSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.uploading.set('video');
    const formData = new FormData();
    formData.append('file', file);
    this.http.post<{ url: string }>(this.videoUploadUrl, formData).subscribe({
      next: ({ url }) => {
        // HTML5 <video> 태그를 직접 삽입
        this.editor.chain().focus().insertContent(
          `<p><video controls style="max-width:100%"><source src="${url}" type="${file.type}"></video></p>`
        ).run();
        this.uploading.set(false);
      },
      error: () => {
        this.toast.error('동영상 업로드에 실패했습니다.');
        this.uploading.set(false);
      },
    });
    input.value = '';
  }

  getHTML() {
    return this.editor.getHTML();
  }

  getText() {
    return this.editor.getText();
  }
}
