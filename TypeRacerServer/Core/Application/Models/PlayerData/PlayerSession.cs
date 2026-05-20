namespace TypeRacerServer.Core.Application.Models.PlayerData;
public record PlayerSession
{
    public string Nickname { get; set; } = string.Empty;
    public string RoomCode { get; set; } = string.Empty;
    public string TargetText { get; set; } = string.Empty;

    public int Progress { get; set; }
    public int PowerUpProgress { get; set; }
    public int Keystrokes { get; set; }
    public int Errors { get; set; }
    public int DebuffsReceived { get; set; }

    public DateTime? StartTime { get; set; }
    public DateTime? FinishTime { get; set; }
    public DateTime? FreezeEnd { get; set; }

    public double Accuracy => Keystrokes > 0 ? ((double)(Keystrokes - Errors) / Keystrokes) * 100.0 : 0;
}