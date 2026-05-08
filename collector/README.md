## browser-event-collector

Browser event collector API that **writes NDJSON** (one JSON per line) to a local file or stdout.
Use Fluent Bit to ship those logs to OpenSearch with buffering/retries.

### Run

```powershell
cd .\collector
npm install

$env:PORT="8080"
$env:COLLECTOR_TOKEN="exam-monitor-token"   # must match extension's X-Collector-Token (optional)
$env:OUTPUT_MODE="file"                     # file | stdout
$env:OUTPUT_DIR="c:\exam-monitor\logs"
$env:OUTPUT_FILE="browser-events.ndjson"

npm start
```

Health check: `GET /healthz`

### Fluent Bit (tail NDJSON file → OpenSearch) example

Use Fluent Bit `tail` input + `opensearch` output. Keep this file-oriented so you get disk buffering/retries.

1) Point the collector to write here:
- `OUTPUT_DIR=c:\exam-monitor\logs`
- `OUTPUT_FILE=browser-events.ndjson`

2) Fluent Bit config sketch (adjust paths/credentials):

```ini
[INPUT]
    Name              tail
    Path              C:\exam-monitor\logs\browser-events.ndjson
    Tag               exam.browser
    Read_from_Head    True
    Refresh_Interval  1

[FILTER]
    Name              parser
    Match             exam.browser
    Key_Name          log
    Parser            json

[OUTPUT]
    Name              opensearch
    Match             exam.browser
    Host              10.20.0.10
    Port              9200
    Index             exam-browser-events
    HTTP_User         admin
    HTTP_Passwd       admin
    tls               On
```

Notes:
- Keep output over TLS in real deployments.
- The collector already enriches `observer.*`, `source.ip`, `host.name` (from `candidate_id`), and `agent.*`.

