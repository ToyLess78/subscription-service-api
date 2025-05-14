import { FastifyPluginAsync } from 'fastify';
import fastifyEnv from '@fastify/env';
import fastifyPlugin from 'fastify-plugin';

// Define the schema for environment variables
const schema = {
  type: 'object',
  required: ['PORT', 'HOST'],
  properties: {
    PORT: {
      type: 'string',
      default: '3000'
    },
    HOST: {
      type: 'string',
      default: 'localhost'
    },
    NODE_ENV: {
      type: 'string',
      default: 'development'
    },
    API_VERSION: {
      type: 'string',
      default: 'v1'
    }
  }
};

// Define the options for the plugin
const options = {
  confKey: 'config', // This is the key under which the config will be stored in the fastify instance
  schema: schema,
  dotenv: true, // Load ..env file
  data: process.env // Use process..env as data source
};

// Create a plugin to load and validate environment variables
const configPlugin: FastifyPluginAsync = async (fastify) => {
  await fastify.register(fastifyEnv, options);
};

export default fastifyPlugin(configPlugin);

// Type declaration for the fastify instance with config
declare module 'fastify' {
  interface FastifyInstance {
    config: {
      PORT: string;
      HOST: string;
      NODE_ENV: string;
      API_VERSION: string;
    }
  }
}
