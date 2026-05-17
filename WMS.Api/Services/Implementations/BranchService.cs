using AutoMapper;
using WMS.Api.DTOs.Branch;
using WMS.Api.Models;
using WMS.Api.Repositories.Interfaces;
using WMS.Api.Services.Interfaces;

namespace WMS.Api.Services.Implementations
{
    public class BranchService : IBranchService
    {
        private readonly IBranchRepository _repo;
        private readonly IMapper _mapper;

        public BranchService(IBranchRepository repo, IMapper mapper)
        {
            _repo = repo;
            _mapper = mapper;
        }

        public async Task<BranchDto> CreateAsync(BranchDto dto)
        {
            var branch = _mapper.Map<Branch>(dto);
            var result = await _repo.CreateAsync(branch);
            return _mapper.Map<BranchDto>(result);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            return await _repo.DeleteAsync(id);
        }

        public async Task<IEnumerable<BranchDto>> GetAllAsync()
        {
            var list = await _repo.GetAllAsync();
            return _mapper.Map<IEnumerable<BranchDto>>(list);
        }

        public async Task<BranchDto> GetByIdAsync(int id)
        {
            var branch = await _repo.GetByIdAsync(id);
            return _mapper.Map<BranchDto>(branch);
        }

        public async Task<BranchDto> UpdateAsync(int id, BranchDto dto)
        {
            var branch = await _repo.GetByIdAsync(id);
            if (branch == null) return null;

            _mapper.Map(dto, branch);
            var updated = await _repo.UpdateAsync(branch);
            return _mapper.Map<BranchDto>(updated);
        }
    }
}

