import { SlicePipe } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RegistrationDTO, PublicApiService } from '../../services/public-api.service';

@Component({
  selector: 'app-registration-lookup',
  imports: [FormsModule, SlicePipe],
  templateUrl: './registration-lookup.component.html',
})
export class RegistrationLookupComponent {
  private api = inject(PublicApiService);
  private destroyRef = inject(DestroyRef);

  reservationNo = '';
  loading = signal(false);
  saving = signal(false);
  errorMsg = signal('');
  saveMsg = signal('');
  result = signal<RegistrationDTO | null>(null);
  isEditing = signal(false);

  editName = '';
  editContact = '';

  onSearch() {
    this.errorMsg.set('');
    this.result.set(null);
    this.isEditing.set(false);
    if (!this.reservationNo.trim()) { this.errorMsg.set('예약번호를 입력해주세요.'); return; }

    this.loading.set(true);
    this.api.findRegistrationByNo(this.reservationNo.trim())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: data => { this.result.set(data); this.loading.set(false); },
        error: () => {
          this.errorMsg.set('예약번호를 찾을 수 없습니다. 다시 확인해주세요.');
          this.loading.set(false);
        },
      });
  }

  startEdit() {
    const reg = this.result();
    if (!reg) return;
    this.editName = reg.name;
    this.editContact = reg.contact;
    this.saveMsg.set('');
    this.isEditing.set(true);
  }

  cancelEdit() { this.isEditing.set(false); }

  onContactInput(event: Event) {
    const raw = (event.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 11);
    let formatted = raw;
    if (raw.startsWith('02')) {
      if (raw.length <= 6) formatted = raw.replace(/(\d{2})(\d+)/, '$1-$2');
      else if (raw.length <= 9) formatted = raw.replace(/(\d{2})(\d{3,4})(\d+)/, '$1-$2-$3');
      else formatted = raw.replace(/(\d{2})(\d{4})(\d+)/, '$1-$2-$3');
    } else {
      if (raw.length <= 7) formatted = raw.replace(/(\d{3})(\d+)/, '$1-$2');
      else if (raw.length <= 10) formatted = raw.replace(/(\d{3})(\d{3})(\d+)/, '$1-$2-$3');
      else formatted = raw.replace(/(\d{3})(\d{4})(\d+)/, '$1-$2-$3');
    }
    this.editContact = formatted;
    (event.target as HTMLInputElement).value = formatted;
  }

  onSave() {
    if (!this.editName.trim()) { this.saveMsg.set('이름을 입력해주세요.'); return; }
    if (!this.editContact.trim()) { this.saveMsg.set('연락처를 입력해주세요.'); return; }

    this.saving.set(true);
    this.saveMsg.set('');
    this.api.updateRegistrationByNo(this.reservationNo.trim(), {
      name: this.editName.trim(),
      contact: this.editContact.trim(),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: data => {
          this.result.set(data);
          this.isEditing.set(false);
          this.saving.set(false);
          this.saveMsg.set('수정되었습니다.');
        },
        error: () => {
          this.saveMsg.set('수정에 실패했습니다. 다시 시도해주세요.');
          this.saving.set(false);
        },
      });
  }
}
