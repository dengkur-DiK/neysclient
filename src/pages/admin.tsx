  import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
// Using explicit relative import paths as a fallback
import { apiRequest, queryClient } from "../lib/queryClient"; // Assumes client/src/pages/ and client/src/lib/ are siblings
import { Upload, Save, Eye, Edit2, Trash2, Calendar, Phone, Mail, User, Plus, FileImage } from "lucide-react";
// Using explicit relative import path
import AdminLogin from "./admin-login"; 
import MessagesList from "./messageslist.tsx";
import { useQueryClient } from "@tanstack/react-query";
import { Clock, MessageSquare } from "lucide-react";

// Assumes admin-login.tsx is in the same client/src/pages/ directory

// IMPORTANT: Import types from your shared schema for consistency
import {
  PortfolioItem,
  InsertPortfolioItem,
  UpdatePortfolioItem,
  Booking
} from "server/schema.ts";

interface SiteContent {
  hero: {
    title: string;
    subtitle: string;
    description: string;
    backgroundImage: string;
  };
  about: {
    title: string;
    description: string;
    longDescription: string;
    image: string;
    stats: {
      projects: number;
      clients: number;
      experience: number;
    };
  };
  contact: {
    address: string;
    phone: string;
    email: string;
    hours: string;
  };
}

  function BookingsList() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: bookings = [], isLoading } = useQuery<Booking[]>({
    queryKey: ["/api/bookings"],
    queryFn: () => fetch("/api/bookings").then((res) => res.json())
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/bookings/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete booking');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      toast({
        title: "Booking Deleted",
        description: "The booking was successfully removed.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return <div className="text-center py-8 text-gray-400">Loading bookings...</div>;
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <MessageSquare className="w-12 h-12 mx-auto mb-4" />
        <p>No bookings yet. This section will show new bookings.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <div key={booking.id} className="border border-gray-600 rounded-lg p-4 bg-gray-800">
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-orange-500" />
                <span className="font-semibold">{booking.name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <Mail className="w-4 h-4" />
                <span>{booking.email}</span>
                <Phone className="w-4 h-4" />
                <span>{booking.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <Calendar className="w-4 h-4" />
                <span>{new Date(booking.date).toLocaleDateString()}</span>
                <Clock className="w-4 h-4" />
                <span>{new Date(booking.date).toLocaleTimeString()}</span>
              </div>
              <div className="text-sm">
                <span className="font-semibold text-orange-500">Service:</span>
                <p className="mt-1 text-gray-300">{booking.service}</p>
              </div>
              <div className="text-sm">
                <span className="font-semibold text-orange-500">Message:</span>
                <p className="mt-1 text-gray-300">{booking.message}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => deleteMutation.mutate(booking.id)}
              disabled={deleteMutation.isPending}
              className="ml-4"
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
export default function Admin() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [siteContent, setSiteContent] = useState<SiteContent | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null); // Renamed for clarity
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  const [newItem, setNewItem] = useState<Partial<InsertPortfolioItem>>({
    title: '',
    description: '',
    image: '',
    category: ''
  });
  const { toast } = useToast();

  // Fetch portfolio items from database
  const { data: portfolioItems = [], isLoading: portfolioLoading } = useQuery<PortfolioItem[]>({
    queryKey: ['/api/portfolio'],
    queryFn: () => apiRequest('GET', '/api/portfolio').then(res => res.json())
  });

  // NEW: Mutation for uploading image to Cloudinary via backend
  const uploadImageMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('image', file); // 'image' must match the multer field name in backend (upload.single('image'))

      const response = await fetch('/api/upload-image', { // Use fetch directly for multipart/form-data
        method: 'POST',
        body: formData,
        // Don't set Content-Type header; browser will set it automatically with boundary
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown upload error' }));
        throw new Error(errorData.error || 'Failed to upload image.');
      }
      return response.json(); // Expected to return { imageUrl: '...' }
    },
    onSuccess: (data) => {
      const imageUrl = data.imageUrl;
      if (editingItem) {
        setEditingItem(prev => prev ? { ...prev, image: imageUrl } : null);
        toast({ title: "Image Uploaded", description: "Image URL updated for editing item." });
      } else {
        setNewItem(prev => ({ ...prev, image: imageUrl }));
        toast({ title: "Image Uploaded", description: "Image URL updated for new item." });
      }
      setSelectedImageFile(null); // Clear selected file after successful upload
    },
    onError: (error: any) => {
      console.error("Image upload error:", error);
      toast({
        title: "Image Upload Failed",
        description: error.message || "Failed to upload image. Please try again.",
        variant: "destructive",
      });
      setSelectedImageFile(null); // Clear selected file on error
    }
  });


  // Mutations for portfolio operations (no changes to these mutations themselves,
  // but the data they receive for 'image' will now be Cloudinary URLs)
  const addPortfolioMutation = useMutation({
    mutationFn: (data: InsertPortfolioItem) => apiRequest('POST', '/api/portfolio', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/portfolio'] });
      toast({ title: "Item Added", description: "New portfolio item added successfully" });
      setNewItem({ title: '', description: '', image: '', category: '' });
    },
    onError: (error: any) => {
      console.error("Error adding portfolio item:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add portfolio item",
        variant: "destructive"
      });
    }
  });

  const updatePortfolioMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePortfolioItem }) => apiRequest('PUT', `/api/portfolio/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/portfolio'] });
      toast({ title: "Item Updated", description: "Portfolio item updated successfully" });
      setEditingItem(null);
    },
    onError: (error: any) => {
      console.error("Error updating portfolio item:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update portfolio item",
        variant: "destructive"
      });
    }
  });

  const deletePortfolioMutation = useMutation({
    mutationFn: (id: number) => apiRequest('DELETE', `/api/portfolio/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/portfolio'] });
      toast({ title: "Item Deleted", description: "Portfolio item removed successfully" });
    },
    onError: (error: any) => {
      console.error("Error deleting portfolio item:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete portfolio item",
        variant: "destructive"
      });
    }
  });

  // Initialize with current content
  useEffect(() => {
    const defaultContent: SiteContent = {
      hero: {
        title: "Creative Photography",
        subtitle: "for the Digital Age",
        description: "We capture innovation, technology, and human collaboration through stunning visual storytelling that elevates your brand.",
        backgroundImage: "https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1920&h=1080"
      },
      about: {
        title: "About AntBros",
        description: "We are a creative photography studio specializing in technology, innovation, and collaborative storytelling.",
        longDescription: "With years of experience in commercial photography, we understand the importance of visual communication in today's digital landscape. From startup tech companies to established enterprises, we help brands tell their stories through stunning photography.",
        image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600",
        stats: {
          projects: 500,
          clients: 50,
          experience: 5
        }
      },
      contact: {
        address: "123 Creative Avenue, Innovation District, Tech City 12345",
        phone: "+1 (555) 123-4567",
        email: "hello@antbrosphotography.com",
        hours: "Mon-Fri: 9AM-6PM, Sat: 10AM-4PM"
      }
    };

    const defaultPortfolio: PortfolioItem[] = [
      {
        id: 1,
        title: "Studio Equipment",
        description: "Professional-grade equipment for tech photography",
        image: "https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600",
        category: "equipment",
        createdAt: new Date().toISOString(),
      },
      {
        id: 2,
        title: "Tech Innovation",
        description: "Capturing cutting-edge technology and innovation",
        image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600",
        category: "technology",
        createdAt: new Date().toISOString(),
      },
      {
        id: 3,
        title: "Team Collaboration",
        description: "Dynamic team interactions and collaborative moments",
        image: "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600",
        category: "team",
        createdAt: new Date().toISOString(),
      },
      {
        id: 4,
        title: "Creative Spaces",
        description: "Inspiring workspaces that foster creativity",
        image: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600",
        category: "workspace",
        createdAt: new Date().toISOString(),
      },
      {
        id: 5,
        title: "Studio Sessions",
        description: "Professional studio photography sessions",
        image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600",
        category: "studio",
        createdAt: new Date().toISOString(),
      },
      {
        id: 6,
        title: "Tech Workspaces",
        description: "Modern technology environments and setups",
        image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600",
        category: "workspace",
        createdAt: new Date().toISOString(),
      }
    ];

    setSiteContent(defaultContent);
  }, []);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImageFile(file); // Store the file itself
      toast({
        title: "File Selected",
        description: `${file.name} is ready for upload.`
      });
    }
  };

  const triggerImageUpload = () => {
    if (selectedImageFile) {
      uploadImageMutation.mutate(selectedImageFile);
    } else {
      toast({
        title: "No File Selected",
        description: "Please select an image file first.",
        variant: "destructive"
      });
    }
  };

  const savePortfolioItem = () => {
    if (editingItem && editingItem.id !== undefined) {
      const dataToUpdate: UpdatePortfolioItem = {
        title: editingItem.title,
        description: editingItem.description,
        image: editingItem.image,
        category: editingItem.category
      };
      updatePortfolioMutation.mutate({
        id: editingItem.id,
        data: dataToUpdate
      });
    } else {
      toast({
        title: "Error",
        description: "Cannot save changes: Item is not selected for editing or missing ID.",
        variant: "destructive"
      });
    }
  };

  const addNewPortfolioItem = () => {
    if (newItem.title && newItem.description && newItem.image && newItem.category) {
      const itemToInsert: InsertPortfolioItem = {
        title: newItem.title,
        description: newItem.description,
        image: newItem.image,
        category: newItem.category,
      };
      addPortfolioMutation.mutate(itemToInsert);
    } else {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields (Title, Description, Image URL, Category) and ensure an image is uploaded.",
        variant: "destructive"
      });
    }
  };

  const deletePortfolioItem = (id: number) => {
    if (window.confirm('Are you sure you want to delete this portfolio item?')) {
      deletePortfolioMutation.mutate(id);
    }
  };

  const saveSiteContent = () => {
    toast({
      title: "Content Saved",
      description: "Site content updated successfully (frontend-only for now)"
    });
    console.log("Site Content to save:", siteContent);
  };

  if (!isLoggedIn) {
    return <AdminLogin onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">AntBros Admin Panel</h1>
          <Button
            onClick={() => window.open('/', '_blank')}
            className="bg-orange-600 hover:bg-orange-700"
          >
            <Eye className="w-4 h-4 mr-2" />
            View Site
          </Button>
        </div>

        <Tabs defaultValue="portfolio" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
          </TabsList>

          <TabsContent value="portfolio" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Portfolio Management</CardTitle>
                <CardDescription>Add, edit, and manage your portfolio items</CardDescription>
              </CardHeader>
              <CardContent>
                {portfolioLoading ? (
                  <div className="text-center py-8 text-gray-400">Loading portfolio items...</div>
                ) : portfolioItems.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">No portfolio items found. Add some below!</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {portfolioItems.map(item => (
                      <div key={item.id} className="border rounded-lg p-4 bg-gray-800">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-32 object-cover rounded mb-2"
                          onError={(e) => (e.currentTarget.src = 'https://placehold.co/320x128/333/FFF?text=No+Image')}
                        />
                        <h3 className="font-semibold">{item.title}</h3>
                        <p className="text-sm text-gray-400 mb-2">{item.description}</p>
                        <p className="text-sm text-gray-400 mb-2">Category: {item.category}</p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingItem({...item})}
                          >
                            <Edit2 className="w-3 h-3 mr-1" /> Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deletePortfolioItem(item.id)}
                            disabled={deletePortfolioMutation.isPending}
                          >
                            <Trash2 className="w-3 h-3 mr-1" /> Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Edit Form */}
                {editingItem && (
                  <div className="mt-6 p-4 border rounded-lg bg-gray-800">
                    <h3 className="font-semibold mb-4">Edit Portfolio Item (ID: {editingItem.id})</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="edit-title">Title</Label>
                        <Input
                          id="edit-title"
                          value={editingItem.title}
                          onChange={(e) => setEditingItem(prev => prev ? {...prev, title: e.target.value} : null)}
                          className="bg-gray-700"
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-category">Category</Label>
                        <Input
                          id="edit-category"
                          value={editingItem.category}
                          onChange={(e) => setEditingItem(prev => prev ? {...prev, category: e.target.value} : null)}
                          className="bg-gray-700"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor="edit-description">Description</Label>
                        <Textarea
                          id="edit-description"
                          value={editingItem.description}
                          onChange={(e) => setEditingItem(prev => prev ? {...prev, description: e.target.value} : null)}
                          className="bg-gray-700"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor="edit-image">Image URL</Label>
                        <div className="flex gap-2">
                          <Input
                            id="edit-image"
                            value={editingItem.image}
                            onChange={(e) => setEditingItem(prev => prev ? {...prev, image: e.target.value} : null)}
                            className="bg-gray-700 flex-1"
                            placeholder="Image URL"
                          />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="hidden"
                            id="edit-file-upload"
                          />
                          <Button
                            type="button"
                            onClick={() => document.getElementById('edit-file-upload')?.click()}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <FileImage className="w-4 h-4 mr-2" />
                            Select File
                          </Button>
                           <Button
                            type="button"
                            onClick={triggerImageUpload}
                            className="bg-green-600 hover:bg-green-700"
                            disabled={!selectedImageFile || uploadImageMutation.isPending}
                          >
                            {uploadImageMutation.isPending ? 'Uploading...' : 'Upload Image'}
                          </Button>
                        </div>
                        {editingItem.image && (
                          <img
                            src={editingItem.image}
                            alt="Preview"
                            className="mt-2 w-32 h-24 object-cover rounded"
                            onError={(e) => (e.currentTarget.src = 'https://placehold.co/128x96/333/FFF?text=No+Image')}
                          />
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button
                        onClick={savePortfolioItem}
                        className="bg-green-600 hover:bg-green-700"
                        disabled={updatePortfolioMutation.isPending}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {updatePortfolioMutation.isPending ? 'Saving...' : 'Save Changes'}
                      </Button>
                      <Button
                        onClick={() => setEditingItem(null)}
                        variant="outline"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {/* Add New Item Form */}
                <div className="mt-6 p-4 border rounded-lg bg-gray-800">
                  <h3 className="font-semibold mb-4">Add New Portfolio Item</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="new-title">Title</Label>
                      <Input
                        id="new-title"
                        value={newItem.title || ''}
                        onChange={(e) => setNewItem(prev => ({...prev, title: e.target.value}))}
                        placeholder="Project title"
                        className="bg-gray-700"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="new-category">Category</Label>
                      <Input
                        id="new-category"
                        value={newItem.category || ''}
                        onChange={(e) => setNewItem(prev => ({...prev, category: e.target.value}))}
                        placeholder="e.g., technology, studio, team"
                        className="bg-gray-700"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="new-description">Description</Label>
                      <Textarea
                        id="new-description"
                        value={newItem.description || ''}
                        onChange={(e) => setNewItem(prev => ({...prev, description: e.target.value}))}
                        placeholder="Project description"
                        className="bg-gray-700"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="new-image">Image URL</Label>
                      <div className="flex gap-2">
                        <Input
                          id="new-image"
                          value={newItem.image || ''}
                          onChange={(e) => setNewItem(prev => ({...prev, image: e.target.value}))}
                          className="bg-gray-700 flex-1"
                          placeholder="Paste Image URL or Select File to Upload"
                          type="url"
                          required
                        />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileSelect}
                          className="hidden"
                          id="new-file-upload"
                        />
                        <Button
                          type="button"
                          onClick={() => document.getElementById('new-file-upload')?.click()}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <FileImage className="w-4 h-4 mr-2" />
                          Select File
                        </Button>
                        <Button
                          type="button"
                          onClick={triggerImageUpload}
                          className="bg-green-600 hover:bg-green-700"
                          disabled={!selectedImageFile || uploadImageMutation.isPending}
                        >
                          {uploadImageMutation.isPending ? 'Uploading...' : 'Upload Image'}
                        </Button>
                      </div>
                      {newItem.image && (
                        <img
                          src={newItem.image}
                          alt="Preview"
                          className="mt-2 w-32 h-24 object-cover rounded"
                          onError={(e) => (e.currentTarget.src = 'https://placehold.co/128x96/333/FFF?text=No+Image')}
                        />
                      )}
                    </div>
                  </div>
                  <Button
                    onClick={addNewPortfolioItem}
                    className="mt-4 bg-orange-600 hover:bg-orange-700"
                    disabled={addPortfolioMutation.isPending}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {addPortfolioMutation.isPending ? 'Adding...' : 'Add Portfolio Item'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Site Content</CardTitle>
                <CardDescription>Edit your site's text content and information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {siteContent && (
                  <>
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Hero Section</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="hero-title">Main Title</Label>
                          <Input
                            id="hero-title"
                            value={siteContent.hero.title}
                            onChange={(e) => setSiteContent(prev => prev ? {
                              ...prev,
                              hero: { ...prev.hero, title: e.target.value }
                            } : null)}
                            className="bg-gray-700"
                          />
                        </div>
                        <div>
                          <Label htmlFor="hero-subtitle">Subtitle</Label>
                          <Input
                            id="hero-subtitle"
                            value={siteContent.hero.subtitle}
                            onChange={(e) => setSiteContent(prev => prev ? {
                              ...prev,
                              hero: { ...prev.hero, subtitle: e.target.value }
                            } : null)}
                            className="bg-gray-700"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="hero-description">Description</Label>
                        <Textarea
                          id="hero-description"
                          value={siteContent.hero.description}
                          onChange={(e) => setSiteContent(prev => prev ? {
                            ...prev,
                            hero: { ...prev.hero, description: e.target.value }
                          } : null)}
                          className="bg-gray-700"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">About Section</h3>
                      <div>
                        <Label htmlFor="about-title">Title</Label>
                        <Input
                          id="about-title"
                          value={siteContent.about.title}
                          onChange={(e) => setSiteContent(prev => prev ? {
                            ...prev,
                            about: { ...prev.about, title: e.target.value }
                          } : null)}
                          className="bg-gray-700"
                        />
                      </div>
                      <div>
                        <Label htmlFor="about-description">Short Description</Label>
                        <Textarea
                          id="about-description"
                          value={siteContent.about.description}
                          onChange={(e) => setSiteContent(prev => prev ? {
                            ...prev,
                            about: { ...prev.about, description: e.target.value }
                          } : null)}
                          className="bg-gray-700"
                        />
                      </div>
                      <div>
                        <Label htmlFor="about-long">Long Description</Label>
                        <Textarea
                          id="about-long"
                          value={siteContent.about.longDescription}
                          onChange={(e) => setSiteContent(prev => prev ? {
                            ...prev,
                            about: { ...prev.about, longDescription: e.target.value }
                          } : null)}
                          className="bg-gray-700"
                          rows={4}
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="projects">Projects Completed</Label>
                          <Input
                            id="projects"
                            type="number"
                            value={siteContent.about.stats.projects}
                            onChange={(e) => setSiteContent(prev => prev ? {
                              ...prev,
                              about: {
                                ...prev.about,
                                stats: { ...prev.about.stats, projects: parseInt(e.target.value) || 0 }
                              }
                            } : null)}
                            className="bg-gray-700"
                          />
                        </div>
                        <div>
                          <Label htmlFor="clients">Happy Clients</Label>
                          <Input
                            id="clients"
                            type="number"
                            value={siteContent.about.stats.clients}
                            onChange={(e) => setSiteContent(prev => prev ? {
                              ...prev,
                              about: {
                                ...prev.about,
                                stats: { ...prev.about.stats, clients: parseInt(e.target.value) || 0 }
                              }
                            } : null)}
                            className="bg-gray-700"
                          />
                        </div>
                        <div>
                          <Label htmlFor="experience">Years Experience</Label>
                          <Input
                            id="experience"
                            type="number"
                            value={siteContent.about.stats.experience}
                            onChange={(e) => setSiteContent(prev => prev ? {
                              ...prev,
                              about: {
                                ...prev.about,
                                stats: { ...prev.about.stats, experience: parseInt(e.target.value) || 0 }
                              }
                            } : null)}
                            className="bg-gray-700"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Contact Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="address">Address</Label>
                          <Input
                            id="address"
                            value={siteContent.contact.address}
                            onChange={(e) => setSiteContent(prev => prev ? {
                              ...prev,
                              contact: { ...prev.contact, address: e.target.value }
                            } : null)}
                            className="bg-gray-700"
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone">Phone</Label>
                          <Input
                            id="phone"
                            value={siteContent.contact.phone}
                            onChange={(e) => setSiteContent(prev => prev ? {
                              ...prev,
                              contact: { ...prev.contact, phone: e.target.value }
                            } : null)}
                            className="bg-gray-700"
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            value={siteContent.contact.email}
                            onChange={(e) => setSiteContent(prev => prev ? {
                              ...prev,
                              contact: { ...prev.contact, email: e.target.value }
                            } : null)}
                            className="bg-gray-700"
                          />
                        </div>
                        <div>
                          <Label htmlFor="hours">Business Hours</Label>
                          <Input
                            id="hours"
                            value={siteContent.contact.hours}
                            onChange={(e) => setSiteContent(prev => prev ? {
                              ...prev,
                              contact: { ...prev.contact, hours: e.target.value }
                            } : null)}
                            className="bg-gray-700"
                          />
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={saveSiteContent}
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save All Changes
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="images" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Image Uploads</CardTitle>
                <CardDescription>Manage images for your site (not directly linked to portfolio items here)</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">
                  This section is for general image uploads. For portfolio items, use the Image URL field in the Portfolio tab.
                  To make images persistent, you'll need a dedicated image hosting solution (e.g., Cloudinary, AWS S3) and a backend endpoint to handle the actual file upload and return a public URL.
                </p>
                {/* You could add a general image upload form here if needed */}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Bookings</CardTitle>
                <CardDescription>View customer booking requests</CardDescription>
              </CardHeader>
              <CardContent>
                <BookingsList />
              </CardContent>
            </Card>
            <MessagesList />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}