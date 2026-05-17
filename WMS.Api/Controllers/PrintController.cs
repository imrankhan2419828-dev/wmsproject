using Microsoft.AspNetCore.Mvc;
using WMS.Api.Services.Interfaces;

namespace WMS.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PrintController : BaseController
    {
        private readonly IPrintService _printService;

        public PrintController(IPrintService printService)
        {
            _printService = printService;
        }

        [HttpGet("{module}/{id}")]
        public async Task<IActionResult> GetPrintHtml(string module, int id)
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var html = await _printService.GenerateHtmlAsync(module, id, branchId);
                return Ok(new { html });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpGet("{module}/{id}/data")]
        public async Task<IActionResult> GetPrintData(string module, int id)
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var data = await _printService.GetPrintDataAsync(module, id, branchId);
                return Ok(data);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }
    }
}