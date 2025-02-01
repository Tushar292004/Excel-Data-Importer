import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { UploadCloud, Trash2 } from "lucide-react";
import * as XLSX from "xlsx";
import axios,  { AxiosResponse } from "axios";
import { useFileStore } from "@/store/useFileStore";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ACCEPTED_FORMATS = [".xlsx"];

type FileWithPreview = File & { preview: string };

const FileUpload = () => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [uploadedFile, setUploadedFile] = useState<Set<string>>(new Set());
  const { setUploadedFiles, setSheetNames } = useFileStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [dialogErrors, setDialogErrors] = useState<{filename: string; sheetName: string; row: number; error: string }[]>([]);

  const excelSerialToDate = (serial: number): string => {
    const utc_days = Math.floor(serial - 25569);
    const date = new Date(utc_days * 86400000);
    return date.toISOString().split("T")[0]; // Returns YYYY-MM-DD
  };

  const onDrop = (acceptedFiles: File[]) => {
    const validFiles = acceptedFiles
      .map((file) => {
        const sanitizedFile = new File([file], file.name.replace(/\s+/g, "_"), { type: file.type });
        return sanitizedFile;
      }).filter(
        (file) => file.size <= MAX_FILE_SIZE && ACCEPTED_FORMATS.includes(`.${file.name.split(".").pop()?.toLowerCase()}`)
      );

    if (validFiles.length !== acceptedFiles.length) {
      alert("Some files were rejected due to size or format restrictions.");
    }

    setFiles((prevFiles: any) => {
      return [...prevFiles, ...validFiles];
    });
  };

  const removeFile = (fileName: string) => {
    if (!uploadedFile.has(fileName)) { 
      setFiles((prevFiles) => prevFiles.filter((file) => file.name !== fileName));
    }
  };


  const processAndUploadFiles = async () => {
    const allFilesData: { filename: string; sheets: Record<string, any[]> }[] = [];
  const allFileNames: string[] = [];
    for (const file of files) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });

        const allSheetsData: { filename: string; sheets: Record<string, any[]> } = {
          filename: file.name,
          sheets: {},
        };

        const sheetNames: string[] = [];
        workbook.SheetNames.forEach((sheetName) => {
          const worksheet = workbook.Sheets[sheetName];
          allSheetsData.sheets[sheetName] = XLSX.utils.sheet_to_json(worksheet, { raw: false });
          sheetNames.push(sheetName);
        });

        allFileNames.push(file.name);
        setSheetNames(file.name, sheetNames);
        allFilesData.push(allSheetsData);
        setUploadedFiles(allFileNames);
        setUploadedFile((prev) => new Set(prev.add(file.name)));
        await sendToBackend(allSheetsData);
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const sendToBackend = async (jsonData: any) => {
    try {
      const response: AxiosResponse = await axios.post("http://localhost:3000/api/upload", jsonData);
      console.log("Data sent successfully!");
      if (response.status === 207) {
        // If partial success modal dialog 
        setDialogMessage(response.data.message);
        setDialogErrors(response.data.errors);
      } else if (response.status === 400) {
        // If failure modal dialog
        setDialogMessage(response.data.message);
        setDialogErrors(response.data.errors);
      } else {
        setDialogMessage("All users are uploaded successfully");
      }
      setDialogOpen(true); 
    } catch (error) {
      console.error("Error sending data:", error);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"] },
    multiple: true,
  });

  return (

    <div className="p-6 border rounded-xl shadow-md bg-white max-w-md mx-auto">
      <div {...getRootProps()} className="border-dashed border-2 p-6 text-center cursor-pointer rounded-lg">
        <input {...getInputProps()} />
        <UploadCloud size={40} className="mx-auto text-gray-500" />
        <p className="text-gray-600 mt-2">Drag & Drop .xlsx files here</p>
        <p className="text-gray-400 text-sm">or</p>
        <Button className="mt-2">Browse Files</Button>
      </div>

      {files.length > 0 && (
        <ul className="mt-4 space-y-2">
          {files.map((file) => (
            <li key={file.name} className="flex justify-between items-center p-2 border rounded-lg bg-gray-100">
              <span className="truncate">{file.name}</span>
              <Button variant="destructive" size="icon" onClick={() => removeFile(file.name)} disabled={uploadedFile.has(file.name)}>
                <Trash2 size={16} />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <Button className="mt-4 w-full" onClick={processAndUploadFiles} disabled={files.length === 0}>
        Upload Files
      </Button>
      <ToastContainer />

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-bold text-xl">Upload Status</DialogTitle>
          </DialogHeader>
          <div>
            <p>{dialogMessage}</p>
            {dialogErrors.length > 0 && (
              <div>
                <h4>Errors:</h4>
                <ul>
                  {dialogErrors.map((error, index) => (
                    <li key={index}>
                      <strong className="text-red-600">{error.filename}: </strong><strong>{error.sheetName}: </strong><strong>Row {error.row}: </strong>{error.error}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button className="btn">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FileUpload;
