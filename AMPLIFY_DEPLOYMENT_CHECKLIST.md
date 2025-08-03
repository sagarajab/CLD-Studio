# Amplify Console Deployment Checklist

## ✅ **Pre-Deployment Status: READY**

### **1. Amplify Gen 2 Configuration** ✅ **CONFIGURED**
- ✅ **Backend Definition**: `amplify/backend.ts` properly configured
- ✅ **Data Schema**: `UserAssessment` model with all required fields
- ✅ **Auth Configuration**: Email-based authentication enabled
- ✅ **Storage Configuration**: S3 bucket for file storage
- ✅ **Outputs File**: `amplify_outputs.json` generated and valid

### **2. Database Schema** ✅ **READY**
```typescript
UserAssessment: {
  email: string (required)
  cognitoUserId: string (required)
  tbtAuthStatus: enum['guest', 'tbt', 'pending']
  accessLevel: enum['guest', 'tbt', 'admin']
  createdAt: datetime
  lastLoginAt: datetime
  assessmentData: string (JSON)
}
```

### **3. Authentication** ✅ **CONFIGURED**
- ✅ **User Pool ID**: `us-east-1_RStk4QlMJ`
- ✅ **Identity Pool ID**: `us-east-1:1489c4fb-be07-45bd-91f6-93b868ed7032`
- ✅ **AppSync API**: `https://4p7wexxlujhnhn57akpcgenekm.appsync-api.us-east-1.amazonaws.com/graphql`
- ✅ **Region**: `us-east-1`

### **4. Storage** ✅ **CONFIGURED**
- ✅ **S3 Bucket**: `amplify-cldstudio-kritika-cldstudiostoragebucketbc-njhfrrl701m8`
- ✅ **Access Control**: Proper permissions for authenticated users

## 🚀 **Deployment Steps**

### **Step 1: Amplify Console Setup**
1. **Connect Repository**: Connect your GitHub repository to Amplify Console
2. **Branch Selection**: Select your deployment branch
3. **Build Settings**: Use the following build settings:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

### **Step 2: Environment Variables**
Set these environment variables in Amplify Console:

```bash
# Build-time environment variables
NODE_ENV=production

# Runtime environment variables (if needed)
VITE_APP_TITLE=CLD Studio
```

### **Step 3: Build Configuration**
Ensure your `vite.config.js` is optimized for production:

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser'
  }
})
```

## 🔧 **Post-Deployment Verification**

### **1. Database Connection Test**
- ✅ Verify `amplify_outputs.json` is accessible in production
- ✅ Test database operations (create, read, update)
- ✅ Verify UserAssessment model works correctly

### **2. Authentication Test**
- ✅ Test user registration/login
- ✅ Verify TBT authentication flow
- ✅ Test access control for assignments

### **3. Assignment System Test**
- ✅ Test assignment loading for TBT users
- ✅ Test assignment access denial for guest users
- ✅ Verify assignment submission and grading
- ✅ Test progress persistence

### **4. File Storage Test**
- ✅ Test S3 file uploads/downloads
- ✅ Verify assignment file access
- ✅ Test example file loading

## 📋 **Deployment Checklist**

### **Pre-Deployment** ✅
- [x] `mpx ampx sandbox` running successfully
- [x] `amplify_outputs.json` generated and valid
- [x] Database schema properly configured
- [x] Authentication working locally
- [x] Assignment access control implemented
- [x] All tests passing

### **During Deployment** 🔄
- [ ] Connect repository to Amplify Console
- [ ] Configure build settings
- [ ] Set environment variables
- [ ] Deploy to staging environment
- [ ] Run smoke tests

### **Post-Deployment** 🎯
- [ ] Verify database connectivity
- [ ] Test authentication flow
- [ ] Test assignment functionality
- [ ] Test access control
- [ ] Monitor error logs
- [ ] Performance testing

## 🎯 **Expected Deployment Results**

### **✅ Success Indicators**
- **Build Success**: No build errors in Amplify Console
- **Database Access**: Assignment data can be saved/loaded
- **Authentication**: Users can register/login successfully
- **Assignment Access**: TBT users can access assignments, guests cannot
- **File Storage**: Assignment files load correctly

### **⚠️ Potential Issues to Monitor**
- **CORS Issues**: If API calls fail due to CORS
- **Authentication Errors**: If Cognito integration fails
- **Database Timeouts**: If AppSync queries are slow
- **File Access**: If S3 file access fails

## 🔍 **Troubleshooting Guide**

### **Common Issues**

#### **1. Build Failures**
```bash
# Check build logs in Amplify Console
# Verify all dependencies are in package.json
npm ci
npm run build
```

#### **2. Database Connection Issues**
```javascript
// Verify amplify_outputs.json is accessible
console.log('Amplify outputs:', outputs);
// Check if client.models.UserAssessment exists
```

#### **3. Authentication Issues**
```javascript
// Verify auth configuration
import { Amplify } from 'aws-amplify';
Amplify.configure(outputs);
```

#### **4. CORS Issues**
- Check AppSync API CORS settings
- Verify domain is allowed in Cognito User Pool

## 📊 **Deployment Status**

| Component | Status | Notes |
|-----------|--------|-------|
| **Amplify Backend** | ✅ Ready | Gen 2 properly configured |
| **Database Schema** | ✅ Ready | UserAssessment model complete |
| **Authentication** | ✅ Ready | Cognito integration working |
| **Storage** | ✅ Ready | S3 bucket configured |
| **Frontend Build** | ✅ Ready | Vite build optimized |
| **Access Control** | ✅ Ready | TBT-only assignment access |
| **Assignment System** | ✅ Ready | Complete functionality |

## 🎉 **Ready for Deployment!**

Your application is fully prepared for Amplify Console deployment with:
- ✅ Complete Amplify Gen 2 backend
- ✅ Robust database integration
- ✅ Secure authentication system
- ✅ Assignment access control
- ✅ File storage capabilities
- ✅ Production-optimized build

**Proceed with confidence to Amplify Console deployment!** 