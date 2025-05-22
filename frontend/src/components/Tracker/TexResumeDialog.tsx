import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";

interface TexResumeDialogProps {
  open: boolean;
  onClose: () => void;
  texContent: string;
  jobdescId?: string; // Optional, for download filename
}

const TexResumeDialog: React.FC<TexResumeDialogProps> = ({
  open,
  onClose,
  texContent,
  jobdescId,
}) => {
  const handleDownload = () => {
    const blob = new Blob([texContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `resume_${jobdescId || "output"}.tex`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      className="tex-dialog"
      sx={{ paddingBottom: "200px" }}
    >
      <DialogTitle>Resume Preview (.tex)</DialogTitle>
      <DialogContent>
        <pre style={{ whiteSpace: "pre-wrap", fontSize: "0.9rem" }}>
          {texContent}
        </pre>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleDownload} color="primary">
          Download .tex
        </Button>
        <Button onClick={onClose} color="secondary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TexResumeDialog;
