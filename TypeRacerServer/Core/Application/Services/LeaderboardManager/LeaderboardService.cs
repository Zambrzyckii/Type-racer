using TypeRacerServer.Core.Application.Interfaces.LeaderboardInterfaces;
using TypeRacerServer.Core.Application.Models.PlayerData;
using TypeRacerServer.Core.Domain.Constant;

namespace TypeRacerServer.Core.Application.Services.LeaderboardManager;

public class LeaderboardSerivce(ILeaderboardRepository _repository)
{
    public async Task<List<TopPlayers>> Leaderboard()
    {

        var users = await _repository.GetTopUsers();

        var topPlayers = users.Select(u => new TopPlayers
        {
            Username = u.Username.Value,
            HighScoreWpm = u.HighScoreWpm,
            GamesPlayed = u.GamesPlayed,
            GamesWin = u.GamesWin,
            Winrate = u.GamesWin > 0 ? Math.Round((double)u.GamesWin / u.GamesPlayed * 100, 1) : 0,
        });
        
        return topPlayers.ToList();
    }
}