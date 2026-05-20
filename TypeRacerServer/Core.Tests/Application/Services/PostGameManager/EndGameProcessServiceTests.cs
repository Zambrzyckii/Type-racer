using TypeRacerServer.Core.Application.Models.PlayerData;
using TypeRacerServer.Core.Application.Models.RoomResults;
using TypeRacerServer.Core.Domain.State;
using TypeRacerServer.Core.Application.Services.PostGameManager;

namespace Core.Tests.Application.Services.PostGameManager;

public class EndGameProcessServiceTests
{
    [Fact]
    public void EndGameProcess_TiedProgress_WinsByFasterFinishTime()
    {
        var gameState = new GameState();
        var player1 = new PlayerSession {Nickname = "Slow Player", Progress = 100, FinishTime = DateTime.Now.AddSeconds(-5)};
        var player2 = new PlayerSession {Nickname = "Fast Player", Progress = 100, FinishTime = DateTime.Now.AddSeconds(-10)};
        
        gameState.Sessions.TryAdd("player1", player1);
        gameState.Sessions.TryAdd("player2", player2);

        var activeRoom = new RoomState { GameStarted = true };
        activeRoom.Players.TryAdd("player1", player1.Nickname);
        activeRoom.Players.TryAdd("player2", player2.Nickname);
        gameState.Rooms.TryAdd("activeRoom", activeRoom);
        
        var service = new EndGameProcessService(gameState);
        
        var winner = service.EndGameProcess("activeRoom");
        
        Assert.Equal("Fast Player", winner);
        Assert.False(gameState.Rooms["activeRoom"].GameStarted);
    }
}