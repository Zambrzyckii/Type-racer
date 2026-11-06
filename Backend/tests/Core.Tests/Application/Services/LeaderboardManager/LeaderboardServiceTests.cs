using TypeRacerServer.Core.Application.Interfaces.LeaderboardInterfaces;
using Moq;
using TypeRacerServer.Core.Application.Services.LeaderboardManager;
using TypeRacerServer.Core.Domain.Entities;
using TypeRacerServer.Core.Domain.ValueObjects;

namespace Core.Tests.Application.Services.LeaderboardManager;

public class UsePowerupServiceTests
{
    private readonly Mock<ILeaderboardRepository> _leaderboardRepository;
    private readonly LeaderboardSerivce _leaderboardSerivce;
    
    public UsePowerupServiceTests()
    {
        _leaderboardRepository = new Mock<ILeaderboardRepository>();
        _leaderboardSerivce = new LeaderboardSerivce(_leaderboardRepository.Object);
    }

    [Fact]
    public async Task Leaderboard_ReturnsMappedPlayers_CalculatesWinrateCorrectly()
    {
        var fakeUsers = new List<User>
        {
            new User {Username = new Username("pro"), PasswordHash = new Password("xd"), GamesPlayed = 10, GamesWin = 5},
            new User {Username = new Username("noob"), PasswordHash = new Password("xd2"), GamesPlayed = 10, GamesWin = 0},
        };
        _leaderboardRepository.Setup(repo => repo.GetTopUsers()).ReturnsAsync(fakeUsers);
        
        var result = await _leaderboardSerivce.Leaderboard();
        Assert.Equal(2,result.Count);
        
        Assert.Equal("pro",result[0].Username);
        Assert.Equal(50,result[0].Winrate);
        
        Assert.Equal("noob",result[1].Username);
        Assert.Equal(0,result[1].Winrate);
    }
}