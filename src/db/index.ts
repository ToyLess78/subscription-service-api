import { FastifyPluginAsync } from 'fastify';
import fastifyPlugin from 'fastify-plugin';

// This is a placeholder for your database connection
// You would replace this with your actual database setup
const dbPlugin: FastifyPluginAsync = async (fastify) => {
  // Initialize your database connection here
  const db = {
    // Example methods
    connect: async () => {
      fastify.log.info('Database connected');
    },
    disconnect: async () => {
      fastify.log.info('Database disconnected');
    }
  };

  // Make the db client available through the fastify instance
  fastify.decorate('db', db);

  // Close the connection when the fastify instance is closed
  fastify.addHook('onClose', async (instance) => {
    await instance.db.disconnect();
  });
};

export default fastifyPlugin(dbPlugin);

// Type declaration for the fastify instance with db
declare module 'fastify' {
  interface FastifyInstance {
    db: {
      connect: () => Promise<void>;
      disconnect: () => Promise<void>;
    }
  }
}