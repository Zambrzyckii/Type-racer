using TypeRacerServer.Core.Domain.Entities;
namespace TypeRacerServer.Core.Application.Interfaces.LeaderboardInterfaces;

public interface ILeaderboardRepository
{
    Task<List<User>>  GetTopUsers();
}