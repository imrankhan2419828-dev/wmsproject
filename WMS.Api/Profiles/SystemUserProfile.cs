using AutoMapper;
using WMS.Api.Models;
using WMS.Api.DTOs.SystemUser;  // ✅ IMPORTANT: Add this using

namespace WMS.Api.Profiles
{
    public class SystemUserProfile : Profile
    {
        public SystemUserProfile()
        {
            // SystemUser -> SystemUserDto
            CreateMap<SystemUser, SystemUserDto>()
                .ForMember(dest => dest.RoleName,
                    opt => opt.MapFrom(src => src.Role != null ? src.Role.RoleName : ""))
                .ForMember(dest => dest.BranchName,
                    opt => opt.MapFrom(src => src.Branch != null ? src.Branch.BranchName : ""));

            // SystemUserCreateDto -> SystemUser
            CreateMap<SystemUserCreateDto, SystemUser>()
                .ForMember(dest => dest.Password, opt => opt.Ignore())
                .ForMember(dest => dest.UserID, opt => opt.Ignore())
                .ForMember(dest => dest.AddBy, opt => opt.Ignore())
                .ForMember(dest => dest.AddOn, opt => opt.Ignore());

            // SystemUserUpdateDto -> SystemUser
            CreateMap<SystemUserUpdateDto, SystemUser>()
                .ForMember(dest => dest.Password, opt => opt.Ignore())
                .ForMember(dest => dest.UserID, opt => opt.Ignore())
                .ForMember(dest => dest.AddBy, opt => opt.Ignore())
                .ForMember(dest => dest.AddOn, opt => opt.Ignore());

            // RoleMaster -> RoleDto
            CreateMap<RoleMaster, RoleDto>();
        }
    }
}

