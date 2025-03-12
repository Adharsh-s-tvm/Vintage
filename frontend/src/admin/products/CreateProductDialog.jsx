import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../ui/Dialog';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Label } from '../../ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/Select';
import { X, Plus, Upload } from 'lucide-react';

// Removed TypeScript interface
export function CreateProductDialog({ open, onOpenChange }) {
  const [variants, setVariants] = useState([]);
  const [newVariant, setNewVariant] = useState('');
  const [mainImagePreview, setMainImagePreview] = useState(null);
  const [subImagePreviews, setSubImagePreviews] = useState([]);

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
    // Here you would typically save the product data
    // For this demo, we'll just close the dialog
    onOpenChange(false);

    // Reset form
    setVariants([]);
    setNewVariant('');
    setMainImagePreview(null);
    setSubImagePreviews([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input id="name" placeholder="Enter product name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="electronics">Electronics</SelectItem>
                  <SelectItem value="audio">Audio</SelectItem>
                  <SelectItem value="furniture">Furniture</SelectItem>
                  <SelectItem value="photography">Photography</SelectItem>
                  <SelectItem value="wearables">Wearables</SelectItem>
                  <SelectItem value="gaming">Gaming</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="brand">Brand</Label>
              <Input id="brand" placeholder="Enter brand name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="size">Size</Label>
              <Input id="size" placeholder="E.g., Small, Medium, Large, 15 inch" required />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price ($)</Label>
              <Input id="price" type="number" min="0" step="0.01" placeholder="0.00" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock">Stock</Label>
              <Input id="stock" type="number" min="0" placeholder="0" required />
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
                    onClick={() => setMainImagePreview(null)}
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
                onClick={() => document.getElementById('mainImage')?.click()}
              >
                Select Image
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subImages">Additional Images</Label>
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center">
              {subImagePreviews.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {subImagePreviews.map((preview, index) => (
                    <div key={index} className="relative inline-block">
                      <img
                        src={preview}
                        alt={`Product preview ${index + 1}`}
                        className="h-20 w-20 rounded-md object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveSubImage(index)}
                        className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-md"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-4">
                  <Upload className="mx-auto h-10 w-10 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">Upload additional product images</p>
                </div>
              )}
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
                className="mt-2"
                onClick={() => document.getElementById('subImages')?.click()}
              >
                Select Images
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Product</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
  // ... existing code (rest of the JSX remains the same) ...
} 