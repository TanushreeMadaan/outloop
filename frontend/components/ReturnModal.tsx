import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";

interface ReturnModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (actualReturnDate: string) => void;
    isSubmitting: boolean;
}

export function ReturnModal({ isOpen, onClose, onSubmit, isSubmitting }: ReturnModalProps) {
    const [actualReturnDate, setActualReturnDate] = useState(
        new Date().toISOString().split('T')[0]
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(actualReturnDate);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader className="text-center sm:text-center">
                    <DialogTitle>Mark as Returned</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6 py-2">
                    <div className="space-y-2">
                        <label htmlFor="actualReturnDate" className="control-label">
                            Recorded Return Date
                        </label>
                        <div className="relative">
                            <input
                                id="actualReturnDate"
                                type="date"
                                required
                                value={actualReturnDate}
                                onChange={(e) => setActualReturnDate(e.target.value)}
                                className="control-input"
                            />
                        </div>
                    </div>

                    <DialogFooter className="-mx-6 flex-row justify-center gap-3 border-t border-border/70 px-6 pt-4 sm:justify-center">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="min-w-28 rounded-[1rem] px-6"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="min-w-36 rounded-[1rem] px-8"
                        >
                            {isSubmitting && (
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            )}
                            {isSubmitting ? "Updating..." : "Complete Return"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
