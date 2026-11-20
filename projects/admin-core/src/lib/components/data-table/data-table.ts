import { ChangeDetectionStrategy, Component, computed, contentChild, DestroyRef, inject, input, model, output, TemplateRef } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { Subject } from 'rxjs';
import { distinctUntilChanged, switchMap } from 'rxjs/operators';
import { debounceTime } from 'rxjs';
import { NgTemplateOutlet } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { SkeletonLoaderComponent } from '../skeleton-loader/skeleton-loader';
import { ButtonComponent } from '../button/button';
import { TableColumn, TableLazyEvent } from '../../interfaces/table-column';
import { shouldTruncate, truncateText, getTruncateTooltip } from '../../utils/string-truncate';

@Component({
  selector: 'lib-data-table',
  imports: [NgTemplateOutlet, FormsModule, TableModule, TooltipModule, SkeletonLoaderComponent, ButtonComponent],
  templateUrl: './data-table.html',
  styleUrl: './data-table.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataTableComponent<T = any> {
  private readonly destroyRef = inject(DestroyRef);
  private readonly searchSubject = new Subject<string>();

  readonly value = input<T[]>([]);
  readonly columns = input.required<TableColumn[]>();
  readonly totalRecords = input<number>(0);
  readonly loading = input<boolean>(false);
  readonly trackByField = input<string>('id');

  readonly rows = input<number>(10);
  readonly rowsPerPageOptions = input<number[]>([10, 25, 50, 100]);
  readonly first = input<number>(0);
  readonly paginator = input<boolean>(true);
  readonly showCurrentPageReport = input<boolean>(true);
  readonly currentPageReportTemplate = input<string>('Showing {first} to {last} of {totalRecords} entries');

  readonly sortField = input<string>('');
  readonly sortOrder = input<1 | -1>(1);

  readonly selectionMode = input<'single' | 'multiple' | null>(null);
  readonly checkbox = input<boolean>(false);
  readonly selection = model<T[]>([]);

  readonly scrollHeight = input<string>('calc(100vh - 16rem)');
  readonly searchable = input<boolean>(false);
  readonly searchPlaceholder = input<string>('');
  readonly searchValue = model<string>('');
  readonly debounceTimeMs = input<number>(300);
  readonly textTruncateLimit = input<number>(30);

  readonly shouldTruncate = shouldTruncate;
  readonly truncateText = truncateText;
  readonly getTruncateTooltip = getTruncateTooltip;

  readonly lazyLoad = output<TableLazyEvent>();
  readonly rowSelect = output<T>();
  readonly search = output<string>();
  readonly refresh = output<void>();

  readonly captionTemplate = contentChild<TemplateRef<any>>('caption');
  readonly emptyTemplate = contentChild<TemplateRef<any>>('empty');

  readonly skeletonColumns = computed(() => this.columns().length || 4);

  readonly effectiveSearchPlaceholder = computed(() => {
    const custom = this.searchPlaceholder();
    if (custom && custom !== 'Search...') {
      return custom;
    }
    const cols = this.columns()
      .filter((c) => c.field !== 'actions' && c.header)
      .slice(0, 3)
      .map((c) => c.header.toLowerCase());
    return cols.length ? `Search by ${cols.join(', ')}...` : 'Search...';
  });

  readonly effectiveSelectionMode = computed(() =>
    this.checkbox() ? 'multiple' as const : this.selectionMode()
  );

  readonly effectiveScrollHeight = computed(() => {
    const val = this.scrollHeight();
    return !val || val === 'flex' ? 'calc(100vh - 16rem)' : val;
  });

  clearSelection(): void {
    this.selection.set([]);
  }

  onRefreshTable(): void {
    if (this.searchValue()) {
      this.searchValue.set('');
    }
    this.refresh.emit();
  }

  constructor() {
    toObservable(this.debounceTimeMs)
      .pipe(
        switchMap((time) =>
          this.searchSubject.pipe(
            debounceTime(time),
            distinctUntilChanged()
          )
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((query) => {
        this.search.emit(query);
      });
  }

  onLazyLoad(event: any): void {
    this.lazyLoad.emit({
      first: event.first ?? 0,
      rows: event.rows ?? this.rows(),
      sortField: event.sortField,
      sortOrder: event.sortOrder,
      filters: event.filters,
    });
  }

  onRowSelect(event: any): void {
    this.rowSelect.emit(event.data);
  }

  onSearchInput(value: string): void {
    this.searchValue.set(value);
    this.searchSubject.next(value);
  }

  onClearSearch(): void {
    this.searchValue.set('');
    this.searchSubject.next('');
  }

  trackByFn(index: number, item: any): any {
    return item?.[this.trackByField()] ?? index;
  }
}
