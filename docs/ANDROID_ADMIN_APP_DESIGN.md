# Android Admin App - Architecture & Design Specification

## 📱 Executive Summary

This document provides a comprehensive technical specification for developing a dedicated Android application for the **admin/business management** functionality of the online shop platform. The app will enable business owners to manage their shop on-the-go with mobile-optimized UI patterns while maintaining feature parity with the web admin panel.

---

## 🎯 Project Scope

### In Scope
- **Admin panel features only** - All business/shop management features
- **Native Android app** - Kotlin-based, modern architecture
- **Offline-capable** - Local caching with background sync
- **Push notifications** - Real-time order alerts
- **Mobile-optimized UI** - Touch-friendly, responsive design

### Out of Scope
- Customer-facing features (shopping, cart, checkout)
- iOS version (though architecture should allow future iOS port)
- Web portal (already exists)

---

## 📋 Feature Analysis from Web Admin

Based on the codebase analysis, here's the complete feature set:

### 1. **Dashboard** (`/admin/dashboard`)
- Quick access cards to all sections
- Recent orders shortcut
- List cloning functionality
- Visual stats/metrics display
- Next delivery date display

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

### 8. **Advanced Operations** (`/admin/advanced`)
- Push notifications management
- Notification subscriptions
- Topic-based notifications

---

## 🏗️ Recommended Architecture

### Technology Stack

```
Android Application
├── Language: Kotlin 1.9+
├── Min SDK: Android 8.0 (API 26)
├── Target SDK: Android 14 (API 34)
├── Architecture: MVVM + Clean Architecture
├── DI: Hilt (Dagger)
├── Networking: Retrofit 2 + OkHttp 3
├── Local DB: Room
├── Image Loading: Coil
├── Async: Coroutines + Flow
├── UI: Jetpack Compose
├── Navigation: Compose Navigation
└── Build: Gradle (Kotlin DSL)
```

### Why This Stack?

1. **Kotlin** - Modern, concise, null-safe, official Android language
2. **Jetpack Compose** - Declarative UI, similar to React (easier for team familiar with React)
3. **MVVM** - Separates concerns, testable, Android recommended
4. **Hilt** - Simplified dependency injection, officially supported
5. **Retrofit** - Industry standard for REST APIs
6. **Room** - Type-safe database, offline-first architecture
7. **Coroutines + Flow** - Similar to RxJS/async patterns from web
8. **Coil** - Kotlin-first, efficient image loading with Compose support

---

## 📁 Project Structure

```
app/
├── src/
│   ├── main/
│   │   ├── java/com/yourcompany/adminapp/
│   │   │   ├── data/
│   │   │   │   ├── local/           # Room database
│   │   │   │   │   ├── dao/
│   │   │   │   │   ├── entities/
│   │   │   │   │   └── AppDatabase.kt
│   │   │   │   ├── remote/          # API services
│   │   │   │   │   ├── api/
│   │   │   │   │   │   ├── ProductApi.kt
│   │   │   │   │   │   ├── CategoryApi.kt
│   │   │   │   │   │   ├── OrderApi.kt
│   │   │   │   │   │   └── ...
│   │   │   │   │   ├── dto/         # API response models
│   │   │   │   │   └── interceptors/
│   │   │   │   ├── repository/      # Data layer implementation
│   │   │   │   │   ├── ProductRepository.kt
│   │   │   │   │   ├── CategoryRepository.kt
│   │   │   │   │   └── ...
│   │   │   │   └── mapper/          # DTO ↔ Domain mapping
│   │   │   ├── domain/
│   │   │   │   ├── model/           # Domain entities
│   │   │   │   │   ├── Product.kt
│   │   │   │   │   ├── Category.kt
│   │   │   │   │   ├── Order.kt
│   │   │   │   │   └── ...
│   │   │   │   ├── repository/      # Repository interfaces
│   │   │   │   └── usecase/         # Business logic
│   │   │   │       ├── product/
│   │   │   │       ├── category/
│   │   │   │       ├── order/
│   │   │   │       └── ...
│   │   │   ├── presentation/
│   │   │   │   ├── navigation/      # Compose Navigation
│   │   │   │   ├── theme/           # Material Design theme
│   │   │   │   ├── components/      # Reusable UI components
│   │   │   │   │   ├── AppButton.kt
│   │   │   │   │   ├── AppTextField.kt
│   │   │   │   │   ├── ImagePicker.kt
│   │   │   │   │   └── ...
│   │   │   │   └── screens/         # Feature screens
│   │   │   │       ├── dashboard/
│   │   │   │       │   ├── DashboardScreen.kt
│   │   │   │       │   └── DashboardViewModel.kt
│   │   │   │       ├── products/
│   │   │   │       │   ├── ProductListScreen.kt
│   │   │   │       │   ├── ProductListViewModel.kt
│   │   │   │       │   ├── ProductFormScreen.kt
│   │   │   │       │   └── ProductFormViewModel.kt
│   │   │   │       ├── categories/
│   │   │   │       ├── orders/
│   │   │   │       ├── lists/
│   │   │   │       ├── settings/
│   │   │   │       └── auth/
│   │   │   ├── di/                  # Hilt modules
│   │   │   │   ├── AppModule.kt
│   │   │   │   ├── NetworkModule.kt
│   │   │   │   ├── DatabaseModule.kt
│   │   │   │   └── RepositoryModule.kt
│   │   │   ├── util/                # Utilities
│   │   │   │   ├── Constants.kt
│   │   │   │   ├── DateUtils.kt
│   │   │   │   ├── ImageUtils.kt
│   │   │   │   └── ValidationUtils.kt
│   │   │   └── AdminApplication.kt  # Application class
│   │   ├── res/
│   │   │   ├── drawable/
│   │   │   ├── values/
│   │   │   └── xml/                 # Network security config
│   │   └── AndroidManifest.xml
│   └── test/                        # Unit tests
│       └── androidTest/             # Instrumented tests
└── build.gradle.kts
```

---

## 🔌 API Integration

### Base Configuration

The app will communicate with the same FastAPI backend:

```kotlin
// NetworkModule.kt
object NetworkConfig {
    const val BASE_URL = "https://api.yourshop.com/api/v1/"
    const val CONNECT_TIMEOUT = 30L
    const val READ_TIMEOUT = 30L
    const val WRITE_TIMEOUT = 30L
}

@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {
    
    @Provides
    @Singleton
    fun provideOkHttpClient(
        authInterceptor: AuthInterceptor,
        loggingInterceptor: HttpLoggingInterceptor
    ): OkHttpClient {
        return OkHttpClient.Builder()
            .addInterceptor(authInterceptor)
            .addInterceptor(loggingInterceptor)
            .connectTimeout(CONNECT_TIMEOUT, TimeUnit.SECONDS)
            .readTimeout(READ_TIMEOUT, TimeUnit.SECONDS)
            .writeTimeout(WRITE_TIMEOUT, TimeUnit.SECONDS)
            .build()
    }
    
    @Provides
    @Singleton
    fun provideRetrofit(okHttpClient: OkHttpClient): Retrofit {
        return Retrofit.Builder()
            .baseUrl(NetworkConfig.BASE_URL)
            .client(okHttpClient)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }
}
```

### Authentication Interceptor

```kotlin
class AuthInterceptor @Inject constructor(
    private val tokenManager: TokenManager
) : Interceptor {
    
    override fun intercept(chain: Interceptor.Chain): Response {
        val request = chain.request()
        val token = tokenManager.getAccessToken()
        
        val authenticatedRequest = if (token != null) {
            request.newBuilder()
                .header("Authorization", "Bearer $token")
                .build()
        } else {
            request
        }
        
        val response = chain.proceed(authenticatedRequest)
        
        // Handle 401 - token refresh logic
        if (response.code == 401) {
            response.close()
            synchronized(this) {
                val refreshToken = tokenManager.getRefreshToken()
                if (refreshToken != null) {
                    val newToken = refreshAccessToken(refreshToken)
                    if (newToken != null) {
                        tokenManager.saveAccessToken(newToken)
                        // Retry request with new token
                        return chain.proceed(
                            request.newBuilder()
                                .header("Authorization", "Bearer $newToken")
                                .build()
                        )
                    }
                }
            }
            // Token refresh failed, logout
            tokenManager.clearTokens()
        }
        
        return response
    }
}
```

### API Service Examples

```kotlin
// ProductApi.kt
interface ProductApi {
    @GET("products")
    suspend fun getProducts(
        @Query("skip") skip: Int = 0,
        @Query("limit") limit: Int = 100,
        @Query("category_id") categoryId: Int? = null
    ): List<ProductDto>
    
    @GET("products/{id}")
    suspend fun getProduct(@Path("id") id: Int): ProductDto
    
    @Multipart
    @POST("products")
    suspend fun createProduct(
        @Part("nume") name: String,
        @Part("cantitate") quantity: Int,
        @Part("pret") price: Double,
        @Part("description") description: String?,
        @Part("category_id") categoryId: Int,
        @Part("unitati_id") unitId: Int,
        @Part image: MultipartBody.Part?
    ): ProductDto
    
    @Multipart
    @PATCH("products/{id}")
    suspend fun updateProduct(
        @Path("id") id: Int,
        @Part("nume") name: String?,
        @Part("cantitate") quantity: Int?,
        @Part("pret") price: Double?,
        @Part("description") description: String?,
        @Part("category_id") categoryId: Int?,
        @Part("unitati_id") unitId: Int?
    ): ProductDto
    
    @DELETE("products/{id}")
    suspend fun deleteProduct(@Path("id") id: Int)
    
    @Multipart
    @POST("products/{id}/images")
    suspend fun uploadProductImage(
        @Path("id") productId: Int,
        @Part image: MultipartBody.Part,
        @Part("position") position: Int? = null
    ): ProductImageDto
    
    @DELETE("products/{product_id}/images/{image_id}")
    suspend fun deleteProductImage(
        @Path("product_id") productId: Int,
        @Path("image_id") imageId: Int
    )
    
    @PUT("products/{product_id}/images/{image_id}/primary")
    suspend fun setPrimaryImage(
        @Path("product_id") productId: Int,
        @Path("image_id") imageId: Int
    ): ProductDto
    
    @PUT("products/{id}/images/reorder")
    suspend fun reorderImages(
        @Path("id") productId: Int,
        @Body mappings: List<ImagePositionMapping>
    ): List<ProductImageDto>
}

// OrderApi.kt
interface OrderApi {
    @GET("orders")
    suspend fun getOrders(
        @Query("liste_id") listId: Int? = null,
        @Query("merge_similar") mergeSimilar: Boolean = false
    ): List<OrderDto>
    
    @GET("orders/{id}")
    suspend fun getOrder(@Path("id") id: Int): OrderDto
    
    @PATCH("orders/{id}")
    suspend fun updateOrder(
        @Path("id") id: Int,
        @Body update: OrderUpdateDto
    ): OrderDto
    
    @DELETE("orders/{id}")
    suspend fun deleteOrder(@Path("id") id: Int)
}
```

### Domain Models

```kotlin
// Product.kt
data class Product(
    val id: Int,
    val nume: String,
    val cantitate: Int,
    val pret: Double,
    val description: String?,
    val categoryId: Int,
    val unitatiId: Int,
    val createdAt: String,
    val updatedAt: String,
    val isDeleted: Boolean,
    val images: List<ProductImage>,
    val imageVersions: ImageVersions
)

data class ProductImage(
    val id: Int,
    val path: String,
    val position: Int,
    val produseId: Int,
    val isPrimary: Boolean,
    val imageVersions: ImageVersions
)

data class ImageVersions(
    val original: String,
    val medium: String,
    val thumbnail: String
)

// Order.kt
data class Order(
    val id: Int,
    val numeClient: String,
    val dataPlasarii: String,
    val listeId: Int,
    val deliveryTypeId: Int,
    val paymentMethodId: Int,
    val deliveryAddress: String?,
    val orderNotes: String?,
    val phoneNumber: String?,
    val createdAt: String,
    val updatedAt: String,
    val items: List<OrderItem>
)

data class OrderItem(
    val comenziId: Int,
    val produseId: Int,
    val pretProdus: Double,
    val cantitateProdus: Int,
    val unitatiId: Int
)
```

---

## 🎨 UI/UX Design Patterns

### Mobile-Specific Patterns

#### 1. **Navigation**
- **Bottom Navigation Bar** (main sections)
  - Dashboard (Home)
  - Products
  - Orders
  - Lists
  - More (settings, business details, etc.)

- **Top App Bar**
  - Title
  - Search (context-sensitive)
  - Filter/Sort
  - Actions menu

#### 2. **List Views**
- **Infinite Scroll** with pagination
- **Pull-to-Refresh** for data updates
- **Swipe Actions** for quick operations (delete, edit)
- **Card-based Layout** for better touch targets
- **Floating Action Button (FAB)** for primary action (e.g., Add Product)

#### 3. **Forms**
- **Single-column layout** (mobile-first)
- **Large touch targets** (minimum 48dp)
- **Inline validation** with error messages
- **Image picker** with camera/gallery options
- **Date/time pickers** for scheduling
- **Dropdown selections** with bottom sheets

#### 4. **Image Management**
- **Grid view** for multiple images
- **Long-press to reorder** (drag & drop)
- **Tap to set primary** image
- **Swipe to delete** with confirmation
- **Full-screen preview** with pinch-to-zoom

#### 5. **Order Management**
- **Expandable cards** for order details
- **Filter chips** for delivery types
- **Multi-select mode** for bulk actions
- **Quick actions** (edit, delete, share)
- **Export menu** (PDF, XLS) with share intent

### Material Design 3

```kotlin
// Theme.kt
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
            secondary = Color(0xFF03DAC6),
            tertiary = Color(0xFFBB86FC)
        )
        else -> lightColorScheme(
            primary = Color(0xFF6200EE),
            secondary = Color(0xFF03DAC6),
            tertiary = Color(0xFFBB86FC)
        )
    }
    
    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
```

---

## 📱 Screen Examples

### 1. Dashboard Screen

```kotlin
@Composable
fun DashboardScreen(
    viewModel: DashboardViewModel = hiltViewModel(),
    onNavigateToOrders: () -> Unit,
    onNavigateToProducts: () -> Unit,
    onNavigateToLists: () -> Unit
) {
    val uiState by viewModel.uiState.collectAsState()
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Dashboard") },
                actions = {
                    IconButton(onClick = { /* Notifications */ }) {
                        Icon(Icons.Filled.Notifications, "Notifications")
                    }
                }
            )
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Quick Stats
            item {
                QuickStatsSection(stats = uiState.stats)
            }
            
            // Shortcuts
            item {
                Text("Shortcuts", style = MaterialTheme.typography.titleLarge)
            }
            
            item {
                ShortcutCard(
                    title = "Recent Orders",
                    description = "View latest orders",
                    icon = Icons.Filled.ShoppingCart,
                    onClick = onNavigateToOrders
                )
            }
            
            item {
                ShortcutCard(
                    title = "Clone List",
                    description = "Create new list from latest",
                    icon = Icons.Filled.ContentCopy,
                    onClick = { viewModel.cloneLatestList() }
                )
            }
            
            // Main Sections
            item {
                Text("Catalog", style = MaterialTheme.typography.titleLarge)
            }
            
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    DashboardCard(
                        title = "Products",
                        icon = Icons.Filled.Inventory,
                        onClick = onNavigateToProducts,
                        modifier = Modifier.weight(1f)
                    )
                    DashboardCard(
                        title = "Categories",
                        icon = Icons.Filled.Category,
                        onClick = { /* Navigate */ },
                        modifier = Modifier.weight(1f)
                    )
                }
            }
            
            item {
                DashboardCard(
                    title = "Lists",
                    icon = Icons.Filled.List,
                    onClick = onNavigateToLists,
                    modifier = Modifier.fillMaxWidth()
                )
            }
        }
    }
}
```

### 2. Product List Screen

```kotlin
@Composable
fun ProductListScreen(
    viewModel: ProductListViewModel = hiltViewModel(),
    onNavigateToProductForm: (Int?) -> Unit
) {
    val uiState by viewModel.uiState.collectAsState()
    val products = uiState.products
    val isLoading = uiState.isLoading
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Products") },
                actions = {
                    IconButton(onClick = { /* Search */ }) {
                        Icon(Icons.Filled.Search, "Search")
                    }
                    IconButton(onClick = { /* Filter */ }) {
                        Icon(Icons.Filled.FilterList, "Filter")
                    }
                }
            )
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = { onNavigateToProductForm(null) }
            ) {
                Icon(Icons.Filled.Add, "Add Product")
            }
        }
    ) { padding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            if (isLoading && products.isEmpty()) {
                CircularProgressIndicator(
                    modifier = Modifier.align(Alignment.Center)
                )
            } else {
                LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(products, key = { it.id }) { product ->
                        ProductListItem(
                            product = product,
                            onClick = { onNavigateToProductForm(product.id) },
                            onDelete = { viewModel.deleteProduct(product.id) }
                        )
                    }
                    
                    // Pagination loading indicator
                    if (isLoading && products.isNotEmpty()) {
                        item {
                            CircularProgressIndicator(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(16.dp)
                                    .wrapContentWidth(Alignment.CenterHorizontally)
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun ProductListItem(
    product: Product,
    onClick: () -> Unit,
    onDelete: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
    ) {
        Row(
            modifier = Modifier
                .padding(16.dp)
                .fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Product Image
            AsyncImage(
                model = product.imageVersions.thumbnail,
                contentDescription = product.nume,
                modifier = Modifier
                    .size(80.dp)
                    .clip(RoundedCornerShape(8.dp)),
                contentScale = ContentScale.Crop
            )
            
            Spacer(modifier = Modifier.width(16.dp))
            
            // Product Info
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = product.nume,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = "${product.pret} RON",
                    style = MaterialTheme.typography.bodyLarge,
                    color = MaterialTheme.colorScheme.primary
                )
                Text(
                    text = "${product.cantitate} units",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
            
            // Actions
            IconButton(onClick = onDelete) {
                Icon(
                    Icons.Filled.Delete,
                    contentDescription = "Delete",
                    tint = MaterialTheme.colorScheme.error
                )
            }
        }
    }
}
```

### 3. Product Form Screen

```kotlin
@Composable
fun ProductFormScreen(
    productId: Int?,
    viewModel: ProductFormViewModel = hiltViewModel(),
    onNavigateBack: () -> Unit
) {
    val uiState by viewModel.uiState.collectAsState()
    
    LaunchedEffect(productId) {
        productId?.let { viewModel.loadProduct(it) }
    }
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(if (productId == null) "New Product" else "Edit Product") },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, "Back")
                    }
                },
                actions = {
                    TextButton(
                        onClick = { viewModel.saveProduct() }
                    ) {
                        Text("SAVE")
                    }
                }
            )
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Image section
            item {
                ProductImageManager(
                    images = uiState.images,
                    onAddImage = { viewModel.addImage(it) },
                    onRemoveImage = { viewModel.removeImage(it) },
                    onReorderImages = { viewModel.reorderImages(it) },
                    onSetPrimary = { viewModel.setPrimaryImage(it) }
                )
            }
            
            // Name field
            item {
                OutlinedTextField(
                    value = uiState.name,
                    onValueChange = { viewModel.updateName(it) },
                    label = { Text("Product Name") },
                    modifier = Modifier.fillMaxWidth(),
                    isError = uiState.nameError != null,
                    supportingText = uiState.nameError?.let { { Text(it) } }
                )
            }
            
            // Price and Quantity
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    OutlinedTextField(
                        value = uiState.price,
                        onValueChange = { viewModel.updatePrice(it) },
                        label = { Text("Price (RON)") },
                        keyboardOptions = KeyboardOptions(
                            keyboardType = KeyboardType.Decimal
                        ),
                        modifier = Modifier.weight(1f)
                    )
                    
                    OutlinedTextField(
                        value = uiState.quantity,
                        onValueChange = { viewModel.updateQuantity(it) },
                        label = { Text("Quantity") },
                        keyboardOptions = KeyboardOptions(
                            keyboardType = KeyboardType.Number
                        ),
                        modifier = Modifier.weight(1f)
                    )
                }
            }
            
            // Category dropdown
            item {
                ExposedDropdownMenuBox(
                    expanded = uiState.categoryDropdownExpanded,
                    onExpandedChange = { viewModel.toggleCategoryDropdown() }
                ) {
                    OutlinedTextField(
                        value = uiState.selectedCategory?.name ?: "",
                        onValueChange = {},
                        readOnly = true,
                        label = { Text("Category") },
                        trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = uiState.categoryDropdownExpanded) },
                        modifier = Modifier
                            .fillMaxWidth()
                            .menuAnchor()
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
            }
            
            // Description
            item {
                OutlinedTextField(
                    value = uiState.description,
                    onValueChange = { viewModel.updateDescription(it) },
                    label = { Text("Description (optional)") },
                    modifier = Modifier.fillMaxWidth(),
                    minLines = 3,
                    maxLines = 6
                )
            }
        }
    }
}
```

### 4. Order List Screen

```kotlin
@Composable
fun OrderListScreen(
    listId: Int,
    viewModel: OrderListViewModel = hiltViewModel(),
    onNavigateToOrderDetail: (Int) -> Unit
) {
    val uiState by viewModel.uiState.collectAsState()
    
    LaunchedEffect(listId) {
        viewModel.loadOrders(listId)
    }
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Orders") },
                actions = {
                    IconButton(onClick = { /* Sort */ }) {
                        Icon(Icons.Filled.Sort, "Sort")
                    }
                    IconButton(onClick = { /* More options */ }) {
                        Icon(Icons.Filled.MoreVert, "More")
                    }
                }
            )
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            // Group by delivery type
            uiState.ordersByDeliveryType.forEach { (deliveryType, orders) ->
                item {
                    DeliveryTypeHeader(
                        deliveryType = deliveryType,
                        orderCount = orders.size
                    )
                }
                
                items(orders, key = { it.id }) { order ->
                    OrderListItem(
                        order = order,
                        onClick = { onNavigateToOrderDetail(order.id) },
                        onEdit = { viewModel.editOrder(order) },
                        onDelete = { viewModel.deleteOrder(order.id) }
                    )
                }
            }
            
            // Order totals
            item {
                OrderTotalsCard(totals = uiState.productTotals)
            }
        }
    }
}
```

---

## 💾 Offline Support & Caching

### Room Database Schema

```kotlin
@Database(
    entities = [
        ProductEntity::class,
        CategoryEntity::class,
        OrderEntity::class,
        OrderItemEntity::class,
        ListEntity::class,
        // ... other entities
    ],
    version = 1,
    exportSchema = false
)
abstract class AppDatabase : RoomDatabase() {
    abstract fun productDao(): ProductDao
    abstract fun categoryDao(): CategoryDao
    abstract fun orderDao(): OrderDao
    // ... other DAOs
}

// Example Entity
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
    val syncStatus: SyncStatus,
    val lastSyncAt: Long?
)

enum class SyncStatus {
    SYNCED,      // Fully synced with server
    PENDING,     // Local changes pending upload
    CONFLICT,    // Sync conflict detected
    ERROR        // Sync failed
}
```

### Repository Pattern with Offline Support

```kotlin
class ProductRepository @Inject constructor(
    private val productApi: ProductApi,
    private val productDao: ProductDao,
    private val networkMonitor: NetworkMonitor
) : IProductRepository {
    
    override fun getProducts(
        categoryId: Int?,
        forceRefresh: Boolean
    ): Flow<Resource<List<Product>>> = flow {
        // Emit loading state
        emit(Resource.Loading())
        
        // Emit cached data first
        val cachedProducts = productDao.getAllProducts()
        if (cachedProducts.isNotEmpty() && !forceRefresh) {
            emit(Resource.Success(cachedProducts.map { it.toDomain() }))
        }
        
        // Fetch from network if online
        if (networkMonitor.isOnline()) {
            try {
                val remoteProducts = productApi.getProducts(categoryId = categoryId)
                
                // Update cache
                productDao.deleteAll()
                productDao.insertAll(remoteProducts.map { it.toEntity() })
                
                // Emit fresh data
                val freshProducts = productDao.getAllProducts()
                emit(Resource.Success(freshProducts.map { it.toDomain() }))
                
            } catch (e: Exception) {
                // Network error - use cached data if available
                if (cachedProducts.isNotEmpty()) {
                    emit(Resource.Error(
                        message = "Using offline data",
                        data = cachedProducts.map { it.toDomain() }
                    ))
                } else {
                    emit(Resource.Error(message = e.message ?: "Unknown error"))
                }
            }
        } else {
            // Offline - use cached data
            if (cachedProducts.isEmpty()) {
                emit(Resource.Error(message = "No internet connection"))
            }
        }
    }.flowOn(Dispatchers.IO)
    
    override suspend fun createProduct(product: ProductCreate): Resource<Product> {
        return try {
            if (networkMonitor.isOnline()) {
                // Online - create on server
                val created = productApi.createProduct(
                    name = product.nume,
                    quantity = product.cantitate,
                    price = product.pret,
                    description = product.description,
                    categoryId = product.categoryId,
                    unitId = product.unitatiId,
                    image = null // Handle separately
                )
                
                // Update cache
                productDao.insert(created.toEntity())
                
                Resource.Success(created.toDomain())
            } else {
                // Offline - save to local queue
                val localProduct = product.toEntity(
                    id = generateTempId(),
                    syncStatus = SyncStatus.PENDING
                )
                productDao.insert(localProduct)
                
                Resource.Success(localProduct.toDomain())
            }
        } catch (e: Exception) {
            Resource.Error(message = e.message ?: "Failed to create product")
        }
    }
    
    override suspend fun syncPendingChanges() {
        if (!networkMonitor.isOnline()) return
        
        val pendingProducts = productDao.getPendingProducts()
        
        pendingProducts.forEach { product ->
            try {
                when {
                    product.id < 0 -> {
                        // New product - create on server
                        val created = productApi.createProduct(/* ... */)
                        productDao.delete(product)
                        productDao.insert(created.toEntity())
                    }
                    product.isDeleted -> {
                        // Deleted product - delete on server
                        productApi.deleteProduct(product.id)
                        productDao.delete(product)
                    }
                    else -> {
                        // Updated product - update on server
                        val updated = productApi.updateProduct(product.id, /* ... */)
                        productDao.update(updated.toEntity())
                    }
                }
            } catch (e: Exception) {
                // Mark as error, retry later
                productDao.update(product.copy(syncStatus = SyncStatus.ERROR))
            }
        }
    }
}
```

### Background Sync with WorkManager

```kotlin
@HiltWorker
class SyncWorker @AssistedInject constructor(
    @Assisted context: Context,
    @Assisted params: WorkerParameters,
    private val productRepository: ProductRepository,
    private val orderRepository: OrderRepository
    // ... other repositories
) : CoroutineWorker(context, params) {
    
    override suspend fun doWork(): Result {
        return try {
            // Sync all pending changes
            productRepository.syncPendingChanges()
            orderRepository.syncPendingChanges()
            // ... sync other entities
            
            Result.success()
        } catch (e: Exception) {
            Result.retry()
        }
    }
    
    companion object {
        const val WORK_NAME = "sync_worker"
        
        fun schedule(workManager: WorkManager) {
            val constraints = Constraints.Builder()
                .setRequiredNetworkType(NetworkType.CONNECTED)
                .build()
            
            val syncRequest = PeriodicWorkRequestBuilder<SyncWorker>(
                repeatInterval = 15,
                repeatIntervalTimeUnit = TimeUnit.MINUTES
            )
                .setConstraints(constraints)
                .build()
            
            workManager.enqueueUniquePeriodicWork(
                WORK_NAME,
                ExistingPeriodicWorkPolicy.KEEP,
                syncRequest
            )
        }
    }
}
```

---

## 🔔 Push Notifications

### Firebase Cloud Messaging Setup

```kotlin
// FirebaseMessagingService
@AndroidEntryPoint
class AdminFirebaseMessagingService : FirebaseMessagingService() {
    
    @Inject
    lateinit var notificationManager: NotificationManager
    
    @Inject
    lateinit var pushNotificationRepository: PushNotificationRepository
    
    override fun onNewToken(token: String) {
        super.onNewToken(token)
        // Send token to backend
        CoroutineScope(Dispatchers.IO).launch {
            pushNotificationRepository.registerToken(token)
        }
    }
    
    override fun onMessageReceived(message: RemoteMessage) {
        super.onMessageReceived(message)
        
        val data = message.data
        when (data["type"]) {
            "new_order" -> {
                showNewOrderNotification(
                    orderId = data["order_id"]?.toInt() ?: return,
                    customerName = data["customer_name"] ?: "",
                    totalAmount = data["total_amount"] ?: ""
                )
            }
            "order_update" -> {
                // Handle order update notification
            }
            // ... other notification types
        }
    }
    
    private fun showNewOrderNotification(
        orderId: Int,
        customerName: String,
        totalAmount: String
    ) {
        val intent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
            putExtra("navigate_to", "order_detail")
            putExtra("order_id", orderId)
        }
        
        val pendingIntent = PendingIntent.getActivity(
            this, 0, intent, PendingIntent.FLAG_IMMUTABLE
        )
        
        val notification = NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_notification)
            .setContentTitle("New Order")
            .setContentText("$customerName - $totalAmount RON")
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setAutoCancel(true)
            .setContentIntent(pendingIntent)
            .setSound(RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION))
            .setVibrate(longArrayOf(0, 500, 250, 500))
            .build()
        
        notificationManager.notify(orderId, notification)
    }
    
    companion object {
        const val CHANNEL_ID = "orders_channel"
    }
}

// Notification setup in Application class
@HiltAndroidApp
class AdminApplication : Application() {
    
    override fun onCreate() {
        super.onCreate()
        createNotificationChannels()
    }
    
    private fun createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val ordersChannel = NotificationChannel(
                "orders_channel",
                "Orders",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Notifications for new orders"
                enableLights(true)
                enableVibration(true)
            }
            
            val notificationManager = getSystemService(NotificationManager::class.java)
            notificationManager.createNotificationChannel(ordersChannel)
        }
    }
}
```

---

## 🔒 Security Considerations

### 1. **Token Storage**

```kotlin
// Encrypted SharedPreferences for tokens
class SecureTokenManager @Inject constructor(
    @ApplicationContext private val context: Context
) {
    private val masterKey = MasterKey.Builder(context)
        .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
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
    
    companion object {
        private const val KEY_ACCESS_TOKEN = "access_token"
        private const val KEY_REFRESH_TOKEN = "refresh_token"
    }
}
```

### 2. **Network Security Config**

```xml
<!-- res/xml/network_security_config.xml -->
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <domain-config cleartextTrafficPermitted="false">
        <domain includeSubdomains="true">api.yourshop.com</domain>
        <pin-set expiration="2025-12-31">
            <pin digest="SHA-256"><!-- your certificate pin --></pin>
            <!-- backup pin -->
            <pin digest="SHA-256"><!-- backup certificate pin --></pin>
        </pin-set>
    </domain-config>
</network-security-config>
```

### 3. **ProGuard Rules**

```proguard
# Retrofit
-dontwarn retrofit2.**
-keep class retrofit2.** { *; }

# Gson
-keep class com.google.gson.** { *; }
-keep class * implements com.google.gson.TypeAdapter
-keep class * implements com.google.gson.TypeAdapterFactory
-keep class * implements com.google.gson.JsonSerializer
-keep class * implements com.google.gson.JsonDeserializer

# Keep DTOs
-keep class com.yourcompany.adminapp.data.remote.dto.** { *; }

# OkHttp
-dontwarn okhttp3.**
-keep class okhttp3.** { *; }
```

---

## 📊 Performance Optimization

### 1. **Image Loading with Coil**

```kotlin
@Composable
fun ProductImage(
    imageUrl: String,
    modifier: Modifier = Modifier
) {
    AsyncImage(
        model = ImageRequest.Builder(LocalContext.current)
            .data(imageUrl)
            .crossfade(true)
            .placeholder(R.drawable.placeholder_product)
            .error(R.drawable.error_image)
            .memoryCachePolicy(CachePolicy.ENABLED)
            .diskCachePolicy(CachePolicy.ENABLED)
            .build(),
        contentDescription = null,
        modifier = modifier,
        contentScale = ContentScale.Crop
    )
}
```

### 2. **Pagination**

```kotlin
class ProductListViewModel @Inject constructor(
    private val productRepository: ProductRepository
) : ViewModel() {
    
    private val _uiState = MutableStateFlow(ProductListUiState())
    val uiState: StateFlow<ProductListUiState> = _uiState.asStateFlow()
    
    private var currentPage = 0
    private val pageSize = 20
    
    init {
        loadProducts()
    }
    
    fun loadProducts(refresh: Boolean = false) {
        if (refresh) {
            currentPage = 0
            _uiState.update { it.copy(products = emptyList()) }
        }
        
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true) }
            
            productRepository.getProducts(
                skip = currentPage * pageSize,
                limit = pageSize
            ).collect { resource ->
                when (resource) {
                    is Resource.Success -> {
                        val newProducts = resource.data ?: emptyList()
                        _uiState.update {
                            it.copy(
                                products = if (refresh) newProducts else it.products + newProducts,
                                isLoading = false,
                                hasMore = newProducts.size == pageSize
                            )
                        }
                        currentPage++
                    }
                    is Resource.Error -> {
                        _uiState.update {
                            it.copy(
                                isLoading = false,
                                error = resource.message
                            )
                        }
                    }
                    is Resource.Loading -> {
                        _uiState.update { it.copy(isLoading = true) }
                    }
                }
            }
        }
    }
}
```

### 3. **LazyColumn Optimization**

```kotlin
LazyColumn(
    modifier = Modifier.fillMaxSize()
) {
    items(
        items = products,
        key = { it.id }  // Important for performance
    ) { product ->
        ProductListItem(
            product = product,
            onClick = { /* ... */ }
        )
    }
}
```

---

## 🧪 Testing Strategy

### Unit Tests

```kotlin
@ExperimentalCoroutinesTest
class ProductRepositoryTest {
    
    @get:Rule
    val instantExecutorRule = InstantTaskExecutorRule()
    
    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()
    
    private lateinit var productApi: ProductApi
    private lateinit var productDao: ProductDao
    private lateinit var networkMonitor: NetworkMonitor
    private lateinit var repository: ProductRepository
    
    @Before
    fun setup() {
        productApi = mockk()
        productDao = mockk()
        networkMonitor = mockk()
        repository = ProductRepository(productApi, productDao, networkMonitor)
    }
    
    @Test
    fun `getProducts returns cached data when offline`() = runTest {
        // Given
        val cachedProducts = listOf(
            ProductEntity(id = 1, nume = "Product 1", /* ... */)
        )
        coEvery { productDao.getAllProducts() } returns cachedProducts
        every { networkMonitor.isOnline() } returns false
        
        // When
        val result = repository.getProducts().first()
        
        // Then
        assertTrue(result is Resource.Success)
        assertEquals(1, result.data?.size)
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
        assertTrue(result is Resource.Success)
        coVerify { productApi.createProduct(any()) }
        coVerify { productDao.insert(any()) }
    }
}
```

### UI Tests (Compose)

```kotlin
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
}
```

---

## 📦 Build Configuration

### build.gradle.kts (app level)

```kotlin
plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("com.google.dagger.hilt.android")
    id("com.google.gms.google-services")
    kotlin("kapt")
}

android {
    namespace = "com.yourcompany.adminapp"
    compileSdk = 34
    
    defaultConfig {
        applicationId = "com.yourcompany.adminapp"
        minSdk = 26
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"
        
        testInstrumentationRunner = "com.yourcompany.adminapp.HiltTestRunner"
        
        buildConfigField("String", "API_BASE_URL", "\"https://api.yourshop.com/api/v1/\"")
    }
    
    buildTypes {
        debug {
            applicationIdSuffix = ".debug"
            versionNameSuffix = "-debug"
            isDebuggable = true
            buildConfigField("String", "API_BASE_URL", "\"https://api-dev.yourshop.com/api/v1/\"")
        }
        
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
            signingConfig = signingConfigs.getByName("release")
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
    
    // Networking
    implementation("com.squareup.retrofit2:retrofit:2.9.0")
    implementation("com.squareup.retrofit2:converter-gson:2.9.0")
    implementation("com.squareup.okhttp3:okhttp:4.12.0")
    implementation("com.squareup.okhttp3:logging-interceptor:4.12.0")
    
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
    
    // Firebase
    implementation(platform("com.google.firebase:firebase-bom:32.6.0"))
    implementation("com.google.firebase:firebase-messaging-ktx")
    implementation("com.google.firebase:firebase-analytics-ktx")
    
    // Security
    implementation("androidx.security:security-crypto:1.1.0-alpha06")
    
    // Splash Screen
    implementation("androidx.core:core-splashscreen:1.0.1")
    
    // Testing
    testImplementation("junit:junit:4.13.2")
    testImplementation("org.jetbrains.kotlinx:kotlinx-coroutines-test:1.7.3")
    testImplementation("io.mockk:mockk:1.13.8")
    testImplementation("app.cash.turbine:turbine:1.0.0")
    
    androidTestImplementation("androidx.test.ext:junit:1.1.5")
    androidTestImplementation("androidx.test.espresso:espresso-core:3.5.1")
    androidTestImplementation(composeBom)
    androidTestImplementation("androidx.compose.ui:ui-test-junit4")
    androidTestImplementation("com.google.dagger:hilt-android-testing:2.48.1")
    kaptAndroidTest("com.google.dagger:hilt-compiler:2.48.1")
    
    debugImplementation("androidx.compose.ui:ui-tooling")
    debugImplementation("androidx.compose.ui:ui-test-manifest")
}
```

---

## 🚀 Deployment Strategy

### 1. **CI/CD Pipeline (GitHub Actions)**

```yaml
name: Android CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  build:
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
        restore-keys: |
          ${{ runner.os }}-gradle-
          
    - name: Grant execute permission for gradlew
      run: chmod +x gradlew
      
    - name: Run tests
      run: ./gradlew test
      
    - name: Build debug APK
      run: ./gradlew assembleDebug
      
    - name: Upload APK
      uses: actions/upload-artifact@v3
      with:
        name: app-debug
        path: app/build/outputs/apk/debug/app-debug.apk

  release:
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    needs: build
    
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
        
    - name: Upload to Play Store
      uses: r0adkll/upload-google-play@v1
      with:
        serviceAccountJsonPlainText: ${{ secrets.SERVICE_ACCOUNT_JSON }}
        packageName: com.yourcompany.adminapp
        releaseFiles: app/build/outputs/apk/release/app-release.apk
        track: internal
```

### 2. **Versioning Strategy**

```
Semantic Versioning: MAJOR.MINOR.PATCH
- MAJOR: Incompatible API changes
- MINOR: New features (backward compatible)
- PATCH: Bug fixes (backward compatible)

Examples:
- 1.0.0 - Initial release
- 1.1.0 - Added push notifications
- 1.1.1 - Fixed image upload bug
- 2.0.0 - Redesigned with new architecture
```

### 3. **Release Channels**

- **Internal Testing**: Alpha builds for QA team
- **Closed Testing**: Beta builds for select users
- **Open Testing**: Public beta
- **Production**: Stable release

---

## 📅 Implementation Roadmap

### Phase 1: Foundation (Weeks 1-2)
- [ ] Project setup (Gradle, dependencies)
- [ ] Architecture skeleton (MVVM, Clean Architecture)
- [ ] Networking layer (Retrofit, OkHttp)
- [ ] Database layer (Room)
- [ ] Authentication flow
- [ ] Basic navigation structure

### Phase 2: Core Features (Weeks 3-5)
- [ ] Dashboard screen
- [ ] Product management (list, create, edit, delete)
- [ ] Category management
- [ ] Image upload & management
- [ ] Offline support for core features

### Phase 3: Order Management (Weeks 6-7)
- [ ] Order list screen
- [ ] Order details & editing
- [ ] Order grouping & filtering
- [ ] PDF/XLS export functionality
- [ ] Order totals calculation

### Phase 4: Lists & Configuration (Weeks 8-9)
- [ ] Lists management
- [ ] List products management
- [ ] List cloning
- [ ] Delivery & payment configuration
- [ ] Business details management

### Phase 5: Advanced Features (Week 10)
- [ ] Push notifications (FCM)
- [ ] Background sync (WorkManager)
- [ ] Security features (password change)
- [ ] Settings screen

### Phase 6: Polish & Testing (Weeks 11-12)
- [ ] UI/UX refinement
- [ ] Performance optimization
- [ ] Comprehensive testing (unit, integration, UI)
- [ ] Bug fixes
- [ ] Documentation

### Phase 7: Release (Week 13)
- [ ] Internal testing
- [ ] Beta testing
- [ ] Play Store listing
- [ ] Production release

---

## 💰 Estimated Development Effort

### Team Composition
- **1 Senior Android Developer** (full-time)
- **1 UI/UX Designer** (part-time, first 4 weeks)
- **1 QA Engineer** (part-time, last 6 weeks)

### Time Estimate
- **Development**: 10-12 weeks
- **Testing & QA**: 2 weeks
- **Beta & Refinement**: 1 week
- **Total**: ~13-15 weeks

### Cost Estimate (Rough)
- Senior Android Developer: ~$80-120/hour × 520 hours = $41,600 - $62,400
- UI/UX Designer: ~$60-90/hour × 160 hours = $9,600 - $14,400
- QA Engineer: ~$50-70/hour × 240 hours = $12,000 - $16,800
- **Total**: ~$63,200 - $93,600

*Note: Costs vary greatly by location and contractor vs employee*

---

## 🎓 Learning Resources for Team

### Kotlin & Android
- Official Kotlin docs: https://kotlinlang.org/docs/home.html
- Android Developer Guide: https://developer.android.com/guide
- Kotlin Coroutines Guide: https://kotlinlang.org/docs/coroutines-guide.html

### Jetpack Compose
- Compose Tutorial: https://developer.android.com/jetpack/compose/tutorial
- Compose Pathway: https://developer.android.com/courses/pathways/compose
- Compose samples: https://github.com/android/compose-samples

### Architecture
- Guide to app architecture: https://developer.android.com/topic/architecture
- MVVM pattern: https://developer.android.com/topic/libraries/architecture/viewmodel
- Clean Architecture: https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html

### Libraries
- Hilt Documentation: https://dagger.dev/hilt/
- Retrofit Guide: https://square.github.io/retrofit/
- Room Documentation: https://developer.android.com/training/data-storage/room
- Coil Documentation: https://coil-kt.github.io/coil/

---

## 🔍 Key Differences from Web Admin

### UI Patterns
| Feature | Web (React) | Android (Compose) |
|---------|-------------|-------------------|
| Navigation | React Router (URL-based) | Jetpack Navigation (Screen-based) |
| State | React Query + Zustand | ViewModel + StateFlow |
| Styling | Tailwind CSS | Material Design 3 |
| Forms | React Hook Form | Compose State |
| Images | React Dropzone | Activity Result API |
| Lists | Infinite scroll with pagination | LazyColumn with pagination |
| Modals | React Modal | Bottom Sheet / Dialog |

### Mobile-Optimized Features
1. **Bottom Navigation** - Easier thumb access than sidebar
2. **Swipe Gestures** - Swipe to delete, swipe to refresh
3. **FAB** - Primary actions always accessible
4. **Bottom Sheets** - Better than dropdowns on mobile
5. **Touch Targets** - Minimum 48dp for all interactive elements
6. **Offline First** - Works even without internet

---

## 📊 Success Metrics

### Performance Targets
- App launch time: < 2 seconds
- Screen transition time: < 300ms
- Image loading: < 1 second
- API response handling: < 500ms
- Battery drain: < 5% per hour of active use
- APK size: < 50 MB

### Quality Targets
- Crash-free rate: > 99.5%
- ANR rate: < 0.1%
- Unit test coverage: > 80%
- UI test coverage: > 60%
- Code review approval rate: 100%

---

## 🎯 Conclusion

This Android admin app will provide business owners with a powerful, mobile-optimized tool to manage their online shop from anywhere. The architecture is designed for:

1. **Maintainability** - Clean Architecture with clear separation of concerns
2. **Testability** - Unit and UI tests for reliability
3. **Performance** - Offline-first with efficient caching
4. **Security** - Encrypted storage and secure networking
5. **Scalability** - Easy to add new features
6. **User Experience** - Mobile-first UI patterns

The estimated 13-15 week timeline provides a realistic path to a production-ready app with comprehensive features matching the web admin panel while leveraging mobile-specific advantages like push notifications and offline support.

---

**Document Version**: 1.0  
**Created**: October 31, 2025  
**Last Updated**: October 31, 2025  
**Status**: Draft for Review

