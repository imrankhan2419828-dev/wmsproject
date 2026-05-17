using Microsoft.EntityFrameworkCore;
using WMS.Api.DTOs.SaleReturns;
using WMS.Api.DTOs.Sales;
using WMS.Api.Models;
using WMS.Api.Models.Workshop;

namespace WMS.Api.Data
{
    public class WmsDbContext : DbContext
    {
        public WmsDbContext(DbContextOptions<WmsDbContext> options) : base(options)
        {
        }

        // =====================
        //        DbSets
        // =====================

        public DbSet<Branch> Branches { get; set; }
        public DbSet<SystemUser> SystemUsers { get; set; }
        public DbSet<RoleMaster> RoleMasters { get; set; }
        public DbSet<UserBranch> UserBranches { get; set; }
        public DbSet<RolePermission> RolePermissions { get; set; }
        public DbSet<UserPermission> UserPermissions { get; set; }
        public DbSet<FormDetail> FormDetail { get; set; }

        public DbSet<COA> tblCOA { get; set; }

        // Other DbSets
        public DbSet<AcctTran> AcctTran { get; set; }
        public DbSet<AcctTrad> AcctTrad { get; set; }
        public DbSet<VochType> VochType { get; set; }
        public DbSet<CompFile> CompFile { get; set; }
        public DbSet<CatgFile> CatgFile { get; set; }

        public DbSet<ItemFile> ItemFile { get; set; }
        public DbSet<PurcFile> PurcFile { get; set; }
        public DbSet<PurcFild> PurcFild { get; set; }
        public DbSet<ItemStock> ItemStock { get; set; }   // ✅ IMPORTANT
        public DbSet<PurchaseReturn> PurchaseReturn { get; set; }
        public DbSet<PurchaseReturnItem> PurchaseReturnItems { get; set; }

        public DbSet<SaleFile> SaleFiles { get; set; }
        public DbSet<SaleFild> SaleFilds { get; set; }

        public DbSet<SaleListDto> SaleListDtos { get; set; }

        public DbSet<SaleReturnFile> SaleReturnFiles { get; set; }
        public DbSet<SaleReturnItem> SaleReturnItems { get; set; }
        public DbSet<SalesForReturnDto> SalesForReturn { get; set; }

        public DbSet<PaymentFile> PaymentFiles { get; set; }
        public DbSet<PaymentItem> PaymentItems { get; set; }
        public DbSet<LedgerEntry> LedgerEntries { get; set; }
        public DbSet<PaymentDetail> PaymentDetails { get; set; }
        public DbSet<ReceivingFile> ReceivingFiles { get; set; }
        public DbSet<ReceivingCash> ReceivingCash { get; set; }
        public DbSet<ReceivingCheque> ReceivingCheque { get; set; }
        public DbSet<PostdatedCheque> PostdatedCheques { get; set; }
        public DbSet<PostdatedChequeLog> PostdatedChequeLogs { get; set; }
        public DbSet<Subcategory> Subcategories { get; set; }
        public DbSet<COAAudit> COAAudits { get; set; }
        // =====================
        // Workshop Management
        // =====================
        public DbSet<Vehicle> Vehicles { get; set; }
        public DbSet<ServiceCatalog> ServiceCatalog { get; set; }
        public DbSet<Technician> Technicians { get; set; }
        public DbSet<JobCard> JobCards { get; set; }
        public DbSet<JobService> JobServices { get; set; }
        public DbSet<JobPart> JobParts { get; set; }
        public DbSet<JobInspectionImage> JobInspectionImages { get; set; }
        public DbSet<Booking> Bookings { get; set; }
        public DbSet<BookingService> BookingServices { get; set; }
        public DbSet<TimeSlot> TimeSlots { get; set; }
        public DbSet<TechnicianTimeLog> TechnicianTimeLog { get; set; }
        public DbSet<WorkshopSettings> WorkshopSettings { get; set; }

        public DbSet<PartsRequest> PartsRequests { get; set; }

        // =====================
        // Phase 7b - Vehicle Inspection System
        // =====================
        public DbSet<InspectionTemplate> InspectionTemplates { get; set; }
        public DbSet<InspectionItem> InspectionItems { get; set; }
        public DbSet<JobInspection> JobInspections { get; set; }
        public DbSet<InspectionResult> InspectionResults { get; set; }
        public DbSet<InspectionPhoto> InspectionPhotos { get; set; }

        public DbSet<CustomerNotification> CustomerNotifications { get; set; }
        public DbSet<NotificationTemplate> NotificationTemplates { get; set; }
        public DbSet<MessageQueue> MessageQueue { get; set; }
        public DbSet<CustomerPreference> CustomerPreferences { get; set; }
        public DbSet<NotificationProvider> NotificationProviders { get; set; }

        public DbSet<Department> Departments { get; set; }
        public DbSet<JobDepartment> JobDepartments { get; set; }
        public DbSet<TechnicianDepartment> TechnicianDepartments { get; set; }
        public DbSet<DepartmentService> DepartmentServices { get; set; }
        public DbSet<DepartmentPart> DepartmentParts { get; set; }
        public DbSet<DepartmentTransfer> DepartmentTransfers { get; set; }

        public DbSet<WarrantyClaim> WarrantyClaims { get; set; }
        public DbSet<WarrantyAttachment> WarrantyAttachments { get; set; }
        public DbSet<WarrantyHistory> WarrantyHistory { get; set; }
        public DbSet<SupplierWarranty> SupplierWarranties { get; set; }

        public DbSet<ItemPriceHistory> ItemPriceHistory { get; set; }
        public DbSet<ItemImages> ItemImages { get; set; }
        public DbSet<ItemGodownOpening> ItemGodownOpening { get; set; }
        public DbSet<Godown> Godowns { get; set; }

        public DbSet<COALength> tblCOALength { get; set; }
        public DbSet<AccountTypeModel> tblAccountTypes { get; set; }


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // ============================
            //       Branch → Users
            // ============================
            modelBuilder.Entity<Branch>()
                .HasMany(b => b.Users)
                .WithOne(u => u.Branch)
                .HasForeignKey(u => u.BranchID)
                .OnDelete(DeleteBehavior.Restrict);

            // ============================
            //     RoleMaster → Users
            // ============================
            modelBuilder.Entity<RoleMaster>()
                .HasMany(r => r.Users)
                .WithOne(u => u.Role)
                .HasForeignKey(u => u.RoleID)
                .OnDelete(DeleteBehavior.Restrict);

            // ============================
            //       UserBranch Mapping
            // ============================
            modelBuilder.Entity<UserBranch>()
                .HasKey(ub => ub.UserBranchID);

            modelBuilder.Entity<UserBranch>()
                .HasOne(ub => ub.User)
                .WithMany(u => u.UserBranches)
                .HasForeignKey(ub => ub.UserID)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<UserBranch>()
                .HasOne(ub => ub.Branch)
                .WithMany()
                .HasForeignKey(ub => ub.BranchID)
                .OnDelete(DeleteBehavior.Cascade);

            // ============================
            //       RolePermission - ULTIMATE FIX
            // ============================
            modelBuilder.Entity<RolePermission>(entity =>
            {
                entity.ToTable("RolePermission");
                entity.HasKey(e => e.RolePermissionID);

                // Explicit column mapping - NO AUTO COLUMNS
                entity.Property(e => e.RolePermissionID).HasColumnName("RolePermissionID");
                entity.Property(e => e.RoleID).HasColumnName("RoleID");
                entity.Property(e => e.MenuID).HasColumnName("MenuID");
                entity.Property(e => e.BranchID).HasColumnName("BranchID");
                entity.Property(e => e.CanView).HasColumnName("CanView");
                entity.Property(e => e.CanAdd).HasColumnName("CanAdd");
                entity.Property(e => e.CanEdit).HasColumnName("CanEdit");
                entity.Property(e => e.CanDelete).HasColumnName("CanDelete");

                // Relationships - WITHOUT creating shadow properties
                entity.HasOne(rp => rp.Role)
                    .WithMany()
                    .HasForeignKey(rp => rp.RoleID)
                    .HasConstraintName("FK_RolePermission_Role")
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(rp => rp.FormDetail)
                    .WithMany()
                    .HasForeignKey(rp => rp.MenuID)
                    .HasPrincipalKey(fd => fd.FormID)
                    .HasConstraintName("FK_RolePermission_FormDetail")
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(rp => rp.Branch)
                    .WithMany()
                    .HasForeignKey(rp => rp.BranchID)
                    .HasConstraintName("FK_RolePermission_Branch")
                    .OnDelete(DeleteBehavior.Restrict);

                // 🚨 IGNORE navigation properties to prevent shadow columns
                entity.Ignore(rp => rp.Role);
                entity.Ignore(rp => rp.FormDetail);
                entity.Ignore(rp => rp.Branch);
            });

            // ============================
            //       UserPermission - FIXED
            // ============================
            modelBuilder.Entity<UserPermission>(entity =>
            {
                entity.ToTable("UserPermission");
                entity.HasKey(e => e.UserPermissionID);

                entity.Property(e => e.UserPermissionID).HasColumnName("UserPermissionID");
                entity.Property(e => e.UserID).HasColumnName("UserID");
                entity.Property(e => e.MenuID).HasColumnName("MenuID");
                entity.Property(e => e.CanView).HasColumnName("CanView");
                entity.Property(e => e.CanAdd).HasColumnName("CanAdd");
                entity.Property(e => e.CanEdit).HasColumnName("CanEdit");
                entity.Property(e => e.CanDelete).HasColumnName("CanDelete");

                entity.HasOne(up => up.User)
                    .WithMany(u => u.UserPermissions)
                    .HasForeignKey(up => up.UserID)
                    .HasConstraintName("FK_UserPermission_User")
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(up => up.FormDetail)
                    .WithMany()
                    .HasForeignKey(up => up.MenuID)
                    .HasPrincipalKey(fd => fd.FormID)
                    .HasConstraintName("FK_UserPermission_FormDetail")
                    .OnDelete(DeleteBehavior.Cascade);

                // 🚨 IGNORE navigation properties
                entity.Ignore(up => up.User);
                entity.Ignore(up => up.FormDetail);
            });
        



        // ============================
        //     FormDetail Parent/Child
        // ============================

        modelBuilder.Entity<FormDetail>()
     .HasKey(f => f.FormID);

            modelBuilder.Entity<FormDetail>()
                .HasOne(f => f.Parent)
                .WithMany(f => f.Children)
                .HasForeignKey(f => f.ParentPage)
                .OnDelete(DeleteBehavior.Restrict);

            // ============================
            //             coa
            // ============================
            modelBuilder.Entity<COA>().HasKey(c => c.acctID);

            // PurchaseReturn → PurchaseReturnItems relationship
            modelBuilder.Entity<PurchaseReturn>()
                .HasMany(p => p.Items)
                .WithOne(i => i.PurchaseReturn)
                .HasForeignKey(i => i.ReturnID)
                .OnDelete(DeleteBehavior.Cascade);

            base.OnModelCreating(modelBuilder);


            modelBuilder.Entity<SaleFile>(entity =>
            {
                entity.HasKey(e => e.TranNumb);

                entity.Property(e => e.TranNumb).ValueGeneratedOnAdd();

                // Configure one-to-many relationship
                entity.HasMany(e => e.SaleFilds)
                    .WithOne(e => e.SaleFile)
                    .HasForeignKey(e => e.TranNumb)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // SaleFild Configuration
            modelBuilder.Entity<SaleFild>(entity =>
            {
                entity.HasKey(e => e.SaleDtlID);

                entity.Property(e => e.SaleDtlID).ValueGeneratedOnAdd();

                entity.HasOne(e => e.SaleFile)
                    .WithMany(e => e.SaleFilds)
                    .HasForeignKey(e => e.TranNumb);
            });


            modelBuilder.Entity<SaleListDto>().HasNoKey();
            modelBuilder.Entity<SaleReturnListDto>().HasNoKey();
            modelBuilder.Entity<SalesForReturnDto>()
        .HasNoKey()
        .ToView(null);


            modelBuilder.Entity<LedgerEntry>()
        .HasKey(e => e.LedgerID);


            modelBuilder.Entity<ReceivingFile>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.ReceiveDate).IsRequired();
                entity.Property(e => e.BranchId).IsRequired();
                entity.Property(e => e.UserId).IsRequired();
                entity.Property(e => e.AccountId).IsRequired();

                // Relationships
                entity.HasMany(e => e.CashList)
                    .WithOne(e => e.ReceivingFile)
                    .HasForeignKey(e => e.ReceivingFileId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasMany(e => e.ChequeList)
                    .WithOne(e => e.ReceivingFile)
                    .HasForeignKey(e => e.ReceivingFileId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // ReceivingCash configuration
            modelBuilder.Entity<ReceivingCash>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.ReceivingFileId).IsRequired();
                entity.Property(e => e.Amount).IsRequired();

                entity.HasOne(e => e.ReceivingFile)
                    .WithMany(e => e.CashList)
                    .HasForeignKey(e => e.ReceivingFileId);
            });

            // ReceivingCheque configuration
            modelBuilder.Entity<ReceivingCheque>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.ReceivingFileId).IsRequired();
                entity.Property(e => e.BankName).IsRequired().HasMaxLength(100);
                entity.Property(e => e.ChequeNumber).IsRequired().HasMaxLength(50);
                entity.Property(e => e.ChequeDate).IsRequired();
                entity.Property(e => e.Amount).IsRequired();

                entity.HasOne(e => e.ReceivingFile)
                    .WithMany(e => e.ChequeList)
                    .HasForeignKey(e => e.ReceivingFileId);
            });

            modelBuilder.Entity<PostdatedCheque>(entity =>
            {
                entity.ToTable("PostdatedChequeFile");
                entity.HasKey(e => e.Id);

                entity.Property(e => e.ChequeNumber).IsRequired().HasMaxLength(50);
                entity.Property(e => e.BankName).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Amount).HasColumnType("decimal(18,2)");
                entity.Property(e => e.SourceType).IsRequired().HasMaxLength(20);
                entity.Property(e => e.Status).IsRequired().HasMaxLength(20);
                entity.Property(e => e.BounceReason).HasMaxLength(500);

                // Relationships
                entity.HasMany(e => e.Logs)
                    .WithOne(e => e.Cheque)
                    .HasForeignKey(e => e.ChequeId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // PostdatedChequeLog configuration
            modelBuilder.Entity<PostdatedChequeLog>(entity =>
            {
                entity.ToTable("PostdatedChequeLog");
                entity.HasKey(e => e.Id);

                entity.Property(e => e.OldStatus).HasMaxLength(20);
                entity.Property(e => e.NewStatus).IsRequired().HasMaxLength(20);
                entity.Property(e => e.Remarks).HasMaxLength(500);
            });


            // ============================
            // Workshop Configurations
            // ============================

            // Vehicle Configuration
            modelBuilder.Entity<Vehicle>(entity =>
            {
                entity.HasKey(e => e.VehicleID);
                entity.Property(e => e.RegistrationNo).IsRequired().HasMaxLength(50);
                entity.HasIndex(e => e.RegistrationNo).IsUnique();

                entity.HasOne(e => e.Customer)
                    .WithMany()
                    .HasForeignKey(e => e.CustomerID)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // ServiceCatalog Configuration
            modelBuilder.Entity<ServiceCatalog>(entity =>
            {
                entity.HasKey(e => e.ServiceID);
                entity.Property(e => e.ServiceCode).IsRequired().HasMaxLength(50);
                entity.HasIndex(e => e.ServiceCode).IsUnique();
                entity.Property(e => e.ServiceName).IsRequired().HasMaxLength(200);
                entity.Property(e => e.DefaultLaborRate).HasPrecision(18, 2);
            });

            // Technician Configuration
            modelBuilder.Entity<Technician>(entity =>
            {
                entity.HasKey(e => e.TechnicianID);
                entity.HasOne(e => e.User)
                    .WithMany()
                    .HasForeignKey(e => e.UserID)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // JobCard Configuration
            modelBuilder.Entity<JobCard>(entity =>
            {
                entity.HasKey(e => e.JobCardID);
                entity.Property(e => e.JobCardNo).IsRequired().HasMaxLength(50);
                entity.HasIndex(e => e.JobCardNo).IsUnique();

                entity.HasOne(e => e.Vehicle)
                    .WithMany(v => v.JobCards)
                    .HasForeignKey(e => e.VehicleID)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Customer)
                    .WithMany()
                    .HasForeignKey(e => e.CustomerID)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Branch)
                    .WithMany()
                    .HasForeignKey(e => e.BranchID)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.ServiceAdvisor)
                    .WithMany()
                    .HasForeignKey(e => e.ServiceAdvisorID)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Technician)
                    .WithMany(t => t.AssignedJobs)
                    .HasForeignKey(e => e.TechnicianID)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // JobService Configuration
            modelBuilder.Entity<JobService>(entity =>
            {
                entity.HasKey(e => e.JobServiceID);

                entity.Property(e => e.UnitPrice).HasPrecision(18, 2);
                entity.Property(e => e.DiscountPercent).HasPrecision(5, 2);
                entity.Property(e => e.DiscountAmount).HasPrecision(18, 2);
                entity.Property(e => e.TotalAmount).HasPrecision(18, 2);

                // ✅ FIXED: Service relationship using ServiceID
                entity.HasOne(e => e.Service)
    .WithMany(s => s.JobServices)  // ← YEH CHANGE KARO
    .HasForeignKey(e => e.ServiceID)
    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.JobCard)
                    .WithMany(j => j.Services)
                    .HasForeignKey(e => e.JobCardID)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Technician)
                    .WithMany(t => t.JobServices)
                    .HasForeignKey(e => e.TechnicianID)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // JobPart Configuration
            modelBuilder.Entity<JobPart>(entity =>
            {
                entity.HasKey(e => e.JobPartID);
                entity.Property(e => e.Quantity).HasPrecision(18, 2);
                entity.Property(e => e.UnitPrice).HasPrecision(18, 2);
                entity.Property(e => e.DiscountPercent).HasPrecision(5, 2);
                entity.Property(e => e.DiscountAmount).HasPrecision(18, 2);
                entity.Property(e => e.TotalAmount).HasPrecision(18, 2);

                entity.HasOne(e => e.JobCard)
                    .WithMany(j => j.Parts)
                    .HasForeignKey(e => e.JobCardID)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Item)
                    .WithMany()
                    .HasForeignKey(e => e.ItemID)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // JobInspectionImage Configuration
            modelBuilder.Entity<JobInspectionImage>(entity =>
            {
                entity.HasKey(e => e.ImageID);
                entity.HasOne(e => e.JobCard)
                    .WithMany(j => j.InspectionImages)
                    .HasForeignKey(e => e.JobCardID)
                    .OnDelete(DeleteBehavior.Cascade);
            });


            // ============================
            // Phase 7a - Parts Request Configurations
            // ============================
            modelBuilder.Entity<PartsRequest>(entity =>
            {
                entity.HasKey(e => e.RequestID);
                entity.Property(e => e.RequestNo).IsRequired().HasMaxLength(50);
                entity.HasIndex(e => e.RequestNo).IsUnique();

                entity.Property(e => e.Quantity).HasPrecision(18, 2);
                entity.Property(e => e.ApprovedQuantity).HasPrecision(18, 2);
                entity.Property(e => e.EstimatedCost).HasPrecision(18, 2);
                entity.Property(e => e.ActualCost).HasPrecision(18, 2);

                entity.HasOne(e => e.JobCard)
                    .WithMany()
                    .HasForeignKey(e => e.JobCardID)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Item)
                    .WithMany()
                    .HasForeignKey(e => e.ItemID)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Supplier)
                    .WithMany()
                    .HasForeignKey(e => e.SupplierID)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Branch)
                    .WithMany()
                    .HasForeignKey(e => e.BranchID)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // ============================
            // Phase 7b - Inspection Templates
            // ============================
            modelBuilder.Entity<InspectionTemplate>(entity =>
            {
                entity.HasKey(e => e.TemplateID);
                entity.Property(e => e.TemplateCode).IsRequired().HasMaxLength(50);
                entity.HasIndex(e => e.TemplateCode).IsUnique();
                entity.Property(e => e.TemplateName).IsRequired().HasMaxLength(200);

                entity.HasOne(e => e.Branch)
                    .WithMany()
                    .HasForeignKey(e => e.BranchID)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // ============================
            // Phase 7b - Inspection Items
            // ============================
            modelBuilder.Entity<InspectionItem>(entity =>
            {
                entity.HasKey(e => e.ItemID);
                entity.Property(e => e.ItemCode).IsRequired().HasMaxLength(50);
                entity.Property(e => e.ItemName).IsRequired().HasMaxLength(200);
                entity.Property(e => e.MinValue).HasPrecision(18, 2);
                entity.Property(e => e.MaxValue).HasPrecision(18, 2);

                entity.HasOne(e => e.Template)
                    .WithMany(t => t.Items)
                    .HasForeignKey(e => e.TemplateID)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // ============================
            // Phase 7b - Job Inspections
            // ============================
            modelBuilder.Entity<JobInspection>(entity =>
            {
                entity.HasKey(e => e.InspectionID);
                entity.Property(e => e.InspectionNo).IsRequired().HasMaxLength(50);
                entity.HasIndex(e => e.InspectionNo).IsUnique();

                entity.HasOne(e => e.JobCard)
                    .WithMany()
                    .HasForeignKey(e => e.JobCardID)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Template)
                    .WithMany(t => t.JobInspections)
                    .HasForeignKey(e => e.TemplateID)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Branch)
                    .WithMany()
                    .HasForeignKey(e => e.BranchID)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // ============================
            // Phase 7b - Inspection Results
            // ============================
            modelBuilder.Entity<InspectionResult>(entity =>
            {
                entity.HasKey(e => e.ResultID);
                entity.Property(e => e.NumericValue).HasPrecision(18, 2);

                entity.HasOne(e => e.Inspection)
                    .WithMany(i => i.Results)
                    .HasForeignKey(e => e.InspectionID)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Item)
                    .WithMany(i => i.Results)
                    .HasForeignKey(e => e.ItemID)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // ============================
            // Phase 7b - Inspection Photos
            // ============================
            modelBuilder.Entity<InspectionPhoto>(entity =>
            {
                entity.HasKey(e => e.PhotoID);
                entity.Property(e => e.PhotoPath).IsRequired().HasMaxLength(500);

                entity.HasOne(e => e.Inspection)
                    .WithMany(i => i.Photos)
                    .HasForeignKey(e => e.InspectionID)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Result)
                    .WithMany()
                    .HasForeignKey(e => e.ResultID)
                    .OnDelete(DeleteBehavior.Restrict);
            });


            // ============================
            // Notification Module Configurations
            // ============================

            // CustomerNotification
            modelBuilder.Entity<CustomerNotification>(entity =>
            {
                entity.HasKey(e => e.NotificationID);
                entity.Property(e => e.NotificationNo).IsRequired().HasMaxLength(50);
                entity.HasIndex(e => e.NotificationNo).IsUnique();

                entity.HasOne(e => e.JobCard)
                    .WithMany()
                    .HasForeignKey(e => e.JobCardID)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Customer)
                    .WithMany()
                    .HasForeignKey(e => e.CustomerID)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Branch)
                    .WithMany()
                    .HasForeignKey(e => e.BranchID)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // NotificationTemplate
            modelBuilder.Entity<NotificationTemplate>(entity =>
            {
                entity.HasKey(e => e.TemplateID);
                entity.Property(e => e.TemplateCode).IsRequired().HasMaxLength(50);
                entity.HasIndex(e => e.TemplateCode).IsUnique();
            });

            // ============================
            // Phase 7c - Department Transfer Configurations
            // ============================
            modelBuilder.Entity<DepartmentTransfer>(entity =>
            {
                entity.ToTable("DepartmentTransfers");
                entity.HasKey(e => e.TransferID);

                entity.Property(e => e.TransferID).ValueGeneratedOnAdd();
                entity.Property(e => e.Status).HasMaxLength(20).HasDefaultValue("PENDING");
                entity.Property(e => e.Reason).HasMaxLength(500);
                entity.Property(e => e.Notes).HasMaxLength(500);

                // ⚠️ CRITICAL: Remove any existing configurations first
                // Clear existing relationships
                entity.Ignore(e => e.FromDepartment);
                entity.Ignore(e => e.ToDepartment);
                entity.Ignore(e => e.JobCard);

                // Configure relationships with explicit foreign keys
                entity.HasOne(e => e.FromDepartment)
                    .WithMany()  // 🔑 Don't specify the navigation property
                    .HasForeignKey(e => e.FromDepartmentID)
                    .OnDelete(DeleteBehavior.Restrict)
                    .HasConstraintName("FK_DepartmentTransfers_FromDepartment");

                entity.HasOne(e => e.ToDepartment)
                    .WithMany()  // 🔑 Don't specify the navigation property
                    .HasForeignKey(e => e.ToDepartmentID)
                    .OnDelete(DeleteBehavior.Restrict)
                    .HasConstraintName("FK_DepartmentTransfers_ToDepartment");

                entity.HasOne(e => e.JobCard)
                    .WithMany()
                    .HasForeignKey(e => e.JobCardID)
                    .OnDelete(DeleteBehavior.Restrict)
                    .HasConstraintName("FK_DepartmentTransfers_JobCard");

                // Indexes
                entity.HasIndex(e => e.Status);
                entity.HasIndex(e => e.TransferDate);
                entity.HasIndex(e => new { e.FromDepartmentID, e.ToDepartmentID });
            });






            // CustomerPreference
            modelBuilder.Entity<CustomerPreference>(entity =>
            {
                entity.HasKey(e => e.PreferenceID);
                entity.HasIndex(e => e.CustomerID).IsUnique();

                entity.HasOne(e => e.Customer)
                    .WithMany()
                    .HasForeignKey(e => e.CustomerID)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // MessageQueue
            modelBuilder.Entity<MessageQueue>(entity =>
            {
                entity.HasKey(e => e.QueueID);

                entity.HasOne(e => e.Notification)
                    .WithMany()
                    .HasForeignKey(e => e.NotificationID)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Subcategory configuration
            modelBuilder.Entity<Subcategory>(entity =>
            {
                entity.HasKey(e => e.SubcatID);
                entity.Property(e => e.SubcatName).IsRequired().HasMaxLength(150);
                entity.Property(e => e.CatgID).IsRequired();
                entity.Property(e => e.BranchID).IsRequired();
                entity.Property(e => e.InActive).HasDefaultValue(false);
                entity.Property(e => e.IsSparepart).HasDefaultValue(false);

                // Relationship with Category only
                entity.HasOne(e => e.Category)
                    .WithMany()
                    .HasForeignKey(e => e.CatgID)
                    .OnDelete(DeleteBehavior.Restrict);

                // Indexes
                entity.HasIndex(e => e.CatgID).HasDatabaseName("IX_Subcategory_CatgID");
                entity.HasIndex(e => e.BranchID).HasDatabaseName("IX_Subcategory_BranchID");
            });


            // ============================
            //        COAAudit Configuration
            // ============================
            modelBuilder.Entity<COAAudit>(entity =>
            {
                entity.ToTable("tblCOAAudit");
                entity.HasKey(e => e.AuditID);
                entity.Property(e => e.Action).IsRequired().HasMaxLength(20);
                entity.Property(e => e.ChangedBy).IsRequired().HasMaxLength(50);
                entity.Property(e => e.ChangedOn).IsRequired();
                entity.Property(e => e.FieldName).HasMaxLength(100);
                entity.Property(e => e.IPAddress).HasMaxLength(50);
                entity.Property(e => e.UserAgent).HasMaxLength(500);

                entity.HasIndex(e => e.acctID);
                entity.HasIndex(e => e.ChangedOn);
                entity.HasIndex(e => e.Action);
            });

        }
    }
}
