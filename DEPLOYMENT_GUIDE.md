# Deployment Guide - TrustaSitter

## Issues Identified and Solutions

### 1. Environment Variables

**Issue:** The frontend was using `process.env.REACT_APP_API_URL` but the project uses Vite, which requires `VITE_` as prefix.

**Solution:** 
- Changed to `import.meta.env.VITE_API_URL`
- Added fallback for Azure URL
- Updated GitHub Actions workflow

### 2. CORS Configuration

**Issue:** CORS was too permissive and may not be working correctly on Azure.

**Solution:**
- Configured specific CORS for Azure domains
- Added support for credentials
- Included necessary headers

### 3. Logs and Debug

**Issue:** There weren't enough logs to debug communication issues.

**Solution:**
- Added Axios interceptors for request/response logs
- Added logging middleware in backend
- Created connection test component

## Azure Configuration

### Backend (Azure App Service)

1. **Environment Variables:**
   - `JWT_SECRET`: Secret key for JWT (ex: `trustasitter_jwt_secret_key_2024_secure_and_long_enough`)
   - `PORT`: 3000 (or leave default)

2. **CORS Configuration:**
   - Backend is already configured to accept requests from Azure domain

### Frontend (Azure Static Web Apps)

1. **Environment Variables:**
   - `VITE_API_URL`: Backend API URL (ex: `https://trustasitter-api-cwahftcwg4e5axah.australiaeast-01.azurewebsites.net/api`)

2. **Build Configuration:**
   - GitHub Actions workflow is already configured

## Testing Connection

1. Access the login page
2. Use the "Test Connection" button to verify frontend can communicate with backend
3. Check browser console logs (F12)

## Troubleshooting

### If connection test fails:

1. **Check API URL:**
   - Confirm backend URL is correct
   - Test URL directly in browser: `https://trustasitter-api-cwahftcwg4e5axah.australiaeast-01.azurewebsites.net/api/health`

2. **Check backend logs:**
   - Access Azure App Service logs
   - Look for CORS or database connection errors

3. **Check database:**
   - Confirm PostgreSQL database is accessible
   - Verify credentials are correct

### If login fails:

1. **Check console logs:**
   - Open DevTools (F12)
   - Go to Console tab
   - Try to login and see request/response logs

2. **Check JWT_SECRET:**
   - Confirm variable is defined in Azure
   - Should be a long and secure string

## Useful Commands

```bash
# Test API locally
curl https://trustasitter-api-cwahftcwg4e5axah.australiaeast-01.azurewebsites.net/api/health

# Check environment variables in Azure
az webapp config appsettings list --name trustasitter-api-cwahftcwg4e5axah --resource-group YOUR_RESOURCE_GROUP
``` 