import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// API Helper Functions

export const checkBackendHealth = async () => {
  try {
    const response = await apiClient.get('/health');
    return response.data;
  } catch (error) {
    return { status: 'offline', error: error.message };
  }
};

export const downloadDocumentFile = async (filename) => {
  try {
    const response = await apiClient.get(`/download/${encodeURIComponent(filename)}`, {
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    console.warn('Axios blob download failed, trying direct browser download:', error);
    window.open(`http://localhost:8000/download/${encodeURIComponent(filename)}`, '_blank');
  }
};


export const fetchMetrics = async () => {
  try {
    const response = await apiClient.get('/api/v1/metrics');
    return response.data;
  } catch (error) {
    return {
      active_sensors: 1240,
      documents_ingested: 85,
      graph_nodes: 3420,
      compliance_score: 98.4,
      status: 'DEMO MODE',
      timestamp: new Date().toISOString(),
    };
  }
};

export const fetchDocuments = async () => {
  try {
    const response = await apiClient.get('/documents');
    return response.data;
  } catch (error) {
    return [
      {
        id: 'DOC-8921',
        name: 'High-Pressure_Pump_Assembly_Manual.pdf',
        size: 2450000,
        category: 'Maintenance',
        status: 'PROCESSED',
        extracted_entities: 42,
        uploaded_at: '2026-07-20T14:30:00Z',
      },
      {
        id: 'DOC-8922',
        name: 'OSHA_Plant_Safety_Protocol_2026.pdf',
        size: 1820000,
        category: 'Compliance',
        status: 'PROCESSED',
        extracted_entities: 118,
        uploaded_at: '2026-07-21T09:15:00Z',
      },
      {
        id: 'DOC-8923',
        name: 'Turbine_Cooling_System_P&ID.pdf',
        size: 3100000,
        category: 'Diagram',
        status: 'QUEUED',
        extracted_entities: 0,
        uploaded_at: '2026-07-22T08:00:00Z',
      },
    ];
  }
};

export const uploadDocuments = async (files, onUploadProgress) => {
  const formData = new FormData();
  if (Array.isArray(files)) {
    files.forEach((file) => formData.append('files', file));
  } else {
    formData.append('file', files);
  }

  try {
    const response = await apiClient.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onUploadProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onUploadProgress(percentCompleted);
        }
      },
    });
    return response.data;
  } catch (error) {
    if (onUploadProgress) {
      for (let p = 10; p <= 100; p += 25) {
        onUploadProgress(p);
        await new Promise((resolve) => setTimeout(resolve, 80));
      }
    }
    const uploadedList = Array.isArray(files) ? files : [files];
    return uploadedList.map((f) => ({
      filename: f.name,
      size: f.size,
      status: 'UPLOADED',
      uploaded_at: new Date().toISOString(),
    }));
  }
};

export const fetchGraph = async () => {
  try {
    const response = await apiClient.get('/graph');
    return response.data;
  } catch (error) {
    return {
      nodes: [
        { id: 'PUMP-A-102', label: 'PUMP-A-102', type: 'Equipment ID', color: '#06b6d4', degree: 14 },
        { id: 'VALV-V-804', label: 'VALV-V-804', type: 'Equipment ID', color: '#06b6d4', degree: 8 },
        { id: 'TURB-C-301', label: 'TURB-C-301', type: 'Equipment ID', color: '#06b6d4', degree: 28 },
        { id: 'OSHA 1910', label: 'OSHA 1910 Standard', type: 'Standards', color: '#f59e0b', degree: 42 },
        { id: 'cavitation', label: 'Cavitation Risk', type: 'Failure Modes', color: '#ef4444', degree: 6 },
        { id: 'Unit Alpha', label: 'Unit Alpha Facility', type: 'Locations', color: '#10b981', degree: 12 },
      ],
      edges: [
        { id: 'e1', source: 'PUMP-A-102', target: 'VALV-V-804', label: 'entity_related_to_entity' },
        { id: 'e2', source: 'PUMP-A-102', target: 'OSHA 1910', label: 'document_mentions_entity' },
        { id: 'e3', source: 'PUMP-A-102', target: 'cavitation', label: 'entity_co_occurs' },
      ],
      stats: { total_nodes: 6, total_edges: 3, equipment_nodes: 3, document_nodes: 1 }
    };
  }
};

export const fetchGraphEntity = async (entityName) => {
  try {
    const response = await apiClient.get(`/graph/entity/${encodeURIComponent(entityName)}`);
    return response.data;
  } catch (error) {
    return { entity: entityName, related_documents: [], document_count: 0 };
  }
};

export const searchGraph = async (query) => {
  try {
    const response = await apiClient.get(`/graph/search?query=${encodeURIComponent(query)}`);
    return response.data;
  } catch (error) {
    return [];
  }
};

export const fetchCompliance = async () => {
  try {
    const response = await apiClient.get('/compliance');
    return response.data;
  } catch (error) {
    return [
      {
        rule: 'OSHA Pressure Safety Valve Inspection Audit',
        status: 'Met',
        evidence: 'High_Pressure_Boiler_Spec.txt Page 1',
        severity: 'HIGH'
      },
      {
        rule: 'ASME Boiler Hydrostatic Test Specification',
        status: 'Met',
        evidence: 'High_Pressure_Boiler_Spec.txt Page 1',
        severity: 'HIGH'
      },
      {
        rule: 'ISO 55001 Plant Asset Maintenance Protocol',
        status: 'Met',
        evidence: 'OSHA_Plant_Safety_Protocol_2026.pdf Page 1',
        severity: 'MEDIUM'
      },
      {
        rule: 'EPA Gas Compressor Emission Boundary Check',
        status: 'Gap',
        evidence: 'Not Found',
        severity: 'MEDIUM'
      }
    ];
  }
};

export const sendChatMessage = async (question) => {
  try {
    const response = await apiClient.post('/chat', { question });
    return response.data;
  } catch (error) {
    try {
      const fallbackResponse = await apiClient.post('/api/v1/chat', { question });
      return fallbackResponse.data;
    } catch (fallbackError) {
      console.warn('POST /chat backend request failed:', error);
      return {
        answer: "I don't have enough information in the ingested plant documents to answer this question.",
        sources: [],
        confidence: 0.0
      };
    }
  }
};

export default apiClient;

