import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../../ui/Dialog';
import { Button } from '../../ui/Button';
import { AlertTriangle } from 'lucide-react';

export function DeleteProductDialog({ product, open, onOpenChange }) {
    const handleDelete = () => {
        // Here you would typically delete the product
        // For this demo, we'll just close the dialog
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Delete Product</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete this product? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex items-center gap-4 p-4 bg-red-50 rounded-lg">
                    <AlertTriangle className="h-12 w-12 text-red-500" />
                    <div>
                        <h4 className="font-semibold">{product.name}</h4>
                        <p className="text-sm text-gray-500">{product.category} - {product.brand}</p>
                    </div>
                </div>

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button type="button" variant="destructive" onClick={handleDelete}>
                        Delete
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
} 