
variable "RELEASE" {
    default = "v1.0.0"
}

variable "REGISTRY" {
    default = "ghcr.io/baryhuang/agentic-mcp-client"
}

group "default" {
  targets = ["agentic-mcp-client"]
}


target "agentic-mcp-client" {
  dockerfile = "Dockerfile"
  tags       = ["${REGISTRY}/${target.agentic-mcp-client.name}:${RELEASE}"]
  context    = "."
  labels = {
    "org.opencontainers.image.source" = "https://github.com/baryhuang/agentic-mcp-client"
  }
}
