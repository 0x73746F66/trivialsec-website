SHELL := /bin/bash
-include .env
export $(shell sed 's/=.*//' .env)
.ONESHELL: # Applies to every targets in the file!
.PHONY: help

help: ## This help.
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

.DEFAULT_GOAL := help

prep:
	find . -type f -name '*.DS_Store' -delete 2>/dev/null || true
	@rm *.zip || true

init:  ## Runs tf init tf
	cd plans
	terraform init -reconfigure -upgrade=true

plan: init ## Runs tf validate and tf plan
	cd plans
	terraform init -reconfigure -upgrade=true
	terraform validate
	terraform plan -no-color -out=.tfplan
	terraform show --json .tfplan | jq -r '([.resource_changes[]?.change.actions?]|flatten)|{"create":(map(select(.=="create"))|length),"update":(map(select(.=="update"))|length),"delete":(map(select(.=="delete"))|length)}' > tfplan.json

apply: plan ## tf apply -auto-approve -refresh=true
	cd plans
	terraform apply -auto-approve -refresh=true .tfplan

destroy: init ## tf destroy -auto-approve
	cd plans
	terraform validate
	terraform plan -destroy -no-color -out=.tfdestroy
	terraform show --json .tfdestroy | jq -r '([.resource_changes[]?.change.actions?]|flatten)|{"create":(map(select(.=="create"))|length),"update":(map(select(.=="update"))|length),"delete":(map(select(.=="delete"))|length)}' > tfdestroy.json
	terraform apply -auto-approve -destroy .tfdestroy

invalidate-cloudfront:
ifdef AWS_PROFILE
	aws --profile $(AWS_PROFILE) \
		cloudfront create-invalidation \
		--distribution-id ${CF_DISTRIBUTION_ID} \
		--paths "/static/"
else
	aws cloudfront create-invalidation \
		--distribution-id ${CF_DISTRIBUTION_ID} \
		--paths "/static/"
endif

publish-s3:
ifdef AWS_PROFILE
	aws --profile $(AWS_PROFILE) s3 sync --only-show-errors public/ s3://static-trivialsec/static/
else
	aws s3 sync --only-show-errors public/ s3://static-trivialsec/static/
endif

build: ## Build compressed container
	docker-compose build

buildnc: package ## Clean build docker
	docker-compose build --no-cache

rebuild: down build

up: ## Start the app
	docker-compose up -d

down: ## Stop the app
	@docker-compose down --remove-orphans

semgrep-tf-ci:
	semgrep --disable-version-check -q --strict --error -o semgrep-tf.json --json --config p/terraform plans/*.tf

semgrep-sast-ci:
	semgrep --disable-version-check -q --strict --error -o semgrep-ci.json --json --config p/r2c-ci --lang=js src/**/*.js

semgrep-xss-ci:
	semgrep --disable-version-check -q --strict --error -o semgrep-xss.json --json --config p/xss --lang=js src/**/*.js

semgrep-secrets-ci:
	semgrep --disable-version-check -q --strict --error -o semgrep-secrets.json --json --config p/secrets --lang=js src/**/*.js

semgrep-tls-ci:
	semgrep --disable-version-check -q --strict --error -o semgrep-tls.json --json --config p/insecure-transport --lang=js src/**/*.js

lint-ci: semgrep-tf-ci semgrep-sast-ci semgrep-xss-ci semgrep-secrets-ci semgrep-tls-ci

semgrep-tf:
	semgrep --force-color -q --strict --config p/terraform plans/**/*.tf

semgrep-sast:
	semgrep --force-color -q --strict --config p/r2c-ci --lang=js src/**/*.js

semgrep-xss:
	semgrep --force-color -q --strict --config p/xss --lang=js src/**/*.js

semgrep-secrets:
	semgrep --force-color -q --strict --config p/secrets --lang=js src/**/*.js

semgrep-tls:
	semgrep --force-color -q --strict --config p/insecure-transport --lang=js src/**/*.js

lint: semgrep-tf semgrep-sast semgrep-xss semgrep-secrets semgrep-tls

