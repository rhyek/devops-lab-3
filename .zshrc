source ~/.zshrc

export PULUMI_CONFIG_PASSPHRASE=pass
export DB_URL=postgresql://user:pass@localhost:5433/db

migrate() {
  starting_dir=$(pwd)
  cd $PROJECT_ROOT/apps/sql-migrations
  ./migrate.sh
  cd $starting_dir
}
