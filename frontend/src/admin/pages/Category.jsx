import React, { useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import axios from 'axios';
import { toast } from 'sonner';

const initialCategories = [
];

const API_BASE_URL = 'http://localhost:7000/api/admin/products'; // Adjust this to match your backend URL

const Category = () => {
  const [categories, setCategories] = useState(initialCategories);
  const [isOpen, setIsOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [updatedName, setUpdatedName] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [categoryToToggle, setCategoryToToggle] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCategories, setFilteredCategories] = useState([]);

  // Open & Close Modals
  function closeModal() {
    setIsOpen(false);
    setSelectedCategory(null);
  }
  function openModal(category) {
    setSelectedCategory(category);
    setUpdatedName(category.name);
    setIsOpen(true);
  }
  function closeAddModal() {
    setIsAddOpen(false);
    setNewCategory("");
  }
  function openAddModal() {
    setIsAddOpen(true);
  }

  // Add these new functions for handling confirmation
  function closeConfirmModal() {
    setIsConfirmOpen(false);
    setCategoryToToggle(null);
  }

  function openConfirmModal(category) {
    setCategoryToToggle(category);
    setIsConfirmOpen(true);
  }

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Add this useEffect to handle search and sorting
  useEffect(() => {
    if (categories.length > 0) {
      const filtered = categories
        .filter(category =>
          category.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setFilteredCategories(filtered);
    }
  }, [categories, searchQuery]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/categories`);
      setCategories(response.data);
    } catch (error) {
      toast.error('Failed to fetch categories');
    }
  };

  // Update Category
  const handleUpdateCategory = async () => {
    if (!selectedCategory || updatedName.trim() === "") return;

    try {
      const response = await axios.put(
        `${API_BASE_URL}/category/${selectedCategory._id}`,
        { name: updatedName }
      );

      setCategories(prevCategories =>
        prevCategories.map(cat =>
          cat._id === selectedCategory._id
            ? { ...cat, name: response.data.name }
            : cat
        )
      );

      toast.success('Category updated successfully');
      closeModal();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update category');
    }
  };

  // Add New Category
  const handleAddCategory = async () => {
    if (newCategory.trim() === "") return;

    try {
      const response = await axios.post(`${API_BASE_URL}/category/add`, {
        name: newCategory
      });

      setCategories(prevCategories => [...prevCategories, response.data]);
      toast.success('Category added successfully');
      closeAddModal();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add category');
    }
  };

  // Modify the status change handler
  const handleStatusChange = async (categoryId, newStatus) => {
    try {
      await axios.put(`${API_BASE_URL}/category/${categoryId}/status`, {
        status: newStatus
      });

      setCategories(prevCategories =>
        prevCategories.map(cat =>
          cat._id === categoryId ? { ...cat, status: newStatus } : cat
        )
      );
      toast.success('Category status updated successfully');
      closeConfirmModal();
    } catch (error) {
      toast.error('Failed to update category status');
    }
  };

  return (
    <div className={`container mx-auto p-6 ${isOpen || isAddOpen ? "backdrop-blur-sm" : ""}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-blue-800">Category Management</h2>
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            className="bg-green-500 hover:bg-green-700 text-white px-4 py-2 rounded"
            onClick={openAddModal}
          >
            + Add Category
          </button>
        </div>
      </div>

      <div className="overflow-x-auto bg-white shadow-lg rounded-lg p-4">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-blue-600 text-white">
              <th className="p-3 text-left">Category</th>
              <th className="p-3 text-left">Created At</th>
              <th className="p-3 text-center">Edit</th>
              <th className="p-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredCategories.map((category) => (
              <tr key={category._id} className="border-b border-gray-300">
                <td className="p-3">{category.name}</td>
                <td className="p-3">
                  {new Date(category.createdAt).toLocaleString()}
                </td>
                <td className="p-3 text-center">
                  <button
                    className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded"
                    onClick={() => openModal(category)}
                  >
                    Edit
                  </button>
                </td>
                <td className="p-3 text-center">
                  <button
                    className={`${category.status === 'listed'
                      ? 'bg-red-500 hover:bg-red-700'
                      : 'bg-green-500 hover:bg-green-700'
                      } text-white px-4 py-2 rounded`}
                    onClick={() => openConfirmModal(category)}
                  >
                    {category.status === 'listed' ? 'Block' : 'Unblock'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Category Modal */}
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="absolute inset-0 flex items-center justify-center p-4" onClose={closeModal}>
          <Dialog.Panel className="bg-white p-6 rounded-lg shadow-lg w-96">
            <Dialog.Title className="text-lg font-bold text-gray-700">
              Edit Category
            </Dialog.Title>
            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-600">
                Category Name
              </label>
              <input
                type="text"
                value={updatedName}
                onChange={(e) => setUpdatedName(e.target.value)}
                className="w-full mt-1 p-2 border rounded focus:outline-none focus:ring focus:ring-blue-300"
              />
            </div>
            <div className="mt-4 flex justify-end space-x-2">
              <button
                className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
                onClick={closeModal}
              >
                Cancel
              </button>
              <button
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded"
                onClick={handleUpdateCategory}
              >
                Update
              </button>
            </div>
          </Dialog.Panel>
        </Dialog>
      </Transition>

      {/* Add Category Modal */}
      <Transition appear show={isAddOpen} as={Fragment}>
        <Dialog as="div" className="absolute inset-0 flex items-center justify-center p-4" onClose={closeAddModal}>
          <Dialog.Panel className="bg-white p-6 rounded-lg shadow-lg w-96">
            <Dialog.Title className="text-lg font-bold text-gray-700">
              Add New Category
            </Dialog.Title>
            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-600">
                Category Name
              </label>
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full mt-1 p-2 border rounded focus:outline-none focus:ring focus:ring-green-300"
                placeholder="Enter category name"
              />
            </div>
            <div className="mt-4 flex justify-end space-x-2">
              <button
                className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
                onClick={closeAddModal}
              >
                Cancel
              </button>
              <button
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                onClick={handleAddCategory}
              >
                Add Category
              </button>
            </div>
          </Dialog.Panel>
        </Dialog>
      </Transition>

      {/* Add Confirmation Modal */}
      <Transition appear show={isConfirmOpen} as={Fragment}>
        <Dialog as="div" className="absolute inset-0 flex items-center justify-center p-4" onClose={closeConfirmModal}>
          <Dialog.Panel className="bg-white p-6 rounded-lg shadow-lg w-96">
            <Dialog.Title className="text-lg font-bold text-gray-700">
              Confirm Status Change
            </Dialog.Title>
            <div className="mt-3">
              <p className="text-gray-600">
                Are you sure you want to {categoryToToggle?.status === 'listed' ? 'block' : 'unblock'} the category "{categoryToToggle?.name}"?
              </p>
            </div>
            <div className="mt-4 flex justify-end space-x-2">
              <button
                className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
                onClick={closeConfirmModal}
              >
                Cancel
              </button>
              <button
                className={`${categoryToToggle?.status === 'listed' ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} text-white px-4 py-2 rounded`}
                onClick={() => handleStatusChange(
                  categoryToToggle?._id,
                  categoryToToggle?.status === 'listed' ? 'Not listed' : 'listed'
                )}
              >
                {categoryToToggle?.status === 'listed' ? 'Block' : 'Unblock'}
              </button>
            </div>
          </Dialog.Panel>
        </Dialog>
      </Transition>
    </div>
  );
};

export default Category;
