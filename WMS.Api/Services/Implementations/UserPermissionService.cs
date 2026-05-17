using AutoMapper;
using WMS.Api.DTOs.Permissions;
using WMS.Api.Models;
using WMS.Api.Repositories.Interfaces;
using WMS.Api.Services.Interfaces;

namespace WMS.Api.Services.Implementations
{
    public class UserPermissionService : IUserPermissionService
    {
        private readonly IUserPermissionRepository _repo;
        private readonly IMapper _mapper;

        public UserPermissionService(IUserPermissionRepository repo, IMapper mapper)
        {
            _repo = repo;
            _mapper = mapper;
        }

        public async Task<IEnumerable<UserPermissionDto>> GetAllAsync()
        {
            var data = await _repo.GetAllAsync();
            return _mapper.Map<IEnumerable<UserPermissionDto>>(data);
        }

        public async Task<UserPermissionDto?> GetByIdAsync(int id)
        {
            var data = await _repo.GetByIdAsync(id);
            return _mapper.Map<UserPermissionDto>(data);
        }

        public async Task<UserPermissionDto> CreateAsync(UserPermissionCreateDto dto)
        {
            var entity = _mapper.Map<UserPermission>(dto);
            var saved = await _repo.AddAsync(entity);
            return _mapper.Map<UserPermissionDto>(saved);
        }

        public async Task<UserPermissionDto?> UpdateAsync(int id, UserPermissionCreateDto dto)
        {
            var entity = await _repo.GetByIdAsync(id);
            if (entity == null) return null;
            _mapper.Map(dto, entity);
            var updated = await _repo.UpdateAsync(entity);
            return _mapper.Map<UserPermissionDto>(updated);
        }

        public async Task<bool> DeleteAsync(int id)
            => await _repo.DeleteAsync(id);

        public async Task<IEnumerable<UserPermissionDto>> GetByUserIdAsync(int userId)
        {
            var data = await _repo.GetByUserIdAsync(userId);
            return _mapper.Map<IEnumerable<UserPermissionDto>>(data);
        }
    }
}
