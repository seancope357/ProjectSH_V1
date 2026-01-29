'use client';

import React, { useState } from 'react';

const SequenceUploadForm = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(0);
  const [mainFile, setMainFile] = useState<File | null>(null);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [propsUsed, setPropsUsed] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log({
      title,
      description,
      price,
      mainFile,
      previewFile,
      thumbnailFile,
      propsUsed,
    });
    // Reset form fields
    setTitle('');
    setDescription('');
    setPrice(0);
    setMainFile(null);
    setPreviewFile(null);
    setThumbnailFile(null);
    setPropsUsed('');
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Upload New Sequence</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            required
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          ></textarea>
        </div>
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price</label>
          <input
            type="number"
            id="price"
            value={price}
            onChange={(e) => setPrice(parseFloat(e.target.value))}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            required
            min="0"
            step="0.01"
          />
        </div>
        <div>
          <label htmlFor="mainFile" className="block text-sm font-medium text-gray-700">Main File (e.g., .zip, .rar)</label>
          <input
            type="file"
            id="mainFile"
            onChange={(e) => setMainFile(e.target.files ? e.target.files[0] : null)}
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            required
          />
        </div>
        <div>
          <label htmlFor="previewFile" className="block text-sm font-medium text-gray-700">Preview File (Optional, e.g., .mp4, .gif)</label>
          <input
            type="file"
            id="previewFile"
            onChange={(e) => setPreviewFile(e.target.files ? e.target.files[0] : null)}
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>
        <div>
          <label htmlFor="thumbnailFile" className="block text-sm font-medium text-gray-700">Thumbnail Image (Optional, e.g., .jpg, .png)</label>
          <input
            type="file"
            id="thumbnailFile"
            onChange={(e) => setThumbnailFile(e.target.files ? e.target.files[0] : null)}
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>
        <div>
          <label htmlFor="propsUsed" className="block text-sm font-medium text-gray-700">Props Used (Comma-separated)</label>
          <input
            type="text"
            id="propsUsed"
            value={propsUsed}
            onChange={(e) => setPropsUsed(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            placeholder="e.g., prop1, prop2, prop3"
          />
        </div>
        <button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Upload Sequence
        </button>
      </form>
    </div>
  );
};

export default SequenceUploadForm;