SHELL := /bin/bash
-include .env
export $(shell sed 's/=.*//' .env)
APP_NAME := website

.PHONY: help

help: ## This help.
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

.DEFAULT_GOAL := help

CMD_AWS := aws
ifdef AWS_PROFILE
CMD_AWS += --profile $(AWS_PROFILE)
endif
ifdef AWS_REGION
CMD_AWS += --region $(AWS_REGION)
endif

setup-debian:
	npm i http-server --save-dev
	pip install -q -U pip awscli
	curl -fsSL https://apt.releases.hashicorp.com/gpg | sudo apt-key add -
	sudo apt-add-repository "deb [arch=amd64] https://apt.releases.hashicorp.com focal main"
	sudo apt-get update && sudo apt-get install -y terraform
	terraform -install-autocomplete
	terraform init plans

serve:
	./node_modules/http-server/bin/http-server ./src

update:
	git pull

plan:
	mkdir -p build
	terraform init plans
	terraform validate plans
	terraform plan -no-color -out=build/.tfplan plans

deploy:
	terraform init plans
	terraform apply -auto-approve -refresh=true build/.tfplan

publish:
	$(CMD_AWS) s3 sync --only-show-errors src/ s3://static-trivialsec/
