using System.Collections.Concurrent;
using TypeRacerServer.Core.Application.Models.PlayerData;
using TypeRacerServer.Core.Application.Models.RoomResults;
namespace TypeRacerServer.Core.Domain.State;

public class GameState
{
    public readonly ConcurrentDictionary<string, RoomState> Rooms = new();
    public readonly ConcurrentDictionary<string, PlayerSession> Sessions = new();
}