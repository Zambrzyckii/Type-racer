using TypeRacerServer.Core.Application.Models.PlayerData;
using Xunit;
using TypeRacerServer.Core.Application.Services.LeaderboardManager;
using TypeRacerServer.Core.Domain.State;
using TypeRacerServer.Core.Application.Models.PostGameResults;
using TypeRacerServer.Core.Application.Models.RoomResults;

namespace Core.Tests.Application.Services.LeaderboardManager;

public class SendProgressServiceTests
{
    [Fact]
    public void SendProgress_ValidInput_UpdatesProgressAndKeystrokes()
    {
        var gameState = new GameState();
        var session = new PlayerSession 
        { 
            RoomCode = "ROOM1", 
            Nickname = "RacerX", 
            TargetText = "Hello World",
            Keystrokes = 0
        };
        gameState.Sessions.TryAdd("conn_1", session);

        var room = new RoomState { GameStarted = true };
        room.Players.TryAdd("conn_1", "RacerX");
        gameState.Rooms.TryAdd("ROOM1", room);

        var service = new SendProgressService(gameState);

        var result = service.SendProgress("Hello", "conn_1");

        Assert.True(result.IsSuccess);
        Assert.False(result.HasError);
        Assert.Equal("ROOM1", result.RoomCode);
        
        Assert.Equal(45, result.Progress); 
        Assert.Equal(45, session.Progress);
        Assert.Equal(1, session.Keystrokes);
    }

    [Fact]
    public void SendProgress_HardModeActiveAndMakesError_EliminatesPlayer()
    {
        var gameState = new GameState();
        var session = new PlayerSession 
        { 
            RoomCode = "ROOM_HARD", 
            TargetText = "TypeRacer", 
            Progress = 0 
        };
        gameState.Sessions.TryAdd("conn_2", session);

        var room = new RoomState { GameStarted = true, HardMode = true };
        room.Players.TryAdd("conn_2", "Player2");
        gameState.Rooms.TryAdd("ROOM_HARD", room);

        var service = new SendProgressService(gameState);

        var result = service.SendProgress("X", "conn_2");

        Assert.True(result.TriggerHardModeFail);
        Assert.True(result.IsDone);
        Assert.True(result.HasError);
        
        Assert.Equal(string.Empty, session.TargetText); 
    }

    [Fact]
    public void SendProgress_CompletesText_SetsFinishTimeAndTriggersEndGame()
    {
        var gameState = new GameState();
        var session = new PlayerSession 
        { 
            RoomCode = "ROOM_FINISH", 
            TargetText = "Winner", 
            StartTime = DateTime.Now.AddSeconds(-10) 
        };
        gameState.Sessions.TryAdd("conn_3", session);

        var room = new RoomState 
        { 
            GameStarted = true, 
            SecondsToEnd = 15 
        };
        room.Players.TryAdd("conn_3", "FastBoy");
        gameState.Rooms.TryAdd("ROOM_FINISH", room);

        var service = new SendProgressService(gameState);

        var result = service.SendProgress("Winner", "conn_3");

        Assert.True(result.IsSuccess);
        Assert.True(result.IsDone);
        Assert.Equal(100, result.Progress);
        
        Assert.NotNull(session.FinishTime);

        Assert.True(result.ShouldStartEndGameTimer);
        Assert.Equal(15, result.SecondsToEnd);
    }
}