declare module 'swagger-ui-react' {
  import { ComponentType, ReactElement } from 'react';

  interface SwaggerUIProps {
    spec?: object;
    url?: string;
    layout?: string;
    docExpansion?: 'list' | 'full' | 'none';
    defaultModelsExpandDepth?: number;
    defaultModelExpandDepth?: number;
    supportedSubmitMethods?: Array<string>;
    requestInterceptor?: (req: any) => any;
    responseInterceptor?: (res: any) => any;
    onComplete?: (system: any) => void;
    presets?: Array<any>;
    plugins?: Array<any>;
  }

  const SwaggerUI: ComponentType<SwaggerUIProps>;
  export default SwaggerUI;
} 