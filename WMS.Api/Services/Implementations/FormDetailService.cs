//using AutoMapper;
//using WMS.Api.DTOs.FormDetail;
//using WMS.Api.Models;

//public class FormDetailService : IFormDetailService
//{
//    private readonly IFormDetailRepository _repo;
//    private readonly IMapper _mapper;

//    public FormDetailService(IFormDetailRepository repo, IMapper mapper)
//    {
//        _repo = repo;
//        _mapper = mapper;
//    }

//    public async Task<IEnumerable<FormDetailDto>> GetAllAsync()
//    {
//        var data = await _repo.GetAllAsync();
//        return _mapper.Map<IEnumerable<FormDetailDto>>(data);
//    }

//    public async Task<FormDetailDto?> GetByIdAsync(int id)
//    {
//        var data = await _repo.GetByIdAsync(id);
//        return _mapper.Map<FormDetailDto>(data);
//    }

//    public async Task<FormDetailDto> CreateAsync(FormDetailCreateDto dto)
//    {
//        var entity = _mapper.Map<FormDetail>(dto);
//        var saved = await _repo.AddAsync(entity);
//        return _mapper.Map<FormDetailDto>(saved);
//    }

//    public async Task<FormDetailDto?> UpdateAsync(int id, FormDetailUpdateDto dto)
//    {
//        var entity = await _repo.GetByIdAsync(id);
//        if (entity == null) return null;

//        _mapper.Map(dto, entity);
//        var updated = await _repo.UpdateAsync(entity);
//        return _mapper.Map<FormDetailDto>(updated);
//    }

//    public async Task<bool> DeleteAsync(int id)
//        => await _repo.DeleteAsync(id);
//}
using AutoMapper;
using WMS.Api.DTOs.FormDetail;
using WMS.Api.Models;
using Microsoft.EntityFrameworkCore;

public class FormDetailService : IFormDetailService
{
    private readonly IFormDetailRepository _repo;
    private readonly IMapper _mapper;

    public FormDetailService(IFormDetailRepository repo, IMapper mapper)
    {
        _repo = repo;
        _mapper = mapper;
    }

    public async Task<IEnumerable<FormDetailDto>> GetAllAsync()
    {
        var data = await _repo.GetAllAsync();
        return _mapper.Map<IEnumerable<FormDetailDto>>(data);
    }

    public async Task<FormDetailDto?> GetByIdAsync(int id)
    {
        var data = await _repo.GetByIdAsync(id);
        return _mapper.Map<FormDetailDto>(data);
    }

    public async Task<FormDetailDto> CreateAsync(FormDetailCreateDto dto)
    {
        var entity = _mapper.Map<FormDetail>(dto);
        var saved = await _repo.AddAsync(entity);
        return _mapper.Map<FormDetailDto>(saved);
    }

    public async Task<FormDetailDto?> UpdateAsync(int id, FormDetailUpdateDto dto)
    {
        var entity = await _repo.GetByIdAsync(id);
        if (entity == null) return null;

        _mapper.Map(dto, entity);
        var updated = await _repo.UpdateAsync(entity);
        return _mapper.Map<FormDetailDto>(updated);
    }

    public async Task<bool> DeleteAsync(int id)
        => await _repo.DeleteAsync(id);

    // 🔥 New method implementations
    public async Task<IEnumerable<FormDetailDto>> GetByCategoryAsync(string category)
    {
        var data = await _repo.GetByCategoryAsync(category);
        return _mapper.Map<IEnumerable<FormDetailDto>>(data);
    }

    public async Task<IEnumerable<FormDetailDto>> GetMenuStructureAsync()
    {
        var allMenus = await _repo.GetAllAsync();

        // Get only root menus (ParentPage is null)
        var rootMenus = allMenus.Where(x => x.ParentPage == null).ToList();

        // Build hierarchy
        foreach (var menu in rootMenus)
        {
            menu.Children = allMenus.Where(x => x.ParentPage == menu.FormID).ToList();
        }

        return _mapper.Map<IEnumerable<FormDetailDto>>(rootMenus);
    }

    public async Task<IEnumerable<FormDetailDto>> GetByParentAsync(int parentId)
    {
        var data = await _repo.GetByParentAsync(parentId);
        return _mapper.Map<IEnumerable<FormDetailDto>>(data);
    }
}