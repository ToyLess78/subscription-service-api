import { FastifyPluginAsync } from 'fastify';

const routes: FastifyPluginAsync = async (fastify) => {
  // Health check route
  fastify.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  // API version route
  fastify.get('/', async () => {
    return { 
      name: 'weather-subscription-api',
      version: fastify.config.API_VERSION,
      environment: fastify.config.NODE_ENV
    };
  });

  // Add more routes here
};

export default routes;