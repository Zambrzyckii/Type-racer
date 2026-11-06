using Moq;
using Microsoft.Extensions.Configuration;
using TypeRacerServer.Core.Application.Services.AccountManager;
using TypeRacerServer.Core.Application.Interfaces.AccountManagerInterfaces;
using TypeRacerServer.Core.Application.Requests.AccountManager;
using TypeRacerServer.Core.Domain.Entities;

namespace Core.Tests.Application.Services.AccountManager;

public class LoginServiceTests
{
    private readonly Mock<ILoginRepository> _loginRepository;
    private readonly Mock<IConfiguration> _configuration;
    private readonly LoginService _loginService;

    public LoginServiceTests()
    {
        _loginRepository = new Mock<ILoginRepository>();
        _configuration = new Mock<IConfiguration>();
        
        _configuration.Setup(config => config["JwtSettings:Key"]).Returns("superupertestkeyformoqandunnnittesting123321bzbzbzbz");
        _loginService = new LoginService(_loginRepository.Object, _configuration.Object);
    }

    [Fact]
    public async Task LoginHandler_UserNotFound_ThrowsUserNotFoundException()
    {
        var request = new LoginRequest{ Username = "bobek", Password = "bobek" };
        _loginRepository.Setup(repo => repo.Login(request.Username)).ReturnsAsync((User)null);
        
        var exception = await Assert.ThrowsAsync<Exception>(() =>  _loginService.LoginHandler(request));
        Assert.Equal("User not found", exception.Message);
    }

    [Fact]
    public async Task LoginHandler_PasswordNotFound_ThrowsWrongPasswordException()
    {
        var request = new LoginRequest{ Username = "bobek", Password = "bobek1" };
        string wrongPassword = "bobek2";
        
        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(request.Password);
        var fakeUser = new User { Username = request.Username, PasswordHash =  hashedPassword };
        _loginRepository.Setup(repo => repo.Login(request.Username)).ReturnsAsync(fakeUser);
        
        request.Password = wrongPassword;
        var exception = await Assert.ThrowsAsync<Exception>(() =>  _loginService.LoginHandler(request));
        Assert.Equal("Wrong password", exception.Message);
    }

    [Fact]
    public async Task LoginHandler_UserFound_ReturnsJWTToken()
    {
        var request = new LoginRequest { Username = "bobek", Password = "bobek" };

        string hashedPassword = BCrypt.Net.BCrypt.HashPassword(request.Password);

        var fakeUser = new User { Username = request.Username, PasswordHash = hashedPassword };

        _loginRepository.Setup(repo => repo.Login(request.Username)).ReturnsAsync(fakeUser);
        var resultToken = await _loginService.LoginHandler(request);
        Assert.False(string.IsNullOrWhiteSpace(resultToken));
        _loginRepository.Verify(repo => repo.Login(request.Username), Times.Once);
    }
}