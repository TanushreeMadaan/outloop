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
                <DialogHeader>
                    <DialogTitle>Mark as Returned</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6 py-2">
                    <div className="space-y-2">
                        <label htmlFor="actualReturnDate" className="text-xs font-bold uppercase tracking-wider text-gray-400 ml-1">
                            Recorded Return Date
                        </label>
                        <div className="relative">
                            <input
                                id="actualReturnDate"
                                type="date"
                                required
                                value={actualReturnDate}
                                onChange={(e) => setActualReturnDate(e.target.value)}
                                className="w-full rounded-2xl border border-gray-100 bg-gray-50/50 px-4 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all font-medium text-gray-900"
                            />
                        </div>
                    </div>

                    <DialogFooter className="pt-4 flex-row justify-end gap-3 border-t border-gray-50 -mx-6 px-6">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="rounded-2xl border-gray-200 text-gray-500 hover:bg-gray-50 font-bold px-6 h-12 shadow-sm transition-all"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="rounded-2xl bg-blue-600 text-white hover:bg-blue-700 font-bold px-8 h-12 shadow-lg shadow-blue-200/50 transition-all active:scale-95 flex items-center gap-2"
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
