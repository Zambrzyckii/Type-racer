using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using TypeRacerServer.Core.Application.Requests.AccountManager;
using TypeRacerServer.Core.Application.Services.AccountManager;

namespace TypeRacerServer.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[EnableRateLimiting("AntiSpamPolicy")]
public class RegisterController(RegisterService registerService) : ControllerBase
{
    [HttpPost]
    public async Task<ActionResult> RegisterUser([FromBody] RegisterRequestByMe registerRequest)
    {
        await registerService.RegisterHandler(registerRequest);
        return Ok();
    }
}