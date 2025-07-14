import React, { useState, useRef } from 'react';
import { UploadOutlined, FileTextOutlined } from '@ant-design/icons';
import { Button, message, Progress, Modal, Table, Tag, Alert } from 'antd';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useDarkMode } from '../App';

interface CSVRow {
  name: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  'Age Group?': string;
  'Are you self-employed, working for a company, or a student?': string;
  'Briefly describe what you do or are passionate about?': string;
  'City & Province?': string;
  'Did you follow us on Instagram? https://shorturl.at/eFvMX': string;
  'Did you like our Facebook page? https://shorturl.at/KmR5d': string;
  'How did you hear about BroCode Canada?': string;
  'Industry / Field of Work?': string;
  'Nearest Intersection? (eg. Hurontario St & Eglinton Ave)': string;
  'Occupation / Job Title?': string;
  'What do you hope to gain from joining Bro Code Canada? (Select all that apply) ': string;
  created_at: string;
}

interface ImportResult {
  success: number;
  failed: number;
  duplicates: number;
  errors: string[];
}

const CSVImport: React.FC = () => {
  const [fileList, setFileList] = useState<Array<{ name: string; size: number }>>([]);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [previewData, setPreviewData] = useState<CSVRow[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isDarkMode } = useDarkMode();

  const parseCSV = (csvText: string): CSVRow[] => {
    const lines = csvText.split('\n');
    if (lines.length < 2) {
      throw new Error('CSV file must have at least a header row and one data row');
    }

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const data: CSVRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Handle commas within quoted fields
      const values: string[] = [];
      let current = '';
      let inQuotes = false;
      
      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim());

      if (values.length === headers.length) {
        const row: Record<string, string> = {};
        headers.forEach((header, index) => {
          row[header] = values[index]?.replace(/"/g, '') || '';
        });
        data.push(row as unknown as CSVRow);
      }
    }

    return data;
  };

  const validateData = (data: CSVRow[]): { valid: CSVRow[], errors: string[] } => {
    const valid: CSVRow[] = [];
    const errors: string[] = [];

    data.forEach((row, index) => {
      const rowNumber = index + 2; // +2 because of 0-based index and header row
      
      if (!row.name || !row.email) {
        errors.push(`Row ${rowNumber}: Missing required fields (name or email)`);
        return;
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(row.email)) {
        errors.push(`Row ${rowNumber}: Invalid email format (${row.email})`);
        return;
      }

      // Add created_at if not present
      if (!row.created_at) {
        row.created_at = new Date().toISOString();
      }

      valid.push(row);
    });

    return { valid, errors };
  };

  const checkDuplicates = async (data: CSVRow[]): Promise<{ unique: CSVRow[], duplicates: number }> => {
    const emails = data.map(row => row.email.toLowerCase());
    const uniqueEmails = [...new Set(emails)];
    
    if (uniqueEmails.length === emails.length) {
      return { unique: data, duplicates: 0 };
    }

    // Check against existing data in Firebase
    const existingEmails = new Set<string>();
    const snapshot = await getDocs(collection(db, 'members'));
    snapshot.forEach(doc => {
      const memberData = doc.data();
      if (memberData.email) {
        existingEmails.add(memberData.email.toLowerCase());
      }
    });

    const unique: CSVRow[] = [];
    const seenEmails = new Set<string>();
    let duplicates = 0;

    data.forEach(row => {
      const email = row.email.toLowerCase();
      if (existingEmails.has(email) || seenEmails.has(email)) {
        duplicates++;
      } else {
        seenEmails.add(email);
        unique.push(row);
      }
    });

    return { unique, duplicates };
  };

  const handleFileUpload = async (file: File) => {
    try {
      const text = await file.text();
      const data = parseCSV(text);
      
      if (data.length === 0) {
        message.error('No valid data found in CSV file');
        return;
      }

      setPreviewData(data.slice(0, 5)); // Show first 5 rows for preview
      setShowPreview(true);
    } catch (error) {
      message.error(`Error parsing CSV: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleImport = async () => {
    if (previewData.length === 0) {
      message.error('No data to import');
      return;
    }

    setImporting(true);
    setProgress(0);
    setShowPreview(false);

    try {
      // Validate all data
      const { valid, errors } = validateData(previewData);
      
      if (errors.length > 0) {
        setImportResult({
          success: 0,
          failed: valid.length,
          duplicates: 0,
          errors
        });
        setShowResults(true);
        setImporting(false);
        return;
      }

      // Check for duplicates
      const { unique, duplicates } = await checkDuplicates(valid);
      
      if (unique.length === 0) {
        setImportResult({
          success: 0,
          failed: 0,
          duplicates: valid.length,
          errors: ['All records are duplicates']
        });
        setShowResults(true);
        setImporting(false);
        return;
      }

      // Import to Firebase
      let success = 0;
      const importErrors: string[] = [];

      for (let i = 0; i < unique.length; i++) {
        try {
          await addDoc(collection(db, 'members'), {
            ...unique[i],
            created_at: unique[i].created_at || new Date().toISOString()
          });
          success++;
        } catch (error) {
          importErrors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Import failed'}`);
        }

        setProgress(((i + 1) / unique.length) * 100);
      }

      const result: ImportResult = {
        success,
        failed: unique.length - success,
        duplicates,
        errors: [...errors, ...importErrors]
      };

      setImportResult(result);
      setShowResults(true);

      if (success > 0) {
        message.success(`Successfully imported ${success} members`);
      }

    } catch (error) {
      message.error(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setImporting(false);
      setFileList([]);
    }
  };

  const previewColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <span style={{ color: isDarkMode ? '#e2e8f0' : '#1f2937' }}>{text}</span>
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (text: string) => <span style={{ color: isDarkMode ? '#e2e8f0' : '#1f2937' }}>{text}</span>
    },
    {
      title: 'Phone',
      dataIndex: 'phone_number',
      key: 'phone_number',
      render: (text: string) => <span style={{ color: isDarkMode ? '#e2e8f0' : '#1f2937' }}>{text || '-'}</span>
    },
    {
      title: 'City',
      dataIndex: 'City & Province?',
      key: 'city',
      render: (text: string) => <span style={{ color: isDarkMode ? '#e2e8f0' : '#1f2937' }}>{text || '-'}</span>
    },
    {
      title: 'Occupation',
      dataIndex: 'Occupation / Job Title?',
      key: 'occupation',
      render: (text: string) => <span style={{ color: isDarkMode ? '#e2e8f0' : '#1f2937' }}>{text || '-'}</span>
    }
  ];



  return (
    <div>
      <h3 style={{
        color: isDarkMode ? '#f8fafc' : '#dc2626',
        fontSize: '1.2rem',
        fontWeight: '600',
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        <FileTextOutlined />
        Import Members from CSV
      </h3>

      <Alert
        message="CSV Format Requirements"
        description={
          <div>
            <p>Your CSV file should include these columns:</p>
            <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
              <li><strong>name</strong> - Full name (required)</li>
              <li><strong>first_name</strong> - First name</li>
              <li><strong>last_name</strong> - Last name</li>
              <li><strong>email</strong> - Email address (required)</li>
              <li><strong>phone_number</strong> - Phone number</li>
              <li><strong>Age Group?</strong> - Age group</li>
              <li><strong>Are you self-employed, working for a company, or a student?</strong> - Employment status</li>
              <li><strong>Briefly describe what you do or are passionate about?</strong> - Description</li>
              <li><strong>City & Province?</strong> - Location</li>
              <li><strong>Did you follow us on Instagram?</strong> - Instagram follow status</li>
              <li><strong>Did you like our Facebook page?</strong> - Facebook like status</li>
              <li><strong>How did you hear about BroCode Canada?</strong> - Source</li>
              <li><strong>Industry / Field of Work?</strong> - Industry</li>
              <li><strong>Nearest Intersection?</strong> - Intersection</li>
              <li><strong>Occupation / Job Title?</strong> - Job title</li>
              <li><strong>What do you hope to gain from joining Bro Code Canada?</strong> - Goals</li>
            </ul>
          </div>
        }
        type="info"
        showIcon
        style={{ marginBottom: '1rem' }}
      />

      <div style={{ marginBottom: '1rem' }}>
        <input
          type="file"
          accept=".csv"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              handleFileUpload(file);
              setFileList([{ name: file.name, size: file.size }]);
            }
          }}
          style={{ display: 'none' }}
          ref={fileInputRef}
        />
        
        <Button
          type="primary"
          icon={<UploadOutlined />}
          onClick={() => fileInputRef.current?.click()}
          disabled={importing}
          style={{
            background: isDarkMode ? '#8b5cf6' : '#dc2626',
            borderColor: isDarkMode ? '#8b5cf6' : '#dc2626',
            marginRight: '0.5rem'
          }}
        >
          Choose CSV File
        </Button>

        <Button
          icon={<FileTextOutlined />}
          onClick={() => {
            const link = document.createElement('a');
            link.href = '/sample_members.csv';
            link.download = 'sample_members.csv';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }}
          style={{
            marginRight: '0.5rem',
            borderColor: isDarkMode ? '#8b5cf6' : '#dc2626',
            color: isDarkMode ? '#8b5cf6' : '#dc2626'
          }}
        >
          Download Template
        </Button>

        {fileList.length > 0 && (
          <span style={{ color: isDarkMode ? '#e2e8f0' : '#374151' }}>
            Selected: {fileList[0].name}
          </span>
        )}
      </div>

      {importing && (
        <div style={{ marginBottom: '1rem' }}>
          <Progress
            percent={Math.round(progress)}
            status="active"
            strokeColor={isDarkMode ? '#8b5cf6' : '#dc2626'}
          />
          <p style={{ color: isDarkMode ? '#e2e8f0' : '#374151', marginTop: '0.5rem' }}>
            Importing members... {Math.round(progress)}%
          </p>
        </div>
      )}

      {/* Preview Modal */}
      <Modal
        title="Preview CSV Data"
        open={showPreview}
        onCancel={() => setShowPreview(false)}
        footer={[
          <Button key="cancel" onClick={() => setShowPreview(false)}>
            Cancel
          </Button>,
          <Button
            key="import"
            type="primary"
            onClick={handleImport}
            style={{
              background: isDarkMode ? '#8b5cf6' : '#dc2626',
              borderColor: isDarkMode ? '#8b5cf6' : '#dc2626'
            }}
          >
            Import {previewData.length} Members
          </Button>
        ]}
        width={800}
      >
        <p style={{ marginBottom: '1rem', color: isDarkMode ? '#e2e8f0' : '#374151' }}>
          Preview of first 5 rows from your CSV file:
        </p>
        <Table
          dataSource={previewData}
          columns={previewColumns}
          pagination={false}
          size="small"
          scroll={{ x: 600 }}
        />
      </Modal>

      {/* Results Modal */}
      <Modal
        title="Import Results"
        open={showResults}
        onCancel={() => setShowResults(false)}
        footer={[
          <Button key="close" onClick={() => setShowResults(false)}>
            Close
          </Button>
        ]}
        width={600}
      >
        {importResult && (
          <div>
            <div style={{ marginBottom: '1rem' }}>
              <Tag color="green" style={{ marginRight: '0.5rem' }}>
                Success: {importResult.success}
              </Tag>
              <Tag color="red" style={{ marginRight: '0.5rem' }}>
                Failed: {importResult.failed}
              </Tag>
              <Tag color="orange">
                Duplicates: {importResult.duplicates}
              </Tag>
            </div>

            {importResult.errors.length > 0 && (
              <div>
                <h4 style={{ color: isDarkMode ? '#f8fafc' : '#1f2937', marginBottom: '0.5rem' }}>
                  Errors:
                </h4>
                <div style={{
                  maxHeight: '200px',
                  overflowY: 'auto',
                  background: isDarkMode ? '#2d2d44' : '#f9fafb',
                  padding: '0.5rem',
                  borderRadius: '6px'
                }}>
                  {importResult.errors.map((error, index) => (
                    <div key={index} style={{
                      color: '#dc2626',
                      fontSize: '0.9rem',
                      marginBottom: '0.25rem'
                    }}>
                      {error}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CSVImport; 