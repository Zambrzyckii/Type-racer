using TypeRacerServer.Core.Application.Models.PlayerData;
using TypeRacerServer.Core.Application.Models.RoomResults;
using TypeRacerServer.Core.Domain.State;
using TypeRacerServer.Core.Application.Services.GameManager;

namespace Core.Tests.Application.Services.GameManager;

public class UsePowerupServiceTests
{
    
    [Fact]
    public void PowerUp_ProperPowerupUsage_True()
    {
        var isolatedGameState = new GameState();

        var targetSession = new PlayerSession { DebuffsReceived = 0 };
        isolatedGameState.Sessions.TryAdd("fakeID",targetSession);
        
        var activeRoom = new RoomState {GameStarted = true};
        activeRoom.Players.TryAdd("fakeID","TargetNick");
        isolatedGameState.Rooms.TryAdd("Room",activeRoom);
        
        var service = new PowerUpService(isolatedGameState);

        bool result = service.PowerUp("Room", "TargetNick", "freeze");
        
        Assert.True(result);
        Assert.Equal(1, targetSession.DebuffsReceived);
        Assert.True(targetSession.FreezeEnd > DateTime.Now);
    }

    [Fact]
    public void PowerUp_DiffrentRoomGames_False()
    {
        var isolatedGameState = new GameState();

        var targetSession = new PlayerSession { DebuffsReceived = 0 };
        isolatedGameState.Sessions.TryAdd("fakeID",targetSession);
        
        var activeRoom = new RoomState {GameStarted = true};
        activeRoom.Players.TryAdd("fakeID","TargetNick");
        isolatedGameState.Rooms.TryAdd("Room1",activeRoom);
        
        var service = new PowerUpService(isolatedGameState);

        bool result = service.PowerUp("Room2", "TargetNick", "freeze");
        
        Assert.False(result);
    }
    
    [Fact]
    public void PowerUp_DiffrentNickname_False()
    {
        var isolatedGameState = new GameState();

        var targetSession = new PlayerSession { DebuffsReceived = 0 };
        isolatedGameState.Sessions.TryAdd("fakeID",targetSession);
        
        var activeRoom = new RoomState {GameStarted = true};
        activeRoom.Players.TryAdd("fakeID","TargetNick1");
        isolatedGameState.Rooms.TryAdd("Room",activeRoom);
        
        var service = new PowerUpService(isolatedGameState);

        bool result = service.PowerUp("Room", "TargetNick2", "freeze");
        
        Assert.False(result);
    }
}