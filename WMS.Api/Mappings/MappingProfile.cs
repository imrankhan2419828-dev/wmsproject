using AutoMapper;
using WMS.Api.Models;
using WMS.Api.DTOs.SystemUser;
using WMS.Api.DTOs.Branch;

namespace WMS.Api.Mappings
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // Role Master to Role DTO - SIMPLE MAPPING
            CreateMap<RoleMaster, RoleDto>()
                .ForMember(dest => dest.RoleID, opt => opt.MapFrom(src => src.RoleID))
                .ForMember(dest => dest.RoleName, opt => opt.MapFrom(src => src.RoleName ?? ""))
                .ForMember(dest => dest.RoleRemarks, opt => opt.MapFrom(src => src.RoleRemarks));

            // SystemUser mappings
            CreateMap<SystemUser, SystemUserDto>()
                .ForMember(dest => dest.RoleName,
                    opt => opt.MapFrom(src => src.Role != null ? src.Role.RoleName : ""))
                .ForMember(dest => dest.BranchName,
                    opt => opt.MapFrom(src => src.Branch != null ? src.Branch.BranchName : ""));

            CreateMap<SystemUserCreateDto, SystemUser>()
                .ForMember(dest => dest.Password, opt => opt.Ignore())
                .ForMember(dest => dest.UserID, opt => opt.Ignore())
                .ForMember(dest => dest.AddBy, opt => opt.Ignore())
                .ForMember(dest => dest.AddOn, opt => opt.Ignore())
                .ForMember(dest => dest.EditBy, opt => opt.Ignore())
                .ForMember(dest => dest.EditOn, opt => opt.Ignore());

            CreateMap<SystemUserUpdateDto, SystemUser>()
                .ForMember(dest => dest.Password, opt => opt.Ignore())
                .ForMember(dest => dest.UserID, opt => opt.Ignore())
                .ForMember(dest => dest.AddBy, opt => opt.Ignore())
                .ForMember(dest => dest.AddOn, opt => opt.Ignore())
                .ForMember(dest => dest.EditBy, opt => opt.Ignore())
                .ForMember(dest => dest.EditOn, opt => opt.Ignore());

            CreateMap<Branch, BranchDto>().ReverseMap();
        }
    }
}