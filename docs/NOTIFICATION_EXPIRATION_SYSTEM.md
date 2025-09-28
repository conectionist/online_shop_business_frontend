# Notification Expiration System

## Problem Statement

Push notifications can persist on user devices even after the content they reference becomes unavailable or expired. This creates a poor user experience where users receive notifications for content that is no longer relevant.

### Example Scenario:
```
Day 1: List #1 published → Notifications sent to users
Day 3: List #1 expires/unavailable  
Day 5: User opens phone → Sees "List #1 published" (but it's expired!)
```

## Solution: Multi-Layer Expiration System

### Layer 1: Time-Based Expiration (Client-Side)

**Implementation:**
```javascript
// Backend sends notification with expiration timestamp
{
  "title": "New List Published",
  "body": "List #1 is now available",
  "data": { 
    "list_id": 1,
    "expires_at": "2024-01-15T23:59:59Z",  // 3 days from now
    "type": "list_published"
  },
  "tag": "list_1"
}

// Service Worker checks expiration before showing
self.addEventListener('push', function(event) {
  const data = event.data.json();
  const expiresAt = new Date(data.data.expires_at);
  
  if (new Date() > expiresAt) {
    console.log('Notification expired, not showing');
    return; // Don't show expired notifications
  }
  
  // Show notification
  self.registration.showNotification(data.title, {
    body: data.body,
    icon: data.icon,
    tag: data.tag,
    data: data.data
  });
});
```

**Benefits:**
- Prevents showing expired notifications
- No server requests needed
- Works offline

**Limitations:**
- Requires accurate expiration times
- No real-time status checking

### Layer 2: Status-Based Expiration (Client-Side)

**Implementation:**
```javascript
// Backend sends notification with status check flag
{
  "title": "New List Published", 
  "body": "List #1 is now available",
  "data": { 
    "list_id": 1,
    "check_status": true,  // Service worker should verify list is still active
    "type": "list_published"
  },
  "tag": "list_1"
}

// Service Worker checks list status before showing
self.addEventListener('push', function(event) {
  const data = event.data.json();
  
  if (data.data.check_status) {
    // Check if list is still active
    fetch(`/api/v1/lists/${data.data.list_id}/status`)
      .then(response => response.json())
      .then(status => {
        if (status.is_active) {
          self.registration.showNotification(data.title, {
            body: data.body,
            icon: data.icon,
            tag: data.tag,
            data: data.data
          });
        } else {
          console.log('List no longer active, not showing notification');
        }
      })
      .catch(error => {
        console.error('Failed to check list status:', error);
        // Optionally show notification anyway, or not
      });
  } else {
    // Show notification without status check
    self.registration.showNotification(data.title, options);
  }
});
```

**Benefits:**
- Real-time status checking
- Handles dynamic expiration
- More accurate than time-based

**Limitations:**
- Requires network request
- May fail if network is unavailable
- Adds latency

### Layer 3: Server-Side Cleanup (Backend)

**Implementation:**
```javascript
// When list expires, backend sends cancellation notification
{
  "title": "List #1 No Longer Available",
  "body": "This list has expired",
  "tag": "list_1",  // Same tag as original notification
  "data": { 
    "action": "cancel",
    "list_id": 1,
    "type": "list_cancelled"
  }
}

// Service Worker handles cancellation
self.addEventListener('push', function(event) {
  const data = event.data.json();
  
  if (data.data.action === 'cancel') {
    // Close any existing notifications with this tag
    self.registration.getNotifications({ tag: data.tag })
      .then(notifications => {
        notifications.forEach(notification => {
          notification.close();
        });
      });
    
    // Optionally show a brief cancellation message
    self.registration.showNotification(data.title, {
      body: data.body,
      tag: data.tag,
      data: data.data,
      requireInteraction: false,  // Auto-dismiss
      silent: true  // No sound
    });
  } else {
    // Handle normal notification
    self.registration.showNotification(data.title, options);
  }
});
```

**Benefits:**
- Immediate cleanup when content expires
- Handles all edge cases
- Server controls the process

**Limitations:**
- Requires backend changes
- More complex implementation

## Recommended Implementation Strategy

### Phase 1: Time-Based Expiration (Quick Win)
- Add `expires_at` field to all notifications
- Implement client-side expiration check
- Set reasonable default expiration times (3-7 days)

### Phase 2: Status-Based Validation (Enhanced Accuracy)
- Add `check_status` flag for critical notifications
- Implement status checking in service worker
- Fallback to time-based if status check fails

### Phase 3: Server-Side Cleanup (Complete Solution)
- Implement cancellation notifications
- Add backend logic to send cancellations when content expires
- Handle edge cases and cleanup

## Implementation Details

### Backend Changes Required

1. **Notification Payload Enhancement:**
```javascript
// Enhanced notification payload
const notificationPayload = {
  title: "New List Published",
  body: "List #1 is now available",
  data: {
    list_id: 1,
    type: "list_published",
    expires_at: "2024-01-15T23:59:59Z",  // Time-based expiration
    check_status: true,  // Status-based validation
    priority: "high"
  },
  tag: "list_1",
  icon: "/icons/list.png"
};
```

2. **Expiration Logic:**
```javascript
// Calculate expiration time
const calculateExpiration = (contentType, contentId) => {
  const now = new Date();
  const expirationHours = {
    'list_published': 72,  // 3 days
    'new_order': 24,       // 1 day
    'admin_login': 1       // 1 hour
  };
  
  const expirationTime = new Date(now.getTime() + (expirationHours[contentType] * 60 * 60 * 1000));
  return expirationTime.toISOString();
};
```

3. **Cancellation System:**
```javascript
// Send cancellation when content expires
const sendCancellationNotification = async (contentType, contentId) => {
  const cancellationPayload = {
    title: "Content No Longer Available",
    body: "This content has expired",
    data: {
      action: "cancel",
      content_type: contentType,
      content_id: contentId
    },
    tag: `${contentType}_${contentId}`,
    requireInteraction: false,
    silent: true
  };
  
  // Send to all subscribed users
  await sendNotificationToSubscribers(cancellationPayload);
};
```

### Frontend Changes Required

1. **Enhanced Service Worker:**
```javascript
// sw.js - Enhanced with expiration handling
self.addEventListener('push', function(event) {
  const data = event.data.json();
  
  // Check for cancellation
  if (data.data.action === 'cancel') {
    handleCancellation(data);
    return;
  }
  
  // Check time-based expiration
  if (data.data.expires_at) {
    const expiresAt = new Date(data.data.expires_at);
    if (new Date() > expiresAt) {
      console.log('Notification expired, not showing');
      return;
    }
  }
  
  // Check status-based expiration
  if (data.data.check_status) {
    checkContentStatus(data).then(isActive => {
      if (isActive) {
        showNotification(data);
      } else {
        console.log('Content no longer active, not showing notification');
      }
    });
  } else {
    showNotification(data);
  }
});

function handleCancellation(data) {
  // Close existing notifications with same tag
  self.registration.getNotifications({ tag: data.tag })
    .then(notifications => {
      notifications.forEach(notification => {
        notification.close();
      });
    });
  
  // Show brief cancellation message
  self.registration.showNotification(data.title, {
    body: data.body,
    tag: data.tag,
    data: data.data,
    requireInteraction: false,
    silent: true
  });
}

async function checkContentStatus(data) {
  try {
    const response = await fetch(`/api/v1/${data.data.content_type}/${data.data.content_id}/status`);
    const status = await response.json();
    return status.is_active;
  } catch (error) {
    console.error('Failed to check content status:', error);
    return false; // Don't show if status check fails
  }
}

function showNotification(data) {
  self.registration.showNotification(data.title, {
    body: data.body,
    icon: data.icon,
    tag: data.tag,
    data: data.data
  });
}
```

## Testing Strategy

### 1. Time-Based Expiration Testing
```javascript
// Test with short expiration times
const testNotification = {
  title: "Test Notification",
  body: "This will expire in 10 seconds",
  data: {
    expires_at: new Date(Date.now() + 10000).toISOString() // 10 seconds
  }
};
```

### 2. Status-Based Testing
```javascript
// Test with status checking
const testNotification = {
  title: "Test List Notification",
  body: "List #999 is available",
  data: {
    list_id: 999,
    check_status: true,
    type: "list_published"
  }
};
```

### 3. Cancellation Testing
```javascript
// Test cancellation flow
const cancellationNotification = {
  title: "List No Longer Available",
  body: "This list has expired",
  data: {
    action: "cancel",
    list_id: 999
  },
  tag: "list_999"
};
```

## Monitoring and Analytics

### 1. Expiration Metrics
- Track how many notifications are expired before showing
- Monitor status check success/failure rates
- Measure cancellation notification effectiveness

### 2. User Experience Metrics
- Monitor notification click-through rates
- Track user complaints about expired content
- Measure notification relevance scores

### 3. System Performance
- Monitor service worker performance
- Track API response times for status checks
- Monitor notification delivery success rates

## Future Enhancements

### 1. Smart Expiration
- Machine learning to predict optimal expiration times
- Dynamic expiration based on content type and user behavior
- Personalized expiration preferences

### 2. Advanced Status Checking
- Real-time content status updates
- WebSocket-based status notifications
- Proactive content availability monitoring

### 3. User Preferences
- Allow users to set expiration preferences
- Custom notification retention periods
- Opt-in/opt-out for different content types

## Conclusion

The multi-layer expiration system provides comprehensive protection against showing expired notifications while maintaining good user experience. The phased implementation approach allows for gradual rollout and testing of each layer.

**Key Benefits:**
- Prevents user confusion from expired content
- Maintains notification relevance
- Improves overall user experience
- Reduces support requests about expired content

**Implementation Priority:**
1. **Phase 1**: Time-based expiration (quick win)
2. **Phase 2**: Status-based validation (enhanced accuracy)  
3. **Phase 3**: Server-side cleanup (complete solution)

This system ensures that users only receive relevant, current notifications while providing multiple layers of protection against expired content.
