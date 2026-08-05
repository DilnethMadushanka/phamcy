import React, { useState, useCallback, useRef } from 'react';
import { api } from '../../services/api';
import { Upload, FileCheck2, AlertCircle, MapPin, Camera, X, Image as ImageIcon, ShieldCheck, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';

const PrescriptionUpload = () => {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [notes, setNotes] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    addFiles(selectedFiles);
  };

  const addFiles = (newFiles) => {
    const validFiles = newFiles.filter(file => file.type.startsWith('image/'));
    
    if (validFiles.length !== newFiles.length) {
      toast.error('Only image files are allowed.');
    }
    
    if (files.length + validFiles.length > 5) {
      toast.error('You can only upload a maximum of 5 images.');
      return;
    }

    const newFilesWithPreview = validFiles.map(file => Object.assign(file, {
      preview: URL.createObjectURL(file)
    }));

    setFiles(prev => [...prev, ...newFilesWithPreview]);
  };

  const removeFile = (index) => {
    setFiles(prev => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].preview);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const onDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  }, [files]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (files.length === 0) {
      toast.error('Please select at least one prescription image to upload.');
      return;
    }
    if (!deliveryAddress) {
      toast.error('Please provide a delivery address.');
      return;
    }

    setLoading(true);
    
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('prescriptions', file);
      });

      const uploadRes = await api.uploadPrescriptions(formData);
      const imageUrls = uploadRes.urls;

      const orderData = {
        items: [],
        prescription_image_url: imageUrls,
        delivery_address: deliveryAddress,
        notes: notes,
        payment_method: 'Cash on Delivery'
      };

      await api.createOrder(orderData);
      toast.success('Prescription submitted successfully! A pharmacist will verify it.');
      
      files.forEach(file => URL.revokeObjectURL(file.preview));
      setFiles([]);
      setDeliveryAddress('');
      setNotes('');
      
      setTimeout(() => {
        navigate('/my-orders');
      }, 1500);

    } catch (error) {
      console.error('Error submitting prescription:', error);
      toast.error(error?.message || 'Failed to upload prescription. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 font-sans px-2 sm:px-4">
      <Toaster position="bottom-right" toastOptions={{ style: { borderRadius: '12px', fontWeight: 600 } }} />

      {/* Hero Telemedicine Header */}
      <section className="bg-[#FAF8F5] rounded-3xl p-6 sm:p-10 border border-cream-200 shadow-xs relative overflow-hidden">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-full text-xs font-bold text-tealAccent-700 border border-cream-200 shadow-xs">
            <ShieldCheck className="w-4 h-4 text-tealAccent-600" />
            24/7 Digital Prescription Verification
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 tracking-tight leading-tight">
            Upload Doctor Prescription
          </h1>
          <p className="text-charcoal-500 text-xs sm:text-sm font-normal leading-relaxed">
            Snap a clear picture of your doctor's prescription. Our licensed pharmacists will verify your medication and dispatch your order to your campus location.
          </p>
        </div>
      </section>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Dropzone Container */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-200 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-charcoal-900 flex items-center gap-2">
            <Camera className="w-5 h-5 text-tealAccent-600" />
            Prescription Photos / Document
          </h2>

          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center ${
              isDragging
                ? 'border-tealAccent-600 bg-tealAccent-50/50 scale-[0.99]'
                : 'border-cream-300 hover:border-tealAccent-500 bg-[#FAF8F5]/60 hover:bg-cream-50'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              multiple
              accept="image/*"
              className="hidden"
            />

            <div className="w-14 h-14 rounded-2xl bg-white text-tealAccent-600 flex items-center justify-center shadow-xs mb-3 border border-cream-200">
              <Upload className="w-7 h-7" />
            </div>

            <h3 className="font-bold text-charcoal-900 text-sm mb-1">
              Drag &amp; drop prescription image here, or <span className="text-tealAccent-600 underline">browse</span>
            </h3>
            <p className="text-xs text-charcoal-400 font-medium max-w-sm">
              Supports JPEG, PNG, WEBP. Maximum 5 photos per order.
            </p>
          </div>

          {/* Uploaded Previews */}
          {files.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
              {files.map((file, index) => (
                <div key={index} className="relative rounded-2xl overflow-hidden border border-cream-200 bg-cream-50 group">
                  <img
                    src={file.preview}
                    alt={`Prescription ${index + 1}`}
                    className="w-full h-32 object-cover"
                  />
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                    className="absolute top-2 right-2 bg-charcoal-900/80 hover:bg-rose-600 text-white rounded-full p-1 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  <span className="absolute bottom-2 left-2 bg-white/90 text-charcoal-900 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                    Image #{index + 1}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Delivery Details */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-200 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-charcoal-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-tealAccent-600" />
            Delivery Destination &amp; Pharmacist Notes
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1.5">
                Delivery Address *
              </label>
              <textarea
                required
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="Enter room number, building name, or campus landmark..."
                className="w-full p-3.5 bg-cream-50/70 border border-cream-200 rounded-2xl text-xs text-charcoal-900 font-medium focus:ring-2 focus:ring-tealAccent-500/30 focus:border-tealAccent-500 transition-all min-h-[80px]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1.5">
                Additional Notes / Dosage Preferences (Optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Please send generic substitute if brand is out of stock"
                className="w-full p-3 bg-cream-50/70 border border-cream-200 rounded-xl text-xs text-charcoal-900 font-medium focus:ring-2 focus:ring-tealAccent-500/30 focus:border-tealAccent-500 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={loading || files.length === 0 || !deliveryAddress}
          className="w-full py-4 bg-tealAccent-600 hover:bg-tealAccent-700 text-white font-bold rounded-full text-xs sm:text-sm shadow-md shadow-tealAccent-600/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <FileCheck2 className="w-5 h-5" />
              <span>Submit Prescription for Pharmacist Verification</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default PrescriptionUpload;
