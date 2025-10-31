# Android App Design Document
## Admin Panel Mobile Application

### Overview
This document outlines the complete architecture, design, and implementation plan for an Android application that provides admin functionality for the Online Shop Business platform. The app will mirror the web admin panel functionality while adapting to mobile UI/UX patterns.

---

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Authentication & Security](#authentication--security)
5. [Data Layer](#data-layer)
6. [UI/UX Design](#uiux-design)
7. [Feature Implementation](#feature-implementation)
8. [API Integration](#api-integration)
9. [Offline Support](#offline-support)
10. [Push Notifications](#push-notifications)
11. [Development Setup](#development-setup)
12. [Testing Strategy](#testing-strategy)

---

## Architecture Overview

### Architecture Pattern: **MVVM (Model-View-ViewModel)**
Following Android's recommended architecture pattern with:
- **Model**: Data classes and repositories
- **View**: Activities/Fragments using Jetpack Compose
- **ViewModel**: Business logic and state management
- **Repository**: Single source of truth for data

### Key Architectural Components:
```
┌─────────────────────────────────────────────────┐
│           UI Layer (Compose)                     │
│  Activities, Fragments, Composables              │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│        ViewModel Layer                           │
│  ViewModels (StateFlow, LiveData)                │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│        Repository Layer                          │
│  Repositories (Data orchestration)               │
└──────┬──────────────────────┬───────────────────┘
       │                      │
┌──────▼──────┐      ┌────────▼────────┐
│  Remote     │      │   Local Cache   │
│  (Retrofit) │      │   (Room DB)     │
└─────────────┘      └─────────────────┘
```

---

## Technology Stack

### Core Android Libraries
- **Language**: Kotlin 100%
- **Minimum SDK**: 24 (Android 7.0)
- **Target SDK**: 34 (Android 14)
- **Compile SDK**: 34

### UI Framework
- **Jetpack Compose**: Modern declarative UI toolkit
  - `compose-bom`: Latest stable version
  - Material 3 components
  - Navigation Compose
  - Compose Material Icons Extended

### Architecture Components
- **ViewModel**: `androidx.lifecycle:lifecycle-viewmodel-compose`
- **LiveData/StateFlow**: Reactive state management
- **Navigation**: `androidx.navigation:navigation-compose`
- **Room Database**: `androidx.room:room-runtime` (for offline caching)
- **DataStore**: `androidx.datastore:datastore-preferences` (for settings/auth tokens)

### Networking
- **Retrofit 2**: `com.squareup.retrofit2:retrofit`
- **OkHttp**: `com.squareup.okhttp3:okhttp`
- **Moshi**: `com.squareup.moshi:moshi-kotlin` (JSON parsing)
- **Interceptor**: For authentication headers and token refresh

### Dependency Injection
- **Hilt**: `com.google.dagger:hilt-android`
- **Hilt Compose**: `androidx.hilt:hilt-navigation-compose`

### Image Loading
- **Coil**: `io.coil-kt:coil-compose` (replaces Glide/Picasso)

### Coroutines & Flow
- **Kotlin Coroutines**: `org.jetbrains.kotlinx:kotlinx-coroutines-android`
- **Kotlin Flow**: For reactive streams

### Additional Libraries
- **Material Icons**: `androidx.compose.material:material-icons-extended`
- **Paging**: `androidx.paging:paging-compose` (for large lists)
- **WorkManager**: `androidx.work:work-runtime-ktx` (for background tasks)
- **Firebase Cloud Messaging**: `com.google.firebase:firebase-messaging-ktx` (push notifications)
- **PDF Generation**: `com.itextpdf:itext7-core` (for PDF exports)
- **Excel Export**: `org.apache.poi:poi-ooxml` (for Excel exports)

### Testing
- **JUnit**: `junit:junit`
- **Mockito**: `org.mockito:mockito-core`
- **Espresso**: `androidx.test.espresso:espresso-core`
- **Compose Testing**: `androidx.compose.ui:ui-test-junit4`

---

## Project Structure

```
app/
├── src/
│   ├── main/
│   │   ├── java/com/onlineshop/admin/
│   │   │   ├── MainActivity.kt
│   │   │   ├── di/
│   │   │   │   ├── AppModule.kt
│   │   │   │   ├── NetworkModule.kt
│   │   │   │   └── DatabaseModule.kt
│   │   │   ├── data/
│   │   │   │   ├── local/
│   │   │   │   │   ├── database/
│   │   │   │   │   │   ├── AppDatabase.kt
│   │   │   │   │   │   ├── dao/
│   │   │   │   │   │   │   ├── ProductDao.kt
│   │   │   │   │   │   │   ├── CategoryDao.kt
│   │   │   │   │   │   │   ├── ListDao.kt
│   │   │   │   │   │   │   └── OrderDao.kt
│   │   │   │   │   │   └── entities/
│   │   │   │   │   │       ├── ProductEntity.kt
│   │   │   │   │   │       ├── CategoryEntity.kt
│   │   │   │   │   │       ├── ListEntity.kt
│   │   │   │   │   │       └── OrderEntity.kt
│   │   │   │   │   ├── datastore/
│   │   │   │   │   │   └── AuthDataStore.kt
│   │   │   │   │   └── preferences/
│   │   │   │   │       └── AppPreferences.kt
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
│   │   │   │   │   ├── dto/
│   │   │   │   │   │   ├── ProductDto.kt
│   │   │   │   │   │   ├── CategoryDto.kt
│   │   │   │   │   │   ├── ListDto.kt
│   │   │   │   │   │   ├── OrderDto.kt
│   │   │   │   │   │   └── AuthDto.kt
│   │   │   │   │   └── interceptors/
│   │   │   │   │       ├── AuthInterceptor.kt
│   │   │   │   │       └── TokenRefreshInterceptor.kt
│   │   │   │   └── repository/
│   │   │   │       ├── AuthRepository.kt
│   │   │   │       ├── ProductsRepository.kt
│   │   │   │       ├── CategoriesRepository.kt
│   │   │   │       ├── ListsRepository.kt
│   │   │   │       ├── OrdersRepository.kt
│   │   │   │       └── BusinessDetailsRepository.kt
│   │   │   ├── domain/
│   │   │   │   ├── model/
│   │   │   │   │   ├── Product.kt
│   │   │   │   │   ├── Category.kt
│   │   │   │   │   ├── List.kt
│   │   │   │   │   ├── Order.kt
│   │   │   │   │   └── BusinessDetails.kt
│   │   │   │   └── usecase/
│   │   │   │       ├── LoginUseCase.kt
│   │   │   │       ├── GetProductsUseCase.kt
│   │   │   │       ├── CreateProductUseCase.kt
│   │   │   │       └── GetOrdersUseCase.kt
│   │   │   ├── ui/
│   │   │   │   ├── theme/
│   │   │   │   │   ├── Color.kt
│   │   │   │   │   ├── Theme.kt
│   │   │   │   │   └── Type.kt
│   │   │   │   ├── navigation/
│   │   │   │   │   ├── NavGraph.kt
│   │   │   │   │   └── Screen.kt
│   │   │   │   ├── login/
│   │   │   │   │   ├── LoginScreen.kt
│   │   │   │   │   └── LoginViewModel.kt
│   │   │   │   ├── dashboard/
│   │   │   │   │   ├── DashboardScreen.kt
│   │   │   │   │   └── DashboardViewModel.kt
│   │   │   │   ├── products/
│   │   │   │   │   ├── list/
│   │   │   │   │   │   ├── ProductsListScreen.kt
│   │   │   │   │   │   └── ProductsListViewModel.kt
│   │   │   │   │   ├── detail/
│   │   │   │   │   │   ├── ProductDetailScreen.kt
│   │   │   │   │   │   └── ProductDetailViewModel.kt
│   │   │   │   │   └── form/
│   │   │   │   │       ├── ProductFormScreen.kt
│   │   │   │   │       └── ProductFormViewModel.kt
│   │   │   │   ├── categories/
│   │   │   │   │   ├── CategoriesListScreen.kt
│   │   │   │   │   ├── CategoryFormScreen.kt
│   │   │   │   │   └── CategoriesViewModel.kt
│   │   │   │   ├── lists/
│   │   │   │   │   ├── ListsListScreen.kt
│   │   │   │   │   ├── ListDetailScreen.kt
│   │   │   │   │   ├── ListFormScreen.kt
│   │   │   │   │   ├── ListProductsScreen.kt
│   │   │   │   │   ├── ListOrdersScreen.kt
│   │   │   │   │   └── ListsViewModel.kt
│   │   │   │   ├── orders/
│   │   │   │   │   ├── OrdersListScreen.kt
│   │   │   │   │   ├── OrderDetailScreen.kt
│   │   │   │   │   ├── OrderEditScreen.kt
│   │   │   │   │   └── OrdersViewModel.kt
│   │   │   │   ├── business/
│   │   │   │   │   ├── BusinessDetailsScreen.kt
│   │   │   │   │   └── BusinessDetailsViewModel.kt
│   │   │   │   ├── settings/
│   │   │   │   │   ├── SettingsScreen.kt
│   │   │   │   │   ├── SecurityScreen.kt
│   │   │   │   │   └── SettingsViewModel.kt
│   │   │   │   └── components/
│   │   │   │       ├── TopAppBar.kt
│   │   │   │       ├── BottomNavigation.kt
│   │   │   │       ├── LoadingIndicator.kt
│   │   │   │       ├── ErrorMessage.kt
│   │   │   │       └── ProductCard.kt
│   │   │   └── util/
│   │   │       ├── Constants.kt
│   │   │       ├── Extensions.kt
│   │   │       └── Validators.kt
│   │   ├── res/
│   │   │   ├── values/
│   │   │   │   ├── strings.xml
│   │   │   │   ├── colors.xml
│   │   │   │   └── themes.xml
│   │   │   └── drawable/
│   │   └── AndroidManifest.xml
│   └── test/
│       └── java/com/onlineshop/admin/
│           ├── repository/
│           ├── viewmodel/
│           └── usecase/
├── build.gradle.kts
└── build.gradle (project level)
```

---

## Authentication & Security

### Authentication Flow
1. **Login Screen**: Username/password input
2. **API Call**: `POST /api/v1/auth/login`
3. **Token Storage**: 
   - Access token: Memory (encrypted) + DataStore
   - Refresh token: DataStore (encrypted)
4. **Token Refresh**: Automatic via interceptor when access token expires
5. **Logout**: Clear tokens and navigate to login

### Security Measures
- **Token Storage**: Encrypted DataStore (Android Keystore)
- **HTTPS Only**: Enforce TLS 1.2+
- **Certificate Pinning**: For production (optional)
- **Biometric Authentication**: Optional unlock with fingerprint/face
- **Token Expiration**: Automatic refresh before expiry
- **Secure SharedPreferences**: Use DataStore instead

### Implementation Details
```kotlin
// AuthInterceptor.kt
class AuthInterceptor(
    private val authRepository: AuthRepository
) : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val request = chain.request()
        val token = authRepository.getAccessToken()
        
        val authenticatedRequest = token?.let {
            request.newBuilder()
                .header("Authorization", "Bearer $it")
                .build()
        } ?: request
        
        val response = chain.proceed(authenticatedRequest)
        
        // Handle 401 and refresh token
        if (response.code == 401 && !request.url.toString().contains("/auth/refresh")) {
            authRepository.refreshToken()
            val newToken = authRepository.getAccessToken()
            return chain.proceed(
                request.newBuilder()
                    .header("Authorization", "Bearer $newToken")
                    .build()
            )
        }
        
        return response
    }
}
```

---

## Data Layer

### Remote Data Source (Retrofit)
```kotlin
// ProductsApi.kt
interface ProductsApi {
    @GET("products")
    suspend fun getProducts(
        @Query("skip") skip: Int? = null,
        @Query("limit") limit: Int? = null,
        @Query("category_id") categoryId: Int? = null
    ): List<ProductDto>
    
    @GET("products/{id}")
    suspend fun getProduct(@Path("id") id: Int): ProductDto
    
    @POST("products")
    suspend fun createProduct(@Body product: ProductCreateDto): ProductDto
    
    @PATCH("products/{id}")
    suspend fun updateProduct(
        @Path("id") id: Int,
        @Body product: ProductUpdateDto
    ): ProductDto
    
    @DELETE("products/{id}")
    suspend fun deleteProduct(@Path("id") id: Int)
    
    @Multipart
    @POST("products/{id}/images")
    suspend fun uploadProductImage(
        @Path("id") id: Int,
        @Part image: MultipartBody.Part
    ): ProductImageDto
}
```

### Local Data Source (Room)
```kotlin
// ProductEntity.kt
@Entity(tableName = "products")
data class ProductEntity(
    @PrimaryKey val id: Int,
    val nume: String,
    val cantitate: Int,
    val pret: Double,
    val description: String?,
    val categoryId: Int,
    val unitatiId: Int,
    val createdAt: String,
    val updatedAt: String,
    val isDeleted: Boolean,
    val lastSynced: Long = System.currentTimeMillis()
)

// ProductDao.kt
@Dao
interface ProductDao {
    @Query("SELECT * FROM products WHERE isDeleted = 0 ORDER BY createdAt DESC")
    fun getAllProducts(): Flow<List<ProductEntity>>
    
    @Query("SELECT * FROM products WHERE id = :id")
    suspend fun getProduct(id: Int): ProductEntity?
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertProduct(product: ProductEntity)
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertProducts(products: List<ProductEntity>)
    
    @Update
    suspend fun updateProduct(product: ProductEntity)
    
    @Query("DELETE FROM products WHERE id = :id")
    suspend fun deleteProduct(id: Int)
}
```

### Repository Pattern
```kotlin
// ProductsRepository.kt
@Singleton
class ProductsRepository @Inject constructor(
    private val productsApi: ProductsApi,
    private val productDao: ProductDao,
    private val dispatcher: CoroutineDispatcher = Dispatchers.IO
) {
    fun getProducts(categoryId: Int? = null): Flow<List<Product>> = flow {
        // Emit cached data first
        productDao.getAllProducts().collect { cached ->
            emit(cached.map { it.toDomain() })
        }
        
        // Fetch from API and update cache
        try {
            val remote = productsApi.getProducts(categoryId = categoryId)
            productDao.insertProducts(remote.map { it.toEntity() })
        } catch (e: Exception) {
            // Handle error, keep showing cached data
        }
    }.flowOn(dispatcher)
    
    suspend fun createProduct(product: ProductCreateDto): Result<Product> {
        return try {
            val created = productsApi.createProduct(product)
            productDao.insertProduct(created.toEntity())
            Result.success(created.toDomain())
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
```

---

## UI/UX Design

### Design System
- **Material Design 3**: Follow Google's latest design guidelines
- **Dark Mode Support**: System-based theme switching
- **Typography**: System fonts (Roboto) with proper scaling
- **Colors**: Primary (Blue), Secondary (Gray), Accent (Green for success, Red for errors)

### Navigation Structure
```
Main Navigation (Bottom Navigation Bar):
├── Dashboard (Home icon)
├── Products (Package icon)
├── Lists (List icon)
├── Orders (Shopping cart icon)
└── Settings (Settings icon)

Secondary Navigation:
- Categories (from Products section)
- Business Details (from Settings)
- Delivery Types/Schedules (from Settings)
- Payment Methods (from Settings)
- Security (from Settings)
```

### Key Screens

#### 1. Login Screen
- Full-screen form
- Username and password fields
- Show/hide password toggle
- Login button
- Error message display
- Loading state during login

#### 2. Dashboard Screen
- Statistics cards (Total products, Lists, Orders today)
- Quick actions:
  - View recent orders
  - Clone latest list
  - Quick navigation to main sections
- Recent activity list

#### 3. Products List Screen
- Search bar
- Filter by category
- List with pull-to-refresh
- Swipe-to-delete
- FAB for adding new product
- Product cards with:
  - Image thumbnail
  - Name
  - Price
  - Stock quantity

#### 4. Product Form Screen
- Form fields:
  - Name (required)
  - Description (optional)
  - Price (required)
  - Quantity (required)
  - Category dropdown
  - Unit dropdown
  - Image upload (camera/gallery)
- Save/Cancel buttons
- Validation error display

#### 5. Lists List Screen
- List of lists with:
  - Date
  - Published status (badge)
  - Product count
  - Order count
- Swipe actions:
  - Edit
  - Clone
  - Delete
- FAB for new list

#### 6. List Detail Screen (Tabs)
- Tab navigation:
  - Edit Details
  - Products
  - Orders
  - Text Format
- Action buttons per tab

#### 7. Orders List Screen
- Filter options:
  - By list
  - By delivery type
  - Date range
- Sort options:
  - Chronological
  - Alphabetical
- Group by delivery type (toggle)
- Order cards with:
  - Customer name
  - Date
  - Total amount
  - Item count
- Swipe actions:
  - View details
  - Edit
  - Delete

#### 8. Order Detail Screen
- Customer information
- Order items list
- Delivery information
- Payment information
- Total breakdown
- Edit button
- Delete button

### Component Library
- **TopAppBar**: Custom app bar with title and actions
- **BottomNavigation**: Main navigation bar
- **Card**: Material 3 card component
- **LoadingIndicator**: Circular progress indicator
- **ErrorMessage**: Error state display
- **SearchBar**: Search input with clear button
- **FilterChip**: Filter selection chips
- **ImagePicker**: Camera/gallery picker dialog

---

## Feature Implementation

### Core Features Mapping

#### 1. Authentication ✅
- [x] Login screen
- [x] Token storage (encrypted)
- [x] Token refresh
- [x] Logout
- [x] Biometric unlock (optional)

#### 2. Dashboard ✅
- [x] Statistics overview
- [x] Quick actions
- [x] Recent activity

#### 3. Products Management ✅
- [x] List products
- [x] Create product
- [x] Edit product
- [x] Delete product
- [x] Image upload
- [x] Search and filter

#### 4. Categories Management ✅
- [x] List categories
- [x] Create category
- [x] Edit category
- [x] Delete category
- [x] Category image upload

#### 5. Lists Management ✅
- [x] List all lists
- [x] Create list
- [x] Edit list details
- [x] Clone list
- [x] Publish/unpublish list
- [x] Set expiration date
- [x] Add/remove products to list
- [x] Set stock per product per list
- [x] View list text format

#### 6. Orders Management ✅
- [x] List orders (filtered by list)
- [x] View order details
- [x] Edit order
- [x] Delete order
- [x] Group by delivery type
- [x] Sort orders
- [x] Merge similar orders
- [x] Export orders (PDF/Excel)
- [x] View product totals

#### 7. Business Configuration ✅
- [x] View business details
- [x] Edit business details
- [x] Upload logo

#### 8. Delivery Management ✅
- [x] List delivery types
- [x] Create/edit/delete delivery types
- [x] List delivery schedules
- [x] Create/edit/delete delivery schedules

#### 9. Payment Methods ✅
- [x] List payment methods
- [x] Create/edit/delete payment methods

#### 10. Units Management ✅
- [x] List units
- [x] Create/edit/delete units

#### 11. Security ✅
- [x] Change password
- [x] Password validation

#### 12. Push Notifications ✅
- [x] Subscribe to notifications
- [x] Manage subscriptions
- [x] Handle notification taps

---

## API Integration

### API Base Configuration
```kotlin
// NetworkModule.kt
@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {
    
    @Provides
    @Singleton
    fun provideOkHttpClient(
        authInterceptor: AuthInterceptor
    ): OkHttpClient {
        return OkHttpClient.Builder()
            .addInterceptor(authInterceptor)
            .addInterceptor(HttpLoggingInterceptor().apply {
                level = if (BuildConfig.DEBUG) {
                    HttpLoggingInterceptor.Level.BODY
                } else {
                    HttpLoggingInterceptor.Level.NONE
                }
            })
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .build()
    }
    
    @Provides
    @Singleton
    fun provideRetrofit(okHttpClient: OkHttpClient): Retrofit {
        return Retrofit.Builder()
            .baseUrl(BuildConfig.API_BASE_URL)
            .client(okHttpClient)
            .addConverterFactory(MoshiConverterFactory.create())
            .build()
    }
    
    @Provides
    @Singleton
    fun provideProductsApi(retrofit: Retrofit): ProductsApi {
        return retrofit.create(ProductsApi::class.java)
    }
    
    // ... other API interfaces
}
```

### API Endpoints Mapping

#### Authentication
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/refresh` - Refresh token
- `POST /api/v1/auth/change-password` - Change password

#### Products
- `GET /api/v1/products` - List products
- `GET /api/v1/products/{id}` - Get product
- `POST /api/v1/products` - Create product
- `PATCH /api/v1/products/{id}` - Update product
- `DELETE /api/v1/products/{id}` - Delete product
- `POST /api/v1/products/{id}/images` - Upload image

#### Categories
- `GET /api/v1/categories` - List categories
- `POST /api/v1/categories` - Create category
- `PUT /api/v1/categories/{id}` - Update category
- `PATCH /api/v1/categories/{id}` - Update category (partial)
- `DELETE /api/v1/categories/{id}` - Delete category

#### Lists
- `GET /api/v1/liste` - List lists
- `GET /api/v1/liste/{id}` - Get list
- `POST /api/v1/liste` - Create list
- `PUT /api/v1/liste/{id}` - Update list
- `PATCH /api/v1/liste/{id}` - Update list (partial)
- `DELETE /api/v1/liste/{id}` - Delete list
- `POST /api/v1/liste/{list_id}/products/{product_id}` - Add product to list
- `DELETE /api/v1/liste/{list_id}/products/{product_id}` - Remove product from list
- `PUT /api/v1/liste/{list_id}/products` - Replace all products

#### Orders
- `GET /api/v1/orders` - List orders (with filters)
- `GET /api/v1/orders/{id}` - Get order
- `PATCH /api/v1/orders/{id}` - Update order
- `DELETE /api/v1/orders/{id}` - Delete order

#### Business Details
- `GET /api/v1/detalii-business` - Get business details
- `POST /api/v1/detalii-business` - Create business details
- `PUT /api/v1/detalii-business/{id}` - Update business details
- `PATCH /api/v1/detalii-business/{id}` - Update business details (partial)

#### Delivery Types
- `GET /api/v1/tipuri-livrare` - List delivery types
- `POST /api/v1/tipuri-livrare` - Create delivery type
- `PUT /api/v1/tipuri-livrare/{id}` - Update delivery type
- `DELETE /api/v1/tipuri-livrare/{id}` - Delete delivery type

#### Delivery Schedules
- `GET /api/v1/orare-livrari` - List delivery schedules
- `POST /api/v1/orare-livrari` - Create delivery schedule
- `PUT /api/v1/orare-livrari/{id}` - Update delivery schedule
- `DELETE /api/v1/orare-livrari/{id}` - Delete delivery schedule

#### Payment Methods
- `GET /api/v1/modalitati-plata` - List payment methods
- `POST /api/v1/modalitati-plata` - Create payment method
- `PUT /api/v1/modalitati-plata/{id}` - Update payment method
- `DELETE /api/v1/modalitati-plata/{id}` - Delete payment method

#### Units
- `GET /api/v1/unitati` - List units
- `POST /api/v1/unitati` - Create unit
- `PUT /api/v1/unitati/{id}` - Update unit
- `DELETE /api/v1/unitati/{id}` - Delete unit

#### Push Notifications
- `GET /api/v1/push/public-key` - Get VAPID public key
- `POST /api/v1/push/admin/subscribe` - Subscribe to admin notifications
- `GET /api/v1/push/topics` - List topics
- `POST /api/v1/push/topics/subscribe` - Subscribe to topics
- `DELETE /api/v1/push/topics/subscribe` - Unsubscribe from topics

---

## Offline Support

### Strategy
1. **Room Database**: Cache all data locally
2. **Sync Queue**: Queue writes when offline
3. **Conflict Resolution**: Last-write-wins or manual merge
4. **Sync Indicators**: Show sync status in UI

### Implementation
```kotlin
// OfflineSyncManager.kt
@Singleton
class OfflineSyncManager @Inject constructor(
    private val productsRepository: ProductsRepository,
    private val workManager: WorkManager
) {
    fun syncAllData() {
        val syncWork = OneTimeWorkRequestBuilder<SyncWorker>()
            .setConstraints(
                Constraints.Builder()
                    .setRequiredNetworkType(NetworkType.CONNECTED)
                    .build()
            )
            .build()
        
        workManager.enqueue(syncWork)
    }
}
```

---

## Push Notifications

### Firebase Cloud Messaging Setup
1. Add Firebase to project
2. Configure FCM in AndroidManifest
3. Create FirebaseMessagingService
4. Handle notification taps
5. Subscribe to admin topics

### Implementation
```kotlin
// FirebaseMessagingService.kt
class AppFirebaseMessagingService : FirebaseMessagingService() {
    
    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        // Handle notification
        showNotification(remoteMessage)
    }
    
    override fun onNewToken(token: String) {
        // Update subscription with new token
        updatePushSubscription(token)
    }
}
```

---

## Development Setup

### Prerequisites
- Android Studio Hedgehog (2023.1.1) or later
- JDK 17 or later
- Android SDK (API 24-34)
- Gradle 8.0+

### Build Configuration
```kotlin
// build.gradle.kts (app level)
android {
    namespace = "com.onlineshop.admin"
    compileSdk = 34
    
    defaultConfig {
        applicationId = "com.onlineshop.admin"
        minSdk = 24
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"
        
        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        
        // API Base URL
        buildConfigField("String", "API_BASE_URL", "\"https://your-api-domain.com\"")
    }
    
    buildTypes {
        release {
            isMinifyEnabled = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
    
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    
    kotlinOptions {
        jvmTarget = "17"
    }
    
    buildFeatures {
        compose = true
    }
    
    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.3"
    }
}

dependencies {
    // Compose BOM
    implementation(platform("androidx.compose:compose-bom:2023.10.01"))
    
    // Core Compose
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3")
    
    // Navigation
    implementation("androidx.navigation:navigation-compose:2.7.5")
    
    // ViewModel
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.6.2")
    
    // Hilt
    implementation("com.google.dagger:hilt-android:2.48")
    kapt("com.google.dagger:hilt-compiler:2.48")
    implementation("androidx.hilt:hilt-navigation-compose:1.1.0")
    
    // Retrofit
    implementation("com.squareup.retrofit2:retrofit:2.9.0")
    implementation("com.squareup.retrofit2:converter-moshi:2.9.0")
    implementation("com.squareup.okhttp3:okhttp:4.12.0")
    implementation("com.squareup.okhttp3:logging-interceptor:4.12.0")
    
    // Moshi
    implementation("com.squareup.moshi:moshi-kotlin:1.15.0")
    kapt("com.squareup.moshi:moshi-kotlin-codegen:1.15.0")
    
    // Room
    implementation("androidx.room:room-runtime:2.6.1")
    implementation("androidx.room:room-ktx:2.6.1")
    kapt("androidx.room:room-compiler:2.6.1")
    
    // DataStore
    implementation("androidx.datastore:datastore-preferences:1.0.0")
    
    // Coil (Image loading)
    implementation("io.coil-kt:coil-compose:2.5.0")
    
    // Coroutines
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3")
    
    // WorkManager
    implementation("androidx.work:work-runtime-ktx:2.9.0")
    
    // Firebase
    implementation("com.google.firebase:firebase-messaging-ktx:23.3.1")
    
    // PDF Generation
    implementation("com.itextpdf:itext7-core:8.0.2")
    
    // Excel Export
    implementation("org.apache.poi:poi-ooxml:5.2.5")
    
    // Testing
    testImplementation("junit:junit:4.13.2")
    androidTestImplementation("androidx.test.ext:junit:1.1.5")
    androidTestImplementation("androidx.test.espresso:espresso-core:3.5.1")
    androidTestImplementation(platform("androidx.compose:compose-bom:2023.10.01"))
    androidTestImplementation("androidx.compose.ui:ui-test-junit4")
}
```

### Environment Configuration
Create `local.properties`:
```properties
api.base.url=https://your-api-domain.com
```

### ProGuard Rules
```proguard
# Retrofit
-keepattributes Signature, InnerClasses, EnclosingMethod
-keepattributes RuntimeVisibleAnnotations, RuntimeVisibleParameterAnnotations
-keepclassmembers,allowshrinking,allowobfuscation interface * {
    @retrofit2.http.* <methods>;
}

# Moshi
-keep class com.squareup.moshi.** { *; }
-keep @com.squareup.moshi.JsonQualifier interface *

# OkHttp
-dontwarn okhttp3.**
-dontwarn okio.**
```

---

## Testing Strategy

### Unit Tests
- ViewModels: Test business logic
- Repositories: Test data operations
- UseCases: Test domain logic
- Validators: Test input validation

### Integration Tests
- API integration: Test network calls
- Database operations: Test Room queries
- Navigation: Test navigation flow

### UI Tests
- Compose UI tests: Test UI components
- Espresso tests: Test user interactions

### Example Test
```kotlin
// ProductsViewModelTest.kt
@HiltAndroidTest
class ProductsViewModelTest {
    
    @get:Rule
    val hiltRule = HiltAndroidRule(this)
    
    @Test
    fun `loadProducts loads products from repository`() = runTest {
        val viewModel = ProductsViewModel(mockRepository)
        viewModel.loadProducts()
        
        assertEquals(3, viewModel.uiState.value.products.size)
    }
}
```

---

## Additional Considerations

### Performance Optimization
- **Image Caching**: Coil handles this automatically
- **List Pagination**: Use Paging3 for large lists
- **Database Indexing**: Add indices for frequently queried fields
- **Memory Management**: Use weak references where appropriate

### Accessibility
- **Content Descriptions**: Add for all interactive elements
- **Touch Targets**: Minimum 48dp x 48dp
- **Text Scaling**: Support system font scaling
- **Screen Readers**: Test with TalkBack

### Internationalization
- **String Resources**: All text in `strings.xml`
- **Date Formatting**: Use locale-aware formatting
- **Number Formatting**: Use locale-aware formatting

### Error Handling
- **Network Errors**: Show user-friendly messages
- **Validation Errors**: Show inline errors
- **Generic Errors**: Show generic error with retry option
- **Logging**: Log errors for debugging (not in production)

### Analytics
- **Firebase Analytics**: Track user actions (optional)
- **Crash Reporting**: Firebase Crashlytics (optional)

---

## Summary

This Android app will provide full admin functionality for the Online Shop Business platform with:
- ✅ Modern Android architecture (MVVM + Compose)
- ✅ Complete feature parity with web admin panel
- ✅ Offline support with local caching
- ✅ Push notifications
- ✅ Secure authentication
- ✅ Material Design 3 UI
- ✅ PDF/Excel export capabilities
- ✅ Comprehensive testing strategy

The app is designed to be maintainable, scalable, and user-friendly while following Android best practices and modern development patterns.

