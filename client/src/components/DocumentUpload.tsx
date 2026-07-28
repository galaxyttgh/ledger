import { useState } from 'react';
import api from '../api/axios';

interface DocumentUploadProps {
  transactionType: string;
  transactionId: number;
}

interface Doc {
  id: number;
  filename: string;
  original_name: string;
  created_at: string;
}

const DocumentUpload = ({ transactionType, transactionId }: DocumentUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [documents, setDocuments] = useState<Doc[]>([]);
  const [showUpload, setShowUpload] = useState(false);
  const [message, setMessage] = useState('');

  const fetchDocuments = async () => {
    try {
      const response = await api.get(`/documents/${transactionType}/${transactionId}`);
      setDocuments(response.data);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('transaction_type', transactionType);
    formData.append('transaction_id', transactionId.toString());

    try {
      await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMessage('File uploaded successfully');
      fetchDocuments();
    } catch (error) {
      setMessage('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mt-4">
      <button
        onClick={() => {
          setShowUpload(!showUpload);
          if (!showUpload) fetchDocuments();
        }}
        className="text-sm text-blue-600 hover:text-blue-800"
      >
        📎 {showUpload ? 'Hide' : 'View'} Attachments
      </button>

      {showUpload && (
        <div className="mt-2 p-4 bg-gray-50 rounded-lg">
          <label className="block mb-2">
            <input
              type="file"
              onChange={handleUpload}
              disabled={uploading}
           accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx,.csv,.tiff"
              className="text-sm"
            />
          </label>
          
          {uploading && <p className="text-sm text-gray-500">Uploading...</p>}
          {message && <p className={`text-sm ${message.includes('failed') ? 'text-red-600' : 'text-green-600'}`}>{message}</p>}

          {documents.length > 0 && (
            <ul className="mt-3 space-y-1">
              {documents.map((doc) => (
                <li key={doc.id} className="text-sm text-gray-600">
                  📄 {doc.original_name}
                  <span className="text-xs text-gray-400 ml-2">
                    {new Date(doc.created_at).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default DocumentUpload;