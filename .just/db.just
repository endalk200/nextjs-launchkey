# Database module (docker compose)

compose := 'docker-compose.db.yml'

# Start postgres
@db-up:
	docker compose -f {{compose}} up -d

# Stop postgres
@db-down:
	docker compose -f {{compose}} down

# Reset postgres (danger: volume removed)
@db-reset:
	docker compose -f {{compose}} down -v

# Show logs
@db-logs *ARGS:
	docker compose -f {{compose}} logs -f {{ARGS}}

# PSQL shell (requires psql installed locally)
@db-psql:
	psql "$DATABASE_URL"
