using TypeRacerServer.Core.Domain.ValueObjects;

namespace TypeRacerServer.Core.Domain.Entities;

public class User
{
    public int Id { get; set; }
    public required Username Username { get; set; }
    public required Password PasswordHash { get; set; }
    public uint HighScoreWpm { get; set; } = 0;
    public uint GamesPlayed { get; set; } = 0;
    public uint GamesWin { get;  set; } = 0;
}