#!/bin/bash
OAUTH_TOKEN="IeT6cPwU17_ZQy7NjqOVdbY0fZ67YEZsTMzgbcFcQ_c.57rJazz8N9ZZ8ZEHvxKXHmudmjnpp-8mybrkFzihBwM"
ACCOUNT_ID="b18869a0dec6b679f4aac5e1e79b6fb8"

curl -s "https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/pages/projects/event" \
  -H "Authorization: Bearer ${OAUTH_TOKEN}" > /tmp/cf_project.json

echo "File size: $(wc -c < /tmp/cf_project.json) bytes"
