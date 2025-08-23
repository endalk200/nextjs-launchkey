# Global settings
set dotenv-load := true
set export := true

# Modules approach: import sub-justfiles from .just/
# Each module groups related commands

# Load module paths if they exist
import './.just/docker.just'
import './.just/db.just'
import './.just/dev.just'
import './.just/prisma.just'
import './.just/lint.just'

# Default: list recipes
@default:
	just --list
