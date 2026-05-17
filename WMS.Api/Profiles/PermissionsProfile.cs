using AutoMapper;
using WMS.Api.DTOs.Permissions;
using WMS.Api.Models;

public class PermissionsProfile : Profile
{
    public PermissionsProfile()
    {
        CreateMap<RolePermission, RolePermissionDto>().ReverseMap();
        CreateMap<RolePermissionCreateDto, RolePermission>();

        CreateMap<UserPermission, UserPermissionDto>().ReverseMap();
        CreateMap<UserPermissionCreateDto, UserPermission>();
    }
}
