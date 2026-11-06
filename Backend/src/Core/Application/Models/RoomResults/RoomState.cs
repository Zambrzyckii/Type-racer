using System.Collections.Concurrent;
namespace TypeRacerServer.Core.Application.Models.RoomResults;
public record RoomState
{
    public string TargetText { get; set; } = string.Empty;
    public ConcurrentDictionary<string, string> Players { get; set; } = new();
    public bool GameStarted { get; set; } = false;
    public string HostConnection { get; set; } = string.Empty;
    public bool PowerUpsEnabled { get; set; } = false;
    public int SecondsToEnd { get; set; } = 0;
    public bool HardMode { get; set; } = false;
    public Guid CurrentGameId { get; set; } = Guid.NewGuid();
}
