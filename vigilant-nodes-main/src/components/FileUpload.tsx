import { useCallback } from "react";
import { Upload, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
  fileName?: string;
}

export function FileUpload({ onFileSelect, isLoading, fileName }: FileUploadProps) {
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file && file.name.endsWith(".csv")) onFileSelect(file);
    },
    [onFileSelect]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) onFileSelect(file);
    },
    [onFileSelect]
  );

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className={`relative rounded-lg p-10 text-center transition-all
        ${fileName ? "bg-primary/5" : "hover:bg-primary/5"}
        ${isLoading ? "opacity-50 pointer-events-none" : ""}`}
    >
      <input
        type="file"
        accept=".csv"
        onChange={handleChange}
        className="absolute inset-0 opacity-0 cursor-pointer"
        disabled={isLoading}
      />
      <div className="flex flex-col items-center gap-4">
        {fileName ? (
          <>
            <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center">
              <FileText className="w-7 h-7 text-primary" />
            </div>
            <p className="font-mono text-sm text-primary font-medium">{fileName}</p>
            <p className="text-xs text-muted-foreground">Click or drag to replace</p>
          </>
        ) : (
          <>
            <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center glow-primary">
              <Upload className="w-7 h-7 text-primary" />
            </div>
            <div>
              <p className="text-sm text-foreground font-semibold">Upload Transaction CSV</p>
              <p className="text-xs text-muted-foreground mt-1">
                Drag & drop or click to browse
              </p>
            </div>
            <p className="text-[11px] text-muted-foreground font-mono">
              Required: transaction_id, sender_id, receiver_id, amount, timestamp
            </p>
            <Button variant="outline" size="sm" className="font-mono text-xs border-primary/30 text-primary hover:bg-primary/10 pointer-events-none">
              <FileText className="w-3.5 h-3.5 mr-1.5" /> Select CSV File
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
