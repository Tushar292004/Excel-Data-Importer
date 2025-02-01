export interface ValidationError {
    sheet: string;
    row: number;
    message: string;
  }
  
  export interface SheetErrors {
    [sheetName: string]: ValidationError[];
  }