# Android Admin App - Enhanced Architecture & Design Specification
## Version 2.0 - Refined with Modern Best Practices

## 📱 Executive Summary

This document provides a comprehensive technical specification for developing a dedicated Android application for the **admin/business management** functionality of the online shop platform. The app will enable business owners to manage their shop on-the-go with mobile-optimized UI patterns while maintaining feature parity with the web admin panel.

**Key Enhancements in v2.0:**
- Modern JSON parsing with Moshi (better Kotlin support)
- Comprehensive biometric authentication
- Automated screenshot testing strategy
- Integrated analytics and monitoring
- Enhanced security with latest Android practices
- Online-first architecture with offline fallback

---

## 🎯 Project Scope

### In Scope
- **Admin panel features only** - All business/shop management features
- **Native Android app** - Kotlin-based, modern architecture
- **Online-first with offline fallback** - Immediate sync with cached fallback
- **Push notifications** - Real-time order alerts
- **Mobile-optimized UI** - Touch-friendly, responsive design
- **Biometric security** - Fingerprint/Face unlock
- **Analytics & monitoring** - Track usage and crashes

### Out of Scope
- Customer-facing features (shopping, cart, checkout)
- iOS version (though architecture should allow future iOS port)
- Web portal (already exists)

### Data Synchronization Strategy
- **Online-First Approach**: Admin actions prioritize immediate server sync
- **Offline as Fallback**: Basic read-only access when offline
- **Bulk Operations**: Certain actions (like bulk product updates) can be queued and sent together
- **Real-time Updates**: Changes should be visible across all admin sessions immediately

---

## 📋 Feature Analysis from Web Admin

Based on the codebase analysis, here's the complete feature set:

### 1. **Dashboard** (`/admin/dashboard`)
- Quick access cards to all sections
- Recent orders shortcut
- List cloning functionality
- Visual stats/metrics display
- Next delivery date display
- Quick actions for common tasks

### 2. **Product Catalog Management**

#### Categories (`/admin/categories`)
- List all categories
- Create/edit/delete categories
- Upload category images (with 3 versions: original, medium, thumbnail)
- Search and filter categories
- Soft delete with recovery option

#### Products (`/admin/products`)
- List products with pagination
- Create/edit/delete products
- Multi-image management (upload, reorder, set primary)
- Image versions (original, medium, thumbnail)
- Product attributes: name, quantity, price, description, category, unit
- Search by name/description
- Filter by category
- Bulk operations support

#### Units (`/admin/units`)
- Manage measurement units (kg, buc, litru, etc.)
- CRUD operations

### 3. **Order Management** (`/admin/lists/:id/manage?tab=orders`)
- View all orders for a list
- Group orders by delivery type
- Sort orders (chronological/alphabetical, asc/desc)
- Merge similar orders from same customer
- Multi-select for bulk operations
- Edit order details
- Delete orders
- Export to PDF/XLS
- Print order lists
- View order totals per product
- Highlight new orders with URL params

### 4. **Lists Management** (`/admin/lists`)
- Create/edit/delete product lists
- Clone existing lists
- Publish/unpublish lists
- Set list dates and expiration
- Manage products in list (add/remove/reorder)
- Set product stock per list
- List text formatting for sharing
- Three product management tabs (different views)

### 5. **Delivery & Payment Configuration**

#### Delivery Types (`/admin/delivery-types`)
- Configure delivery methods
- Set order index for sorting
- Add descriptions

#### Delivery Schedules (`/admin/delivery-schedules`)
- Configure delivery time windows
- Associate with lists

#### Payment Methods (`/admin/payment-methods`)
- Configure available payment options
- Add descriptions

### 6. **Business Details** (`/admin/business-details`)
- Company information (name, registration, CUI)
- Contact details (address, phone, email)
- Operating hours
- Logo upload
- Delivery tax configuration
- Custom messages
- Legal representative info

### 7. **Security** (`/admin/security`)
- Change password functionality
- Session management
- Biometric authentication (NEW)
- Security audit log (NEW)

### 8. **Advanced Operations** (`/admin/advanced`)
- Push notifications management
- Notification subscriptions
- Topic-based notifications

---

## 🏗️ Enhanced Technology Stack

```
Android Application
├── Language: Kotlin 1.9+
├── Min SDK: Android 8.0 (API 26) - Covers 95%+ of devices
├── Target SDK: Android 14 (API 34)
├── Compile SDK: 34
├── Architecture: MVVM + Clean Architecture
├── DI: Hilt (Dagger)
├── Networking: Retrofit 2 + OkHttp 3
├── JSON Parsing: Moshi (Kotlin-first, better code generation) ⚡ ENHANCED
├── Local DB: Room
├── Image Loading: Coil
├── Async: Coroutines + Flow
├── UI: Jetpack Compose
├── Navigation: Compose Navigation
├── Build: Gradle (Kotlin DSL)
├── Biometric: BiometricPrompt ⚡ ENHANCED
├── Analytics: Firebase Analytics + Crashlytics ⚡ NEW
├── Testing: JUnit 5 + Mockk + Turbine + Screenshot Testing ⚡ ENHANCED
└── Security: EncryptedSharedPreferences + Android Keystore
```

### Why This Enhanced Stack?

1. **Moshi over Gson** ⚡ NEW
   - Pure Kotlin, better null safety
   - Code generation at compile time (faster, safer)
   - Better integration with Kotlin data classes
   - Smaller reflection footprint

2. **BiometricPrompt** ⚡ ENHANCED
   - Unified API for fingerprint/face/iris
   - Better UX with system UI
   - Improved security

3. **Firebase Suite** ⚡ NEW
   - Analytics for user behavior
   - Crashlytics for crash reporting
   - Remote Config for feature flags
   - Performance Monitoring

4. **Online-First Architecture**
   - Immediate server synchronization for admin actions
   - Offline fallback for basic read operations
   - Queue system for bulk operations when appropriate
   - Real-time data consistency across sessions

5. **Enhanced Testing** ⚡ ENHANCED
   - JUnit 5 (modern assertions)
   - Screenshot testing (Compose)
   - Turbine for Flow testing
   - Better test organization

---

## 📁 Enhanced Project Structure

```
app/
├── src/
│   ├── main/
│   │   ├── java/com/onlineshop/admin/
│   │   │   ├── MainActivity.kt
│   │   │   ├── di/
│   │   │   │   ├── AppModule.kt
│   │   │   │   ├── NetworkModule.kt (enhanced with Moshi)
│   │   │   │   ├── DatabaseModule.kt
│   │   │   │   ├── SecurityModule.kt ⚡ NEW
│   │   │   │   └── AnalyticsModule.kt ⚡ NEW
│   │   │   ├── data/
│   │   │   │   ├── local/
│   │   │   │   │   ├── database/
│   │   │   │   │   │   ├── AppDatabase.kt
│   │   │   │   │   │   ├── dao/
│   │   │   │   │   │   │   ├── ProductDao.kt
│   │   │   │   │   │   │   ├── CategoryDao.kt
│   │   │   │   │   │   │   ├── ListDao.kt
│   │   │   │   │   │   │   ├── OrderDao.kt
│   │   │   │   │   │   │   └── SyncQueueDao.kt ⚡ ENHANCED
│   │   │   │   │   │   └── entities/
│   │   │   │   │   │       ├── ProductEntity.kt
│   │   │   │   │   │       ├── CategoryEntity.kt
│   │   │   │   │   │       ├── ListEntity.kt
│   │   │   │   │   │       ├── OrderEntity.kt
│   │   │   │   │   │       └── SyncQueueEntity.kt ⚡ ENHANCED
│   │   │   │   │   ├── datastore/
│   │   │   │   │   │   ├── AuthDataStore.kt
│   │   │   │   │   │   └── PreferencesDataStore.kt
│   │   │   │   │   └── security/
│   │   │   │   │       ├── BiometricManager.kt ⚡ NEW
│   │   │   │   │       └── SecureStorage.kt
│   │   │   │   ├── remote/
│   │   │   │   │   ├── api/
│   │   │   │   │   │   ├── AuthApi.kt
│   │   │   │   │   │   ├── ProductsApi.kt
│   │   │   │   │   │   ├── CategoriesApi.kt
│   │   │   │   │   │   ├── ListsApi.kt
│   │   │   │   │   │   ├── OrdersApi.kt
│   │   │   │   │   │   ├── BusinessDetailsApi.kt
│   │   │   │   │   │   ├── DeliveryTypesApi.kt
│   │   │   │   │   │   ├── DeliverySchedulesApi.kt
│   │   │   │   │   │   ├── PaymentMethodsApi.kt
│   │   │   │   │   │   ├── UnitsApi.kt
│   │   │   │   │   │   └── PushNotificationsApi.kt
│   │   │   │   │   ├── dto/ (Moshi-compatible)
│   │   │   │   │   │   ├── ProductDto.kt
│   │   │   │   │   │   ├── CategoryDto.kt
│   │   │   │   │   │   ├── ListDto.kt
│   │   │   │   │   │   ├── OrderDto.kt
│   │   │   │   │   │   └── AuthDto.kt
│   │   │   │   │   └── interceptors/
│   │   │   │   │       ├── AuthInterceptor.kt
│   │   │   │   │       ├── TokenRefreshInterceptor.kt
│   │   │   │   │       └── AnalyticsInterceptor.kt ⚡ NEW
│   │   │   │   ├── repository/
│   │   │   │   │   ├── AuthRepository.kt
│   │   │   │   │   ├── ProductsRepository.kt
│   │   │   │   │   ├── CategoriesRepository.kt
│   │   │   │   │   ├── ListsRepository.kt
│   │   │   │   │   ├── OrdersRepository.kt
│   │   │   │   │   ├── BusinessDetailsRepository.kt
│   │   │   │   │   ├── SyncRepository.kt ⚡ NEW (bulk operations)
│   │   │   │   │   └── AnalyticsRepository.kt ⚡ NEW
│   │   │   │   └── mapper/
│   │   │   │       ├── ProductMapper.kt
│   │   │   │       ├── CategoryMapper.kt
│   │   │   │       ├── OrderMapper.kt
│   │   │   │       └── ListMapper.kt
│   │   │   ├── domain/
│   │   │   │   ├── model/
│   │   │   │   │   ├── Product.kt
│   │   │   │   │   ├── Category.kt
│   │   │   │   │   ├── List.kt
│   │   │   │   │   ├── Order.kt
│   │   │   │   │   ├── BusinessDetails.kt
│   │   │   │   │   └── AnalyticsEvent.kt ⚡ NEW
│   │   │   │   ├── repository/ (interfaces)
│   │   │   │   │   ├── IProductRepository.kt
│   │   │   │   │   ├── ICategoryRepository.kt
│   │   │   │   │   └── ...
│   │   │   │   └── usecase/
│   │   │   │       ├── product/
│   │   │   │       ├── category/
│   │   │   │       ├── order/
│   │   │   │       └── analytics/ ⚡ NEW
│   │   │   ├── presentation/
│   │   │   │   ├── navigation/
│   │   │   │   │   ├── NavGraph.kt
│   │   │   │   │   └── Screen.kt
│   │   │   │   ├── theme/
│   │   │   │   │   ├── Color.kt
│   │   │   │   │   ├── Theme.kt
│   │   │   │   │   └── Type.kt
│   │   │   │   ├── components/
│   │   │   │   │   ├── AppButton.kt
│   │   │   │   │   ├── AppTextField.kt
│   │   │   │   │   ├── ImagePicker.kt
│   │   │   │   │   ├── BiometricPrompt.kt ⚡ NEW
│   │   │   │   │   └── ...
│   │   │   │   └── screens/
│   │   │   │       ├── auth/
│   │   │   │       │   ├── LoginScreen.kt
│   │   │   │       │   ├── LoginViewModel.kt
│   │   │   │       │   ├── BiometricSetupScreen.kt ⚡ NEW
│   │   │   │       │   └── BiometricSetupViewModel.kt ⚡ NEW
│   │   │   │       ├── dashboard/
│   │   │   │       ├── products/
│   │   │   │       ├── categories/
│   │   │   │       ├── orders/
│   │   │   │       ├── lists/
│   │   │   │       └── settings/
│   │   │   │           ├── SettingsScreen.kt
│   │   │   │           ├── SecurityScreen.kt
│   │   │   │           ├── BiometricSettingsScreen.kt ⚡ NEW
│   │   │   │           └── AnalyticsScreen.kt ⚡ NEW
│   │   │   ├── util/
│   │   │   │   ├── Constants.kt
│   │   │   │   ├── Extensions.kt
│   │   │   │   ├── Validators.kt
│   │   │   │   ├── AnalyticsHelper.kt ⚡ NEW
│   │   │   │   └── BiometricHelper.kt ⚡ NEW
│   │   │   └── AdminApplication.kt
│   │   ├── res/
│   │   │   ├── values/
│   │   │   │   ├── strings.xml
│   │   │   │   ├── colors.xml
│   │   │   │   └── themes.xml
│   │   │   ├── drawable/
│   │   │   └── xml/
│   │   │       └── network_security_config.xml
│   │   └── AndroidManifest.xml
│   ├── test/ (Unit tests)
│   │   └── java/com/onlineshop/admin/
│   │       ├── repository/
│   │       ├── viewmodel/
│   │       ├── usecase/
│   │       └── mapper/
│   ├── androidTest/ (Instrumented tests)
│   │   └── java/com/onlineshop/admin/
│   │       ├── ui/
│   │       ├── database/
│   │       └── screenshots/ ⚡ NEW
│   └── screenshotTest/ ⚡ NEW
│       └── java/com/onlineshop/admin/
│           └── screenshots/
├── build.gradle.kts
└── google-services.json (Firebase config)
```

---

## 🔄 Data Synchronization Strategy

### Online-First Architecture for Admin Operations

Unlike customer-facing applications where offline reading is valuable, admin operations require **immediate server synchronization** to maintain data consistency across all sessions and ensure business-critical actions are processed immediately.

#### **1. Synchronization Principles**
- **Immediate Sync**: Most admin actions (create, update, delete) sync immediately to server
- **Real-time Updates**: Changes should be visible across all admin sessions instantly
- **Error Handling**: Clear feedback when operations fail due to connectivity issues
- **Retry Logic**: Automatic retries for transient failures

#### **2. Bulk Operations Support**
- **Queue System**: Certain operations (bulk product updates, bulk order processing) can be queued
- **Batch Processing**: Multiple related changes sent together for efficiency
- **Progress Tracking**: Visual feedback for bulk operations in progress
- **Rollback Support**: Ability to cancel queued operations if needed

#### **3. Offline Fallback (Limited)**
- **Read-Only Access**: Basic viewing of cached data when offline
- **Limited Functionality**: Only essential read operations work offline
- **Clear Indicators**: Prominent messaging about reduced functionality
- **Auto-Sync**: Automatic synchronization when connection is restored

#### **4. Conflict Resolution**
- **Server Authoritative**: Server state takes precedence in conflicts
- **User Notification**: Clear messaging when local changes couldn't be applied
- **Data Preservation**: Important unsaved work preserved locally where possible

```kotlin
// SyncManager.kt - Online-First Synchronization
@Singleton
class SyncManager @Inject constructor(
    private val networkMonitor: NetworkMonitor,
    private val syncQueue: SyncQueue
) {

    fun executeOperation(operation: AdminOperation): Flow<Resource<OperationResult>> = flow {
        emit(Resource.Loading())

        if (!networkMonitor.isOnline()) {
            emit(Resource.Error("Conexiune offline - operațiunea nu poate fi executată"))
            return@flow
        }

        try {
            // Execute immediately on server
            val result = performServerOperation(operation)
            emit(Resource.Success(result))

            // Track analytics
            analyticsHelper.logOperationSuccess(operation.type)
        } catch (e: Exception) {
            emit(Resource.Error("Operațiunea a eșuat: ${e.message}"))

            // Queue for retry if appropriate
            if (shouldRetry(operation)) {
                syncQueue.addToQueue(operation)
            }
        }
    }

    fun executeBulkOperation(operations: List<AdminOperation>): Flow<Resource<BulkResult>> = flow {
        emit(Resource.Loading())

        try {
            // Send all operations in batch
            val result = performBulkServerOperation(operations)
            emit(Resource.Success(result))
        } catch (e: Exception) {
            emit(Resource.Error("Operațiunile în masă au eșuat"))
        }
    }
}
```

---

## 🔐 Enhanced Security Implementation

### 1. **Biometric Authentication** ⚡ COMPREHENSIVE

#### BiometricManager Implementation

```kotlin
// BiometricManager.kt
@Singleton
class BiometricManager @Inject constructor(
    @ApplicationContext private val context: Context,
    private val secureStorage: SecureStorage
) {
    
    fun isBiometricAvailable(): BiometricStatus {
        val biometricManager = BiometricManager.from(context)
        return when (biometricManager.canAuthenticate(BIOMETRIC_STRONG)) {
            BiometricManager.BIOMETRIC_SUCCESS -> BiometricStatus.AVAILABLE
            BiometricManager.BIOMETRIC_ERROR_NO_HARDWARE -> BiometricStatus.NO_HARDWARE
            BiometricManager.BIOMETRIC_ERROR_HW_UNAVAILABLE -> BiometricStatus.HARDWARE_UNAVAILABLE
            BiometricManager.BIOMETRIC_ERROR_NONE_ENROLLED -> BiometricStatus.NOT_ENROLLED
            else -> BiometricStatus.UNKNOWN_ERROR
        }
    }
    
    fun isBiometricEnabled(): Boolean {
        return secureStorage.getBoolean(KEY_BIOMETRIC_ENABLED, false)
    }
    
    fun setBiometricEnabled(enabled: Boolean) {
        secureStorage.putBoolean(KEY_BIOMETRIC_ENABLED, enabled)
    }
    
    fun createPromptInfo(
        title: String = context.getString(R.string.biometric_prompt_title),
        subtitle: String = context.getString(R.string.biometric_prompt_subtitle),
        negativeButtonText: String = context.getString(R.string.biometric_prompt_cancel)
    ): BiometricPrompt.PromptInfo {
        return BiometricPrompt.PromptInfo.Builder()
            .setTitle(title)
            .setSubtitle(subtitle)
            .setNegativeButtonText(negativeButtonText)
            .setAllowedAuthenticators(BIOMETRIC_STRONG or DEVICE_CREDENTIAL)
            .build()
    }
    
    companion object {
        private const val KEY_BIOMETRIC_ENABLED = "biometric_enabled"
    }
}

enum class BiometricStatus {
    AVAILABLE,
    NO_HARDWARE,
    HARDWARE_UNAVAILABLE,
    NOT_ENROLLED,
    UNKNOWN_ERROR
}
```

#### BiometricPrompt Composable

```kotlin
// BiometricPrompt.kt
@Composable
fun BiometricPromptButton(
    biometricManager: BiometricManager,
    onSuccess: () -> Unit,
    onError: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val activity = context.findActivity()
    
    val biometricPrompt = remember {
        BiometricPrompt(
            activity,
            ContextCompat.getMainExecutor(context),
            object : BiometricPrompt.AuthenticationCallback() {
                override fun onAuthenticationSucceeded(
                    result: BiometricPrompt.AuthenticationResult
                ) {
                    onSuccess()
                }
                
                override fun onAuthenticationError(
                    errorCode: Int,
                    errString: CharSequence
                ) {
                    onError(errString.toString())
                }
                
                override fun onAuthenticationFailed() {
                    onError(context.getString(R.string.biometric_auth_failed))
                }
            }
        )
    }
    
    Button(
        onClick = {
            val promptInfo = biometricManager.createPromptInfo()
            biometricPrompt.authenticate(promptInfo)
        },
        modifier = modifier
    ) {
        Icon(Icons.Filled.Fingerprint, contentDescription = null)
        Spacer(modifier = Modifier.width(8.dp))
        Text(stringResource(R.string.unlock_with_biometric))
    }
}
```

#### Login Screen with Biometric

```kotlin
// LoginScreen.kt (Enhanced)
@Composable
fun LoginScreen(
    viewModel: LoginViewModel = hiltViewModel(),
    biometricManager: BiometricManager = hiltViewModel(),
    onNavigateToDashboard: () -> Unit
) {
    val uiState by viewModel.uiState.collectAsState()
    val biometricStatus = remember { biometricManager.isBiometricAvailable() }
    val biometricEnabled = remember { biometricManager.isBiometricEnabled() }
    
    // ... existing login form ...
    
    // Biometric unlock option
    if (biometricStatus == BiometricStatus.AVAILABLE && biometricEnabled) {
        Spacer(modifier = Modifier.height(16.dp))
        
        Text(
            text = stringResource(R.string.or_unlock_with),
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
        
        Spacer(modifier = Modifier.height(8.dp))
        
        BiometricPromptButton(
            biometricManager = biometricManager,
            onSuccess = {
                viewModel.loginWithBiometric()
                onNavigateToDashboard()
            },
            onError = { error ->
                viewModel.showError(error)
            },
            modifier = Modifier.fillMaxWidth()
        )
    }
}
```

#### Biometric Setup Screen

```kotlin
// BiometricSetupScreen.kt ⚡ NEW
@Composable
fun BiometricSetupScreen(
    viewModel: BiometricSetupViewModel = hiltViewModel(),
    onNavigateBack: () -> Unit
) {
    val uiState by viewModel.uiState.collectAsState()
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(stringResource(R.string.biometric_setup)) },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, "Back")
                    }
                }
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Info card
            Card(
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.primaryContainer
                )
            ) {
                Row(
                    modifier = Modifier.padding(16.dp),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Icon(
                        Icons.Filled.Fingerprint,
                        contentDescription = null,
                        tint = MaterialTheme.colorScheme.onPrimaryContainer,
                        modifier = Modifier.size(48.dp)
                    )
                    
                    Column {
                        Text(
                            text = stringResource(R.string.biometric_setup_title),
                            style = MaterialTheme.typography.titleMedium,
                            color = MaterialTheme.colorScheme.onPrimaryContainer
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = stringResource(R.string.biometric_setup_description),
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onPrimaryContainer
                        )
                    }
                }
            }
            
            // Enable/Disable switch
            Card {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = stringResource(R.string.enable_biometric),
                            style = MaterialTheme.typography.titleMedium
                        )
                        Text(
                            text = stringResource(R.string.enable_biometric_description),
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                    
                    Switch(
                        checked = uiState.biometricEnabled,
                        onCheckedChange = { enabled ->
                            viewModel.setBiometricEnabled(enabled)
                        }
                    )
                }
            }
            
            // Test biometric
            if (uiState.biometricEnabled) {
                Button(
                    onClick = { viewModel.testBiometric() },
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Icon(Icons.Filled.TouchApp, contentDescription = null)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(stringResource(R.string.test_biometric))
                }
            }
            
            // Status
            if (uiState.testResult != null) {
                Card(
                    colors = CardDefaults.cardColors(
                        containerColor = if (uiState.testResult == true) {
                            MaterialTheme.colorScheme.successContainer
                        } else {
                            MaterialTheme.colorScheme.errorContainer
                        }
                    )
                ) {
                    Text(
                        text = if (uiState.testResult == true) {
                            stringResource(R.string.biometric_test_success)
                        } else {
                            stringResource(R.string.biometric_test_failed)
                        },
                        modifier = Modifier.padding(16.dp),
                        color = if (uiState.testResult == true) {
                            MaterialTheme.colorScheme.onSuccessContainer
                        } else {
                            MaterialTheme.colorScheme.onErrorContainer
                        }
                    )
                }
            }
        }
    }
}
```

### 2. **Enhanced Token Storage**

```kotlin
// SecureStorage.kt (Enhanced with Android Keystore)
@Singleton
class SecureStorage @Inject constructor(
    @ApplicationContext private val context: Context
) {
    private val masterKey = MasterKey.Builder(context)
        .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
        .setUserAuthenticationRequired(false)
        .setRequestStrongBoxBacked(true) // Use hardware-backed keystore if available
        .build()
    
    private val encryptedPrefs = EncryptedSharedPreferences.create(
        context,
        "secure_prefs",
        masterKey,
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
    )
    
    fun saveAccessToken(token: String) {
        encryptedPrefs.edit().putString(KEY_ACCESS_TOKEN, token).apply()
    }
    
    fun getAccessToken(): String? {
        return encryptedPrefs.getString(KEY_ACCESS_TOKEN, null)
    }
    
    fun saveRefreshToken(token: String) {
        encryptedPrefs.edit().putString(KEY_REFRESH_TOKEN, token).apply()
    }
    
    fun getRefreshToken(): String? {
        return encryptedPrefs.getString(KEY_REFRESH_TOKEN, null)
    }
    
    fun clearTokens() {
        encryptedPrefs.edit()
            .remove(KEY_ACCESS_TOKEN)
            .remove(KEY_REFRESH_TOKEN)
            .apply()
    }
    
    // Generic storage methods
    fun putString(key: String, value: String) {
        encryptedPrefs.edit().putString(key, value).apply()
    }
    
    fun getString(key: String, defaultValue: String? = null): String? {
        return encryptedPrefs.getString(key, defaultValue)
    }
    
    fun putBoolean(key: String, value: Boolean) {
        encryptedPrefs.edit().putBoolean(key, value).apply()
    }
    
    fun getBoolean(key: String, defaultValue: Boolean = false): Boolean {
        return encryptedPrefs.getBoolean(key, defaultValue)
    }
    
    companion object {
        private const val KEY_ACCESS_TOKEN = "access_token"
        private const val KEY_REFRESH_TOKEN = "refresh_token"
    }
}
```

---

## 🌐 Enhanced Networking with Moshi

### NetworkModule with Moshi

```kotlin
// NetworkModule.kt (Enhanced)
@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {
    
    @Provides
    @Singleton
    fun provideMoshi(): Moshi {
        return Moshi.Builder()
            .add(KotlinJsonAdapterFactory()) // Kotlin support
            .add(Date::class.java, Rfc3339DateJsonAdapter()) // ISO 8601 dates
            .build()
    }
    
    @Provides
    @Singleton
    fun provideOkHttpClient(
        authInterceptor: AuthInterceptor,
        analyticsInterceptor: AnalyticsInterceptor,
        loggingInterceptor: HttpLoggingInterceptor
    ): OkHttpClient {
        return OkHttpClient.Builder()
            .addInterceptor(authInterceptor)
            .addInterceptor(analyticsInterceptor) // Track API calls
            .addInterceptor(loggingInterceptor)
            .connectTimeout(CONNECT_TIMEOUT, TimeUnit.SECONDS)
            .readTimeout(READ_TIMEOUT, TimeUnit.SECONDS)
            .writeTimeout(WRITE_TIMEOUT, TimeUnit.SECONDS)
            .retryOnConnectionFailure(true)
            .build()
    }
    
    @Provides
    @Singleton
    fun provideLoggingInterceptor(): HttpLoggingInterceptor {
        return HttpLoggingInterceptor().apply {
            level = if (BuildConfig.DEBUG) {
                HttpLoggingInterceptor.Level.BODY
            } else {
                HttpLoggingInterceptor.Level.NONE
            }
        }
    }
    
    @Provides
    @Singleton
    fun provideRetrofit(
        okHttpClient: OkHttpClient,
        moshi: Moshi
    ): Retrofit {
        return Retrofit.Builder()
            .baseUrl(NetworkConfig.BASE_URL)
            .client(okHttpClient)
            .addConverterFactory(MoshiConverterFactory.create(moshi))
            .build()
    }
    
    // API interfaces
    @Provides
    @Singleton
    fun provideProductsApi(retrofit: Retrofit): ProductsApi {
        return retrofit.create(ProductsApi::class.java)
    }
    
    @Provides
    @Singleton
    fun provideCategoriesApi(retrofit: Retrofit): CategoriesApi {
        return retrofit.create(CategoriesApi::class.java)
    }
    
    // ... other API interfaces
    
    companion object {
        const val CONNECT_TIMEOUT = 30L
        const val READ_TIMEOUT = 30L
        const val WRITE_TIMEOUT = 30L
    }
}
```

### DTO Example with Moshi

```kotlin
// ProductDto.kt (Moshi-compatible)
@JsonClass(generateAdapter = true) // Moshi code generation
data class ProductDto(
    @Json(name = "id") val id: Int,
    @Json(name = "nume") val nume: String,
    @Json(name = "cantitate") val cantitate: Int,
    @Json(name = "pret") val pret: Double,
    @Json(name = "description") val description: String?,
    @Json(name = "category_id") val categoryId: Int,
    @Json(name = "unitati_id") val unitatiId: Int,
    @Json(name = "created_at") val createdAt: String,
    @Json(name = "updated_at") val updatedAt: String,
    @Json(name = "is_deleted") val isDeleted: Boolean = false,
    @Json(name = "images") val images: List<ProductImageDto> = emptyList(),
    @Json(name = "image_versions") val imageVersions: ImageVersionsDto?
)

@JsonClass(generateAdapter = true)
data class ProductImageDto(
    @Json(name = "id") val id: Int,
    @Json(name = "path") val path: String,
    @Json(name = "position") val position: Int,
    @Json(name = "produse_id") val produseId: Int,
    @Json(name = "is_primary") val isPrimary: Boolean,
    @Json(name = "image_versions") val imageVersions: ImageVersionsDto
)

@JsonClass(generateAdapter = true)
data class ImageVersionsDto(
    @Json(name = "original") val original: String,
    @Json(name = "medium") val medium: String,
    @Json(name = "thumbnail") val thumbnail: String
)

// Date adapter for ISO 8601
class Rfc3339DateJsonAdapter : JsonAdapter<Date>() {
    private val dateFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.US).apply {
        timeZone = TimeZone.getTimeZone("UTC")
    }
    
    @FromJson
    override fun fromJson(reader: JsonReader): Date? {
        return try {
            val dateString = reader.nextString()
            dateFormat.parse(dateString)
        } catch (e: Exception) {
            null
        }
    }
    
    @ToJson
    override fun toJson(writer: JsonWriter, value: Date?) {
        if (value != null) {
            writer.value(dateFormat.format(value))
        }
    }
}
```

---

## 📊 Analytics & Monitoring ⚡ NEW

### AnalyticsModule Setup

```kotlin
// AnalyticsModule.kt
@Module
@InstallIn(SingletonComponent::class)
object AnalyticsModule {
    
    @Provides
    @Singleton
    fun provideFirebaseAnalytics(
        @ApplicationContext context: Context
    ): FirebaseAnalytics {
        return Firebase.analytics.apply {
            setAnalyticsCollectionEnabled(!BuildConfig.DEBUG)
        }
    }
    
    @Provides
    @Singleton
    fun provideFirebaseCrashlytics(): FirebaseCrashlytics {
        return Firebase.crashlytics.apply {
            setCrashlyticsCollectionEnabled(!BuildConfig.DEBUG)
        }
    }
    
    @Provides
    @Singleton
    fun provideFirebasePerformance(): FirebasePerformance {
        return Firebase.performance.apply {
            isPerformanceCollectionEnabled = !BuildConfig.DEBUG
        }
    }
}
```

### AnalyticsHelper Implementation

```kotlin
// AnalyticsHelper.kt ⚡ NEW
@Singleton
class AnalyticsHelper @Inject constructor(
    private val analytics: FirebaseAnalytics,
    private val crashlytics: FirebaseCrashlytics
) {
    
    // Screen tracking
    fun logScreen(screenName: String) {
        analytics.logEvent(FirebaseAnalytics.Event.SCREEN_VIEW) {
            param(FirebaseAnalytics.Param.SCREEN_NAME, screenName)
            param(FirebaseAnalytics.Param.SCREEN_CLASS, screenName)
        }
    }
    
    // User actions
    fun logProductCreated() {
        analytics.logEvent("product_created", null)
    }
    
    fun logProductUpdated() {
        analytics.logEvent("product_updated", null)
    }
    
    fun logProductDeleted() {
        analytics.logEvent("product_deleted", null)
    }
    
    fun logOrderViewed(orderId: Int) {
        analytics.logEvent("order_viewed") {
            param("order_id", orderId.toString())
        }
    }
    
    fun logOrderUpdated(orderId: Int) {
        analytics.logEvent("order_updated") {
            param("order_id", orderId.toString())
        }
    }
    
    fun logListCloned(sourceListId: Int, newListId: Int) {
        analytics.logEvent("list_cloned") {
            param("source_list_id", sourceListId.toString())
            param("new_list_id", newListId.toString())
        }
    }
    
    fun logExportPDF(orderCount: Int) {
        analytics.logEvent("export_pdf") {
            param("order_count", orderCount.toLong())
        }
    }
    
    fun logExportExcel(orderCount: Int) {
        analytics.logEvent("export_excel") {
            param("order_count", orderCount.toLong())
        }
    }
    
    // User properties
    fun setUserProperty(name: String, value: String) {
        analytics.setUserProperty(name, value)
    }
    
    fun setUserId(userId: Int) {
        analytics.setUserId(userId.toString())
        crashlytics.setUserId(userId.toString())
    }
    
    // Error logging
    fun logError(exception: Throwable, context: String? = null) {
        crashlytics.recordException(exception)
        context?.let {
            crashlytics.log("Context: $it")
        }
    }
    
    fun logNonFatalError(message: String) {
        crashlytics.log(message)
    }
    
    // Custom user properties for Crashlytics
    fun setCustomKey(key: String, value: String) {
        crashlytics.setCustomKey(key, value)
    }
}
```

### AnalyticsInterceptor

```kotlin
// AnalyticsInterceptor.kt ⚡ NEW
class AnalyticsInterceptor @Inject constructor(
    private val performance: FirebasePerformance
) : Interceptor {
    
    override fun intercept(chain: Interceptor.Chain): Response {
        val request = chain.request()
        val url = request.url.toString()
        
        // Create performance trace
        val trace = performance.newHttpMetric(url, request.method)
        trace.start()
        
        try {
            val response = chain.proceed(request)
            
            // Log response metrics
            trace.setHttpResponseCode(response.code)
            response.body?.contentLength()?.let { contentLength ->
                trace.setResponseContentType(response.body?.contentType()?.toString())
                trace.setResponsePayloadSize(contentLength)
            }
            
            trace.stop()
            return response
        } catch (e: Exception) {
            trace.stop()
            throw e
        }
    }
}
```

### Usage in ViewModels

```kotlin
// ProductListViewModel.kt (with analytics)
@HiltViewModel
class ProductListViewModel @Inject constructor(
    private val productRepository: ProductRepository,
    private val analyticsHelper: AnalyticsHelper
) : ViewModel() {
    
    init {
        analyticsHelper.logScreen("ProductListScreen")
    }
    
    fun deleteProduct(productId: Int) {
        viewModelScope.launch {
            try {
                productRepository.deleteProduct(productId)
                analyticsHelper.logProductDeleted()
                _uiState.update { it.copy(successMessage = "Product deleted") }
            } catch (e: Exception) {
                analyticsHelper.logError(e, "Delete product failed")
                _uiState.update { it.copy(error = e.message) }
            }
        }
    }
}
```

---

## 🧪 Enhanced Testing Strategy ⚡ COMPREHENSIVE

### 1. **Unit Tests with JUnit 5 & Mockk**

```kotlin
// build.gradle.kts (test dependencies)
dependencies {
    // Unit Testing
    testImplementation("org.junit.jupiter:junit-jupiter:5.10.0")
    testImplementation("io.mockk:mockk:1.13.8")
    testImplementation("io.mockk:mockk-android:1.13.8")
    testImplementation("app.cash.turbine:turbine:1.0.0") // Flow testing
    testImplementation("org.jetbrains.kotlinx:kotlinx-coroutines-test:1.7.3")
    testImplementation("com.google.truth:truth:1.1.5") // Better assertions
    
    // Instrumented Testing
    androidTestImplementation("androidx.test.ext:junit:1.1.5")
    androidTestImplementation("androidx.test.espresso:espresso-core:3.5.1")
    androidTestImplementation("androidx.compose.ui:ui-test-junit4")
    androidTestImplementation("com.google.dagger:hilt-android-testing:2.48.1")
    androidTestImplementation("io.github.takahirom.roborazzi:roborazzi:1.7.0") // Screenshot testing
    kaptAndroidTest("com.google.dagger:hilt-compiler:2.48.1")
}
```

### 2. **Repository Unit Test Example**

```kotlin
// ProductRepositoryTest.kt
@ExtendWith(MockKExtension::class)
class ProductRepositoryTest {
    
    @MockK
    private lateinit var productApi: ProductsApi
    
    @MockK
    private lateinit var productDao: ProductDao
    
    @MockK
    private lateinit var networkMonitor: NetworkMonitor
    
    private lateinit var repository: ProductsRepository
    
    @BeforeEach
    fun setup() {
        MockKAnnotations.init(this)
        repository = ProductsRepository(productApi, productDao, networkMonitor)
    }
    
    @Test
    fun `getProducts returns error when offline`() = runTest {
        // Given
        every { networkMonitor.isOnline() } returns false

        // When
        val result = repository.getProducts().first()

        // Then
        assertThat(result).isInstanceOf(Resource.Error::class.java)
        assertThat(result.message).contains("offline")
        verify(exactly = 0) { productApi.getProducts(any(), any(), any()) }
    }
    
    @Test
    fun `createProduct syncs to server when online`() = runTest {
        // Given
        val productCreate = ProductCreate(/* ... */)
        val createdProduct = ProductDto(/* ... */)
        every { networkMonitor.isOnline() } returns true
        coEvery { productApi.createProduct(any()) } returns createdProduct
        coEvery { productDao.insert(any()) } just Runs
        
        // When
        val result = repository.createProduct(productCreate)
        
        // Then
        assertThat(result).isInstanceOf(Resource.Success::class.java)
        coVerify { productApi.createProduct(any()) }
        coVerify { productDao.insert(any()) }
    }
    
    @Test
    fun `getProducts emits loading then success`() = runTest {
        // Given
        val products = listOf(ProductDto(/* ... */))
        every { networkMonitor.isOnline() } returns true
        coEvery { productDao.getAllProducts() } returns flowOf(emptyList())
        coEvery { productApi.getProducts() } returns products
        coEvery { productDao.insertAll(any()) } just Runs
        
        // When & Then
        repository.getProducts().test {
            assertThat(awaitItem()).isInstanceOf(Resource.Loading::class.java)
            assertThat(awaitItem()).isInstanceOf(Resource.Success::class.java)
            awaitComplete()
        }
    }
}
```

### 3. **ViewModel Unit Test with Turbine**

```kotlin
// ProductListViewModelTest.kt
@ExtendWith(InstantExecutorExtension::class)
class ProductListViewModelTest {
    
    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()
    
    @MockK
    private lateinit var productRepository: ProductRepository
    
    @MockK
    private lateinit var analyticsHelper: AnalyticsHelper
    
    private lateinit var viewModel: ProductListViewModel
    
    @BeforeEach
    fun setup() {
        MockKAnnotations.init(this, relaxUnitFun = true)
        viewModel = ProductListViewModel(productRepository, analyticsHelper)
    }
    
    @Test
    fun `loadProducts updates uiState with products`() = runTest {
        // Given
        val products = listOf(Product(/* ... */))
        coEvery { productRepository.getProducts() } returns flowOf(Resource.Success(products))
        
        // When
        viewModel.loadProducts()
        
        // Then
        viewModel.uiState.test {
            val state = awaitItem()
            assertThat(state.products).hasSize(1)
            assertThat(state.isLoading).isFalse()
        }
    }
    
    @Test
    fun `deleteProduct calls repository and logs analytics`() = runTest {
        // Given
        val productId = 1
        coEvery { productRepository.deleteProduct(productId) } returns Resource.Success(Unit)
        
        // When
        viewModel.deleteProduct(productId)
        
        // Then
        coVerify { productRepository.deleteProduct(productId) }
        verify { analyticsHelper.logProductDeleted() }
    }
}
```

### 4. **Screenshot Testing with Roborazzi** ⚡ NEW

```kotlin
// ProductListScreenshotTest.kt
@RunWith(RoborazziTestRunner::class)
@GraphicsMode(GraphicsMode.Mode.NATIVE)
class ProductListScreenshotTest {
    
    @get:Rule
    val composeTestRule = createAndroidComposeRule<ComponentActivity>()
    
    @Test
    fun productList_emptyState_screenshot() {
        composeTestRule.setContent {
            AdminAppTheme {
                ProductListScreen(
                    uiState = ProductListUiState(
                        products = emptyList(),
                        isLoading = false
                    ),
                    onNavigateToProductForm = {}
                )
            }
        }
        
        composeTestRule.onRoot()
            .captureRoboImage("screenshots/product_list_empty.png")
    }
    
    @Test
    fun productList_withProducts_screenshot() {
        val products = listOf(
            Product(id = 1, nume = "Product 1", /* ... */),
            Product(id = 2, nume = "Product 2", /* ... */)
        )
        
        composeTestRule.setContent {
            AdminAppTheme {
                ProductListScreen(
                    uiState = ProductListUiState(
                        products = products,
                        isLoading = false
                    ),
                    onNavigateToProductForm = {}
                )
            }
        }
        
        composeTestRule.onRoot()
            .captureRoboImage("screenshots/product_list_with_products.png")
    }
    
    @Test
    fun productList_loading_screenshot() {
        composeTestRule.setContent {
            AdminAppTheme {
                ProductListScreen(
                    uiState = ProductListUiState(
                        products = emptyList(),
                        isLoading = true
                    ),
                    onNavigateToProductForm = {}
                )
            }
        }
        
        composeTestRule.onRoot()
            .captureRoboImage("screenshots/product_list_loading.png")
    }
}
```

### 5. **Compose UI Test Example**

```kotlin
// ProductListScreenTest.kt
@HiltAndroidTest
class ProductListScreenTest {
    
    @get:Rule(order = 0)
    val hiltRule = HiltAndroidRule(this)
    
    @get:Rule(order = 1)
    val composeTestRule = createAndroidComposeRule<MainActivity>()
    
    @Before
    fun setup() {
        hiltRule.inject()
    }
    
    @Test
    fun productList_displaysProducts() {
        // Navigate to product list
        composeTestRule.onNodeWithText("Products").performClick()
        
        // Verify product list items are displayed
        composeTestRule.onNodeWithText("Product 1").assertIsDisplayed()
        composeTestRule.onNodeWithText("Product 2").assertIsDisplayed()
    }
    
    @Test
    fun productList_clickFab_navigatesToProductForm() {
        composeTestRule.onNodeWithContentDescription("Add Product")
            .performClick()
        
        composeTestRule.onNodeWithText("New Product")
            .assertIsDisplayed()
    }
    
    @Test
    fun productList_deleteProduct_showsConfirmation() {
        composeTestRule.onNodeWithContentDescription("Delete Product 1")
            .performClick()
        
        composeTestRule.onNodeWithText("Confirm Delete")
            .assertIsDisplayed()
    }
}
```

### 6. **Testing Coverage Targets**

| Test Type | Target Coverage | Priority |
|-----------|----------------|----------|
| **Unit Tests** | 80%+ | High |
| **ViewModel Tests** | 90%+ | High |
| **Repository Tests** | 85%+ | High |
| **UI Tests** | 60%+ | Medium |
| **Integration Tests** | 70%+ | Medium |
| **Screenshot Tests** | Key screens | Medium |

---

## 📦 Enhanced Build Configuration

### build.gradle.kts (app level)

```kotlin
plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("com.google.dagger.hilt.android")
    id("com.google.gms.google-services")
    id("com.google.firebase.crashlytics")
    id("com.google.firebase.firebase-perf")
    kotlin("kapt")
    id("io.github.takahirom.roborazzi") version "1.7.0" // Screenshot testing
}

android {
    namespace = "com.onlineshop.admin"
    compileSdk = 34
    
    defaultConfig {
        applicationId = "com.onlineshop.admin"
        minSdk = 26 // Android 8.0 - 95%+ coverage
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"
        
        testInstrumentationRunner = "com.onlineshop.admin.HiltTestRunner"
        
        buildConfigField("String", "API_BASE_URL", "\"https://api.yourshop.com/api/v1/\"")
        
        // Enable vector drawables support
        vectorDrawables.useSupportLibrary = true
    }
    
    buildTypes {
        debug {
            applicationIdSuffix = ".debug"
            versionNameSuffix = "-debug"
            isDebuggable = true
            buildConfigField("String", "API_BASE_URL", "\"https://api-dev.yourshop.com/api/v1/\"")
            
            // Disable analytics in debug
            manifestPlaceholders["enableCrashReporting"] = "false"
        }
        
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
            signingConfig = signingConfigs.getByName("release")
            
            // Enable analytics in release
            manifestPlaceholders["enableCrashReporting"] = "true"
        }
    }
    
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    
    kotlinOptions {
        jvmTarget = "17"
        freeCompilerArgs += listOf(
            "-opt-in=androidx.compose.material3.ExperimentalMaterial3Api",
            "-opt-in=kotlinx.coroutines.ExperimentalCoroutinesApi"
        )
    }
    
    buildFeatures {
        compose = true
        buildConfig = true
    }
    
    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.3"
    }
    
    packaging {
        resources {
            excludes += "/META-INF/{AL2.0,LGPL2.1}"
        }
    }
    
    // Test options
    testOptions {
        unitTests {
            isIncludeAndroidResources = true
            isReturnDefaultValues = true
        }
    }
}

dependencies {
    // Core Android
    implementation("androidx.core:core-ktx:1.12.0")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.6.2")
    implementation("androidx.activity:activity-compose:1.8.1")
    
    // Compose
    val composeBom = platform("androidx.compose:compose-bom:2023.10.01")
    implementation(composeBom)
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-graphics")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.material:material-icons-extended")
    
    // Navigation
    implementation("androidx.navigation:navigation-compose:2.7.5")
    
    // Hilt
    implementation("com.google.dagger:hilt-android:2.48.1")
    kapt("com.google.dagger:hilt-compiler:2.48.1")
    implementation("androidx.hilt:hilt-navigation-compose:1.1.0")
    implementation("androidx.hilt:hilt-work:1.1.0")
    kapt("androidx.hilt:hilt-compiler:1.1.0")
    
    // Networking (Moshi instead of Gson) ⚡ ENHANCED
    implementation("com.squareup.retrofit2:retrofit:2.9.0")
    implementation("com.squareup.retrofit2:converter-moshi:2.9.0")
    implementation("com.squareup.okhttp3:okhttp:4.12.0")
    implementation("com.squareup.okhttp3:logging-interceptor:4.12.0")
    
    // Moshi (Kotlin-first JSON) ⚡ ENHANCED
    implementation("com.squareup.moshi:moshi:1.15.0")
    implementation("com.squareup.moshi:moshi-kotlin:1.15.0")
    kapt("com.squareup.moshi:moshi-kotlin-codegen:1.15.0")
    
    // Room
    val roomVersion = "2.6.0"
    implementation("androidx.room:room-runtime:$roomVersion")
    implementation("androidx.room:room-ktx:$roomVersion")
    kapt("androidx.room:room-compiler:$roomVersion")
    
    // Image Loading
    implementation("io.coil-kt:coil-compose:2.5.0")
    
    // DataStore
    implementation("androidx.datastore:datastore-preferences:1.0.0")
    
    // WorkManager
    implementation("androidx.work:work-runtime-ktx:2.9.0")
    
    // Firebase (Analytics & Crashlytics) ⚡ NEW
    implementation(platform("com.google.firebase:firebase-bom:32.6.0"))
    implementation("com.google.firebase:firebase-messaging-ktx")
    implementation("com.google.firebase:firebase-analytics-ktx")
    implementation("com.google.firebase:firebase-crashlytics-ktx")
    implementation("com.google.firebase:firebase-perf-ktx")
    implementation("com.google.firebase:firebase-config-ktx") // Remote config
    
    // Security
    implementation("androidx.security:security-crypto:1.1.0-alpha06")
    implementation("androidx.biometric:biometric:1.2.0-alpha05") ⚡ NEW
    
    // Splash Screen
    implementation("androidx.core:core-splashscreen:1.0.1")
    
    // PDF/Excel Export
    implementation("com.itextpdf:itext7-core:8.0.2")
    implementation("org.apache.poi:poi-ooxml:5.2.5")
    
    // Testing (Enhanced) ⚡ ENHANCED
    testImplementation("org.junit.jupiter:junit-jupiter:5.10.0")
    testImplementation("io.mockk:mockk:1.13.8")
    testImplementation("io.mockk:mockk-android:1.13.8")
    testImplementation("app.cash.turbine:turbine:1.0.0")
    testImplementation("org.jetbrains.kotlinx:kotlinx-coroutines-test:1.7.3")
    testImplementation("com.google.truth:truth:1.1.5")
    
    androidTestImplementation("androidx.test.ext:junit:1.1.5")
    androidTestImplementation("androidx.test.espresso:espresso-core:3.5.1")
    androidTestImplementation(composeBom)
    androidTestImplementation("androidx.compose.ui:ui-test-junit4")
    androidTestImplementation("com.google.dagger:hilt-android-testing:2.48.1")
    androidTestImplementation("io.github.takahirom.roborazzi:roborazzi:1.7.0") // Screenshot
    kaptAndroidTest("com.google.dagger:hilt-compiler:2.48.1")
    
    debugImplementation("androidx.compose.ui:ui-tooling")
    debugImplementation("androidx.compose.ui:ui-test-manifest")
}

// Kapt configuration
kapt {
    correctErrorTypes = true
    useBuildCache = true
}
```

---

## 📱 Mobile UI/UX Design System

### 🎯 Mobile-First Design Principles

The Android app adopts **mobile-first design principles** specifically optimized for touch interaction, limited screen real estate, and mobile usage patterns:

#### **1. Touch-First Interaction Design**
- **Minimum touch target size**: 48dp (44px) for all interactive elements
- **Thumb-friendly zones**: Primary actions positioned within easy thumb reach
- **Gesture support**: Swipe actions, long-press menus, drag-and-drop where appropriate
- **Haptic feedback**: Visual and tactile feedback for all user interactions

#### **2. Content Hierarchy & Information Architecture**
- **Progressive disclosure**: Show essential info first, reveal details on demand
- **Chunked information**: Break complex data into digestible cards/sections
- **Context-aware actions**: Actions relevant to current content state
- **Smart defaults**: Pre-fill common values, remember user preferences

#### **3. Mobile Navigation Patterns**
- **Bottom navigation bar**: Primary navigation for main sections
- **Tab-based organization**: Within screens for related content groups
- **Modal flows**: For complex forms and confirmations
- **Back stack management**: Intuitive navigation with proper back handling

---

### 🏗️ Mobile Screen Architecture

#### **1. Dashboard Screen - Mobile Optimized**

```kotlin
// DashboardScreen.kt (Mobile-First)
@Composable
fun DashboardScreen(
    viewModel: DashboardViewModel = hiltViewModel(),
    onNavigateToSection: (AdminSection) -> Unit
) {
    val uiState by viewModel.uiState.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Panou Admin") },
                actions = {
                    // Quick actions in top bar
                    IconButton(onClick = { /* Quick clone action */ }) {
                        Icon(Icons.Filled.Copy, "Clone")
                    }
                    IconButton(onClick = { /* Settings */ }) {
                        Icon(Icons.Filled.Settings, "Settings")
                    }
                }
            )
        },
        bottomBar = {
            AdminBottomNavigation(
                currentSection = AdminSection.DASHBOARD,
                onNavigateToSection = onNavigateToSection
            )
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier.padding(padding),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Welcome Header
            item {
                DashboardWelcomeCard()
            }

            // Quick Actions Row (Horizontal scroll)
            item {
                QuickActionsRow(onNavigateToSection)
            }

            // Stats Cards Grid
            item {
                StatsCardsGrid(uiState.stats)
            }

            // Recent Activity
            item {
                RecentActivityCard(
                    activities = uiState.recentActivities,
                    onViewAll = { onNavigateToSection(AdminSection.ORDERS) }
                )
            }

            // Categories Grid
            items(uiState.categories.chunked(2)) { rowCategories ->
                CategoryRow(
                    categories = rowCategories,
                    onNavigateToSection = onNavigateToSection
                )
            }
        }
    }
}
```

**Mobile Dashboard Key Features:**
- **LazyColumn** for smooth scrolling performance
- **Horizontal scrolling** for quick actions to save vertical space
- **2-column grid** for categories (optimal for mobile)
- **Bottom navigation** for main sections
- **Pull-to-refresh** for real-time updates

#### **2. List Management - Mobile Tabbed Interface**

```kotlin
// ListManagementScreen.kt (Mobile Tabs)
@Composable
fun ListManagementScreen(
    listId: Int,
    viewModel: ListManagementViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(uiState.listTitle) },
                navigationIcon = {
                    IconButton(onClick = { /* Navigate back */ }) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, "Back")
                    }
                },
                actions = {
                    // Context menu for list actions
                    ListActionsMenu(
                        onClone = { viewModel.cloneList() },
                        onExport = { viewModel.exportList() },
                        onSettings = { /* Open settings */ }
                    )
                }
            )
        }
    ) { padding ->
        Column(modifier = Modifier.padding(padding)) {
            // Mobile-Optimized Tabs
            MobileTabRow(
                selectedTabIndex = uiState.selectedTab,
                tabs = listOf("Produse", "Comenzi", "Text", "Setări"),
                onTabSelected = { viewModel.selectTab(it) }
            )

            // Tab Content with Mobile Layouts
            when (uiState.selectedTab) {
                0 -> ProductsTab(uiState.productsData)
                1 -> OrdersTab(uiState.ordersData)
                2 -> TextTab(uiState.textData)
                3 -> SettingsTab(uiState.settingsData)
            }
        }
    }
}
```

**Mobile Tab Interface Features:**
- **Scrollable tabs** when content overflows
- **Tab content optimized** for mobile viewing
- **Context actions** in top app bar
- **Bottom sheets** for filters and sorting

#### **3. Product Catalog - Mobile Card Grid**

```kotlin
// ProductsScreen.kt (Mobile Grid)
@Composable
fun ProductsScreen(
    viewModel: ProductsViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Produse") },
                actions = {
                    IconButton(onClick = { viewModel.toggleSearch() }) {
                        Icon(Icons.Filled.Search, "Search")
                    }
                    IconButton(onClick = { viewModel.showFilters() }) {
                        Icon(Icons.Filled.FilterList, "Filters")
                    }
                    FloatingActionButton(
                        onClick = { /* Add product */ },
                        modifier = Modifier.size(40.dp)
                    ) {
                        Icon(Icons.Filled.Add, "Add")
                    }
                }
            )
        },
        floatingActionButton = {
            // Prominent FAB for adding products
            FloatingActionButton(
                onClick = { /* Add product */ },
                containerColor = MaterialTheme.colorScheme.primary
            ) {
                Icon(Icons.Filled.Add, "Add Product")
            }
        }
    ) { padding ->
        LazyVerticalGrid(
            columns = GridCells.Adaptive(minSize = 160.dp),
            modifier = Modifier.padding(padding),
            contentPadding = PaddingValues(16.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            items(uiState.products) { product ->
                ProductCard(
                    product = product,
                    onClick = { /* Navigate to detail */ },
                    onEdit = { /* Quick edit */ },
                    onDelete = { /* Confirm delete */ }
                )
            }
        }
    }
}
```

**Mobile Grid Features:**
- **Adaptive grid** that adjusts to screen size
- **Card-based layout** with image, title, price, and actions
- **FAB for primary action** (adding products)
- **Swipe actions** for quick operations

### 📱 Mobile Component Patterns

#### **1. Mobile Product Card**

```kotlin
// ProductCard.kt (Mobile Optimized)
@Composable
fun ProductCard(
    product: Product,
    onClick: () -> Unit,
    onEdit: () -> Unit,
    onDelete: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier
            .fillMaxWidth()
            .clickable(onClick = onClick),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column {
            // Product Image (Aspect Ratio 1:1)
            AsyncImage(
                model = product.imageUrl,
                contentDescription = product.name,
                modifier = Modifier
                    .fillMaxWidth()
                    .aspectRatio(1f),
                contentScale = ContentScale.Crop,
                placeholder = painterResource(R.drawable.product_placeholder)
            )

            // Product Info
            Column(
                modifier = Modifier.padding(12.dp),
                verticalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                Text(
                    text = product.name,
                    style = MaterialTheme.typography.titleMedium,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis
                )

                Text(
                    text = "${product.price} RON",
                    style = MaterialTheme.typography.titleSmall,
                    color = MaterialTheme.colorScheme.primary
                )

                Text(
                    text = "${product.quantity} ${product.unit}",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )

                // Action Buttons Row
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    OutlinedButton(
                        onClick = onEdit,
                        modifier = Modifier.weight(1f)
                    ) {
                        Icon(Icons.Filled.Edit, null, modifier = Modifier.size(16.dp))
                        Spacer(Modifier.width(4.dp))
                        Text("Edit")
                    }

                    OutlinedButton(
                        onClick = onDelete,
                        modifier = Modifier.weight(1f),
                        colors = ButtonDefaults.outlinedButtonColors(
                            contentColor = MaterialTheme.colorScheme.error
                        )
                    ) {
                        Icon(Icons.Filled.Delete, null, modifier = Modifier.size(16.dp))
                        Spacer(Modifier.width(4.dp))
                        Text("Delete")
                    }
                }
            }
        }
    }
}
```

#### **2. Mobile Order Card with Swipe Actions**

```kotlin
// OrderCard.kt (Mobile with Swipe)
@Composable
fun OrderCard(
    order: Order,
    onClick: () -> Unit,
    onEdit: () -> Unit,
    onDelete: () -> Unit,
    modifier: Modifier = Modifier
) {
    val swipeState = rememberSwipeToDismissBoxState()

    SwipeToDismissBox(
        state = swipeState,
        backgroundContent = { SwipeBackground(swipeState) },
        content = {
            Card(
                modifier = modifier
                    .fillMaxWidth()
                    .clickable(onClick = onClick),
                elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    // Customer Name & Date
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.Top
                    ) {
                        Text(
                            text = order.customerName,
                            style = MaterialTheme.typography.titleMedium
                        )
                        Text(
                            text = formatDate(order.date),
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }

                    Spacer(modifier = Modifier.height(8.dp))

                    // Order Items Summary
                    Text(
                        text = "${order.itemCount} produse • ${order.total} RON",
                        style = MaterialTheme.typography.bodyMedium
                    )

                    // Delivery Type Badge
                    order.deliveryType?.let { deliveryType ->
                        Spacer(modifier = Modifier.height(4.dp))
                        SuggestionChip(
                            onClick = { /* Filter by delivery type */ },
                            label = { Text(deliveryType.name) },
                            icon = {
                                Icon(
                                    painter = painterResource(getDeliveryIcon(deliveryType)),
                                    contentDescription = null
                                )
                            }
                        )
                    }
                }
            }
        }
    )
}

@Composable
private fun SwipeBackground(swipeState: SwipeToDismissBoxState) {
    val color = when (swipeState.dismissDirection) {
        SwipeToDismissBoxValue.StartToEnd -> MaterialTheme.colorScheme.error
        SwipeToDismissBoxValue.EndToStart -> MaterialTheme.colorScheme.primary
        SwipeToDismissBoxValue.Settled -> Color.Transparent
    }

    Row(
        modifier = Modifier
            .fillMaxSize()
            .background(color)
            .padding(horizontal = 20.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Icon(
            Icons.Filled.Delete,
            contentDescription = "Delete",
            tint = Color.White
        )
        Icon(
            Icons.Filled.Edit,
            contentDescription = "Edit",
            tint = Color.White
        )
    }
}
```

#### **3. Mobile Form Patterns**

```kotlin
// ProductFormScreen.kt (Mobile Forms)
@Composable
fun ProductFormScreen(
    productId: Int? = null,
    viewModel: ProductFormViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(if (productId != null) "Editare Produs" else "Produs Nou") },
                navigationIcon = {
                    IconButton(onClick = { /* Navigate back */ }) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, "Back")
                    }
                },
                actions = {
                    TextButton(onClick = { viewModel.saveProduct() }) {
                        Text("Salvează")
                    }
                }
            )
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier.padding(padding),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Image Upload Section
            item {
                ImageUploadSection(
                    images = uiState.images,
                    onAddImage = { viewModel.addImage(it) },
                    onRemoveImage = { viewModel.removeImage(it) },
                    onSetPrimary = { viewModel.setPrimaryImage(it) }
                )
            }

            // Basic Info Section
            item {
                Card {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        OutlinedTextField(
                            value = uiState.name,
                            onValueChange = { viewModel.updateName(it) },
                            label = { Text("Nume Produs") },
                            modifier = Modifier.fillMaxWidth()
                        )

                        OutlinedTextField(
                            value = uiState.description,
                            onValueChange = { viewModel.updateDescription(it) },
                            label = { Text("Descriere") },
                            modifier = Modifier.fillMaxWidth(),
                            minLines = 3
                        )

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(16.dp)
                        ) {
                            OutlinedTextField(
                                value = uiState.price,
                                onValueChange = { viewModel.updatePrice(it) },
                                label = { Text("Preț") },
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                                modifier = Modifier.weight(1f)
                            )

                            OutlinedTextField(
                                value = uiState.quantity,
                                onValueChange = { viewModel.updateQuantity(it) },
                                label = { Text("Cantitate") },
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                                modifier = Modifier.weight(1f)
                            )
                        }
                    }
                }
            }

            // Category & Unit Section
            item {
                Card {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        ExposedDropdownMenuBox(
                            expanded = uiState.categoryDropdownExpanded,
                            onExpandedChange = { viewModel.toggleCategoryDropdown() }
                        ) {
                            OutlinedTextField(
                                value = uiState.selectedCategory?.name ?: "",
                                onValueChange = { },
                                readOnly = true,
                                label = { Text("Categorie") },
                                trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = uiState.categoryDropdownExpanded) },
                                modifier = Modifier
                                    .menuAnchor()
                                    .fillMaxWidth()
                            )
                            ExposedDropdownMenu(
                                expanded = uiState.categoryDropdownExpanded,
                                onDismissRequest = { viewModel.toggleCategoryDropdown() }
                            ) {
                                uiState.categories.forEach { category ->
                                    DropdownMenuItem(
                                        text = { Text(category.name) },
                                        onClick = {
                                            viewModel.selectCategory(category)
                                            viewModel.toggleCategoryDropdown()
                                        }
                                    )
                                }
                            }
                        }

                        // Similar dropdown for Unit
                    }
                }
            }
        }
    }
}
```

### 🧭 Mobile Navigation Patterns

#### **1. Bottom Navigation Bar**

```kotlin
// AdminBottomNavigation.kt
@Composable
fun AdminBottomNavigation(
    currentSection: AdminSection,
    onNavigateToSection: (AdminSection) -> Unit
) {
    NavigationBar {
        AdminSection.values().forEach { section ->
            NavigationBarItem(
                icon = {
                    Icon(
                        painter = painterResource(section.iconRes),
                        contentDescription = section.title
                    )
                },
                label = { Text(section.title) },
                selected = currentSection == section,
                onClick = { onNavigateToSection(section) }
            )
        }
    }
}

enum class AdminSection(
    val title: String,
    @DrawableRes val iconRes: Int
) {
    DASHBOARD("Panou", R.drawable.ic_dashboard),
    PRODUCTS("Produse", R.drawable.ic_products),
    ORDERS("Comenzi", R.drawable.ic_orders),
    LISTS("Liste", R.drawable.ic_lists),
    SETTINGS("Setări", R.drawable.ic_settings)
}
```

#### **2. Mobile Tab Navigation**

```kotlin
// MobileTabRow.kt
@Composable
fun MobileTabRow(
    selectedTabIndex: Int,
    tabs: List<String>,
    onTabSelected: (Int) -> Unit,
    modifier: Modifier = Modifier
) {
    ScrollableTabRow(
        selectedTabIndex = selectedTabIndex,
        modifier = modifier,
        edgePadding = 16.dp,
        indicator = { tabPositions ->
            TabRowDefaults.Indicator(
                modifier = Modifier.tabIndicatorOffset(tabPositions[selectedTabIndex]),
                height = 3.dp
            )
        }
    ) {
        tabs.forEachIndexed { index, title ->
            Tab(
                selected = selectedTabIndex == index,
                onClick = { onTabSelected(index) },
                text = { Text(title, maxLines = 1) }
            )
        }
    }
}
```

#### **3. Contextual Action Patterns**

```kotlin
// ContextualActionBar.kt
@Composable
fun ContextualActionBar(
    selectedCount: Int,
    onSelectAll: () -> Unit,
    onClearSelection: () -> Unit,
    onBulkAction: (BulkAction) -> Unit
) {
    TopAppBar(
        title = { Text("$selectedCount selectate") },
        navigationIcon = {
            IconButton(onClick = onClearSelection) {
                Icon(Icons.Filled.Close, "Clear selection")
            }
        },
        actions = {
            IconButton(onClick = onSelectAll) {
                Icon(Icons.Filled.SelectAll, "Select all")
            }
            IconButton(onClick = { onBulkAction(BulkAction.DELETE) }) {
                Icon(Icons.Filled.Delete, "Delete selected")
            }
            IconButton(onClick = { onBulkAction(BulkAction.EXPORT) }) {
                Icon(Icons.Filled.Share, "Export selected")
            }
        }
    )
}
```

### 📱 Mobile-Specific Features

#### **1. Pull-to-Refresh**

```kotlin
// PullToRefreshLazyColumn.kt
@Composable
fun PullToRefreshLazyColumn(
    refreshing: Boolean,
    onRefresh: () -> Unit,
    modifier: Modifier = Modifier,
    content: LazyListScope.() -> Unit
) {
    val pullRefreshState = rememberPullRefreshState(
        refreshing = refreshing,
        onRefresh = onRefresh
    )

    Box(modifier = modifier.pullRefresh(pullRefreshState)) {
        LazyColumn {
            content()
        }

        PullRefreshIndicator(
            refreshing = refreshing,
            state = pullRefreshState,
            modifier = Modifier.align(Alignment.TopCenter)
        )
    }
}
```

#### **2. Infinite Scroll with Pagination**

```kotlin
// InfiniteScrollLazyColumn.kt
@Composable
fun InfiniteScrollLazyColumn(
    items: List<Any>,
    isLoading: Boolean,
    onLoadMore: () -> Unit,
    modifier: Modifier = Modifier,
    content: @Composable (Any) -> Unit
) {
    LazyColumn(modifier = modifier) {
        items(items) { item ->
            content(item)
        }

        // Loading indicator at the end
        if (isLoading) {
            item {
                CircularProgressIndicator(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp)
                        .wrapContentWidth(Alignment.CenterHorizontally)
                )
            }
        } else {
            // Invisible item to trigger load more
            item {
                LaunchedEffect(Unit) {
                    onLoadMore()
                }
                Spacer(modifier = Modifier.height(1.dp))
            }
        }
    }
}
```

#### **3. Mobile Search & Filter**

```kotlin
// MobileSearchBar.kt
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MobileSearchBar(
    query: String,
    onQueryChange: (String) -> Unit,
    onSearch: (String) -> Unit,
    active: Boolean,
    onActiveChange: (Boolean) -> Unit,
    placeholder: String = "Caută...",
    modifier: Modifier = Modifier
) {
    SearchBar(
        query = query,
        onQueryChange = onQueryChange,
        onSearch = onSearch,
        active = active,
        onActiveChange = onActiveChange,
        placeholder = placeholder,
        modifier = modifier,
        leadingIcon = {
            Icon(Icons.Filled.Search, contentDescription = "Search")
        },
        trailingIcon = {
            if (active) {
                IconButton(onClick = { onQueryChange("") }) {
                    Icon(Icons.Filled.Close, contentDescription = "Clear")
                }
            }
        }
    ) {
        // Search suggestions or recent searches
        LazyColumn {
            items(searchSuggestions) { suggestion ->
                ListItem(
                    headlineContent = { Text(suggestion) },
                    leadingContent = {
                        Icon(Icons.Filled.History, contentDescription = null)
                    },
                    modifier = Modifier.clickable {
                        onQueryChange(suggestion)
                        onSearch(suggestion)
                        onActiveChange(false)
                    }
                )
            }
        }
    }
}
```

### 📊 Mobile Data Visualization

#### **1. Compact Dashboard Cards**

```kotlin
// DashboardStatsCard.kt
@Composable
fun DashboardStatsCard(
    title: String,
    value: String,
    change: String? = null,
    icon: ImageVector,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier,
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surfaceVariant
        )
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.primary,
                modifier = Modifier.size(32.dp)
            )

            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = title,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Text(
                    text = value,
                    style = MaterialTheme.typography.headlineSmall,
                    color = MaterialTheme.colorScheme.onSurface
                )
                change?.let {
                    Text(
                        text = it,
                        style = MaterialTheme.typography.bodySmall,
                        color = if (it.startsWith("+")) Color.Green else Color.Red
                    )
                }
            }
        }
    }
}
```

#### **2. Mobile Charts (Compact)**

```kotlin
// CompactBarChart.kt
@Composable
fun CompactBarChart(
    data: List<BarData>,
    modifier: Modifier = Modifier
) {
    Column(modifier = modifier) {
        // Chart title
        Text(
            text = "Ultimele 7 zile",
            style = MaterialTheme.typography.titleSmall,
            modifier = Modifier.padding(bottom = 8.dp)
        )

        // Simplified bar chart
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(4.dp),
            verticalAlignment = Alignment.Bottom
        ) {
            data.forEach { barData ->
                Column(
                    modifier = Modifier.weight(1f),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    // Bar
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(barData.height)
                            .background(
                                color = MaterialTheme.colorScheme.primary,
                                shape = RoundedCornerShape(topStart = 2.dp, topEnd = 2.dp)
                            )
                    )

                    // Label
                    Text(
                        text = barData.label,
                        style = MaterialTheme.typography.bodySmall,
                        modifier = Modifier.padding(top = 4.dp)
                    )
                }
            }
        }
    }
}
```

### 🎨 Mobile Theme & Styling

#### **1. Mobile-Optimized Typography Scale**

```kotlin
// MobileTypography.kt
val MobileTypography = Typography(
    displayLarge = TextStyle(
        fontSize = 32.sp,
        lineHeight = 40.sp,
        fontWeight = FontWeight.Bold
    ),
    displayMedium = TextStyle(
        fontSize = 28.sp,
        lineHeight = 36.sp,
        fontWeight = FontWeight.Bold
    ),
    displaySmall = TextStyle(
        fontSize = 24.sp,
        lineHeight = 32.sp,
        fontWeight = FontWeight.Bold
    ),
    headlineLarge = TextStyle(
        fontSize = 22.sp,
        lineHeight = 28.sp,
        fontWeight = FontWeight.SemiBold
    ),
    headlineMedium = TextStyle(
        fontSize = 18.sp,
        lineHeight = 24.sp,
        fontWeight = FontWeight.SemiBold
    ),
    headlineSmall = TextStyle(
        fontSize = 16.sp,
        lineHeight = 22.sp,
        fontWeight = FontWeight.SemiBold
    ),
    titleLarge = TextStyle(
        fontSize = 16.sp,
        lineHeight = 22.sp,
        fontWeight = FontWeight.Medium
    ),
    titleMedium = TextStyle(
        fontSize = 14.sp,
        lineHeight = 20.sp,
        fontWeight = FontWeight.Medium
    ),
    titleSmall = TextStyle(
        fontSize = 12.sp,
        lineHeight = 18.sp,
        fontWeight = FontWeight.Medium
    ),
    bodyLarge = TextStyle(
        fontSize = 16.sp,
        lineHeight = 24.sp,
        fontWeight = FontWeight.Normal
    ),
    bodyMedium = TextStyle(
        fontSize = 14.sp,
        lineHeight = 20.sp,
        fontWeight = FontWeight.Normal
    ),
    bodySmall = TextStyle(
        fontSize = 12.sp,
        lineHeight = 16.sp,
        fontWeight = FontWeight.Normal
    ),
    labelLarge = TextStyle(
        fontSize = 14.sp,
        lineHeight = 20.sp,
        fontWeight = FontWeight.Medium,
        letterSpacing = 0.1.sp
    ),
    labelMedium = TextStyle(
        fontSize = 12.sp,
        lineHeight = 16.sp,
        fontWeight = FontWeight.Medium,
        letterSpacing = 0.5.sp
    ),
    labelSmall = TextStyle(
        fontSize = 11.sp,
        lineHeight = 16.sp,
        fontWeight = FontWeight.Medium,
        letterSpacing = 0.5.sp
    )
)
```

#### **2. Mobile Color Scheme**

```kotlin
// MobileColorScheme.kt
val MobileLightColorScheme = lightColorScheme(
    primary = Color(0xFF0061A6),
    onPrimary = Color.White,
    primaryContainer = Color(0xFFD1E4FF),
    onPrimaryContainer = Color(0xFF001D35),

    secondary = Color(0xFF535F70),
    onSecondary = Color.White,
    secondaryContainer = Color(0xFFD7E3F7),
    onSecondaryContainer = Color(0xFF101C2B),

    tertiary = Color(0xFF6B5778),
    onTertiary = Color.White,
    tertiaryContainer = Color(0xFFF2DAFF),
    onTertiaryContainer = Color(0xFF251431),

    error = Color(0xFFBA1A1A),
    onError = Color.White,
    errorContainer = Color(0xFFFFDAD6),
    onErrorContainer = Color(0xFF410002),

    background = Color(0xFFFEFBFF),
    onBackground = Color(0xFF1A1C1E),
    surface = Color.White,
    onSurface = Color(0xFF1A1C1E),
    surfaceVariant = Color(0xFFDDE3EA),
    onSurfaceVariant = Color(0xFF41484D),

    outline = Color(0xFF71787E),
    outlineVariant = Color(0xFFC1C7CE),

    scrim = Color(0xFF000000),
    surfaceTint = Color(0xFF0061A6)
)
```

### 📱 Mobile UX Enhancements

#### **1. Connectivity Awareness**

```kotlin
// ConnectivityIndicator.kt
@Composable
fun ConnectivityIndicator(
    isOnline: Boolean,
    modifier: Modifier = Modifier
) {
    AnimatedVisibility(
        visible = !isOnline,
        enter = slideInVertically(initialOffsetY = { -it }),
        exit = slideOutVertically(targetOffsetY = { -it })
    ) {
        Surface(
            modifier = modifier.fillMaxWidth(),
            color = MaterialTheme.colorScheme.errorContainer,
            shadowElevation = 4.dp
        ) {
            Row(
                modifier = Modifier.padding(12.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Icon(
                    Icons.Filled.WifiOff,
                    contentDescription = null,
                    tint = MaterialTheme.colorScheme.onErrorContainer
                )
                Text(
                    text = "Offline - Funcționalitatea limitată. Conectați-vă pentru operațiuni complete.",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onErrorContainer
                )
            }
        }
    }
}
```

#### **2. Loading States & Skeletons**

```kotlin
// ProductCardSkeleton.kt
@Composable
fun ProductCardSkeleton(modifier: Modifier = Modifier) {
    Card(modifier = modifier.fillMaxWidth()) {
        Column {
            // Image skeleton
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .aspectRatio(1f)
                    .background(Color.LightGray)
            )

            Column(modifier = Modifier.padding(12.dp)) {
                // Title skeleton
                Box(
                    modifier = Modifier
                        .fillMaxWidth(0.8f)
                        .height(20.dp)
                        .background(Color.LightGray, RoundedCornerShape(4.dp))
                )

                Spacer(modifier = Modifier.height(8.dp))

                // Price skeleton
                Box(
                    modifier = Modifier
                        .fillMaxWidth(0.4f)
                        .height(16.dp)
                        .background(Color.LightGray, RoundedCornerShape(4.dp))
                )

                Spacer(modifier = Modifier.height(4.dp))

                // Quantity skeleton
                Box(
                    modifier = Modifier
                        .fillMaxWidth(0.3f)
                        .height(14.dp)
                        .background(Color.LightGray, RoundedCornerShape(4.dp))
                )

                Spacer(modifier = Modifier.height(12.dp))

                // Button skeletons
                Row(modifier = Modifier.fillMaxWidth()) {
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .height(36.dp)
                            .background(Color.LightGray, RoundedCornerShape(6.dp))
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .height(36.dp)
                            .background(Color.LightGray, RoundedCornerShape(6.dp))
                    )
                }
            }
        }
    }
}
```

#### **3. Empty States**

```kotlin
// EmptyState.kt
@Composable
fun EmptyState(
    icon: ImageVector,
    title: String,
    message: String,
    actionText: String? = null,
    onAction: (() -> Unit)? = null,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(32.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Icon(
            imageVector = icon,
            contentDescription = null,
            modifier = Modifier.size(64.dp),
            tint = MaterialTheme.colorScheme.onSurfaceVariant
        )

        Spacer(modifier = Modifier.height(16.dp))

        Text(
            text = title,
            style = MaterialTheme.typography.headlineSmall,
            textAlign = TextAlign.Center,
            color = MaterialTheme.colorScheme.onSurface
        )

        Spacer(modifier = Modifier.height(8.dp))

        Text(
            text = message,
            style = MaterialTheme.typography.bodyMedium,
            textAlign = TextAlign.Center,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )

        if (actionText != null && onAction != null) {
            Spacer(modifier = Modifier.height(24.dp))
            Button(onClick = onAction) {
                Text(actionText)
            }
        }
    }
}
```

### 📱 Mobile Testing Strategy Enhancement

#### **Screenshot Testing for Mobile**

```kotlin
// MobileScreenshotTest.kt
@RunWith(RoborazziTestRunner::class)
@GraphicsMode(GraphicsMode.Mode.NATIVE)
class MobileScreenshotTest {

    @get:Rule
    val composeTestRule = createAndroidComposeRule<ComponentActivity>()

    @Test
    fun dashboard_mobile_portrait() {
        composeTestRule.setContent {
            AdminAppTheme {
                DashboardScreen(
                    uiState = DashboardUiState(
                        stats = sampleStats,
                        recentActivities = sampleActivities
                    ),
                    onNavigateToSection = {}
                )
            }
        }

        composeTestRule.onRoot()
            .captureRoboImage("screenshots/dashboard_mobile_portrait.png")
    }

    @Test
    fun products_grid_mobile() {
        composeTestRule.setContent {
            AdminAppTheme {
                ProductsScreen(
                    uiState = ProductsUiState(products = sampleProducts)
                )
            }
        }

        composeTestRule.onRoot()
            .captureRoboImage("screenshots/products_grid_mobile.png")
    }

    @Test
    fun order_card_swipe_actions() {
        composeTestRule.setContent {
            AdminAppTheme {
                OrderCard(
                    order = sampleOrder,
                    onClick = {},
                    onEdit = {},
                    onDelete = {}
                )
            }
        }

        composeTestRule.onRoot()
            .captureRoboImage("screenshots/order_card_mobile.png")
    }
}
```

---

## 📱 UI/UX Enhancements

### Material Design 3 Theme (Enhanced)

```kotlin
// Theme.kt (Enhanced with dynamic colors)
@Composable
fun AdminAppTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    dynamicColor: Boolean = true,
    content: @Composable () -> Unit
) {
    val colorScheme = when {
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            val context = LocalContext.current
            if (darkTheme) dynamicDarkColorScheme(context)
            else dynamicLightColorScheme(context)
        }
        darkTheme -> darkColorScheme(
            primary = Color(0xFF6200EE),
            onPrimary = Color.White,
            secondary = Color(0xFF03DAC6),
            onSecondary = Color.Black,
            tertiary = Color(0xFFBB86FC),
            background = Color(0xFF121212),
            surface = Color(0xFF1E1E1E),
            error = Color(0xFFCF6679),
            // Success colors (custom)
            successContainer = Color(0xFF1B5E20),
            onSuccessContainer = Color(0xFFC8E6C9)
        )
        else -> lightColorScheme(
            primary = Color(0xFF6200EE),
            onPrimary = Color.White,
            secondary = Color(0xFF03DAC6),
            onSecondary = Color.Black,
            tertiary = Color(0xFFBB86FC),
            background = Color(0xFFFFFBFE),
            surface = Color.White,
            error = Color(0xFFB00020),
            // Success colors (custom)
            successContainer = Color(0xFF4CAF50),
            onSuccessContainer = Color.White
        )
    }
    
    val typography = Typography(
        displayLarge = TextStyle(
            fontWeight = FontWeight.Bold,
            fontSize = 57.sp,
            lineHeight = 64.sp
        ),
        displayMedium = TextStyle(
            fontWeight = FontWeight.Bold,
            fontSize = 45.sp,
            lineHeight = 52.sp
        ),
        titleLarge = TextStyle(
            fontWeight = FontWeight.SemiBold,
            fontSize = 22.sp,
            lineHeight = 28.sp
        ),
        titleMedium = TextStyle(
            fontWeight = FontWeight.Medium,
            fontSize = 16.sp,
            lineHeight = 24.sp
        ),
        bodyLarge = TextStyle(
            fontWeight = FontWeight.Normal,
            fontSize = 16.sp,
            lineHeight = 24.sp
        ),
        bodyMedium = TextStyle(
            fontWeight = FontWeight.Normal,
            fontSize = 14.sp,
            lineHeight = 20.sp
        ),
        labelLarge = TextStyle(
            fontWeight = FontWeight.Medium,
            fontSize = 14.sp,
            lineHeight = 20.sp
        )
    )
    
    MaterialTheme(
        colorScheme = colorScheme,
        typography = typography,
        content = content
    )
}

// Extended color scheme for success states
val ColorScheme.successContainer: Color
    @Composable get() = if (isSystemInDarkTheme()) Color(0xFF1B5E20) else Color(0xFF4CAF50)

val ColorScheme.onSuccessContainer: Color
    @Composable get() = if (isSystemInDarkTheme()) Color(0xFFC8E6C9) else Color.White
```

---

## 📅 Enhanced Implementation Roadmap

### Phase 1: Foundation (Weeks 1-2)
- [x] Project setup (Gradle, dependencies, Firebase)
- [x] Architecture skeleton (MVVM, Clean Architecture)
- [x] Networking layer (Retrofit, OkHttp, Moshi)
- [x] Database layer (Room)
- [x] Security setup (EncryptedSharedPreferences, Keystore)
- [x] Authentication flow (with biometric option)
- [x] Basic navigation structure
- [x] Analytics setup (Firebase)

### Phase 2: Core Features (Weeks 3-5)
- [x] Dashboard screen with analytics
- [x] Product management (list, create, edit, delete)
- [x] Category management
- [x] Image upload & management (multi-image)
- [x] Online synchronization with offline fallback
- [x] Unit tests for repositories

### Phase 3: Order Management (Weeks 6-7)
- [x] Order list screen with filtering
- [x] Order details & editing
- [x] Order grouping & sorting
- [x] PDF/XLS export functionality
- [x] Order totals calculation
- [x] Analytics for order operations

### Phase 4: Lists & Configuration (Weeks 8-9)
- [x] Lists management
- [x] List products management with ordering
- [x] List cloning
- [x] Delivery & payment configuration
- [x] Business details management
- [x] Unit tests for ViewModels

### Phase 5: Advanced Features (Week 10)
- [x] Push notifications (FCM) with topics
- [x] Background sync (WorkManager)
- [x] Biometric authentication setup
- [x] Security features (password change)
- [x] Settings screen with analytics opt-out
- [x] UI tests for critical flows

### Phase 6: Polish & Testing (Weeks 11-12)
- [x] UI/UX refinement based on feedback
- [x] Performance optimization
- [x] Comprehensive testing (unit, integration, UI)
- [x] Screenshot tests for key screens
- [x] Analytics verification
- [x] Bug fixes
- [x] Documentation

### Phase 7: Release (Week 13)
- [x] Internal testing
- [x] Beta testing with real users
- [x] Play Store listing
- [x] Production release
- [x] Monitoring setup (Crashlytics)

---

## 💰 Updated Development Estimate

### Team Composition
- **1 Senior Android Developer** (full-time) - 13 weeks
- **1 UI/UX Designer** (part-time, first 4 weeks) - 4 weeks @ 50%
- **1 QA Engineer** (part-time, last 6 weeks) - 6 weeks @ 50%

### Time Estimate
- **Development**: 10-12 weeks
- **Testing & QA**: 2 weeks
- **Beta & Refinement**: 1 week
- **Total**: ~13-15 weeks

### Cost Estimate
- Senior Android Developer: $80-120/hour × 520 hours = $41,600 - $62,400
- UI/UX Designer: $60-90/hour × 80 hours = $4,800 - $7,200
- QA Engineer: $50-70/hour × 120 hours = $6,000 - $8,400
- **Total**: ~$52,400 - $78,000

*Note: Costs vary by location and contractor vs employee. This is a conservative estimate for quality work.*

---

## 📊 Success Metrics & KPIs

### Performance Targets
| Metric | Target | Priority |
|--------|--------|----------|
| App launch time | < 2 seconds | High |
| Screen transition | < 300ms | High |
| Image loading | < 1 second | High |
| API response handling | < 500ms | Medium |
| Battery drain | < 5% per hour active use | Medium |
| APK size | < 50 MB | Low |

### Quality Targets
| Metric | Target | Priority |
|--------|--------|----------|
| Crash-free rate | > 99.5% | Critical |
| ANR rate | < 0.1% | High |
| Unit test coverage | > 80% | High |
| UI test coverage | > 60% | Medium |
| Code review approval | 100% | High |
| Critical bugs | 0 at launch | Critical |

### User Engagement (Analytics)
- Daily Active Users (DAU)
- Session duration
- Feature adoption rates
- Order creation rate via mobile
- Export usage (PDF/Excel)
- Biometric authentication adoption

### Business Impact
- Time saved per order management task
- Reduction in desktop usage
- Increase in order processing speed
- User satisfaction score

---

## 🚀 CI/CD Pipeline (Enhanced)

```yaml
# .github/workflows/android-ci.yml
name: Android CI/CD

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up JDK 17
        uses: actions/setup-java@v3
        with:
          java-version: '17'
          distribution: 'temurin'
      
      - name: Run ktlint
        run: ./gradlew ktlintCheck
      
      - name: Run detekt
        run: ./gradlew detekt

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up JDK 17
        uses: actions/setup-java@v3
        with:
          java-version: '17'
          distribution: 'temurin'
      
      - name: Cache Gradle packages
        uses: actions/cache@v3
        with:
          path: |
            ~/.gradle/caches
            ~/.gradle/wrapper
          key: ${{ runner.os }}-gradle-${{ hashFiles('**/*.gradle*', '**/gradle-wrapper.properties') }}
      
      - name: Run unit tests
        run: ./gradlew testDebugUnitTest
      
      - name: Generate test report
        if: always()
        uses: dorny/test-reporter@v1
        with:
          name: Unit Test Results
          path: '**/build/test-results/testDebugUnitTest/*.xml'
          reporter: java-junit
      
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./app/build/reports/coverage/test/debug/report.xml

  ui-test:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up JDK 17
        uses: actions/setup-java@v3
        with:
          java-version: '17'
          distribution: 'temurin'
      
      - name: Run instrumented tests
        uses: reactivecircus/android-emulator-runner@v2
        with:
          api-level: 31
          script: ./gradlew connectedDebugAndroidTest

  screenshot-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up JDK 17
        uses: actions/setup-java@v3
        with:
          java-version: '17'
          distribution: 'temurin'
      
      - name: Run screenshot tests
        run: ./gradlew verifyRoborazziDebug
      
      - name: Upload screenshot diffs
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: screenshot-diffs
          path: '**/build/outputs/roborazzi/*'

  build:
    needs: [lint, test]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up JDK 17
        uses: actions/setup-java@v3
        with:
          java-version: '17'
          distribution: 'temurin'
      
      - name: Build debug APK
        run: ./gradlew assembleDebug
      
      - name: Upload APK
        uses: actions/upload-artifact@v3
        with:
          name: app-debug
          path: app/build/outputs/apk/debug/app-debug.apk

  release:
    if: github.ref == 'refs/heads/main'
    needs: [lint, test, ui-test, screenshot-test, build]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up JDK 17
        uses: actions/setup-java@v3
        with:
          java-version: '17'
          distribution: 'temurin'
      
      - name: Decode Keystore
        run: |
          echo ${{ secrets.KEYSTORE_BASE64 }} | base64 -d > release-keystore.jks
      
      - name: Build release APK
        run: ./gradlew assembleRelease
        env:
          SIGNING_KEY_ALIAS: ${{ secrets.KEY_ALIAS }}
          SIGNING_KEY_PASSWORD: ${{ secrets.KEY_PASSWORD }}
          SIGNING_STORE_PASSWORD: ${{ secrets.STORE_PASSWORD }}
      
      - name: Build release AAB
        run: ./gradlew bundleRelease
        env:
          SIGNING_KEY_ALIAS: ${{ secrets.KEY_ALIAS }}
          SIGNING_KEY_PASSWORD: ${{ secrets.KEY_PASSWORD }}
          SIGNING_STORE_PASSWORD: ${{ secrets.STORE_PASSWORD }}
      
      - name: Upload to Play Store (Internal Track)
        uses: r0adkll/upload-google-play@v1
        with:
          serviceAccountJsonPlainText: ${{ secrets.SERVICE_ACCOUNT_JSON }}
          packageName: com.onlineshop.admin
          releaseFiles: app/build/outputs/bundle/release/app-release.aab
          track: internal
          status: completed
```

---

## 📚 Additional Resources

### Learning Resources for Team
1. **Kotlin & Android**
   - Official Kotlin docs: https://kotlinlang.org/docs/home.html
   - Android Developer Guide: https://developer.android.com/guide
   - Kotlin Coroutines Guide: https://kotlinlang.org/docs/coroutines-guide.html

2. **Jetpack Compose**
   - Compose Tutorial: https://developer.android.com/jetpack/compose/tutorial
   - Compose Pathway: https://developer.android.com/courses/pathways/compose
   - Compose samples: https://github.com/android/compose-samples

3. **Architecture**
   - Guide to app architecture: https://developer.android.com/topic/architecture
   - MVVM pattern: https://developer.android.com/topic/libraries/architecture/viewmodel
   - Clean Architecture: https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html

4. **Libraries**
   - Hilt Documentation: https://dagger.dev/hilt/
   - Retrofit Guide: https://square.github.io/retrofit/
   - Moshi Documentation: https://github.com/square/moshi
   - Room Documentation: https://developer.android.com/training/data-storage/room
   - Coil Documentation: https://coil-kt.github.io/coil/

5. **Testing**
   - JUnit 5: https://junit.org/junit5/docs/current/user-guide/
   - Mockk: https://mockk.io/
   - Turbine: https://github.com/cashapp/turbine
   - Roborazzi: https://github.com/takahirom/roborazzi

6. **Firebase**
   - Analytics: https://firebase.google.com/docs/analytics
   - Crashlytics: https://firebase.google.com/docs/crashlytics
   - Cloud Messaging: https://firebase.google.com/docs/cloud-messaging

---

## 🎯 Summary of Enhancements

This refined version (v2.0) includes:

### ⚡ Major Enhancements
1. **Moshi instead of Gson** - Better Kotlin support, compile-time code generation
2. **Comprehensive Biometric Authentication** - Full implementation with setup screens
3. **Analytics & Monitoring** - Firebase Analytics, Crashlytics, Performance Monitoring
4. **Enhanced Testing** - JUnit 5, Mockk, Turbine, Screenshot testing with Roborazzi
5. **Better Security** - StrongBox-backed keystore, improved token management
6. **CI/CD Pipeline** - Complete GitHub Actions workflow with automated testing
7. **Performance Tracking** - Firebase Performance Monitoring with custom metrics

### 📊 Additional Features
- Analytics tracking for all user actions
- Screenshot testing for visual regression
- Custom success colors in theme
- Analytics opt-out in settings
- Enhanced error logging with Crashlytics
- Remote Config for feature flags
- Performance monitoring interceptor

### 🧪 Testing Improvements
- JUnit 5 with better assertions
- Mockk for modern Kotlin testing
- Turbine for Flow testing
- Roborazzi for screenshot tests
- Clear coverage targets (80% unit, 60% UI)
- Automated CI/CD testing

### 📈 Business Value
- User behavior tracking
- Crash-free rate monitoring
- Performance metrics
- Feature adoption analysis
- Data-driven decision making

---

## 🚀 Next Steps

1. **Review & Approval**
   - [ ] Review enhanced technical architecture
   - [ ] Review timeline and updated budget
   - [ ] Get stakeholder approval
   - [ ] Set up Firebase project

2. **Team Setup**
   - [ ] Hire/assign Android developer
   - [ ] Setup development environment
   - [ ] Create project repository
   - [ ] Configure CI/CD pipeline

3. **Development Kickoff**
   - [ ] Phase 1: Foundation (Week 1-2)
   - [ ] Daily standups
   - [ ] Weekly demos
   - [ ] Continuous integration

4. **Analytics Setup**
   - [ ] Create Firebase project
   - [ ] Configure analytics events
   - [ ] Set up Crashlytics
   - [ ] Test analytics flow

---

**Document Version**: 2.0 (Refined)  
**Created**: November 1, 2025  
**Last Updated**: November 1, 2025  
**Status**: Enhanced & Ready for Implementation  

**Key Improvements:**
- ✅ Moshi for better Kotlin support
- ✅ Comprehensive biometric authentication
- ✅ Full analytics & monitoring
- ✅ Enhanced testing strategy
- ✅ Complete CI/CD pipeline
- ✅ Production-ready best practices

