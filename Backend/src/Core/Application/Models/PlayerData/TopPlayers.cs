using TypeRacerServer.Core.Domain.ValueObjects;

namespace TypeRacerServer.Core.Application.Models.PlayerData;

public record TopPlayers
{
    public string? Username { get; set; }
    public uint HighScoreWpm { get; set; }
    public uint GamesPlayed {get; set;}
    public uint GamesWin {get; set;}
    public double Winrate {get; set;}
}