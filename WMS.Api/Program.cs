//using Microsoft.AspNetCore.Authentication.JwtBearer;
//using Microsoft.EntityFrameworkCore;
//using Microsoft.IdentityModel.Tokens;
//using System.Text;
//using WMS.Api.Data;
//using WMS.Api.Repositories.Implementations;
//using WMS.Api.Repositories.Interfaces;
//using WMS.Api.Services.Implementations;
//using WMS.Api.Services.Interfaces;

//var builder = WebApplication.CreateBuilder(args);

//// Add services to the container
////builder.Services.AddControllers();
//builder.Services.AddControllers()
//    .AddJsonOptions(options =>
//    {
//        options.JsonSerializerOptions.ReferenceHandler =
//            System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
//    });


//builder.Services.AddEndpointsApiExplorer();
//builder.Services.AddSwaggerGen();

//// ===== CORS setup =====
//builder.Services.AddCors(options =>
//{
//    options.AddPolicy("AllowReactApp",
//        builder => builder
//            .WithOrigins("http://localhost:3000") // React dev server
//            .AllowAnyHeader()
//            .AllowAnyMethod()
//            .AllowCredentials());
//});

//// DbContext
//builder.Services.AddDbContext<WmsDbContext>(options =>
//    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

//builder.Services.AddScoped<IAuthService, AuthService>();
//builder.Services.AddScoped<IUserService, UserService>();
//builder.Services.AddScoped<ISystemUserService, SystemUserService>();

//// JWT Authentication
//var key = Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]);

//builder.Services.AddAuthentication(options =>
//{
//    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
//    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
//})
//.AddJwtBearer(options =>
//{
//    options.TokenValidationParameters = new TokenValidationParameters
//    {
//        ValidateIssuer = true,
//        ValidateAudience = true,
//        ValidateLifetime = true,
//        ValidateIssuerSigningKey = true,
//        ValidIssuer = builder.Configuration["Jwt:Issuer"],
//        ValidAudience = builder.Configuration["Jwt:Audience"],
//        IssuerSigningKey = new SymmetricSecurityKey(key)
//    };
//});

//// Repositories
//builder.Services.AddScoped<IRolePermissionRepository, RolePermissionRepository>();
//builder.Services.AddScoped<IUserPermissionRepository, UserPermissionRepository>();

//// Services
//builder.Services.AddScoped<IRolePermissionService, RolePermissionService>();
//builder.Services.AddScoped<IUserPermissionService, UserPermissionService>();
//builder.Services.AddScoped<IAuthService, AuthService>();

//// AutoMapper
//builder.Services.AddAutoMapper(typeof(Program).Assembly);

//var app = builder.Build();

//app.UseCors("AllowReactApp");

//// Configure middleware
//if (app.Environment.IsDevelopment())
//{
//    app.UseSwagger();
//    app.UseSwaggerUI();
//}

//app.UseHttpsRedirection();

//// JWT middleware
//app.UseAuthentication();
//app.UseAuthorization();

//app.MapControllers();

//app.Run();

using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using WMS.Api.Data;
using WMS.Api.Repositories.Implementations;
using WMS.Api.Repositories.Interfaces;
using WMS.Api.Services.Implementations;
using WMS.Api.Services.Interfaces;
using Microsoft.OpenApi.Models;
using WMS.Api.BackgroundServices;
using WMS.API.Modules.Reports.Purchase.Interfaces;
using WMS.API.Modules.Reports.Purchase.Services;
using WMS.API.Modules.Reports.SupplierBalancing.Interfaces;
using WMS.API.Modules.Reports.SupplierBalancing.Services;
using WMS.API.Modules.Reports.PurchaseReturn.Interfaces;
using WMS.API.Modules.Reports.PurchaseReturn.Services;
using WMS.API.Modules.Reports.Sales.Interfaces;
using WMS.API.Modules.Reports.Sales.Services;
using WMS.API.Modules.Reports.SalesReturn.Interfaces;
using WMS.API.Modules.Reports.SalesReturn.Services;
using BCrypt.Net;
using WMS.Api.Services.Interfaces.Workshop;
using WMS.Api.Services.Implementations.Workshop;
using WMS.Api.Services.BackgroundServices;
using DinkToPdf;
using DinkToPdf.Contracts;


var builder = WebApplication.CreateBuilder(args);

// =====================
// Controllers + JSON
// =====================
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy =
            System.Text.Json.JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.ReferenceHandler =
            System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });

builder.Services.AddEndpointsApiExplorer();
//builder.Services.AddSwaggerGen();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "WMS API",
        Version = "v1"
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter: Bearer {your JWT token}"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});

// =====================
// CORS
// =====================
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policy => policy
            .WithOrigins("http://localhost:3000")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials());
});

// =====================
// DbContext
// =====================
builder.Services.AddDbContext<WmsDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// =====================
// Repositories
// =====================
builder.Services.AddScoped<IRolePermissionRepository, RolePermissionRepository>();
builder.Services.AddScoped<IUserPermissionRepository, UserPermissionRepository>();
builder.Services.AddScoped<IFormDetailRepository, FormDetailRepository>();
builder.Services.AddScoped<IBranchRepository, BranchRepository>();
builder.Services.AddScoped<IBranchService, BranchService>();
builder.Services.AddScoped<ICoaRepository, CoaRepository>();
builder.Services.AddScoped<IOpeningBalanceService, OpeningBalanceService>();
builder.Services.AddScoped<ITrialBalanceService, TrialBalanceService>();
builder.Services.AddScoped<ICompFileRepository, CompFileRepository>();
builder.Services.AddScoped<ICompFileService, CompFileService>();
builder.Services.AddScoped<ICatgFileRepository, CatgFileRepository>();
builder.Services.AddScoped<ICatgFileService, CatgFileService>();
builder.Services.AddScoped<IItemRepository, ItemRepository>();
builder.Services.AddScoped<IItemService, ItemService>();
builder.Services.AddScoped<IPurchaseService, PurchaseService>();
builder.Services.AddScoped<IPurchaseRepository, PurchaseRepository>();
builder.Services.AddScoped<IStockService, StockService>();
builder.Services.AddScoped<IPurchaseReturnService, PurchaseReturnService>();
builder.Services.AddScoped<IPurchaseReturnRepository, PurchaseReturnRepository>();
builder.Services.AddScoped<ISaleService, SaleService>();
builder.Services.AddScoped<ISaleReturnService, SaleReturnService>();
builder.Services.AddScoped<IPaymentService, PaymentService>();
builder.Services.AddScoped<IReceivingService, ReceivingService>();
builder.Services.AddScoped<ILedgerService, LedgerService>();
builder.Services.AddScoped<IPostdatedChequeService, PostdatedChequeService>();
builder.Services.AddHostedService<ChequeAutoPostService>();
builder.Services.AddScoped<IPurchaseReportService, PurchaseReportService>();
builder.Services.AddScoped<ISupplierBalancingService, SupplierBalancingService>();
builder.Services.AddScoped<IPurchaseReturnReportService, PurchaseReturnReportService>();
builder.Services.AddScoped<ISalesReportService, SalesReportService>();
builder.Services.AddScoped<ISalesReturnReportService, SalesReturnReportService>();
builder.Services.AddScoped<ISubcategoryService, SubcategoryService>();
builder.Services.AddScoped<IVoucherService, VoucherService>();
builder.Services.AddScoped<ICoaValidationService, CoaValidationService>();
builder.Services.AddScoped<ICodeGenerationService, CodeGenerationService>();
builder.Services.AddScoped<IAccountGroupService, AccountGroupService>();
builder.Services.AddScoped<IControlAccountService, ControlAccountService>();
builder.Services.AddScoped<IFinancialReportService, FinancialReportService>();
builder.Services.AddScoped<IAuditService, AuditService>();
builder.Services.AddScoped<IReportService, ReportService>();
builder.Services.AddScoped<IItemPriceHistoryRepository, ItemPriceHistoryRepository>();
builder.Services.AddScoped<IPriceHistoryService, PriceHistoryService>();
//builder.Services.AddSingleton(typeof(IConverter), new SynchronizedConverter(new PdfTools()));
builder.Services.AddScoped<IPrintService, PrintService>();

// =====================
// Workshop Services
// =====================
builder.Services.AddScoped<IVehicleService, VehicleService>();
builder.Services.AddScoped<IServiceCatalogService, ServiceCatalogService>();
builder.Services.AddScoped<ITechnicianService, TechnicianService>();
builder.Services.AddScoped<IJobCardService, JobCardService>();
builder.Services.AddScoped<IBookingService, BookingService>();
builder.Services.AddScoped<ITechnicianTimeLogService, TechnicianTimeLogService>();
builder.Services.AddScoped<IWorkshopSettingsService, WorkshopSettingsService>();
builder.Services.AddScoped<IPartsRequestService, PartsRequestService>();
builder.Services.AddScoped<IInspectionService, InspectionService>();
builder.Services.AddScoped<INotificationService, NotificationService>();
//builder.Services.AddHostedService<NotificationBackgroundService>();
builder.Services.AddScoped<IDepartmentService, DepartmentService>();
builder.Services.AddScoped<IWarrantyService, WarrantyService>();
// =====================
// Services (ONLY ONCE)
// =====================
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<ISystemUserService, SystemUserService>();
builder.Services.AddScoped<IFormDetailService, FormDetailService>();
builder.Services.AddScoped<IRolePermissionService, RolePermissionService>();
builder.Services.AddScoped<IUserPermissionService, UserPermissionService>();
builder.Services.AddScoped<ICoaService, CoaService>();
builder.Services.AddHttpContextAccessor();

// =====================
// JWT Authentication
// =====================
var key = Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]);

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(key)
        };
    });

// =====================
// AutoMapper
// =====================
builder.Services.AddAutoMapper(typeof(Program).Assembly);

var app = builder.Build();

// =====================
// Middleware
// =====================
app.UseCors("AllowReactApp");

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.Run();
