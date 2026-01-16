"""
Supabase Connection Test
========================
Quick test to verify Supabase connection and credentials.
Run with: uv run python tests/test_supabase_connection.py
"""

import os
import sys

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from config.settings import SUPABASE_ANON_KEY, SUPABASE_URL  # noqa: E402


def test_supabase_connection():
    """Test Supabase connection."""
    print("\n" + "=" * 60)
    print("🔍 SUPABASE CONNECTION TEST")
    print("=" * 60)

    # Check environment variables
    print("\n📋 Environment Variables:")
    print(f"   SUPABASE_URL: {'✅ Set' if SUPABASE_URL else '❌ Not set'}")
    if SUPABASE_URL:
        # Mask URL for security but show domain
        masked_url = SUPABASE_URL.split("//")[1].split(".")[0] if "//" in SUPABASE_URL else "..."
        print(f"      → Project: {masked_url}...")

    print(f"   SUPABASE_ANON_KEY: {'✅ Set' if SUPABASE_ANON_KEY else '❌ Not set'}")
    if SUPABASE_ANON_KEY:
        print(f"      → Key: {SUPABASE_ANON_KEY[:20]}...")

    if not SUPABASE_URL or not SUPABASE_ANON_KEY:
        print("\n❌ Missing Supabase credentials!")
        print("\n📝 To fix this:")
        print("   1. Open app/server/.env")
        print("   2. Set your Supabase credentials:")
        print("      SUPABASE_URL=https://your-project.supabase.co")
        print("      SUPABASE_ANON_KEY=your_anon_key_here")
        print("\n   Get these from: https://supabase.com/dashboard/project/_/settings/api")
        return False

    # Test connection
    print("\n🔌 Testing Connection...")
    try:
        from db.supabase_client import get_supabase_client, validate_connection

        client = get_supabase_client()
        if client is None:
            print("❌ Failed to create Supabase client")
            return False

        print("✅ Supabase client created successfully")

        # Test a simple query
        print("\n📊 Testing Database Query...")
        try:
            result = client.table("forex_instruments").select("*").limit(1).execute()
            print(f"✅ Query successful! Found {len(result.data)} records")
            if result.data:
                print(f"   Sample data: {list(result.data[0].keys())[:5]}...")
        except Exception as e:
            error_msg = str(e).lower()
            if "does not exist" in error_msg or "relation" in error_msg:
                print("⚠️  Table 'forex_instruments' doesn't exist yet")
                print("   Run migrations to create tables:")
                print("   → Check app/server/db/migrations/001_initial_schema.sql")
            else:
                print(f"❌ Query failed: {e}")
                return False

        # Validate overall connection
        print("\n🔐 Validating Connection...")
        is_valid = validate_connection()
        if is_valid:
            print("✅ Connection validated successfully!")
        else:
            print("❌ Connection validation failed")
            return False

        return True

    except Exception as e:
        print(f"❌ Connection error: {e}")
        return False


if __name__ == "__main__":
    success = test_supabase_connection()
    print("\n" + "=" * 60)
    if success:
        print("🎉 ALL TESTS PASSED - Supabase is working!")
    else:
        print("❌ TESTS FAILED - Check your configuration")
    print("=" * 60 + "\n")
    sys.exit(0 if success else 1)
