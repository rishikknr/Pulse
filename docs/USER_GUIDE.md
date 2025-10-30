# Pulse User Guide

Welcome to Pulse, your comprehensive uptime monitoring solution. This guide will help you get started and make the most of Pulse's features.

## Getting Started

### Logging In

1. Visit the Pulse homepage
2. Click "Sign In" in the top-right corner
3. You will be redirected to the Manus OAuth login page
4. Enter your credentials and authenticate
5. You will be redirected back to Pulse dashboard

### Dashboard Overview

The dashboard provides a quick overview of your monitoring status:

- **Total Targets**: Number of services you're monitoring
- **Active Alerts**: Current alerts requiring attention
- **Average Uptime**: Overall uptime percentage across all targets
- **Response Time**: Average response time for all checks

## Managing Monitoring Targets

### Adding a New Target

1. Navigate to "Targets" in the sidebar
2. Click "Add Target" button
3. Fill in the target details:
   - **Target Name**: Descriptive name for your service
   - **URL**: Domain or IP address (without protocol)
   - **Protocol**: HTTP or HTTPS
   - **Method**: GET, POST, or HEAD
   - **Check Interval**: How often to check (in seconds)
   - **Timeout**: Maximum wait time for response (in seconds)
   - **Expected Status Code**: HTTP code indicating success (usually 200)
4. Click "Create Target"

### Editing a Target

1. Go to "Targets"
2. Find the target you want to edit
3. Click the "Edit" button
4. Modify the settings
5. Click "Save Changes"

### Deleting a Target

1. Go to "Targets"
2. Find the target to delete
3. Click the "Delete" button
4. Confirm the deletion

### Testing a Target

1. Go to "Targets"
2. Click "Test" on the target you want to test
3. The system will perform an immediate health check
4. You'll see the result with response time and status

## Viewing Target Details

1. Click on a target name in the targets list
2. You'll see:
   - **Configuration**: Current monitoring settings
   - **Recent Checks**: Last 24 hours of health checks
   - **Alert Rules**: Rules configured for this target

### Understanding Check Results

Each check shows:
- **Status**: ✓ Success or ✗ Failed
- **Timestamp**: When the check was performed
- **Response Time**: How long the request took (in milliseconds)
- **Status Code**: HTTP response code received

## Managing Alerts

### Creating Alert Rules

1. Go to "Targets" and select a target
2. Click on the target to view details
3. Go to "Alert Rules" tab
4. Click "Create Rule"
5. Configure:
   - **Rule Name**: Descriptive name
   - **Rule Type**: 
     - Consecutive Failures: Alert after N consecutive failed checks
     - Uptime Percentage: Alert if uptime drops below threshold
     - Response Time: Alert if response time exceeds threshold
   - **Threshold**: Number or percentage for the rule
   - **Notification Channels**: Select how to be notified (Email, Slack, Discord)
6. Click "Create Rule"

### Managing Alert Rules

1. Go to "Targets" and select a target
2. View the "Alert Rules" tab
3. You can:
   - **Edit**: Modify rule settings
   - **Disable**: Temporarily disable without deleting
   - **Delete**: Permanently remove the rule

### Viewing Alerts

1. Go to "Alerts" in the sidebar
2. You'll see:
   - **Active Alerts**: Alerts that need attention
   - **All Alerts**: Complete alert history

### Alert Status

Alerts can have three statuses:

- **Triggered**: Alert just occurred, requires action
- **Acknowledged**: You've seen the alert but haven't resolved it
- **Resolved**: Issue has been fixed

### Managing Individual Alerts

1. Go to "Alerts"
2. Click on an alert to view details
3. You can:
   - **Acknowledge**: Mark as seen
   - **Resolve**: Mark as fixed
   - **View History**: See when it was triggered and resolved

## Notification Settings

### Email Notifications

1. Go to "Settings"
2. Click "Notifications" tab
3. Toggle "Email Notifications" on/off
4. Your registered email will receive alerts

### Slack Integration

1. Go to "Settings"
2. Click "Notifications" tab
3. Paste your Slack Webhook URL
4. Click "Save"

To get a Slack Webhook URL:
1. Go to your Slack workspace
2. Create an Incoming Webhook app
3. Copy the webhook URL
4. Paste it in Pulse settings

### Discord Integration

1. Go to "Settings"
2. Click "Notifications" tab
3. Paste your Discord Webhook URL
4. Click "Save"

To get a Discord Webhook URL:
1. Go to your Discord server
2. Right-click a channel → Edit Channel
3. Go to Integrations → Webhooks
4. Click "New Webhook"
5. Copy the webhook URL
6. Paste it in Pulse settings

## Understanding Analytics

### Uptime Percentage

Uptime is calculated as:
```
Uptime % = (Successful Checks / Total Checks) × 100
```

### Response Time

Average response time is the mean of all response times for checks in the period.

### Statistics Periods

- **Daily**: Aggregated statistics for each day
- **Weekly**: Aggregated statistics for each week
- **Monthly**: Aggregated statistics for each month

### Viewing Statistics

1. Click on a target
2. Go to the "Checks" tab
3. Scroll down to see historical data
4. Charts show trends over time

## Account Settings

### Profile Information

1. Go to "Settings"
2. Click "Account" tab
3. View your:
   - Name
   - Email
   - Role (User or Admin)
   - Member since date

### Audit Log

1. Go to "Settings"
2. Click "Audit Log" tab
3. View all actions performed on your account
4. Includes:
   - Action type (Create, Update, Delete)
   - Entity affected
   - Timestamp

### Logging Out

1. Go to "Settings"
2. Click "Account" tab
3. Click "Logout" button
4. You will be logged out and redirected to home page

## Common Tasks

### Setting Up Monitoring for a Website

1. Click "Add Target"
2. Enter your website URL
3. Set check interval to 60 seconds (1 minute)
4. Leave other settings as default
5. Click "Create Target"
6. Create an alert rule for consecutive failures
7. Configure notification channels

### Responding to an Alert

1. Go to "Alerts"
2. Click on the active alert
3. Investigate the issue
4. Once fixed, click "Resolve"
5. The alert will be marked as resolved

### Monitoring API Endpoint

1. Click "Add Target"
2. Enter API URL (e.g., api.example.com/health)
3. Set Method to "GET" (or POST if needed)
4. Set Expected Status Code to 200
5. Set check interval based on your needs
6. Create alert rules as needed

### Checking Historical Data

1. Click on a target
2. Go to "Checks" tab
3. Scroll through recent checks
4. Click on a check to see details
5. Use date filters to view specific periods

## Troubleshooting

### Target Shows as Offline But Website is Up

**Possible causes**:
- Wrong protocol (HTTP vs HTTPS)
- Incorrect expected status code
- Firewall blocking Pulse servers
- Website requires authentication

**Solutions**:
1. Verify the URL is correct
2. Check the protocol setting
3. Verify expected status code matches your website
4. Test manually: `curl -I https://your-website.com`

### Not Receiving Notifications

**Possible causes**:
- Notification settings not configured
- Webhook URL incorrect
- Alert rules not created
- Email marked as spam

**Solutions**:
1. Go to Settings → Notifications
2. Verify channels are enabled
3. Check webhook URLs are correct
4. Create alert rules for your targets
5. Check spam folder for emails

### High Response Times

**Possible causes**:
- Network latency
- Server performance issues
- Timeout setting too high
- Geographic distance

**Solutions**:
1. Check server performance
2. Verify network connectivity
3. Reduce timeout setting if appropriate
4. Consider geographic distribution

### Checks Failing Intermittently

**Possible causes**:
- Network instability
- Server performance issues
- DNS resolution problems
- Rate limiting

**Solutions**:
1. Increase check interval
2. Review server logs
3. Check DNS records
4. Verify rate limits aren't being hit

## Best Practices

### Monitoring Strategy

1. **Start with critical services**: Monitor your most important systems first
2. **Set appropriate intervals**: Balance between responsiveness and load
3. **Configure multiple alert channels**: Don't rely on a single notification method
4. **Test alert rules**: Verify alerts work before relying on them
5. **Review regularly**: Check alert history and adjust rules as needed

### Alert Configuration

1. **Avoid alert fatigue**: Set thresholds to avoid false positives
2. **Use severity levels**: Configure different rules for different severity levels
3. **Escalate appropriately**: Use multiple channels for critical services
4. **Document rules**: Add descriptions to explain why each rule exists

### Data Management

1. **Archive old data**: Regularly export and archive historical data
2. **Review trends**: Look for patterns in uptime and performance
3. **Update targets**: Remove targets no longer in use
4. **Backup settings**: Export your configuration regularly

## Getting Help

### Documentation

- **Architecture**: See `docs/ARCHITECTURE.md` for system design
- **Deployment**: See `docs/DEPLOYMENT.md` for installation guides
- **API Reference**: See `docs/API_REFERENCE.md` for API details

### Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the documentation
3. Check the audit logs for clues
4. Contact support with:
   - Description of the issue
   - Steps to reproduce
   - Screenshots if applicable
   - Relevant log entries

---

**Version**: 1.0.0  
**Last Updated**: 2024
