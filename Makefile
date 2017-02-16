DATETIME = `date +%Y%m%d%H%M%S`

default:
	@sh -c "trap 'npm run dev' EXIT; exit 0"

help:
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@echo "  [default]            start server in development mode"
	@echo "  migration-<name>     create a new generic migration file"
	@echo "  table-<name>         create a new table migration file"
	@echo "  dbup                 run pending migrations"
	@echo "  dbundo               revert the last migration"
	@echo "  help                 print this help"
	@echo ""

# similar to `sequelize migration:create --name ...`, but uses our own template
# migration file
migration-%:
	@mkdir -p database/migrations
	$(eval FILE := database/migrations/$(DATETIME)-$*.js)
	@cp database/skel-migration.js $(FILE)
	@vim $(FILE)

# similar to `sequelize migration:create --create=table ...`, but uses our own
# template migration file
table-%:
	@mkdir -p database/migrations
	$(eval FILE := database/migrations/$(DATETIME)-create_$*_table.js)
	@cp database/skel-table.js $(FILE)
	@sed -i '' 's/TABLE/$*/' $(FILE)
	@vim $(FILE)

# run pending migrations:
dbup:
	@node_modules/.bin/sequelize db:migrate

# revert the last migrations:
dbundo:
	@node_modules/.bin/sequelize db:migrate:undo
