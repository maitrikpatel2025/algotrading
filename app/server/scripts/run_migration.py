#!/usr/bin/env python3
"""
Run Database Migration Script
=============================
Executes SQL migration files against the Supabase PostgreSQL database.

Usage:
    python run_migration.py <migration_file> --database-url <DATABASE_URL>

    Or set DATABASE_URL environment variable:
    DATABASE_URL="postgresql://postgres:password@db.project.supabase.co:5432/postgres"
    python run_migration.py <migration_file>

Example:
    python run_migration.py ../db/migrations/003_create_backtests_table.sql \\
        --database-url "postgresql://postgres:YOUR_PASSWORD@db.cwcmvkhwklnsvsskofsh.supabase.co:5432/postgres"
"""

import argparse
import os
import sys

import psycopg2


def run_migration(migration_file: str, database_url: str) -> bool:
    """Execute a SQL migration file against the database."""
    if not os.path.exists(migration_file):
        print(f"Error: Migration file not found: {migration_file}")
        return False

    with open(migration_file, "r") as f:
        sql = f.read()

    print("Connecting to database...")
    try:
        conn = psycopg2.connect(database_url)
        conn.autocommit = True
        cursor = conn.cursor()

        print(f"Executing migration: {migration_file}")
        cursor.execute(sql)

        print("Migration executed successfully!")

        # Verify the table was created
        cursor.execute(
            "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
        )
        tables = [row[0] for row in cursor.fetchall()]
        print(f"Tables in database: {', '.join(sorted(tables))}")

        cursor.close()
        conn.close()
        return True

    except psycopg2.Error as e:
        print(f"Database error: {e}")
        return False
    except Exception as e:
        print(f"Error: {e}")
        return False


def main():
    parser = argparse.ArgumentParser(
        description="Run SQL migration against Supabase database"
    )
    parser.add_argument("migration_file", help="Path to the SQL migration file")
    parser.add_argument(
        "--database-url",
        help="PostgreSQL connection string (or set DATABASE_URL env var)",
        default=os.environ.get("DATABASE_URL"),
    )

    args = parser.parse_args()

    if not args.database_url:
        print("Error: DATABASE_URL not provided.")
        print("\nTo get the DATABASE_URL:")
        print("1. Go to Supabase Dashboard: https://supabase.com/dashboard")
        print("2. Select your project: cwcmvkhwklnsvsskofsh")
        print("3. Go to Settings > Database")
        print("4. Copy the 'Connection string' (URI format)")
        print("5. Replace [YOUR-PASSWORD] with your database password")
        print(
            "\nFormat: postgresql://postgres:[YOUR-PASSWORD]@db.cwcmvkhwklnsvsskofsh.supabase.co:5432/postgres"
        )
        sys.exit(1)

    success = run_migration(args.migration_file, args.database_url)
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
