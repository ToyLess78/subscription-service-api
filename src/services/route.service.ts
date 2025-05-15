import type { FastifyInstance } from "fastify"

export interface IRouteService {
  getRouteMap(): Record<string, string[]>
  getFormattedRoutes(): string
}

export class RouteService implements IRouteService {
  private fastify: FastifyInstance

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify
  }

  /**
   * Gets a map of all registered routes grouped by tag
   * @returns A map of routes by tag
   */
  getRouteMap(): Record<string, string[]> {
    const routeMap: Record<string, string[]> = {}

    try {
      // Get all registered routes - this is a method, not a property
      const routesTable = this.fastify.printRoutes()

      // Parse the routes table string into a structured format
      const routeLines = routesTable.split("\n").filter((line) => line.trim().length > 0)

      // Process each route line
      routeLines.forEach((line) => {
        // Skip header lines
        if (line.includes("│ Method │") || line.includes("├────────┼")) {
          return
        }

        // Extract method and url from the line
        const parts = line.split("│").filter((part) => part.trim().length > 0)
        if (parts.length >= 2) {
          const method = parts[0].trim()
          const url = parts[1].trim()

          // Get route schema to extract tags
          // Default to 'api' tag if no specific tags are found
          const tag = "api"

          if (!routeMap[tag]) {
            routeMap[tag] = []
          }
          routeMap[tag].push(`${method} ${url}`)
        }
      })

      // Add special routes that might not be in the routes table
      if (!routeMap["system"]) {
        routeMap["system"] = []
      }
      routeMap["system"].push("GET /documentation")
      routeMap["system"].push(`GET /api/${this.fastify.config.API_VERSION}/health`)

      return routeMap
    } catch (error) {
      this.fastify.log.error("Failed to parse routes", error)
      return { api: ["Failed to parse routes"] }
    }
  }

  /**
   * Gets a formatted string of all registered routes
   * @returns A formatted string of routes
   */
  getFormattedRoutes(): string {
    const routeMap = this.getRouteMap()
    let result = ""

    // Format routes by tag
    Object.entries(routeMap).forEach(([tag, routes]) => {
      result += `\n[${tag.toUpperCase()}]\n`
      routes.forEach((route) => {
        result += `  ${route}\n`
      })
    })

    return result
  }

  /**
   * Logs all registered routes
   */
  logAllRoutes(): void {
    try {
      // Get the raw routes table from Fastify
      const routesTable = this.fastify.printRoutes()

      // Log the raw routes table for simplicity and reliability
      const baseUrl = `http://${this.fastify.config.HOST}:${this.fastify.config.PORT}`

      this.fastify.log.info(`=== API Routes ===\n${routesTable}`)
      this.fastify.log.info(`API Documentation: ${baseUrl}/documentation`)
      this.fastify.log.info(`Health Check: ${baseUrl}/api/${this.fastify.config.API_VERSION}/health`)
    } catch (error) {
      this.fastify.log.error("Failed to log routes", error)
    }
  }
}
