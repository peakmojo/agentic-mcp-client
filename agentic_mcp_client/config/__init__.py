from agentic_mcp_client.config.env_subst import substitute_env_vars
from agentic_mcp_client.config.initial import initial_settings
from agentic_mcp_client.config.final import Settings
from typing import Any, Callable
from loguru import logger
from pydantic import ValidationError

__all__ = ["config"]

config: Settings = None  # type: ignore

if initial_settings.load_config:
    # import stuff needed to load the config
    from deepmerge import always_merger
    import sys

    configs: list[dict[str, Any]] = []
    load_config: Callable[[str], dict]  # without this mypy will error about param names

    # load the config
    if initial_settings.file is not None:
        logger.info(f"Loading config from {initial_settings.file}")
        from .file import load_config

        configs.append(load_config(initial_settings.file))

    if initial_settings.http_url is not None:
        logger.info(f"Loading config from {initial_settings.http_url}")
        from .http import load_config

        configs.append(load_config(initial_settings.http_url))

    if initial_settings.json is not None:
        logger.info("Loading config from json string")
        configs.append(initial_settings.json)

    # merge the configs
    result: dict = {}
    for cfg in configs:
        always_merger.merge(result, cfg)

    result = substitute_env_vars(result)

    # build the config
    try:
        config = Settings(**result)
    except ValidationError as e:
        logger.error("unable to load a valid configuration")
        for error in e.errors():
            logger.error(f"{error['loc'][0]}: {error['msg']}")
        exit(1)

    if config.logging.log_level != "DEBUG":
        logger.remove()
        logger.add(
            sys.stderr,
            format="{time} {level} {message}",
            level=config.logging.log_level,
            colorize=True,
        )
