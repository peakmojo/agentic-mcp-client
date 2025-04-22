'use client';

import { useEffect, useState } from 'react';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';
import './swagger.css';

export default function ApiDocs() {
  const [spec, setSpec] = useState(null);

  useEffect(() => {
    const fetchSpec = async () => {
      const response = await fetch('/api/swagger');
      const data = await response.json();
      setSpec(data);
    };
    fetchSpec();
  }, []);

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">API Documentation</h1>
      <div className="swagger-container">
        {spec ? (
          <SwaggerUI spec={spec} docExpansion="list" />
        ) : (
          <p>Loading API documentation...</p>
        )}
      </div>
    </div>
  );
} 