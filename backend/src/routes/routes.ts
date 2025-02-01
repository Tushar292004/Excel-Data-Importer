import express, { Request, Response } from "express";
import User from "../models/User";

const router = express.Router();

interface ExcelSheet {
  [sheetName: string]: Array<Record<string, any>>; // Each sheet is an array of rows
}
interface ExcelData {
  filename: string;
  sheets: ExcelSheet;
}

router.post("/upload", async (req: Request, res: any) => {
  try {
    console.log("Received Request Body:", req.body);
    const { filename, sheets }: ExcelData = req.body;

    if (!filename || !sheets || Object.keys(sheets).length === 0) {
      return res.status(400).json({ error: "Invalid file data received" });
    }
    console.log("Processing Excel File:", filename);

    let usersToSave: any[] = []; // to store any data in array format
    let failedRows: { filename: string, sheetName: string, row: number; error: string }[] = []; 

    Object.entries(sheets).forEach(([sheetName, data]) => {
      console.log(`Processing Sheet: ${sheetName}`);

      //empty sheet check
      if (!Array.isArray(data) || data.length === 0) {
        console.log(`Skipping empty sheet: ${sheetName}`);
        return;
      }

      
      const sheetUsers = data.map((row, rowIndex) => {
        const { Name, Amount, Date: dateValue } = row;
        let errors: string[] = [];
        // Validation for Numbers
        const isValidName = typeof Name === "string" && Name.trim() !== "";
        if (!isValidName) errors.push("Name is required");
        // Validation for Amount
        const numericAmount = parseFloat(Amount);
        const isValidAmount = !isNaN(numericAmount) && numericAmount > 0;
        if (!isValidAmount) errors.push("Amount must be a positive number");
        //Parsing for performing 
        const parseCustomDate = (dateStr: string) => {
          const parts = dateStr.split("/");
          if (parts.length === 3) {
            const [day, month, year] = parts;
            return new Date(`${year}-${month}-${day}`); // Convert to "YYYY-MM-DD"
          }
          return null;
        };

        // Validation for Date within the current month
        const parsedDate = dateValue ? parseCustomDate(dateValue) : null;
        const isValidDate = parsedDate instanceof Date && !isNaN(parsedDate.getTime());
        const now = new Date();
        const currentMonth = now.getMonth() ; 
        const currentYear = now.getFullYear();
        const isDateInCurrentMonth = isValidDate &&       
          parsedDate.getMonth() === currentMonth &&
          parsedDate.getFullYear() === currentYear;

        // Realtime Progress Showing for each row and content
        console.log(`Validating user: ${Name}`);
        console.log(`Name Valid: ${isValidName}`);
        console.log(`Amount Valid: ${isValidAmount}`);
        console.log(`Date Valid: ${isValidDate}`);

        if (!isValidDate) errors.push("Invalid date format");
        if (isValidDate && !isDateInCurrentMonth) errors.push("Date must be in the current month");

        if (errors.length > 0) {
          failedRows.push({
            filename,
            sheetName,
            row: rowIndex  + 1, // 1-based index
            error: errors.join(", ")
          });
        }
        //creating new User object with all necessary details related to User Models
        return new User({
          name: Name,
          amount: isValidAmount ? numericAmount : 0,
          date: isValidDate ? parsedDate : new Date(),
          verified: isValidName && isValidAmount && isDateInCurrentMonth,
          filename: filename,
          sheetName: sheetName,
        });

      }); 

      usersToSave = [...usersToSave, ...sheetUsers];
    });

    if (usersToSave.length === 0) {
      return res.status(400).json({
        message: "No valid data found in the uploaded file hence uploading failed",
        errors: failedRows
      });
    }

     // Efficient batch insert to handle thousands of rows efficently.
     await User.insertMany(usersToSave);

    // If some rows failed, return partial success (207)
    if (failedRows.length > 0) {
      return res.status(207).json({
        message: "Some users uploaded successfully, but there were errors.",
        errors: failedRows
      });
    }

    res.status(201).json({ message: "Users uploaded successfully" });
  } catch (error) {
    console.error("Error processing upload:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

//to import the data from backend with specific filename, sheetname and verified status true wil be handled in frontend
router.post('/import', async (req: Request, res: Response) => {
  try {
    const { filename, sheetName } = req.body;
    const users = await User.find({ filename, sheetName });
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error fetching data' });
  }
});


//delete data from mongodb by having _id field
router.delete("/delete/:id", async (req: Request, res: any) => {
  try {
    const { id } = req.params;
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

export default router;
