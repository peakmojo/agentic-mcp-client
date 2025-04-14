from typing import Union
import os

from loguru import logger
from mcp import McpError, StdioServerParameters
from mcpx.client.transports.docker import DockerMCPServer

from agentic_mcp_client.config import config
from agentic_mcp_client.config.final import SSEMCPServer
from agentic_mcp_client.utils import force_exit

from .DockerClient import DockerClient
from .SseClient import SseClient
from .StdioClient import StdioClient

client_types = Union[StdioClient, SseClient, DockerClient]


class MCPClientManager:
    clients: dict[str, client_types] = {}

    async def initialize(self):
        """Initialize the MCP Client Manager and start all clients"""

        logger.log("DEBUG", "Initializing MCP Client Manager")
        
        for server_name, server_config in config.mcp_servers.items():
            self.clients[server_name] = await self.construct_client(
                server_name, server_config
            )

    async def shutdown(self):
        """Simply exit the program"""
        force_exit(0)

    async def construct_client(self, name, server_config) -> client_types:
        logger.log("DEBUG", f"Constructing client for {server_config}")
        if isinstance(server_config, StdioServerParameters):
            client = StdioClient(name, server_config)
            await client.start()
            return client

        if isinstance(server_config, SSEMCPServer):
            # TODO: implement sse client
            client = SseClient(name, server_config)  # type: ignore
            await client.start()
            return client
        
        if isinstance(server_config, DockerMCPServer):
            client = DockerClient(name, server_config)
            await client.start()
            return client

        raise NotImplementedError("Client Type not supported")

    def get_client(self, server_name: str):
        return self.clients[server_name]

    def get_clients(self):
        return list(self.clients.items())

    async def get_client_from_tool(self, tool: str):
        for name, client in self.get_clients():
            
            # client cannot have tools if it is not connected
            if not client.session:
                continue

            try:
                list_tools = await client.session.list_tools()
                for client_tool in list_tools.tools:
                    if client_tool.name == tool:
                        return client
            except McpError as e:
                logger.error(f"Error listing tools for client {name}: {e}")
                continue

    async def get_client_from_prompt(self, prompt: str):
        for name, client in self.get_clients():

            # client cannot have prompts if it is not connected
            if not client.session:
                continue

            try:
                list_prompts = await client.session.list_prompts()
                for client_prompt in list_prompts.prompts:
                    if client_prompt.name == prompt:
                        return client
            except McpError:
                continue


ClientManager = MCPClientManager()
