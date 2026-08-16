export interface EventIQConfig {
  systemId: string;
  endpoint: string;
  headers?: Record<string, string>;
  batchSize?: number;
  flushIntervalMs?: number;
}

export interface TrackedEvent {
  log_id: string;
  timestamp: string;
  system_id: string;
  username?: string;
  employee_id?: string;
  event_category: 'interaction' | 'navigation' | 'lifecycle' | 'error';
  event_action: string;
  payload: Record<string, any>;
}

export class EventIQTracker {
  private config: Required<EventIQConfig>;
  private buffer: TrackedEvent[] = [];
  private flushTimer: number | null = null;
  private dbName = 'EventIQDB';
  private storeName = 'offline_events';
  private lastMouseMoveTime = 0;
  private mouseMoveThrottleMs = 500;
  private isOffline = !navigator.onLine;
  private activeUsername?: string;

  constructor(config: EventIQConfig) {
    this.config = {
      batchSize: 25,
      flushIntervalMs: 5000,
      headers: {},
      ...config,
    };

    this.initDatabase();
    this.attachListeners();
    this.startFlushTimer();
    this.flushOfflineEvents();
  }

  public identify(username: string) {
    this.activeUsername = username;
    this.track('lifecycle', 'identify', { username });
  }

  private initDatabase() {
    const request = indexedDB.open(this.config.systemId + '_' + this.dbName, 1);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(this.storeName)) {
        db.createObjectStore(this.storeName, { autoIncrement: true });
      }
    };
  }

  private attachListeners() {
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

  private patchHistory(method: 'pushState' | 'replaceState') {
    const original = history[method];
    const self = this;
    history[method] = function (data: any, unused: string, url?: string | URL | null) {
      const result = original.apply(this, [data, unused, url]);
      self.track('navigation', method, { url: window.location.href });
      return result;
    };
  }

  private handleInteraction(e: MouseEvent, action: string) {
    const target = e.target as HTMLElement;
    
    // Ignore elements marked with data-eventiq-ignore
    if (target.closest('[data-eventiq-ignore]')) return;

    this.track('interaction', action, {
      tag: target.tagName,
      id: target.id,
      classes: target.className,
      textSnippet: this.sanitizeText(target.innerText || (target as HTMLInputElement).value || ''),
      x: e.clientX,
      y: e.clientY,
      boundingRect: target.getBoundingClientRect().toJSON()
    });
  }

  private handleMouseMove(e: MouseEvent) {
    const now = Date.now();
    if (now - this.lastMouseMoveTime > this.mouseMoveThrottleMs) {
      this.track('interaction', 'mousemove', { x: e.clientX, y: e.clientY });
      this.lastMouseMoveTime = now;
    }
  }

  private sanitizeText(text: string): string {
    if (!text) return '';
    // Redact SSNs, Credit Cards, common patterns
    let sanitized = text.replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[REDACTED_SSN]');
    sanitized = sanitized.replace(/\b(?:\d[ -]*?){13,16}\b/g, '[REDACTED_CC]');
    return sanitized.substring(0, 100); // truncate
  }

  private track(category: TrackedEvent['event_category'], action: string, payload: Record<string, any>) {
    const event: TrackedEvent = {
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

  private startFlushTimer() {
    this.flushTimer = window.setInterval(() => {
      this.flush();
    }, this.config.flushIntervalMs);
  }

  private async flush(isUnload = false) {
    if (this.buffer.length === 0) return;

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
      } else {
        const response = await fetch(this.config.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...this.config.headers },
          body: JSON.stringify(eventsToFlush),
          keepalive: isUnload
        });
        
        if (!response.ok) {
           throw new Error('Network response was not ok');
        }
      }
    } catch (e) {
      console.warn('EventIQ: Failed to send events, storing offline', e);
      this.saveOffline(eventsToFlush);
    }
  }

  private saveOffline(events: TrackedEvent[]) {
    const request = indexedDB.open(this.config.systemId + '_' + this.dbName, 1);
    request.onsuccess = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      const tx = db.transaction(this.storeName, 'readwrite');
      const store = tx.objectStore(this.storeName);
      store.add(events);
    };
  }

  private flushOfflineEvents() {
    const request = indexedDB.open(this.config.systemId + '_' + this.dbName, 1);
    request.onsuccess = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      
      if (!db.objectStoreNames.contains(this.storeName)) return;

      const tx = db.transaction(this.storeName, 'readwrite');
      const store = tx.objectStore(this.storeName);
      const getAllRequest = store.getAll();

      getAllRequest.onsuccess = async () => {
        const records = getAllRequest.result as TrackedEvent[][];
        if (records && records.length > 0) {
           const allEvents = ([] as TrackedEvent[]).concat(...records);
           
           // clear on success
           try {
             const response = await fetch(this.config.endpoint, {
               method: 'POST',
               headers: { 'Content-Type': 'application/json', ...this.config.headers },
               body: JSON.stringify(allEvents)
             });
             
             if (response.ok) {
                const txClear = db.transaction(this.storeName, 'readwrite');
                txClear.objectStore(this.storeName).clear();
             }
           } catch(err) {
               console.warn("Failed to flush offline events", err);
           }
        }
      };
    };
  }
}

// Ensure it can be attached globally
(window as any).EventIQTracker = EventIQTracker;
