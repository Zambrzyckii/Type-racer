using TypeRacerServer.Core.Application.Interfaces.SavingStatsInterfaces;
using TypeRacerServer.Core.Application.Requests.SavingStats;
using TypeRacerServer.Core.Domain.ValueObjects;

namespace TypeRacerServer.Core.Application.Services.PostGameManager;


public class SaveScoreService(ISaveScoreRepository _repository)
{
    public async Task SaveScoreHandler(SaveScoreRequest saveScoreRequest, string usernameFromToken)
    {
        if(string.IsNullOrEmpty(usernameFromToken)){
            throw new Exception("Invalid username");
        }
        var user = await _repository.getUser(usernameFromToken);
        if(user == null){
            throw new Exception("User not found");
        }
        user.GamesPlayed++;
        if(saveScoreRequest.isWinner){
            user.GamesWin++;
        }
        if (saveScoreRequest.WPM > user.HighScoreWpm){
            user.HighScoreWpm = saveScoreRequest.WPM;
        }

        await _repository.saveScore();
    }
}