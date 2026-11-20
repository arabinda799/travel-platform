import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import {
  PageContainerComponent,
  BreadcrumbItem,
  ButtonComponent,
  FormModalComponent,
  TextFieldComponent,
  SelectFieldComponent,
} from 'admin-core';
import { MenuListService, MenuLabel, MenuPageEntry, PageItem } from './menu-list.service';

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
export class MenuListComponent {
  private readonly service = inject(MenuListService);

  readonly breadcrumbs: BreadcrumbItem[] = [
    { label: 'Content', route: '/content/blogs' },
    { label: 'Menus' },
  ];

  readonly menuLabels = signal<MenuLabel[]>([]);
  readonly menuItems = signal<Record<string, MenuPageEntry[]>>({});
  readonly allPages = signal<PageItem[]>([]);
  readonly selectedMenuId = signal<string>('');
  readonly activeMenuId = signal<string>('');
  readonly labelsModalVisible = signal(false);
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

  constructor() {
    const pages = this.service.loadPages();
    this.allPages.set(pages);
    const labels = this.service.loadMenuLabels();
    this.menuLabels.set(labels);
    const items = this.service.loadMenuItems(pages);
    this.menuItems.set(items);
    const firstId = labels[0]?.id ?? '';
    this.selectedMenuId.set(firstId);
    this.activeMenuId.set(firstId);
    this.menuSelectValue = firstId;
  }

  selectCurrentMenu(): void {
    this.activeMenuId.set(this.selectedMenuId());
    this.leftChecked.set(new Set());
    this.rightChecked.set(new Set());
    this.leftSelectAll.set(false);
    this.rightSelectAll.set(false);
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
    const existing = [...(this.menuItems()[menuId] ?? [])];
    const checkedIds = this.leftChecked();
    const toAdd = this.availablePages().filter(p => checkedIds.has(p.id));
    const newEntries: MenuPageEntry[] = toAdd.map((p, i) => ({
      id: `${Date.now()}-${i}`,
      pageId: p.id,
      title: p.title,
      slug: p.slug,
      order: existing.length + i,
    }));
    const updated = { ...this.menuItems(), [menuId]: [...existing, ...newEntries] };
    this.menuItems.set(updated);
    this.service.saveMenuItems(updated);
    this.leftChecked.set(new Set());
    this.leftSelectAll.set(false);
  }

  removePages(): void {
    const menuId = this.activeMenuId();
    if (!menuId) return;
    const checkedIds = this.rightChecked();
    const filtered = (this.menuItems()[menuId] ?? []).filter(e => !checkedIds.has(e.id));
    const updated = { ...this.menuItems(), [menuId]: filtered };
    this.menuItems.set(updated);
    this.service.saveMenuItems(updated);
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
    const updated = this.menuLabels().map((l, i) => ({
      ...l,
      name: [v.label1, v.label2, v.label3, v.label4][i] ?? l.name,
    }));
    this.menuLabels.set(updated);
    this.service.saveMenuLabels(updated);
    this.labelsModalVisible.set(false);
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
    const updated = { ...this.menuItems(), [menuId]: entries };
    this.menuItems.set(updated);
    this.service.saveMenuItems(updated);
    this.dragOverIndex.set(-1);
    this.dragStartIndex = -1;
  }

  onDragEnd(): void {
    this.dragOverIndex.set(-1);
    this.dragStartIndex = -1;
  }
}
