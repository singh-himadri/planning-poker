"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface ConsensusDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    selectedValue: string;
    onConfirm: (description: string) => void;
}

export function ConsensusDialog({
    open,
    onOpenChange,
    selectedValue,
    onConfirm,
}: ConsensusDialogProps) {
    const [description, setDescription] = useState("");

    const handleConfirm = () => {
        onConfirm(description);
        setDescription("");
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent >
                <DialogHeader>
                    <DialogTitle>Confirm Consensus: {selectedValue}</DialogTitle>
                    <DialogDescription>
                        Add a description or note for this estimate (optional).
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <Textarea
                        placeholder="e.g. High uncertainty due to legacy code..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="h-24 resize-none"
                    />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleConfirm}>Confirm Consensus</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
