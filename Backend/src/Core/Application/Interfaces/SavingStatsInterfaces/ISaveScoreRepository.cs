using TypeRacerServer.Core.Domain.Entities;
using TypeRacerServer.Core.Domain.ValueObjects;

namespace TypeRacerServer.Core.Application.Interfaces.SavingStatsInterfaces;

public interface ISaveScoreRepository
{
    Task<User?> getUser(string username);
    Task saveScore();
}