import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { GridOptions, ColDef, ColumnApi, GridApi, GetContextMenuItems, MenuItemDef, GetContextMenuItemsParams } from 'ag-grid-community';

import { AppService } from './app.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  // api: any;
  gridApi!: GridApi;
  colApi!: ColumnApi;
  rowData: any[] = [];
  // colName = ["name", "phone", "email", "country"];
  colName = [
    { name: "name", isExportable: true },
    { name: "phone", isExportable: true },
    { name: "email", isExportable: false },
    { name: "country", isExportable: true }
  ];
  // colName : string[] = [];
  colDefs: ColDef[] = [];
  defColDef: ColDef = {
    sortable: true, filter: true
  }
  grid: GridOptions = {
    // pagination: true,
    // paginationPageSize: 10
  }
  constructor(private http: HttpClient, private service: AppService) { }
  ngOnInit() {
    this.getData().subscribe({
      next: (data) => {
        // this.colName = Object.keys(data[0]);
        this.rowData = data;
      },
      error: err => this.rowData = err
    });
    for (let entry of this.colName) {
      this.colDefs.push({ field: entry.name })
    }
  }
  getData(): Observable<any[]> {
    return this.http.get<any[]>('assets/data.json').pipe();
  }
  onGridReady = (params: any) => {
    // this.api = params.api;
    this.colApi = params.columnApi;
    this.gridApi = params.api;
  }
  public getContextMenuItems = (
    params: GetContextMenuItemsParams
  ): (string | MenuItemDef)[] => {
    let res: (string | MenuItemDef)[] =
      [
        "cut",
        "copy",
        "copyWithHeaders",
        "copyWithGroupHeaders",
        "paste",
        {
          name: 'Custom CSV Export',
          action: () => {
            this.exportFile("csv");
          }
        },
        {
          name: 'Custom Excel Export',
          action: () => {
            this.exportFile("xlsx");
          }
        }
      ]
    return res;
  }
  public exportFile(type: string) {
    // let downData = structuredClone(this.rowData)
    let currData: any = []
    let count = this.gridApi.getDisplayedRowCount();
    for (let i = 0; i < count; i++) {
      let rowNode = this.gridApi.getDisplayedRowAtIndex(i);
      if(rowNode != undefined)
        currData.push(rowNode.data);
    }
    let downData = structuredClone(currData)
    let currColName: string[] = []
    let removeCols: string[] = []
    // let currRows = this.gridApi.getFilterModel()
    // let filterVals = Object.values(currRows);
    // let filterKeys = Object.keys(currRows);
    // let presentValues: string[] = []
    // let filteredRows: any[] = []
    // filterVals.forEach((val) => {
    //   val.values.forEach((value: any) => {
    //     presentValues.push(value)
    //   })
    // })
    // filterKeys.forEach((key: any) => {
    //   downData.forEach((row: any) => {
    //     if (presentValues.includes(row[key])) {
    //       filteredRows.push(row)
    //     }
    //   })
    // })
    // if (filterKeys.length > 0) downData = filteredRows;
    this.colApi.getAllDisplayedColumns().forEach((val) => {
      let name = String(val.getColDef().field)
      currColName.push(name)
    })
    let filt = this.colName.filter((o) => currColName.indexOf(o.name) === -1);
    filt.forEach((obj) => removeCols.push(obj.name))
    this.colName.forEach((column) => {
      if (!column.isExportable) {
        removeCols.push(column.name)
      }
    })
    downData.forEach((val: any) => {
      removeCols.forEach(key => {
        delete val[key]
      })
    });
    if (type == "csv") {
      this.service.exportAsCsvFile(downData, "CSV_Data")
    }
    else if (type == "xlsx") {
      this.service.exportAsExcelFile(downData, "Excel_Data");
    }
    else {
      window.alert("Invalid export format");
    }
    // console.log(daa);
  }
}