#!/bin/sh
# Only inside the explicitly owned g090p3 VM; public OS files, before private restore.
set -eu
grep -q '^/dev/vda1 /mnt/data ext4 ' /proc/mounts
test -d /mnt/lima-cidata
test ! -e /usr-090-p3-ram-backup
if test ! -e /mnt/data/090-p3-usr; then
  cp -a /usr /mnt/data/090-p3-usr
else
  # Resume only the verified public copy made by this exact prior scoped attempt.
  test "$(sha256sum /usr/bin/dockerd | cut -d ' ' -f 1)" = "$(sha256sum /mnt/data/090-p3-usr/bin/dockerd | cut -d ' ' -f 1)"
fi
# /usr/local is already the same task disk; its copied files now belong to p3-usr.
umount -l /usr/local
mv /usr /usr-090-p3-ram-backup
mkdir /usr
mount --bind /mnt/data/090-p3-usr /usr
# Remove only the just-renamed duplicate RAM directory in this throwaway VM.
# The original public ISO and disk copy retain all recoverable source files.
rm -rf /usr-090-p3-ram-backup
apk add --no-cache docker-cli=29.5.2-r0 docker-engine=29.5.2-r0 docker-openrc=29.5.2-r0
mkdir -p /etc/docker
install -m 600 /tmp/090-p3-docker-classic.json /etc/docker/daemon.json
rc-update add docker default
rc-service docker start
attempt=0
until docker info >/dev/null 2>&1; do
  attempt=$((attempt + 1))
  test "$attempt" -lt 30
  sleep 1
done
