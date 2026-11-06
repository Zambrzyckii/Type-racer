using Microsoft.AspNetCore.Mvc;
using TypeRacerServer.Core.Application.Requests.SavingStats;
using TypeRacerServer.Core.Application.Services.PostGameManager;

namespace TypeRacerServer.Api.Controllers;

[ApiController]
[Route("api/[controller]")]

public class SaveScoreController(SaveScoreService _context) : ControllerBase
{
    [HttpPost]

    public async Task<ActionResult> SaveScore([FromBody] SaveScoreRequest saveScoreRequest)
    {
        string? usernameFromToken = this.HttpContext.User.Identity?.Name;
        await _context.SaveScoreHandler(saveScoreRequest, usernameFromToken ?? throw new InvalidOperationException());
        return Ok();
    }
}