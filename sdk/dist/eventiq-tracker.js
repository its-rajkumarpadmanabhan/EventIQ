var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export class EventIQTracker {
    constructor(config) {
        this.buffer = [];
        this.flushTimer = null;
        this.dbName = 'EventIQDB';
        this.storeName = 'offline_events';
        this.lastMouseMoveTime = 0;
        this.mouseMoveThrottleMs = 500;
        this.isOffline = !navigator.onLine;
        this.config = Object.assign({ batchSize: 25, flushIntervalMs: 5000, headers: {} }, config);
        this.initDatabase();
        this.attachListeners();
        this.startFlushTimer();
        this.flushOfflineEvents();
    }
    identify(username) {
        this.activeUsername = username;
        this.track('lifecycle', 'identify', { username });
    }
    initDatabase() {
        const request = indexedDB.open(this.config.systemId + '_' + this.dbName, 1);
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(this.storeName)) {
                db.createObjectStore(this.storeName, { autoIncrement: true });
            }
        };
    }
    attachListeners() {
        // Mouse clicks
        document.addEventListener('click', (e) => this.handleInteraction(e, 'click'), true);
        document.addEventListener('contextmenu', (e) => this.handleInteraction(e, 'right_click'), true);
        // Mouse movement
        document.addEventListener('mousemove', (e) => this.handleMouseMove(e), { passive: true });
        // Visibility change
        document.addEventListener('visibilitychange', () => {
            this.track('lifecycle', document.visibilityState, { url: window.location.href });
            if (document.visibilityState === 'hidden') {
                this.flush(true);
            }
        });
        // Before unload
        window.addEventListener('beforeunload', () => {
            this.track('lifecycle', 'exit', { url: window.location.href });
            this.flush(true);
        });
        // Offline / Online
        window.addEventListener('offline', () => { this.isOffline = true; });
        window.addEventListener('online', () => {
            this.isOffline = false;
            this.flushOfflineEvents();
        });
        // SPA Navigation Overrides
        this.patchHistory('pushState');
        this.patchHistory('replaceState');
        window.addEventListener('popstate', () => {
            this.track('navigation', 'popstate', { url: window.location.href });
        });
    }
    patchHistory(method) {
        const original = history[method];
        const self = this;
        history[method] = function (data, unused, url) {
            const result = original.apply(this, [data, unused, url]);
            self.track('navigation', method, { url: window.location.href });
            return result;
        };
    }
    handleInteraction(e, action) {
        const target = e.target;
        // Ignore elements marked with data-eventiq-ignore
        if (target.closest('[data-eventiq-ignore]'))
            return;
        this.track('interaction', action, {
            tag: target.tagName,
            id: target.id,
            classes: target.className,
            textSnippet: this.sanitizeText(target.innerText || target.value || ''),
            x: e.clientX,
            y: e.clientY,
            boundingRect: target.getBoundingClientRect().toJSON()
        });
    }
    handleMouseMove(e) {
        const now = Date.now();
        if (now - this.lastMouseMoveTime > this.mouseMoveThrottleMs) {
            this.track('interaction', 'mousemove', { x: e.clientX, y: e.clientY });
            this.lastMouseMoveTime = now;
        }
    }
    sanitizeText(text) {
        if (!text)
            return '';
        // Redact SSNs, Credit Cards, common patterns
        let sanitized = text.replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[REDACTED_SSN]');
        sanitized = sanitized.replace(/\b(?:\d[ -]*?){13,16}\b/g, '[REDACTED_CC]');
        return sanitized.substring(0, 100); // truncate
    }
    track(category, action, payload) {
        const event = {
            log_id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            system_id: this.config.systemId,
            username: this.activeUsername,
            event_category: category,
            event_action: action,
            payload
        };
        this.buffer.push(event);
        if (this.buffer.length >= this.config.batchSize) {
            this.flush();
        }
    }
    startFlushTimer() {
        this.flushTimer = window.setInterval(() => {
            this.flush();
        }, this.config.flushIntervalMs);
    }
    flush() {
        return __awaiter(this, arguments, void 0, function* (isUnload = false) {
            if (this.buffer.length === 0)
                return;
            const eventsToFlush = [...this.buffer];
            this.buffer = [];
            if (this.isOffline) {
                this.saveOffline(eventsToFlush);
                return;
            }
            try {
                if (isUnload && navigator.sendBeacon) {
                    const blob = new Blob([JSON.stringify(eventsToFlush)], { type: 'application/json' });
                    navigator.sendBeacon(this.config.endpoint, blob);
                }
                else {
                    const response = yield fetch(this.config.endpoint, {
                        method: 'POST',
                        headers: Object.assign({ 'Content-Type': 'application/json' }, this.config.headers),
                        body: JSON.stringify(eventsToFlush),
                        keepalive: isUnload
                    });
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                }
            }
            catch (e) {
                console.warn('EventIQ: Failed to send events, storing offline', e);
                this.saveOffline(eventsToFlush);
            }
        });
    }
    saveOffline(events) {
        const request = indexedDB.open(this.config.systemId + '_' + this.dbName, 1);
        request.onsuccess = (e) => {
            const db = e.target.result;
            const tx = db.transaction(this.storeName, 'readwrite');
            const store = tx.objectStore(this.storeName);
            store.add(events);
        };
    }
    flushOfflineEvents() {
        const request = indexedDB.open(this.config.systemId + '_' + this.dbName, 1);
        request.onsuccess = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains(this.storeName))
                return;
            const tx = db.transaction(this.storeName, 'readwrite');
            const store = tx.objectStore(this.storeName);
            const getAllRequest = store.getAll();
            getAllRequest.onsuccess = () => __awaiter(this, void 0, void 0, function* () {
                const records = getAllRequest.result;
                if (records && records.length > 0) {
                    const allEvents = [].concat(...records);
                    // clear on success
                    try {
                        const response = yield fetch(this.config.endpoint, {
                            method: 'POST',
                            headers: Object.assign({ 'Content-Type': 'application/json' }, this.config.headers),
                            body: JSON.stringify(allEvents)
                        });
                        if (response.ok) {
                            const txClear = db.transaction(this.storeName, 'readwrite');
                            txClear.objectStore(this.storeName).clear();
                        }
                    }
                    catch (err) {
                        console.warn("Failed to flush offline events", err);
                    }
                }
            });
        };
    }
}
// Ensure it can be attached globally
window.EventIQTracker = EventIQTracker;
