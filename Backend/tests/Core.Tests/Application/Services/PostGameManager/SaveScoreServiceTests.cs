using Moq;
using TypeRacerServer.Core.Application.Interfaces.SavingStatsInterfaces;
using TypeRacerServer.Core.Application.Requests.SavingStats;
using TypeRacerServer.Core.Application.Services.PostGameManager;
using TypeRacerServer.Core.Domain.Entities;

namespace Core.Tests.Application.Services.PostGameManager;

public class SaveScoreServiceTests
{
    private readonly Mock<ISaveScoreRepository> _saveScoreRepositoryMock;
    private readonly SaveScoreService _saveScoreService;
    
    public SaveScoreServiceTests()
    {
        _saveScoreRepositoryMock = new Mock<ISaveScoreRepository>();
        _saveScoreService = new SaveScoreService(_saveScoreRepositoryMock.Object);
    }

    [Fact]
    public async Task SaveScoreHandler_EmptyUsername_ThrowsException()
    {
        var request = new SaveScoreRequest{WPM = 60, isWinner = true};
        
        string emptyUsername = string.Empty;
        
        var exception = await Assert.ThrowsAsync<Exception>(() => _saveScoreService.SaveScoreHandler(request, emptyUsername));
        
        Assert.Equal("Invalid username", exception.Message);
        _saveScoreRepositoryMock.Verify(repo => repo.saveScore(), Times.Never);
    }

    [Fact]
    public async Task SaveScoreHandler_UserNotFound_ThrowsException()
    {
        var request = new SaveScoreRequest{WPM = 60, isWinner = true};
        string validUsername = "bobek";
        _saveScoreRepositoryMock.Setup(repo => repo.getUser(validUsername)).ReturnsAsync((User)null);
        
        var exception = await Assert.ThrowsAsync<Exception>(() => _saveScoreService.SaveScoreHandler(request, validUsername));
        Assert.Equal("User not found", exception.Message);
        _saveScoreRepositoryMock.Verify(repo => repo.saveScore(), Times.Never);
    }

    [Fact]
    public async Task SaveScoreHandler_ValidUserWInsAndBeatsRecord_UpdateStatsAndSaveScore()
    {
        var request = new SaveScoreRequest{WPM = 150, isWinner = true};
        string username = "Winner";

        var fakeUser = new User
        {
            Username = username,
            GamesWin = 5,
            HighScoreWpm = 80,
            PasswordHash = "random pass",
            GamesPlayed = 10
        };
        
        _saveScoreRepositoryMock.Setup(repo => repo.getUser(username)).ReturnsAsync(fakeUser);
        
        await _saveScoreService.SaveScoreHandler(request, username);
        
        Assert.Equal(11u, fakeUser.GamesPlayed);
        Assert.Equal(6u, fakeUser.GamesWin);
        Assert.Equal(150u,fakeUser.HighScoreWpm);
        
        _saveScoreRepositoryMock.Verify(repo => repo.saveScore(), Times.Once);
    }
}