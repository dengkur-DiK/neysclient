 import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { PortfolioItem, InsertPortfolioItem, UpdatePortfolioItem } from 'server/schema';

interface PortfolioFormState {
  id?: number;
  title: string;
  description: string;
  image: string;
  category: string;
}

export default function AdminPortfolioManager() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [formData, setFormData] = useState<PortfolioFormState>({
    title: '',
    description: '',
    image: '',
    category: '',
  });

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDeleteId, setItemToDeleteId] = useState<number | null>(null);

  // --- Fetch portfolio items with cache busting ---
  const { data: portfolioItems = [], isLoading, isError } = useQuery<PortfolioItem[]>({
    queryKey: ['portfolioItems'],
    queryFn: async () => {
      // Add a cacheBust param to avoid stale 304 responses in dev or aggressive caches
      const response = await apiRequest('GET', `/api/portfolio?cacheBust=${Date.now()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch portfolio items');
      }
      return response.json();
    },
  });

  // --- Create mutation ---
  const createMutation = useMutation({
    mutationFn: async (newItem: InsertPortfolioItem) => {
      const response = await apiRequest('POST', '/api/portfolio', newItem);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create portfolio item');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolioItems'] });
      queryClient.refetchQueries({ queryKey: ['portfolioItems'] });
      toast({ title: 'Portfolio item created successfully!' });
    },
    onSettled: () => {
      setFormData({ title: '', description: '', image: '', category: '' });
    },
    onError: (error: any) => {
      console.error('Create error:', error);
      toast({
        title: 'Error creating portfolio item',
        description: error.message || 'Please try again.',
        variant: 'destructive',
      });
    },
  });

  // --- Update mutation ---
  const updateMutation = useMutation({
    mutationFn: async (updatedItem: { id: number; data: UpdatePortfolioItem }) => {
      const response = await apiRequest('PUT', `/api/portfolio/${updatedItem.id}`, updatedItem.data);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update portfolio item');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolioItems'] });
      queryClient.refetchQueries({ queryKey: ['portfolioItems'] });
      toast({ title: 'Portfolio item updated successfully!' });
      setIsEditDialogOpen(false);
    },
    onSettled: () => {
      setFormData({ title: '', description: '', image: '', category: '' });
    },
    onError: (error: any) => {
      console.error('Update error:', error);
      toast({
        title: 'Error updating portfolio item',
        description: error.message || 'Please try again.',
        variant: 'destructive',
      });
    },
  });

  // --- Delete mutation ---
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('DELETE', `/api/portfolio/${id}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete portfolio item');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolioItems'] });
      queryClient.refetchQueries({ queryKey: ['portfolioItems'] });
      toast({ title: 'Portfolio item deleted successfully!' });
      setIsDeleteDialogOpen(false);
      setItemToDeleteId(null);
    },
    onError: (error: any) => {
      console.error('Delete error:', error);
      toast({
        title: 'Error deleting portfolio item',
        description: error.message || 'Please try again.',
        variant: 'destructive',
      });
      setIsDeleteDialogOpen(false);
      setItemToDeleteId(null);
    },
  });

  // --- Handlers ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem: InsertPortfolioItem = {
      title: formData.title,
      description: formData.description,
      image: formData.image,
      category: formData.category,
    };
    createMutation.mutate(newItem);
  };

  const handleEditClick = (item: PortfolioItem) => {
    setFormData({
      id: item.id,
      title: item.title,
      description: item.description,
      image: item.image,
      category: item.category,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.id === undefined) {
      toast({ title: 'Error: Cannot update item without an ID.', variant: 'destructive' });
      return;
    }
    const dataToUpdate: UpdatePortfolioItem = {
      title: formData.title,
      description: formData.description,
      image: formData.image,
      category: formData.category,
    };
    updateMutation.mutate({ id: formData.id, data: dataToUpdate });
  };

  const handleDeleteClick = (id: number) => {
    setItemToDeleteId(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (itemToDeleteId !== null) {
      deleteMutation.mutate(itemToDeleteId);
    }
  };

  if (isLoading) return <div className="text-center py-8 text-gray-300">Loading portfolio items...</div>;
  if (isError) return <div className="text-center py-8 text-red-500">Error loading portfolio items.</div>;

  return (
    <div className="p-6 bg-gray-900 text-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold mb-6 text-center">Manage Portfolio</h2>

      {/* Add New Portfolio Item Form */}
      <div className="mb-10 p-6 border border-gray-700 rounded-lg bg-gray-800">
        <h3 className="text-2xl font-semibold mb-4">Add New Item</h3>
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={formData.title} onChange={handleInputChange} className="bg-gray-700 border-gray-600" required />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={formData.description} onChange={handleInputChange} className="bg-gray-700 border-gray-600" rows={3} required />
          </div>
          <div>
            <Label htmlFor="image">Image URL</Label>
            <Input id="image" type="url" value={formData.image} onChange={handleInputChange} className="bg-gray-700 border-gray-600" required />
          </div>
          <div>
            <Label htmlFor="category">Category</Label>
            <Input id="category" value={formData.category} onChange={handleInputChange} className="bg-gray-700 border-gray-600" required />
          </div>
          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Adding...' : 'Add Portfolio Item'}
          </Button>
        </form>
      </div>

      {/* Existing Portfolio Items */}
      <div className="p-6 border border-gray-700 rounded-lg bg-gray-800">
        <h3 className="text-2xl font-semibold mb-4">Existing Portfolio Items</h3>
        {portfolioItems.length === 0 ? (
          <p className="text-gray-400">No portfolio items found. Add some above!</p>
        ) : (
          <div className="space-y-4">
            {portfolioItems.map((item) => (
              <div key={item.id} className="flex flex-col md:flex-row items-center justify-between p-4 border border-gray-600 rounded-lg bg-gray-700">
                <div className="flex-grow text-left md:mr-4 mb-4 md:mb-0">
                  <h4 className="text-xl font-semibold">{item.title}</h4>
                  <p className="text-gray-300 text-sm">{item.description}</p>
                  <p className="text-gray-400 text-xs">Category: {item.category}</p>
                  <p className="text-gray-400 text-xs">ID: {item.id}</p>
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-24 h-24 object-cover rounded-md mt-2"
                    onError={(e) => (e.currentTarget.src = 'https://placehold.co/96x96/333/FFF?text=No+Image')}
                  />
                </div>
                <div className="flex space-x-2">
                  <Button onClick={() => handleEditClick(item)} className="bg-yellow-600 hover:bg-yellow-700 text-white">
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleDeleteClick(item.id)}
                    className="bg-red-600 hover:bg-red-700 text-white"
                    disabled={deleteMutation.isPending}
                  >
                    {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Portfolio Item Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>Edit Portfolio Item</DialogTitle>
            <DialogDescription>
              Make changes to your portfolio item here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input id="title" value={formData.title} onChange={handleInputChange} className="col-span-3 bg-gray-700 border-gray-600" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={handleInputChange}
                className="col-span-3 bg-gray-700 border-gray-600"
                rows={3}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="image" className="text-right">
                Image URL
              </Label>
              <Input
                id="image"
                type="url"
                value={formData.image}
                onChange={handleInputChange}
                className="col-span-3 bg-gray-700 border-gray-600"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Category
              </Label>
              <Input
                id="category"
                value={formData.category}
                onChange={handleInputChange}
                className="col-span-3 bg-gray-700 border-gray-600"
                required
              />
            </div>
            <DialogFooter>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-gray-800 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone. This will permanently delete your portfolio item.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-600 hover:bg-gray-700 text-white">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 text-white">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
