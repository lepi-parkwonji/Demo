import { Component, input, output, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface SearchSuggestion {
  id: number;
  label: string;
}

@Component({
  selector: 'app-search-input',
  imports: [FormsModule],
  templateUrl: './search-input.component.html',
})
export class SearchInputComponent {
  placeholder = input('검색');
  inputClass = input('');
  suggestions = input<SearchSuggestion[]>([]);

  queryChange = output<string>();
  search = output<string>();
  select = output<SearchSuggestion>();

  value = signal('');
  private focused = signal(false);

  showDropdown = computed(() =>
    this.focused() && this.value().trim().length > 0 && this.suggestions().length > 0,
  );

  onInput(val: string) {
    this.value.set(val);
    this.queryChange.emit(val);
  }

  onFocus() {
    this.focused.set(true);
  }

  onBlur() {
    setTimeout(() => this.focused.set(false), 150);
  }

  onSearch() {
    this.focused.set(false);
    this.search.emit(this.value());
  }

  onKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') this.onSearch();
    if (event.key === 'Escape') this.focused.set(false);
  }

  onSelect(item: SearchSuggestion) {
    this.value.set(item.label);
    this.focused.set(false);
    this.select.emit(item);
  }

  clear() {
    this.value.set('');
    this.focused.set(false);
    this.queryChange.emit('');
    this.search.emit('');
  }
}
