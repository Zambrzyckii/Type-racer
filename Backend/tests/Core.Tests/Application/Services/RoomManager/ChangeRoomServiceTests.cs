using TypeRacerServer.Core.Application.Models.RoomResults;
using TypeRacerServer.Core.Domain.State;
using TypeRacerServer.Core.Application.Services.RoomManager;

namespace Core.Tests.Application.Services.RoomManager;

public class ChangeRoomServiceTests
{
    [Fact]
    public void ChangeRoomSettings_RoomNotExist_False()
    {
        GameState _gameState = new GameState();
        RoomState _roomState = new RoomState{GameStarted = false};
        _gameState.Rooms.TryAdd("TestRoom", _roomState);
        var service = new ChangeRoomSettingsService(_gameState);
        var result = service.ChangeRoomSettings("NotTestRoom",false,true,10,"test");
        Assert.False(result);
    }

    [Fact]
    public void ChangeRoomSettings_RoomExist_True()
    {
        GameState _gameState = new GameState();
        RoomState _roomState = new RoomState{GameStarted = false};
        _gameState.Rooms.TryAdd("TestRoom", _roomState);
        var service = new ChangeRoomSettingsService(_gameState);
        var result = service.ChangeRoomSettings("TestRoom",false,true,10,"test");
        Assert.False(result);
    }
}