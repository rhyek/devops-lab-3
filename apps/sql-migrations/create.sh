date=$(date -uIseconds | sed -E "s/[^0-9]//g" | cut -c1-14)
directory=$(node -e "console.log(require('./knexfile.js').migrations.directory);")
filename="$directory"/"$date"_"$1".ts

echo "import * as Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(\`
    
  \`);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(\`
    
  \`);
}" >> $filename

# use: ./create.sh migration_name
