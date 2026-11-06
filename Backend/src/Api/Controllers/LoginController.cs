using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using TypeRacerServer.Core.Application.Requests.AccountManager;
using TypeRacerServer.Core.Application.Services.AccountManager;

namespace TypeRacerServer.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[EnableRateLimiting("AntiSpamPolicy")]
public class LoginController(LoginService _user) : ControllerBase
{
    [HttpPost]
    public async Task<ActionResult> LoginUser([FromBody] LoginRequest loginRequest)
    {
        var token = await  _user.LoginHandler(loginRequest);
        return Ok(new {Token = token});
    }
}