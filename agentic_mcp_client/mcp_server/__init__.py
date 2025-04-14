from fastapi import APIRouter, Depends
from .sse import router as sse_router
from agentic_mcp_client.openapi_tags import Tag
from agentic_mcp_client.auth import get_api_key

__all__ = ["router"]

router = APIRouter(prefix="/mcp-server", tags=[Tag.mcp_server])
router.include_router(sse_router)
