import type { FastifyPluginAsync } from "fastify"
import fastifyEnv from "@fastify/env"
import fastifyPlugin from "fastify-plugin"

// Define the schema for environment variables
const schema = {
  type: "object",
  required: ["PORT", "HOST", "WEATHER_API_KEY"],
  properties: {
    PORT: {
      type: "string",
      default: "3000",
    },
    HOST: {
      type: "string",
      default: "localhost",
    },
    NODE_ENV: {
      type: "string",
      default: "development",
    },
    API_VERSION: {
      type: "string",
      default: "v1",
    },
    WEATHER_API_KEY: {
      type: "string",
    },
    LOG_LEVEL: {
      type: "string",
      default: "info",
      enum: ["fatal", "error", "warn", "info", "debug", "trace"],
    },
    PRETTY_LOGS: {
      type: "string",
      default: "true",
    },
  },
}

// Define the options for the plugin
const options = {
  confKey: "config",
  schema: schema,
  dotenv: true,
  data: process.env,
}

// Create a plugin to load and validate environment variables
const configPlugin: FastifyPluginAsync = async (fastify) => {
  await fastify.register(fastifyEnv, options)

  // Update logger level based on config
  if (fastify.config.LOG_LEVEL) {
    fastify.log.level = fastify.config.LOG_LEVEL
  }
}

export default fastifyPlugin(configPlugin)

// Type declaration for the fastify instance with config
declare module "fastify" {
  interface FastifyInstance {
    config: {
      PORT: string
      HOST: string
      NODE_ENV: string
      API_VERSION: string
      WEATHER_API_KEY: string
      LOG_LEVEL: string
      PRETTY_LOGS: string
    }
  }
}
