import * as React from "react";
import { cn } from "@/lib/utils";
import { Upload, X, FileText, CheckCircle } from "lucide-react";
import { HealthcareButton } from "./healthcare-button";

interface FileUploadProps {
  label?: string;
  description?: string;
  accept?: string;
  onChange?: (file: File | null) => void;
  className?: string;
  error?: string;
}

export function FileUpload({ 
  label, 
  description, 
  accept = ".pdf,.doc,.docx,.jpg,.jpeg,.png", 
  onChange, 
  className,
  error 
}: FileUploadProps) {
  const [file, setFile] = React.useState<File | null>(null);
  const [isDragOver, setIsDragOver] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFile: File | null) => {
    setFile(selectedFile);
    onChange?.(selectedFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    handleFileSelect(selectedFile);
  };

  const removeFile = () => {
    handleFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      
      <div
        className={cn(
          "relative border-2 border-dashed rounded-xl transition-all duration-200",
          isDragOver
            ? "border-primary bg-primary/5"
            : file
            ? "border-healthcare-success bg-healthcare-success/5"
            : error
            ? "border-healthcare-error bg-healthcare-error/5"
            : "border-input hover:border-primary/50",
          "cursor-pointer"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileInputChange}
          className="hidden"
        />
        
        {file ? (
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-healthcare-success/10 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-healthcare-success" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {file.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <HealthcareButton
              type="button"
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                removeFile();
              }}
            >
              <X className="w-4 h-4" />
            </HealthcareButton>
          </div>
        ) : (
          <div className="p-6 text-center">
            <div className="mx-auto w-12 h-12 bg-muted rounded-lg flex items-center justify-center mb-3">
              <Upload className="w-6 h-6 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                Click to upload or drag and drop
              </p>
              {description && (
                <p className="text-xs text-muted-foreground">
                  {description}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                PDF, DOC, DOCX, JPG, PNG up to 10MB
              </p>
            </div>
          </div>
        )}
      </div>
      
      {error && (
        <p className="text-sm text-healthcare-error animate-in slide-in-from-top-1 duration-200">
          {error}
        </p>
      )}
    </div>
  );
}