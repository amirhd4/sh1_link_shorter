import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";

interface ConfirmationDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
}

export function ConfirmationDialog({ open, onClose, onConfirm, title, description }: ConfirmationDialogProps) {
    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <DialogContentText>{description}</DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>انصراف</Button>
                <Button onClick={onConfirm} color="error" autoFocus>
                    تایید و حذف
                </Button>
            </DialogActions>
        </Dialog>
    );
}