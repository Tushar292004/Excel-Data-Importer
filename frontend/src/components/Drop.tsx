import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useFileStore } from "@/store/useFileStore";
import { TrashIcon } from "lucide-react";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
  } from "@/components/ui/pagination"
  
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "./ui/table";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast, ToastContainer } from "react-toastify";

// Data Import Functionality
interface ImportDropdownProps {
    onImport: (fileName: string, sheetName: string) => void; // Function to handle import
}

const ImportDropdown: React.FC<ImportDropdownProps> = ({ onImport }) => {
    const { uploadedFiles, sheetNames } = useFileStore();
    const [selectedFile, setSelectedFile] = useState<string>("Select File");
    const [selectedSheet, setSelectedSheet] = useState<string>("Select Sheet");
    const [availableSheets, setAvailableSheets] = useState<string[]>([]);
    const [data, setData] = useState<any[]>([]);

    // Pagination States
    const [currentPage, setCurrentPage] = useState<number>(1);
    const itemsPerPage = 5; // Number of items per page
    const totalPages = Math.ceil(data.length / itemsPerPage);

    useEffect(() => {
        if (selectedFile && sheetNames[selectedFile]) {
            setAvailableSheets(sheetNames[selectedFile]);
            setSelectedSheet(sheetNames[selectedFile][0]);
        }
    }, [selectedFile, sheetNames]);

    // storing the selected file name
    const handleFileSelect = (fileName: string) => {
        setSelectedFile(fileName);
    };

    // storing the selected sheet name
    const handleSheetSelect = (sheetName: string) => {
        setSelectedSheet(sheetName);
    };

    // frequesting the data fron backend with respective file & sheet details
    const fetchDataFromDB = async (fileName: string, sheetName: string) => {
        try {
            const response = await fetch("http://localhost:3000/api/import", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ filename: fileName, sheetName }),
            });
            const result = await response.json(); //stroing the response in result variable for further use
            if (result.success) {
                //If some rows have errors, importing only the valid rows and skiping the invalid ones
                //verified field hold true and false value after validation in backend
                const validRows = result.data.filter((user: any) => user.verified);
                const skippedRows = result.data.filter((user: any) => !user.verified);
                setData(validRows);
                setCurrentPage(1);
                onImport(fileName, sheetName);

                //Displaying a success message upon successful import and highlight skipped rows
                if (skippedRows.length > 0) {
                    toast.warning(
                        `Data from "${fileName}" and "${sheetName}" imported successfully! But ${skippedRows.length} rows were skipped.`, { autoClose: 3000,});
                    } 
                    else{
                        toast.success(`Data from "${fileName}" and "${sheetName}" imported successfully! No rows were skipped`, { autoClose: 3000,});
                    }
            }
         } catch (error) {
            toast.warning(`Error occured : "${error}"`, { autoClose: 3000,});
            console.error("Error:", error);    
         }
        };

        //Delete Row Functionality 
        const handleDelete = async (id: string) => {
            try {
                const response = await fetch(`http://localhost:3000/api/delete/${id}`, {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                if (!response.ok) {
                    throw new Error(`Failed to delete user. Status: ${response.status}`);
                }

                const result = await response.json();

                if (result.success) {
                    console.log("User deleted successfully:", id);
                    setData((prevData) => prevData.filter((item) => item._id !== id)); // Update state to remove deleted user
                    if (data.length % itemsPerPage === 1 && currentPage > 1) {
                        setCurrentPage((prev) => prev - 1);
                    }
                } else {
                    console.error("Error deleting user:", result.message);
                }
            } catch (error) {
                console.error("Error:", error);
            }
        };

        const currentData = data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

        return (
            <div className="flex gap-4 flex-col w-full">
                <div className="flex items-center justify-center gap-4">
                    {/* Providing a dropdown listing the names of all sheets in the uploaded file. */}
                    {/* Dropdown for selecting sheets */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-40">
                                {selectedFile}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                            {uploadedFiles.map((file) => (
                                <DropdownMenuItem key={file} onClick={() => handleFileSelect(file)}>
                                    {file}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Dropdown for selecting sheets */}
                    {selectedFile !== "Select File" && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="w-40">
                                    {selectedSheet}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                                {availableSheets.map((sheet) => (
                                    <DropdownMenuItem key={sheet} onClick={() => handleSheetSelect(sheet)}>
                                        {sheet}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}

                    {/* Import button */}
                    {/* Providing an Import button to import all rows without errors to the 
database */}
                    <Button
                        onClick={() => fetchDataFromDB(selectedFile, selectedSheet)}
                        disabled={selectedFile === "Select File" || selectedSheet === "Select Sheet"}
                    >
                        Import
                    </Button>
                </div>

                <div>
                    {/* Imported Data Table */}
                    {currentData.length > 0 && (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {currentData.map((user) => (
                                    <TableRow key={user._id}>
                                        <TableCell>{user.name}</TableCell>
                                        <TableCell>{user.amount}</TableCell>
                                        <TableCell>{new Date(user.date).toLocaleDateString('en-GB')}</TableCell>
                                        <TableCell>
                                            <AlertDialog>
                                                <AlertDialogTrigger>
                                                    {/* Showing a delete icon next to each row */}
                                                    <div className="text-red-500">
                                                        <TrashIcon className="w-5 h-5" />
                                                    </div>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        {/* Prompting the user with a confirmation dialog before deleting a row */}
                                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This action cannot be undone. This will permanently delete this row
                                                            and remove this data from our database.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        {/* Deleting rows only after user confirmation */}
                                                        <AlertDialogAction asChild>
                                                            <Button variant="destructive" onClick={() => handleDelete(user._id)}>
                                                                Continue
                                                            </Button>
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </div>

                {/* Pagination Controls */}
                {data.length > itemsPerPage && (
                <div className="flex justify-end items-center mt-4 gap-2">
                    <Button variant="outline" disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>
                        Previous
                    </Button>
                    <span className="text-sm font-medium">Page {currentPage} of {totalPages}</span>
                    <Button variant="outline" disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>
                        Next
                    </Button>
                </div>
            )}

                <ToastContainer />
            </div>
        );
    };

    export default ImportDropdown;
