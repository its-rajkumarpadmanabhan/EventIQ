# EventIQ SDK

This is the lightweight JavaScript tracker SDK for EventIQ. It can be embedded into any web application to automatically track user interactions, navigations, and lifecycle events.

## Usage

Embed the compiled SDK and initialize the `EventIQTracker` with your specific configuration.

```html
<script type="module">
    import { EventIQTracker } from './dist/eventiq-tracker.js';

    const tracker = new EventIQTracker({
        systemId: 'your-system-id',
        endpoint: 'http://localhost:8000/api/v1/events/ingest/batch/',
        headers: {
            'X-API-Key': 'your_api_key_here'
        },
        batchSize: 10,
        flushIntervalMs: 5000
    });
</script>
```

## Features
- Automatic tracking of clicks, inputs, and navigations.
- Configurable batching and flushing intervals.
- Intelligent redaction of sensitive input fields (e.g., passwords, credit cards).
- Support for `data-eventiq-ignore` attributes to skip tracking on specific elements.
