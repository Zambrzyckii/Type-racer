using TypeRacerServer.Core.Application.Interfaces.AccountManagerInterfaces;
using TypeRacerServer.Core.Application.Requests.AccountManager;
using Moq;
using TypeRacerServer.Core.Application.Services.AccountManager;

namespace Core.Tests.Application.Services.AccountManager;

public class RegisterServiceTests
{
    private readonly Mock<IRegisterRepository> _registerRepository;
    private readonly RegisterService _registerService;

    public RegisterServiceTests()
    {
        _registerRepository = new Mock<IRegisterRepository>();
        _registerService = new RegisterService(_registerRepository.Object);
    }
    
    [Fact]
    public async Task RegisterHandler_NicknameIsTaken_ThrowsUsernameAlreadyExistsException()
    {
        var request = new RegisterRequestByMe { Username = "bobek", Password = "haslo"};
        _registerRepository.Setup(repo => repo.Exists(request.Username)).ReturnsAsync(true);
        
        var exception = await Assert.ThrowsAsync<InvalidOperationException>(() => _registerService.RegisterHandler(request));
        Assert.Equal("Username already exists", exception.Message);
    }

    [Fact]
    public async Task RegisterHandler_RegisterAccount_SavesAccount()
    {
        var request = new RegisterRequestByMe { Username = "bobek", Password = "haslo" };
        _registerRepository.Setup(repo => repo.Exists(request.Username)).ReturnsAsync(false);
        
        await _registerService.RegisterHandler(request);
        _registerRepository.Verify(repo => repo.SaveNewUser(It.IsAny<string>(), It.IsAny<string>()),Times.Once);
    }
}