#!/bin/sh
set -eu
# Synthetic certificate only. No dotenv, hosted credentials, real DNS, or external targets.
fixture_dir=$(mktemp -d /tmp/genova080.XXXXXX)
cleanup() {
  case "$fixture_dir" in /tmp/genova080.*) rm -f "$fixture_dir/cert.pem" "$fixture_dir/key.pem"; rmdir "$fixture_dir" ;; *) exit 1 ;; esac
}
trap cleanup EXIT HUP INT TERM
openssl req -x509 -newkey rsa:2048 -sha256 -nodes -days 1 \
  -keyout "$fixture_dir/key.pem" -out "$fixture_dir/cert.pem" \
  -subj '/CN=preview.fixture.com' -addext 'subjectAltName=DNS:preview.fixture.com' >/dev/null 2>&1
deno run --no-config --cached-only --allow-net=127.0.0.1 --allow-read="$fixture_dir" \
  supabase/functions/link-preview/runtime-acceptance.ts "$fixture_dir/cert.pem" "$fixture_dir/key.pem"
