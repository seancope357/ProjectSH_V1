'use client';

import { useState } from 'react';
import { useAuth } from '@/components/providers/session-provider';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/ui/navigation';

interface SequenceFormData {
  title: string;
  description: string;
  instructions: string;
  category: string;
  tags: string;
  price: string;
  duration: string;
  ledCount: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  previewImage: File | null;
  sequenceFile: File | null;
}

export default function SellerUploadPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState<SequenceFormData>({
    title: '',
    description: '',
    instructions: '',
    category: '',
    tags: '',
    price: '',
    duration: '',
    ledCount: '',
    difficulty: 'beginner',
    previewImage: null,
    sequenceFile: null,
  });

  // Redirect if not authenticated or not a seller
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    router.push('/auth/signin');
    return null;
  }

  // Check if user has seller or admin role
  if (user.user_metadata?.role !== 'SELLER' && user.user_metadata?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600 mb-4">You need to be a seller to access this page.</p>
            <button
              onClick={() => router.push('/')}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Validation
    if (!formData.title || !formData.description || !formData.category || !formData.price) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    if (!formData.sequenceFile) {
      setError('Please upload a sequence file');
      setLoading(false);
      return;
    }

    if (parseFloat(formData.price) <= 0) {
      setError('Price must be greater than 0');
      setLoading(false);
      return;
    }

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('title', formData.title);
      uploadFormData.append('description', formData.description);
      uploadFormData.append('instructions', formData.instructions);
      uploadFormData.append('category', formData.category);
      uploadFormData.append('tags', formData.tags);
      uploadFormData.append('price', formData.price);
      uploadFormData.append('duration', formData.duration);
      uploadFormData.append('ledCount', formData.ledCount);
      uploadFormData.append('difficulty', formData.difficulty);
      uploadFormData.append('sequenceFile', formData.sequenceFile);
      
      if (formData.previewImage) {
        uploadFormData.append('previewImage', formData.previewImage);
      }

      const response = await fetch('/api/sequences/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      if (response.ok) {
        setSuccess('Sequence uploaded successfully!');
        // Reset form
        setFormData({
          title: '',
          description: '',
          instructions: '',
          category: '',
          tags: '',
          price: '',
          duration: '',
          ledCount: '',
          difficulty: 'beginner',
          previewImage: null,
          sequenceFile: null,
        });
        // Reset file inputs
        const fileInputs = document.querySelectorAll('input[type="file"]') as NodeListOf<HTMLInputElement>;
        fileInputs.forEach(input => input.value = '');
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to upload sequence');
      }
    } catch {
      setError('An error occurred while uploading the sequence');
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    'Holiday & Seasonal',
    'Music Sync',
    'Abstract Patterns',
    'Nature & Weather',
    'Gaming & Entertainment',
    'Architectural',
    'Party & Events',
    'Minimalist',
    'Other'
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Upload New Sequence</h1>
            <p className="mt-1 text-sm text-gray-600">
              Share your LED sequence with the community and start earning
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}
            
            {success && (
              <div className="rounded-md bg-green-50 p-4">
                <div className="text-sm text-green-700">{success}</div>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  placeholder="Enter sequence title"
                  value={formData.title}
                  onChange={handleInputChange}
                />
              </div>
              
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  value={formData.category}
                  onChange={handleInputChange}
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                placeholder="Describe your sequence..."
                value={formData.description}
                onChange={handleInputChange}
              />
            </div>
            
            <div>
              <label htmlFor="instructions" className="block text-sm font-medium text-gray-700">
                xLights Import Instructions
              </label>
              <textarea
                id="instructions"
                name="instructions"
                rows={6}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                placeholder="Provide specific instructions for importing this sequence into xLights (e.g., model requirements, special setup steps, prop configurations, etc.)"
                value={formData.instructions}
                onChange={handleInputChange}
              />
              <p className="mt-1 text-xs text-gray-500">
                Help buyers understand any specific requirements or steps needed to use your sequence in xLights
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                  Price (USD) *
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  step="0.01"
                  min="0.01"
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  placeholder="9.99"
                  value={formData.price}
                  onChange={handleInputChange}
                />
              </div>
              
              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
                  Duration (seconds)
                </label>
                <input
                  type="number"
                  id="duration"
                  name="duration"
                  min="1"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  placeholder="60"
                  value={formData.duration}
                  onChange={handleInputChange}
                />
              </div>
              
              <div>
                <label htmlFor="ledCount" className="block text-sm font-medium text-gray-700">
                  LED Count
                </label>
                <input
                  type="number"
                  id="ledCount"
                  name="ledCount"
                  min="1"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  placeholder="100"
                  value={formData.ledCount}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700">
                  Difficulty Level
                </label>
                <select
                  id="difficulty"
                  name="difficulty"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  value={formData.difficulty}
                  onChange={handleInputChange}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
                  Tags
                </label>
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  placeholder="christmas, music, colorful (comma separated)"
                  value={formData.tags}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="previewImage" className="block text-sm font-medium text-gray-700">
                  Preview Image
                </label>
                <input
                  type="file"
                  id="previewImage"
                  name="previewImage"
                  accept="image/*"
                  className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  onChange={handleFileChange}
                />
                <p className="mt-1 text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
              </div>
              
              <div>
                <label htmlFor="sequenceFile" className="block text-sm font-medium text-gray-700">
                  Sequence File *
                </label>
                <input
                  type="file"
                  id="sequenceFile"
                  name="sequenceFile"
                  accept=".seq,.json,.xml,.txt"
                  required
                  className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  onChange={handleFileChange}
                />
                <p className="mt-1 text-xs text-gray-500">Supported formats: .seq, .json, .xml, .txt</p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.push('/seller/dashboard')}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Uploading...' : 'Upload Sequence'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}