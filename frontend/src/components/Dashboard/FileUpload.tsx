import { useState, useCallback, useRef } from 'react';
import { useAuthStore } from '../../stores/useAuthStore';

interface UploadState {
  status: 'idle' | 'requesting' | 'uploading' | 'success' | 'error';
  progress: number;
  error: string | null;
  uploadedFile: UploadedFile | null;
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  url: string;
  uploadedAt: Date;
}

interface PresignedUrlResponse {
  uploadUrl: string;
  fileId: string;
  publicUrl: string;
}

/**
 * 🔥 BURNER FILE UPLOAD COMPONENT
 * 
 * Two-Step Upload Process:
 * 1. Request presigned URL from API
 * 2. Upload directly to Cloudflare R2
 */
export const FileUpload = () => {
  const [uploadState, setUploadState] = useState<UploadState>({
    status: 'idle',
    progress: 0,
    error: null,
    uploadedFile: null,
  });
  
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const token = useAuthStore(state => state.token);

  /**
   * Step 1: Request presigned URL from your API
   */
  const requestPresignedUrl = async (fileName: string, fileType: string): Promise<PresignedUrlResponse> => {
    const response = await fetch('/api/upload/request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        fileName,
        fileType,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get upload URL');
    }

    return response.json();
  };
  /**
   * Step 2: Upload directly to Cloudflare R2
   */
  const uploadToR2 = async (file: File, uploadUrl: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadState(prev => ({ ...prev, progress }));
        }
      });

      // Handle completion
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });

      // Handle errors
      xhr.addEventListener('error', () => reject(new Error('Upload failed')));
      xhr.addEventListener('abort', () => reject(new Error('Upload cancelled')));

      // Send the file
      xhr.open('PUT', uploadUrl);
      xhr.setRequestHeader('Content-Type', file.type);
      xhr.send(file);
    });
  };

  /**
   * Main upload handler - orchestrates the two-step process
   */
  const handleFileUpload = useCallback(async (file: File) => {
    if (!file) return;

    try {
      // Reset state
      setUploadState({
        status: 'requesting',
        progress: 0,
        error: null,
        uploadedFile: null,
      });

      // STEP 1: Request presigned URL
      const { uploadUrl, fileId, publicUrl } = await requestPresignedUrl(
        file.name,
        file.type
      );

      // STEP 2: Upload to R2
      setUploadState(prev => ({ ...prev, status: 'uploading' }));
      await uploadToR2(file, uploadUrl);
// --- NEW STEP 3: Tell Backend to start processing ---
      // This creates the DB row and kicks off the Celery Worker
      const projectResponse = await fetch('/api/v1/projects/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          r2_key: fileId, // The key you got from Step 1
          original_filename: file.name
        })
      });

      if (!projectResponse.ok) throw new Error("Failed to create project");
      const projectData = await projectResponse.json();
      // Success!
      setUploadState({
        status: 'success',
        progress: 100,
        error: null,
        uploadedFile: {
          id: fileId,
          name: file.name,
          size: file.size,
          url: publicUrl,
          uploadedAt: new Date(),
        },
      });

      // Reset after 3 seconds
      setTimeout(() => {
        setUploadState(prev => ({ ...prev, status: 'idle', progress: 0 }));
      }, 3000);

    } catch (error) {
      setUploadState({
        status: 'error',
        progress: 0,
        error: error instanceof Error ? error.message : 'Upload failed',
        uploadedFile: null,
      });
    }
  }, [token]);

  /**
   * File input change handler
   */
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  /**
   * Drag and drop handlers
   */
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  }, [handleFileUpload]);

  /**
   * Open file picker
   */
  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  /**
   * Format file size
   */
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  /**
   * Get status message
   */
  const getStatusMessage = () => {
    switch (uploadState.status) {
      case 'requesting':
        return 'Requesting upload permission...';
      case 'uploading':
        return `Uploading... ${uploadState.progress}%`;
      case 'success':
        return '🔥 Upload complete!';
      case 'error':
        return uploadState.error || 'Upload failed';
      default:
        return 'Drop your file here or click to browse';
    }
  };

  const isUploading = uploadState.status === 'requesting' || uploadState.status === 'uploading';

  return (
    <div className="w-full max-w-3xl">
      {/* Main Upload Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFilePicker}
        className={`
          relative overflow-hidden
          border-2 border-dashed rounded-3xl
          transition-all duration-300 ease-out
          cursor-pointer group
          ${dragActive 
            ? 'border-[var(--flame-orange)] bg-[var(--flame-orange)]/10 scale-[1.02]' 
            : 'border-[var(--text-tertiary)] hover:border-[var(--flame-orange)]/50 bg-[var(--bg-secondary)]'
          }
          ${isUploading ? 'pointer-events-none' : ''}
        `}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, var(--flame-orange) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }} />
        </div>

        {/* Content */}
        <div className="relative p-12 text-center">
          {/* Icon */}
          <div className={`
            mx-auto w-24 h-24 mb-6 rounded-2xl
            flex items-center justify-center
            transition-all duration-300
            ${uploadState.status === 'success' 
              ? 'bg-[var(--success-green)]/20' 
              : uploadState.status === 'error'
              ? 'bg-[var(--flame-red)]/20'
              : 'bg-[var(--flame-orange)]/10 group-hover:bg-[var(--flame-orange)]/20'
            }
          `}>
            {uploadState.status === 'success' ? (
              <svg className="w-12 h-12 text-[var(--success-green)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : uploadState.status === 'error' ? (
              <svg className="w-12 h-12 text-[var(--flame-red)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : isUploading ? (
              <svg className="w-12 h-12 text-[var(--flame-orange)] animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <svg className="w-12 h-12 text-[var(--flame-orange)] transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            )}
          </div>

          {/* Status Text */}
          <p className={`
            text-xl font-semibold mb-2 transition-colors
            font-['Outfit']
            ${uploadState.status === 'success' 
              ? 'text-[var(--success-green)]' 
              : uploadState.status === 'error'
              ? 'text-[var(--flame-red)]'
              : 'text-[var(--text-primary)]'
            }
          `}>
            {getStatusMessage()}
          </p>

          {/* Helper Text */}
          {uploadState.status === 'idle' && (
            <p className="text-sm text-[var(--text-tertiary)] font-['Outfit']">
              Supports: Video, Images, Documents • Max size: 100MB
            </p>
          )}

          {/* Progress Bar */}
          {isUploading && (
            <div className="mt-6 w-full max-w-md mx-auto">
              <div className="h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[var(--flame-orange)] to-[var(--flame-red)] transition-all duration-300 ease-out"
                  style={{ width: `${uploadState.progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Uploaded File Info */}
          {uploadState.uploadedFile && uploadState.status === 'success' && (
            <div className="mt-6 p-4 bg-[var(--success-green)]/10 border border-[var(--success-green)]/30 rounded-xl max-w-md mx-auto">
              <p className="text-sm font-mono text-[var(--text-secondary)] truncate">
                {uploadState.uploadedFile.name}
              </p>
              <p className="text-xs text-[var(--text-tertiary)] mt-1">
                {formatFileSize(uploadState.uploadedFile.size)}
              </p>
            </div>
          )}
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          className="hidden"
          accept="video/*,image/*,.pdf,.doc,.docx"
        />
      </div>

      {/* Two-Step Process Indicator */}
      <div className="mt-8 grid grid-cols-2 gap-4">
        <div className={`
          p-4 rounded-xl border transition-all duration-300
          ${uploadState.status === 'requesting' || uploadState.status === 'uploading' || uploadState.status === 'success'
            ? 'border-[var(--flame-orange)] bg-[var(--flame-orange)]/10'
            : 'border-[var(--text-tertiary)]/30 bg-[var(--bg-tertiary)]'
          }
        `}>
          <div className="flex items-center gap-3">
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center
              font-bold font-mono text-sm
              ${uploadState.status === 'requesting' || uploadState.status === 'uploading' || uploadState.status === 'success'
                ? 'bg-[var(--flame-orange)] text-[var(--bg-primary)]'
                : 'bg-[var(--text-tertiary)]/20 text-[var(--text-tertiary)]'
              }
            `}>
              1
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--text-primary)] font-['Outfit']">
                Request Permission
              </p>
              <p className="text-xs text-[var(--text-tertiary)] font-['Outfit']">
                Get presigned URL from API
              </p>
            </div>
          </div>
        </div>

        <div className={`
          p-4 rounded-xl border transition-all duration-300
          ${uploadState.status === 'uploading' || uploadState.status === 'success'
            ? 'border-[var(--flame-orange)] bg-[var(--flame-orange)]/10'
            : 'border-[var(--text-tertiary)]/30 bg-[var(--bg-tertiary)]'
          }
        `}>
          <div className="flex items-center gap-3">
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center
              font-bold font-mono text-sm
              ${uploadState.status === 'uploading' || uploadState.status === 'success'
                ? 'bg-[var(--flame-orange)] text-[var(--bg-primary)]'
                : 'bg-[var(--text-tertiary)]/20 text-[var(--text-tertiary)]'
              }
            `}>
              2
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--text-primary)] font-['Outfit']">
                Direct Upload
              </p>
              <p className="text-xs text-[var(--text-tertiary)] font-['Outfit']">
                Send to Cloudflare R2
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
