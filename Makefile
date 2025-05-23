DOCKER_COMPOSE		= docker compose
DOCKER_COMPOSE_FILE	= ./docker-compose.yml

all: prod

prod:
	@$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) up --build


build:
	@$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) up -d

up:
	@$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) up -d

down:
	@$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) down

clean:
	@$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) down -v

fclean: clean
	@echo "Deleting containers..."
	@docker system prune -a -f

re: fclean all

.PHONY: all prod dev build up down clean fclean re