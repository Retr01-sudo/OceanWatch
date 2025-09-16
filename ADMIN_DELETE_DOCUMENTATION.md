# OceanWatch Admin Delete System Documentation

## Overview
The OceanWatch admin delete system provides secure, role-based report deletion with comprehensive cleanup, real-time updates, and audit logging. This system ensures that only authorized administrators can delete reports while maintaining data integrity and providing complete cleanup of all related data.

## Architecture

### Backend Components

#### 1. Authentication & Authorization
- **Role-based Access Control**: Only users with 'official' role can access delete endpoints
- **JWT Middleware**: `authenticateToken` verifies user authentication
- **Admin Middleware**: `requireOfficial` restricts access to admin users
- **Route Protection**: All delete endpoints protected by both middlewares

#### 2. API Endpoints

##### Single Report Deletion
```
DELETE /api/reports/:id
Authorization: Bearer <admin_jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Report deleted successfully",
  "data": {
    "deletedAt": "2024-01-15T10:30:00.000Z",
    "deletedBy": "admin@oceanwatch.com"
  }
}
```

##### Bulk Report Deletion
```
POST /api/reports/bulk-delete
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json

{
  "reportIds": [1, 2, 3, 4, 5]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Bulk deletion completed. 5 successful, 0 failed.",
  "data": {
    "summary": {
      "total": 5,
      "successful": 5,
      "failed": 0
    },
    "successful": [
      {"id": 1, "title": "Coastal Flooding Report", "deletedAt": "2024-01-15T10:30:00.000Z"},
      {"id": 2, "title": "High Waves Report", "deletedAt": "2024-01-15T10:30:00.000Z"}
    ],
    "failed": [],
    "deletedAt": "2024-01-15T10:30:00.000Z",
    "deletedBy": "admin@oceanwatch.com"
  }
}
```

#### 3. DeletionService Class

**Core Methods:**
- `deleteReportCompletely(reportId, adminUserId)` - Complete single report deletion
- `bulkDeleteReports(reportIds, adminUserId)` - Bulk deletion with individual error handling
- `getDeletionStats()` - Retrieve deletion statistics for admin dashboard

**Deletion Process:**
1. **Validation**: Verify report exists and user permissions
2. **Transaction Start**: Begin database transaction for atomicity
3. **File Cleanup**: Delete associated images and documents
4. **Data Cleanup**: Remove analytics, activity logs, and related data
5. **Report Deletion**: Delete the main report record
6. **Audit Logging**: Record deletion in `deletion_logs` table
7. **Transaction Commit**: Commit all changes or rollback on error

#### 4. Database Schema

**Deletion Logs Table:**
```sql
CREATE TABLE deletion_logs (
  id SERIAL PRIMARY KEY,
  report_id INTEGER NOT NULL,
  deleted_by_admin_id INTEGER NOT NULL,
  deleted_at TIMESTAMP DEFAULT NOW(),
  report_data JSONB NOT NULL,
  deletion_reason TEXT,
  FOREIGN KEY (deleted_by_admin_id) REFERENCES users(id)
);
```

### Frontend Components

#### 1. AdminPanel Component
**Features:**
- **Report Management**: Display all reports with admin controls
- **Bulk Selection**: Checkboxes for selecting multiple reports
- **Action Buttons**: Individual delete, verify, and view buttons
- **Bulk Actions**: Select all, clear selection, bulk delete
- **Real-time Updates**: Automatic refresh when reports are deleted

**Key Functions:**
```typescript
const handleDeleteReport = (report: Report) => {
  setReportToDelete(report);
  setDeleteModalOpen(true);
};

const confirmDeleteReport = async () => {
  await deleteReportFromServer(reportToDelete.id);
  // Real-time UI update via context
};

const confirmBulkDelete = async () => {
  await bulkDeleteReports(selectedReports);
  setSelectedReports([]);
};
```

#### 2. AdminDeleteModal Component
**Features:**
- **Dual Mode**: Handles both single and bulk deletions
- **Report Preview**: Shows detailed report information
- **Warning System**: Clear warnings about permanent deletion
- **Loading States**: Progress indicators during deletion
- **Error Handling**: User-friendly error messages

**Props Interface:**
```typescript
interface AdminDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  report?: Report;
  reports?: Report[];
  type: 'single' | 'bulk';
}
```

#### 3. ReportsContext Integration
**Real-time Updates:**
- `deleteReportFromServer(reportId)` - Delete single report with server sync
- `bulkDeleteReports(reportIds)` - Bulk delete with server sync
- `deleteReport(reportId)` - Local state update only
- Automatic propagation to all consuming components

## Security Features

### 1. Access Control
- **JWT Authentication**: Required for all delete operations
- **Role Verification**: Middleware ensures only 'official' users can delete
- **Request Validation**: Validates report IDs and request parameters
- **CORS Protection**: Configured for secure cross-origin requests

### 2. Input Validation
```javascript
// Report ID validation
const validIds = reportIds.filter(id => Number.isInteger(id) && id > 0);
if (validIds.length !== reportIds.length) {
  return res.status(400).json({
    success: false,
    message: 'All report IDs must be positive integers'
  });
}
```

### 3. Audit Trail
- **Complete Logging**: All deletions recorded with timestamp and admin details
- **Data Preservation**: Original report data stored in JSON format
- **Deletion Reason**: Optional field for recording deletion justification
- **Admin Tracking**: Links deletions to specific admin users

## Real-time Updates

### 1. Frontend State Management
- **React Context**: Centralized state management for reports
- **Optimistic Updates**: Immediate UI updates with server sync
- **Error Handling**: Rollback on server errors with user notification
- **Component Synchronization**: All components automatically updated

### 2. Affected Components
- **MapView**: Markers removed immediately from map
- **ActivityFeed**: Reports removed from activity timeline
- **DashboardStats**: Statistics updated to exclude deleted reports
- **AdminPanel**: Report list updated in real-time

### 3. Update Flow
```
User Action → AdminDeleteModal → ReportsContext → Server API → 
Local State Update → Component Re-render → UI Update
```

## Error Handling

### 1. Backend Error Responses
```javascript
// Report not found
{
  "success": false,
  "message": "Report not found or already deleted",
  "code": "REPORT_NOT_FOUND"
}

// Permission denied
{
  "success": false,
  "message": "Official access required",
  "code": "INSUFFICIENT_PERMISSIONS"
}

// Database error
{
  "success": false,
  "message": "Internal server error during deletion",
  "debug": "Connection timeout" // Development only
}
```

### 2. Frontend Error Handling
- **User Notifications**: Toast messages for success/error states
- **Modal Error Display**: In-modal error messages with retry options
- **Graceful Degradation**: Fallback to refresh on critical errors
- **Loading States**: Clear indicators during async operations

## Testing

### 1. Integration Tests
**File**: `packages/backend-api/tests/admin-delete.test.js`

**Test Coverage:**
- Admin authentication and authorization
- Single report deletion success/failure scenarios
- Bulk deletion with mixed success/failure results
- Input validation for various edge cases
- Cascading deletion verification
- Audit logging verification

**Running Tests:**
```bash
cd packages/backend-api
npm test -- admin-delete.test.js
```

### 2. Manual Testing Checklist

#### Admin Authentication
- [ ] Login as admin user (role: 'official')
- [ ] Verify AdminPanel appears on dashboard
- [ ] Confirm citizen users cannot see admin controls

#### Single Report Deletion
- [ ] Click delete button on individual report
- [ ] Verify confirmation modal appears with report details
- [ ] Confirm deletion removes report from all views
- [ ] Check map marker is removed immediately
- [ ] Verify activity feed updates in real-time

#### Bulk Report Deletion
- [ ] Select multiple reports using checkboxes
- [ ] Click "Delete Selected" button
- [ ] Verify bulk confirmation modal shows all selected reports
- [ ] Confirm all selected reports are deleted
- [ ] Check statistics update correctly

#### Error Scenarios
- [ ] Test deletion of non-existent report
- [ ] Verify citizen user gets 403 error on delete attempt
- [ ] Test network error handling
- [ ] Confirm proper error messages displayed

## Deployment Considerations

### 1. Database Migrations
Ensure `deletion_logs` table exists in production:
```sql
-- Run this migration before deploying
CREATE TABLE IF NOT EXISTS deletion_logs (
  id SERIAL PRIMARY KEY,
  report_id INTEGER NOT NULL,
  deleted_by_admin_id INTEGER NOT NULL,
  deleted_at TIMESTAMP DEFAULT NOW(),
  report_data JSONB NOT NULL,
  deletion_reason TEXT
);
```

### 2. Environment Variables
Required environment variables:
- `JWT_SECRET` - For token verification
- `DATABASE_URL` - PostgreSQL connection string
- `NODE_ENV` - Set to 'production' for production deployment

### 3. File Cleanup
Ensure proper file system permissions for image deletion:
- Upload directory must be writable by application
- Consider implementing background cleanup for orphaned files
- Monitor disk space usage

## Monitoring and Maintenance

### 1. Audit Log Monitoring
- Regular review of deletion logs for unusual activity
- Monitor deletion frequency and patterns
- Track admin user deletion activities

### 2. Performance Considerations
- Index `deletion_logs` table on `deleted_at` and `deleted_by_admin_id`
- Consider archiving old deletion logs
- Monitor database transaction performance

### 3. Backup Strategy
- Ensure deletion logs are included in database backups
- Consider separate backup of report data before deletion
- Implement point-in-time recovery for accidental deletions

## Future Enhancements

### 1. Soft Delete Option
- Implement soft delete with `deleted_at` timestamp
- Allow report recovery within time window
- Archive instead of permanent deletion

### 2. Batch Operations
- Scheduled cleanup of old reports
- Bulk operations based on criteria (date, type, etc.)
- Export functionality before deletion

### 3. Enhanced Audit Trail
- Detailed change tracking
- Integration with external audit systems
- Compliance reporting features

## Support and Troubleshooting

### Common Issues

1. **403 Forbidden Error**: User lacks 'official' role
2. **404 Not Found**: Report already deleted or doesn't exist
3. **500 Server Error**: Database connection or transaction issues
4. **UI Not Updating**: Check React context provider setup

### Debug Commands
```bash
# Check user roles
SELECT id, email, role FROM users WHERE email = 'admin@oceanwatch.com';

# View deletion logs
SELECT * FROM deletion_logs ORDER BY deleted_at DESC LIMIT 10;

# Check report existence
SELECT id, event_type, created_at FROM reports WHERE id = 123;
```

This comprehensive admin delete system ensures secure, auditable, and user-friendly report management for OceanWatch administrators while maintaining data integrity and providing excellent user experience.
