// @ts-nocheck

// Console HMR Errors Plugin Client Script
(function () {
  function formatError(error) {
    const message = error.message || error.toString();
    let location = '';
    let stack = '';

    // Extract file and line information
    if (error.loc) {
      location = `${error?.loc?.file || error.id}:${error.loc.line}:${error.loc.column}`;
    } else if (error.id) {
      location = `${error.id}`;
    } else if (error.filename) {
      // Svelte-specific error format
      location = `${error.filename}`;

      if (error.start) {
        location += `:${error.start.line}:${error.start.column}`;
      }
    }

    // Extract stack trace
    if (error.stack || error.frame) {
      stack = error.stack || error.frame;
    }

    return { message, location, stack };
  }

  function sendError(error) {
    const { location, message, stack } = formatError(error);
    window.postMessage(
      {
        type: 'PACY_ERROR',
        data: { subtype: 'vite-error', message, location, stack },
      },
      '*',
    );
  }

  // Listen for HMR update errors
  if (import.meta.hot) {
    // Standard Vite error events
    import.meta.hot.on('vite:error', (error) => {
      sendError(error);
    });

    // Svelte-specific error events
    import.meta.hot.on('svelte:error', (error) => {
      sendError(error);
    });

    // Additional Vite events that might contain errors
    import.meta.hot.on('vite:beforeUpdate', (payload) => {
      if (payload?.error || payload?.err) {
        sendError(payload.error || payload.err);
      }
    });

    import.meta.hot.on('vite:afterUpdate', (payload) => {
      if (payload?.error || payload?.err) {
        sendError(payload.error || payload.err);
      }
    });

    // Catch WebSocket connection errors
    import.meta.hot.on('vite:ws-disconnect', (payload) => {
      if (payload?.error || payload?.err) {
        sendError(payload.error || payload.err);
      }
    });
  }

  // Listen for WebSocket messages directly
  const originalWebSocket = window.WebSocket;

  window.WebSocket = function (...args) {
    const ws = new originalWebSocket(...args);

    ws.addEventListener('message', (event) => {
      try {
        const data = JSON.parse(event.data);

        // Check for various error patterns
        if (data.type === 'error' && data.err) {
          sendError(data.err);
        } else if (data.type === 'update' && data.updates) {
          // Check if any updates contain errors
          data.updates.forEach((update) => {
            if (update.error || update.err) {
              sendError(update.error || update.err);
            }
          });
        } else if (data.event === 'build-error' || data.event === 'error') {
          // Some plugins send errors as events
          sendError(data.data || data.payload || data);
        } else if (data.type === 'full-reload' && data.reason && data.reason.includes('error')) {
          // Sometimes errors are embedded in full-reload messages
          sendError({
            message: data.reason,
            type: 'full-reload-error',
          });
        }

        // Check for plugin-specific error patterns
        if (typeof data === 'object' && data !== null) {
          // Look for plugin prefixed errors like [plugin:vite-plugin-svelte]
          if (data.message && data.message.includes('[plugin:vite-plugin-svelte]')) {
            sendError(data);
          }

          // Check for compilation errors from svelte
          if (data.id && data.id.endsWith('.svelte') && (data.error || data.err)) {
            sendError(data.error || data.err || data);
          }
        }
      } catch (e) {
        // Ignore JSON parse errors
      }
    });

    return ws;
  };

  // Copy static properties
  Object.setPrototypeOf(window.WebSocket, originalWebSocket);
  Object.defineProperty(window.WebSocket, 'prototype', {
    value: originalWebSocket.prototype,
    writable: false,
  });
})();
