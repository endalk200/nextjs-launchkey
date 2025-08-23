# Docker / Image module
# Build prod image

image_name := 'nextcelerator:prod'

# Allow overriding via env: IMAGE_NAME

image := env_var_or_default('IMAGE_NAME', image_name)

# Build with optional SKIP_ENV_VALIDATION=1
image: img-build

# Build image
@img-build:
    # Use build arg for SKIP_ENV_VALIDATION when set
    if [ -n "${SKIP_ENV_VALIDATION}" ]; then \
      docker build --build-arg SKIP_ENV_VALIDATION=1 -t {{ image }} . ; \
    else \
      docker build -t {{ image }} . ; \
    fi

# Run container connected to local host DB
@run *ARGS:
    docker run --rm -p 3000:3000 \
      -e DATABASE_URL="${DATABASE_URL:-postgresql://postgres:postgres@host.docker.internal:5432/nextcelerator}" \
      -e BETTER_AUTH_SECRET="${BETTER_AUTH_SECRET:-change-me-32-characters-minimum-secret-key}" \
      -e BETTER_AUTH_URL="${BETTER_AUTH_URL:-http://localhost:3000}" \
      {{ image }} {{ ARGS }}

# Publish image (expects IMAGE and TAG envs or defaults)
@push:
    if [ -z "${REGISTRY}" ]; then echo "Set REGISTRY (e.g. ghcr.io/user/repo)" && exit 1; fi
    TAG=${TAG:-latest}
    FULL="$REGISTRY/{{ image }}:$TAG"
    docker tag {{ image }} "$FULL"
    docker push "$FULL"
