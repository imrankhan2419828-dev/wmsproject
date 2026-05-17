using AutoMapper;
using WMS.Api.Models;
using WMS.Api.DTOs.COA;

namespace WMS.Api.Profiles
{
    public class COAProfile : Profile
    {
        public COAProfile()
        {
            CreateMap<COA, COADto>().ReverseMap();
            CreateMap<COACreateDto, COA>();
            CreateMap<COAUpdateDto, COA>();
        }
    }
}
