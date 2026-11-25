import {
  ChangeDetectionStrategy, Component, DestroyRef, OnInit,
  computed, inject, signal,
} from '@angular/core';
import { forkJoin, Observable, of } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { MessageService } from 'primeng/api';
import {
  PageContainerComponent,
  BreadcrumbItem,
  ButtonComponent,
  FormModalComponent,
  TextFieldComponent,
  SelectFieldComponent,
} from 'admin-core';
import { MenuListService, MenuPageEntry } from './menu-list.service';
import { PageListService } from '../page-list/page-list.service';

@Component({
  selector: 'app-menu-list',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    PageContainerComponent,
    ButtonComponent,
    FormModalComponent,
    TextFieldComponent,
    SelectFieldComponent,
  ],
  templateUrl: './menu-list.html',
  styleUrl: './menu-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuListComponent implements OnInit {
  private readonly service = inject(MenuListService);
  private readonly pageService = inject(PageListService);
  private readonly messageService = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);

  readonly breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', route: '/' },
    { label: 'Content' },
    { label: 'Menus' },
  ];

  readonly menuLabels = this.service.labels;
  readonly menuItems = this.service.items;
  readonly allPages = this.pageService.pages;
  readonly selectedMenuId = signal<string>('');
  readonly activeMenuId = signal<string>('');
  readonly labelsModalVisible = signal(false);
  readonly isSaving = signal(false);
  readonly leftChecked = signal<Set<string>>(new Set());
  readonly rightChecked = signal<Set<string>>(new Set());
  readonly leftSelectAll = signal(false);
  readonly rightSelectAll = signal(false);
  readonly dragOverIndex = signal<number>(-1);

  menuSelectValue = '';
  private dragStartIndex = -1;

  readonly currentMenuEntries = computed(() =>
    this.menuItems()[this.activeMenuId()] ?? []
  );

  readonly menuOptions = computed(() =>
    this.menuLabels().map(m => ({ label: m.name, value: m.id }))
  );

  readonly availablePages = computed(() => {
    const inMenu = new Set(
      (this.menuItems()[this.activeMenuId()] ?? []).map(e => e.pageId)
    );
    return this.allPages().filter(p => !inMenu.has(p.id));
  });

  readonly labelsForm = new FormGroup({
    label1: new FormControl(''),
    label2: new FormControl(''),
    label3: new FormControl(''),
    label4: new FormControl(''),
  });

  ngOnInit(): void {
    this.pageService.load();
    this.service.loadLabels();
  }

  selectCurrentMenu(): void {
    const id = this.selectedMenuId();
    this.activeMenuId.set(id);
    this.leftChecked.set(new Set());
    this.rightChecked.set(new Set());
    this.leftSelectAll.set(false);
    this.rightSelectAll.set(false);
    if (id && !this.menuItems()[id]) {
      this.service.loadItems(id);
    }
  }

  onMenuSelectChange(value: string | null): void {
    if (value) {
      this.selectedMenuId.set(value);
      this.menuSelectValue = value;
    }
  }

  toggleLeftAll(checked: boolean): void {
    this.leftSelectAll.set(checked);
    if (checked) {
      this.leftChecked.set(new Set(this.availablePages().map(p => p.id)));
    } else {
      this.leftChecked.set(new Set());
    }
  }

  toggleLeft(pageId: string, checked: boolean): void {
    const s = new Set(this.leftChecked());
    if (checked) s.add(pageId); else s.delete(pageId);
    this.leftChecked.set(s);
    this.leftSelectAll.set(s.size === this.availablePages().length && s.size > 0);
  }

  toggleRightAll(checked: boolean): void {
    this.rightSelectAll.set(checked);
    if (checked) {
      this.rightChecked.set(new Set(this.currentMenuEntries().map(e => e.id)));
    } else {
      this.rightChecked.set(new Set());
    }
  }

  toggleRight(entryId: string, checked: boolean): void {
    const s = new Set(this.rightChecked());
    if (checked) s.add(entryId); else s.delete(entryId);
    this.rightChecked.set(s);
    this.rightSelectAll.set(s.size === this.currentMenuEntries().length && s.size > 0);
  }

  addPages(): void {
    const menuId = this.activeMenuId();
    if (!menuId) return;
    const checkedIds = this.leftChecked();
    const toAdd = this.availablePages().filter(p => checkedIds.has(p.id));
    const pageIds = toAdd.map(p => p.id);
    if (pageIds.length === 0) return;

    const existing = [...(this.menuItems()[menuId] ?? [])];
    const newEntries: MenuPageEntry[] = toAdd.map((p, i) => ({
      id: `${Date.now()}-${i}`,
      pageId: p.id,
      title: p.title,
      slug: p.slug,
      order: existing.length + i,
    }));
    this.service.updateItemsLocal(menuId, [...existing, ...newEntries]);

    this.service.saveMenuItems(menuId, [...existing.map(e => e.pageId), ...pageIds])
      .pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Save Failed', detail: 'Could not save menu items.' });
        },
      });

    this.leftChecked.set(new Set());
    this.leftSelectAll.set(false);
  }

  removePages(): void {
    const menuId = this.activeMenuId();
    if (!menuId) return;
    const checkedIds = this.rightChecked();
    const remaining = (this.menuItems()[menuId] ?? []).filter(e => !checkedIds.has(e.id));
    this.service.updateItemsLocal(menuId, remaining);

    this.service.saveMenuItems(menuId, remaining.map(e => e.pageId))
      .pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Save Failed', detail: 'Could not save menu items.' });
        },
      });

    this.rightChecked.set(new Set());
    this.rightSelectAll.set(false);
  }

  openLabelsModal(): void {
    const labels = this.menuLabels();
    this.labelsForm.patchValue({
      label1: labels[0]?.name ?? '',
      label2: labels[1]?.name ?? '',
      label3: labels[2]?.name ?? '',
      label4: labels[3]?.name ?? '',
    });
    this.labelsModalVisible.set(true);
  }

  onUpdateLabels(): void {
    const v = this.labelsForm.getRawValue();
    const names = [v.label1, v.label2, v.label3, v.label4];
    const labels = this.menuLabels();

    const updates: Observable<any>[] = [];
    names.forEach((name, i) => {
      const label = labels[i];
      if (label && name && name !== label.name) {
        updates.push(this.service.updateLabel(label.id, name));
      }
    });

    if (updates.length > 0) {
      this.isSaving.set(true);
      forkJoin(updates)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.isSaving.set(false);
            this.labelsModalVisible.set(false);
          },
          error: () => {
            this.isSaving.set(false);
          },
        });
    } else {
      this.labelsModalVisible.set(false);
    }
  }

  onDragStart(index: number): void {
    this.dragStartIndex = index;
  }

  onDragOver(event: DragEvent, index: number): void {
    event.preventDefault();
    this.dragOverIndex.set(index);
  }

  onDrop(index: number): void {
    const menuId = this.activeMenuId();
    if (!menuId || this.dragStartIndex < 0 || this.dragStartIndex === index) {
      this.dragOverIndex.set(-1);
      return;
    }
    const entries = [...(this.menuItems()[menuId] ?? [])];
    const [moved] = entries.splice(this.dragStartIndex, 1);
    entries.splice(index, 0, moved);
    this.service.updateItemsLocal(menuId, entries);

    this.service.saveMenuItems(menuId, entries.map(e => e.pageId))
      .pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Save Failed', detail: 'Could not reorder menu items.' });
        },
      });

    this.dragOverIndex.set(-1);
    this.dragStartIndex = -1;
  }

  onDragEnd(): void {
    this.dragOverIndex.set(-1);
    this.dragStartIndex = -1;
  }
}
