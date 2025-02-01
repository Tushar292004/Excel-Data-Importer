// src/store/useFileStore.ts
import {create} from 'zustand';

interface FileStore {
  uploadedFiles: string[];
  setUploadedFiles: (files: string[]) => void;
  sheetNames: Record<string, string[]>;
  setSheetNames: (fileName: string, sheetNames: string[]) => void;
}

export const useFileStore = create<FileStore>((set) => ({
  uploadedFiles: [],
  sheetNames: {},
  setUploadedFiles: (files) => set({ uploadedFiles: files }),
  setSheetNames: (fileName, sheetNames) =>
    set((state) => ({
      sheetNames: { ...state.sheetNames, [fileName]: sheetNames },
    })),
}));
