import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatMenuModule } from '@angular/material/menu';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCard, MatCardModule } from '@angular/material/card';
import { MatGridListModule, MatGridTile } from '@angular/material/grid-list';
import { MatSnackBar } from '@angular/material/snack-bar';

const materialModules = [
  MatSlideToggleModule,
  MatToolbarModule,
  MatButtonModule,
  MatSidenavModule,
  MatIconModule,
  MatFormFieldModule,
  MatInputModule,
  MatSelectModule,
  MatListModule,
  MatButtonToggleModule,
  MatMenuModule,
  MatSortModule,
  MatPaginatorModule,
  MatTableModule,    ReactiveFormsModule,
  MatDialogModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatCheckboxModule,
  MatCard,
  MatCardModule,
  MatGridTile,
  MatGridListModule,
  MatIcon,
  MatPaginator,
  MatSort,
  
  
  
];

@NgModule({
  declarations: [],
  imports: [CommonModule, ...materialModules],
  exports: materialModules
})
export class MatModule { }