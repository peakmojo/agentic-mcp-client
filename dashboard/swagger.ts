import { createSwaggerSpec } from 'next-swagger-doc';

export const getApiDocs = () => {
  const spec = createSwaggerSpec({
    apiFolder: 'app/api',
    schemaFolders: ['app/api'],
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'MCP API Documentation',
        version: '1.0.0',
        description: 'API documentation for the MCP client dashboard',
      },
      servers: [
        {
          url: '/api',
        },
      ],
      tags: [
        {
          name: 'Configurations',
          description: 'API endpoints for configuration files'
        },
        {
          name: 'Jobs',
          description: 'API endpoints for managing agent worker jobs'
        },
        {
          name: 'Sessions',
          description: 'API endpoints for accessing agent worker sessions'
        }
      ]
    },
  });
  return spec;
}; 