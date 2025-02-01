# Excel Data Importer

## Overview
Excel Data Importer is an assignment project for the Full Stack Developer Internship. This project enables seamless importing, validation, and management of Excel (.xlsx) files.

## Tech Stack Used
- **Scripting Language:** TypeScript
- **Frontend:** React.js, Tailwind CSS, ShadCN 
- **Backend:** Node.js, Express.js, Mongoose
- **Database:** MongoDB

## Major Focued Points
- Exporting validated data back to .xlsx
- Real-time progress indicators during file upload and processing in backend
- Scalability can handle thousands of rows without performance degradation
- Robust error handling on both frontend and backend to manage unexpected scenarios (e.g., corrupted files, server issues, or database errors)
- Code Quality: Clean, modular, and reusable code with proper use of comments and documentation
- Frontend Usability: Intuitive UI for file upload, error handling, and data preview
- Backend Robustness: Comprehensive validation and support for future extensions and efficient database interactions
---
## Installation & Setup
1. Clone the repository:
   ```sh
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```sh
   cd excel-data-importer
   ```
3. Install dependencies: Same command for both frontend & backend folders respectively 
   ```sh
   npm install
   ```
5. Start the development server: Same command for both frontend & backend folders respectively 
   ```sh
   npm run dev
   ```
---
## Task Overview
### **Frontend Requirements**
#### **1. File Import Page:**
- Create a page with a drag-and-drop file upload option.
- Provide a fallback file input button for users who prefer not to drag and drop.
- Only accept `.xlsx` files with a maximum file size of **2 MB**.

#### **2. Error Display:**
- If the backend returns validation errors for the file, display them in a modal dialog.
- Include the row number and a description of the error for each invalid row.
- For files with multiple sheets, display validation errors in separate tabs, one per sheet.

#### **3. Data Preview:**
- Provide a dropdown listing the names of all sheets in the uploaded file.
- When a sheet is selected, display its data in a **paginated table**.
- Format dates in **DD-MM-YYYY** format.
- Format numeric values using the **Indian number format** (e.g., 12,34,456.00).
- Allow users to delete rows:
  - Show a delete icon next to each row.
  - Prompt the user with a confirmation dialog before deleting a row.
  - Delete rows only after user confirmation.

#### **4. Data Import:**
- Provide an **Import** button to import all valid rows into the database.
- If some rows contain errors, import only the valid rows and skip the invalid ones.
- Display a success message upon successful import and highlight skipped rows.

---
### **Backend Requirements**
#### **1. File Validation:**
- Process the uploaded `.xlsx` file on the backend using a library like **xlsx** or **exceljs**.
- Validate the file based on the following rules:
  1. The sheet must contain the following columns: **Name, Amount, Date, and Verified (Yes or No).**
  2. Validation rules:
     - **Name, Amount, and Date** are mandatory.
     - The **Date** must be valid and fall within the **current month**.
     - The **Amount** must be numeric and greater than **zero**.
  3. If validation fails, return a detailed error response including:
     - **Sheet name**
     - **Row number**
     - **Description of the error**
---
### **Database Interaction:**
- Use MongoDB Atlas (free tier) to store the imported data.
- Ensure the backend can handle thousands of rows efficiency
  
---
## Youtube URL
 ```sh
  https://youtu.be/NZYbL0Gv8FM
 ```

