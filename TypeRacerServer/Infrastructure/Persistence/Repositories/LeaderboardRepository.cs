using Microsoft.EntityFrameworkCore;
using TypeRacerServer.Core.Application.Interfaces.LeaderboardInterfaces;
using TypeRacerServer.Core.Domain.Entities;
namespace TypeRacerServer.Infrastructure.Persistance.Repositories;

public class LeaderboardRepository(AppDbContext _context) : ILeaderboardRepository
{
    public async Task<List<User>> GetTopUsers()
    {
        return await _context.Users.OrderByDescending(u => u.GamesWin).ThenByDescending(u => u.HighScoreWpm).Take(10).ToListAsync();
    }
}