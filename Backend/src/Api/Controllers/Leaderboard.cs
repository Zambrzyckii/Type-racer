using Microsoft.AspNetCore.Mvc;
using TypeRacerServer.Core.Application.Services.LeaderboardManager;

namespace TypeRacerServer.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class Leaderboard(LeaderboardSerivce _context) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> LeaderboardPrinter()
    {
        var data = await _context.Leaderboard();
        return Ok(data);
    }
}