using AutoMapper;
using WMS.Api.DTOs.FormDetail;
using WMS.Api.Models;

public class FormDetailProfile : Profile
{
    public FormDetailProfile()
    {
        CreateMap<FormDetail, FormDetailDto>();
        CreateMap<FormDetailCreateDto, FormDetail>();
        CreateMap<FormDetailUpdateDto, FormDetail>();
    }
}
