import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../ui/Dialog';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Label } from '../../ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/Select';
import { X, Plus, Upload } from 'lucide-react';
import { mockProducts } from './mockData';

export function EditProductDialog({ product, open, onOpenChange }) {
    const [name, setName] = useState(product.name);
    const [category, setCategory] = useState(product.category);
    const [brand, setBrand] = useState(product.brand);
    const [size, setSize] = useState(product.size);
    const [price, setPrice] = useState(product.price);
    const [stock, setStock] = useState(product.stock);
    const [variants, setVariants] = useState(product.variants);
    const [newVariant, setNewVariant] = useState('');
    const [mainImagePreview, setMainImagePreview] = useState(product.mainImage);
    const [subImagePreviews, setSubImagePreviews] = useState(product.subImages);

    useEffect(() => {
        // Update state when product changes
        setName(product.name);
        setCategory(product.category);
        setBrand(product.brand);
        setSize(product.size);
        setPrice(product.price);
        setStock(product.stock);
        setVariants(product.variants);
        setMainImagePreview(product.mainImage);
        setSubImagePreviews(product.subImages);
    }, [product]);

    const handleAddVariant = () => {
        if (newVariant.trim() !== '' && !variants.includes(newVariant.trim())) {
            setVariants([...variants, newVariant.trim()]);
            setNewVariant('');
        }
    };

    const handleRemoveVariant = (variant) => {
        setVariants(variants.filter(v => v !== variant));
    };

    const handleMainImageChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setMainImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubImagesChange = (e) => {
        const files = e.target.files;
        if (files) {
            const newPreviews = [];

            Array.from(files).forEach(file => {
                const reader = new FileReader();
                reader.onload = () => {
                    newPreviews.push(reader.result);
                    if (newPreviews.length === files.length) {
                        setSubImagePreviews([...subImagePreviews, ...newPreviews]);
                    }
                };
                reader.readAsDataURL(file);
            });
        }
    };

    const handleRemoveSubImage = (index) => {
        setSubImagePreviews(subImagePreviews.filter((_, i) => i !== index));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Here you would typically update the product data
        // For this demo, we'll just close the dialog
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Product</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Product Name</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter product name"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>
                            <Select value={category} onValueChange={setCategory}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Electronics">Electronics</SelectItem>
                                    <SelectItem value="Audio">Audio</SelectItem>
                                    <SelectItem value="Furniture">Furniture</SelectItem>
                                    <SelectItem value="Photography">Photography</SelectItem>
                                    <SelectItem value="Wearables">Wearables</SelectItem>
                                    <SelectItem value="Gaming">Gaming</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="brand">Brand</Label>
                            <Input
                                id="brand"
                                value={brand}
                                onChange={(e) => setBrand(e.target.value)}
                                placeholder="Enter brand name"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="size">Size</Label>
                            <Input
                                id="size"
                                value={size}
                                onChange={(e) => setSize(e.target.value)}
                                placeholder="E.g., Small, Medium, Large, 15 inch"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="price">Price ($)</Label>
                            <Input
                                id="price"
                                type="number"
                                min="0"
                                step="0.01"
                                value={price}
                                onChange={(e) => setPrice(parseFloat(e.target.value))}
                                placeholder="0.00"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="stock">Stock</Label>
                            <Input
                                id="stock"
                                type="number"
                                min="0"
                                value={stock}
                                onChange={(e) => setStock(parseInt(e.target.value))}
                                placeholder="0"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Variants</Label>
                        <div className="flex gap-2">
                            <Input
                                value={newVariant}
                                onChange={(e) => setNewVariant(e.target.value)}
                                placeholder="E.g., Color, Size, Material"
                            />
                            <Button
                                type="button"
                                onClick={handleAddVariant}
                                variant="outline"
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                        {variants.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {variants.map((variant, index) => (
                                    <div
                                        key={index}
                                        className="bg-gray-100 px-3 py-1 rounded-full flex items-center gap-1"
                                    >
                                        <span>{variant}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveVariant(variant)}
                                            className="text-gray-500 hover:text-gray-700"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="mainImage">Main Image</Label>
                        <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center">
                            {mainImagePreview ? (
                                <div className="relative inline-block">
                                    <img
                                        src={mainImagePreview}
                                        alt="Main product preview"
                                        className="max-h-40 max-w-full rounded-md object-contain"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setMainImagePreview('')}
                                        className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-md"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            ) : (
                                <div className="py-4">
                                    <Upload className="mx-auto h-10 w-10 text-gray-400" />
                                    <p className="mt-2 text-sm text-gray-500">Click to upload or drag and drop</p>
                                </div>
                            )}
                            <Input
                                id="mainImage"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleMainImageChange}
                            />
                            <Button
                                type="button"
                                variant="outline"
                                className="mt-2"
                                onClick={() => document.getElementById('mainImage').click()}
                            >
                                Choose File
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="subImages">Additional Images</Label>
                        <div className="border-2 border-dashed border-gray-200 rounded-lg p-4">
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                                {subImagePreviews.map((preview, index) => (
                                    <div key={index} className="relative">
                                        <img
                                            src={preview}
                                            alt={`Product preview ${index + 1}`}
                                            className="w-full h-24 object-cover rounded-md"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveSubImage(index)}
                                            className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-md"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <Input
                                id="subImages"
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                onChange={handleSubImagesChange}
                            />
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full"
                                onClick={() => document.getElementById('subImages').click()}
                            >
                                Add More Images
                            </Button>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="submit">Save Changes</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
} 